#!/usr/bin/env node
import fsp from "fs/promises";
import path from "path";

// JSON-RPC 2.0 base types
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: JsonRpcError;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

// MCP-specific types
enum ServerState {
  UNINITIALIZED = 'uninitialized',
  READY = 'ready'
}

interface InitializeParams {
  protocolVersion: string;
  capabilities: Record<string, any>;
  clientInfo: { name: string; version: string };
}

interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface ResourceContents {
  uri: string;
  mimeType?: string;
  text?: string;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

type RequestMessage =
  | { jsonrpc: "2.0"; id: string | number; method: "initialize"; params: InitializeParams }
  | { jsonrpc: "2.0"; method: "notifications/initialized" }
  | { jsonrpc: "2.0"; id: string | number; method: "resources/list"; params?: { cursor?: string } }
  | { jsonrpc: "2.0"; id: string | number; method: "resources/read"; params: { uri: string } }
  | { jsonrpc: "2.0"; id: string | number; method: "tools/list"; params?: any }
  | { jsonrpc: "2.0"; id: string | number; method: "tools/call"; params: { name: string; arguments: any } };

// Error codes
const JsonRpcErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

// Server state
let serverState: ServerState = ServerState.UNINITIALIZED;
const SUPPORTED_PROTOCOL_VERSIONS = ["2024-11-05"];

// Tool definitions
const SEARCH_TOOL: Tool = {
  name: "search_docs",
  description: "Search through Switch scripting documentation for specific terms or concepts. Returns relevant documentation snippets with their locations.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (case-insensitive substring match)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (1-50, default 20)",
        minimum: 1,
        maximum: 50,
        default: 20
      }
    },
    required: ["query"]
  }
};

const args = parseArgs(process.argv.slice(2));
const DOC_ROOT = path.resolve(
  args.docRoot ?? process.env.DOC_ROOT ?? path.join(__dirname, "..", "mcp-switch-manual")
);

async function main() {
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (!(await exists(DOC_ROOT))) {
    console.error(`Doc root not found: ${DOC_ROOT}`);
    process.exit(1);
  }

  process.stdin.setEncoding("utf8");
  let buffer = "";
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      handleLine(line);
    }
  });
  process.stdin.on("end", () => process.exit(0));
}

async function handleLine(line: string) {
  let msg: any;
  try {
    msg = JSON.parse(line);
  } catch {
    reply(null, null, {
      code: JsonRpcErrorCode.PARSE_ERROR,
      message: "Invalid JSON"
    });
    return;
  }

  // Validate JSON-RPC 2.0
  if (msg.jsonrpc !== "2.0") {
    reply(null, null, {
      code: JsonRpcErrorCode.INVALID_REQUEST,
      message: "Invalid JSON-RPC version"
    });
    return;
  }

  // Handle notifications (no id)
  if (!("id" in msg)) {
    handleNotification(msg);
    return;
  }

  // Validate request
  if (!msg.method || typeof msg.method !== "string") {
    reply(msg.id, null, {
      code: JsonRpcErrorCode.INVALID_REQUEST,
      message: "Invalid request"
    });
    return;
  }

  // Check server state
  if (serverState === ServerState.UNINITIALIZED && msg.method !== "initialize") {
    reply(msg.id, null, {
      code: JsonRpcErrorCode.INVALID_REQUEST,
      message: "Server not initialized. Send initialize request first."
    });
    return;
  }

  try {
    switch (msg.method) {
      case "initialize": {
        const params = msg.params as InitializeParams;

        // Validate protocol version
        if (!SUPPORTED_PROTOCOL_VERSIONS.includes(params.protocolVersion)) {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.INVALID_PARAMS,
            message: `Unsupported protocol version. Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}`
          });
          break;
        }

        serverState = ServerState.READY;

        reply(msg.id, {
          protocolVersion: params.protocolVersion,
          capabilities: {
            resources: {
              subscribe: false,
              listChanged: false
            },
            tools: {
              listChanged: false
            }
          },
          serverInfo: {
            name: "switch-mcp-server",
            version: "0.3.0"
          },
          instructions: "Switch scripting documentation server. Use resources to browse docs, search_docs tool to find specific content."
        }, null);
        break;
      }

      case "resources/list": {
        const resources: Resource[] = [];

        await walk(DOC_ROOT, async (abs, rel) => {
          if (!abs.endsWith(".md")) return;

          const uri = pathToUri(rel);
          const name = generateResourceName(rel);
          const description = await generateResourceDescription(abs);

          resources.push({
            uri,
            name,
            description,
            mimeType: "text/markdown"
          });
        });

        // Sort by URI for consistent ordering
        resources.sort((a, b) => a.uri.localeCompare(b.uri));

        reply(msg.id, { resources }, null);
        break;
      }

      case "resources/read": {
        const uri = msg.params?.uri;
        if (!uri || typeof uri !== "string") {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.INVALID_PARAMS,
            message: "Missing or invalid uri parameter"
          });
          break;
        }

        const rel = sanitizeUri(uri);
        if (!rel) {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.INVALID_PARAMS,
            message: "Invalid URI"
          });
          break;
        }

        const abs = path.join(DOC_ROOT, rel);
        if (!abs.startsWith(DOC_ROOT)) {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.INVALID_PARAMS,
            message: "URI escapes doc root"
          });
          break;
        }

        try {
          const content = await fsp.readFile(abs, "utf8");
          reply(msg.id, {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content
              }
            ]
          }, null);
        } catch (err: any) {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.INTERNAL_ERROR,
            message: `Failed to read resource: ${err.message}`
          });
        }
        break;
      }

      case "tools/list": {
        reply(msg.id, {
          tools: [SEARCH_TOOL]
        }, null);
        break;
      }

      case "tools/call": {
        const { name, arguments: args } = msg.params || {};

        if (name !== "search_docs") {
          reply(msg.id, null, {
            code: JsonRpcErrorCode.METHOD_NOT_FOUND,
            message: `Unknown tool: ${name}`
          });
          break;
        }

        const query = args?.query?.trim();
        if (!query) {
          reply(msg.id, {
            content: [{ type: "text", text: "Error: Missing query parameter" }],
            isError: true
          }, null);
          break;
        }

        const limit = clamp(Number(args?.limit ?? 20), 1, 50);
        const results = await searchDocs(DOC_ROOT, query, limit);

        // Format results as text content
        let text = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}":\n\n`;

        results.forEach((hit, idx) => {
          const uri = pathToUri(hit.path);
          text += `${idx + 1}. **${hit.path}**\n`;
          text += `   URI: ${uri}\n`;
          text += `   ...${hit.snippet}...\n\n`;
        });

        if (results.length === 0) {
          text = `No results found for "${query}". Try different search terms.`;
        }

        reply(msg.id, {
          content: [{ type: "text", text }],
          isError: false
        }, null);
        break;
      }

      default:
        reply(msg.id, null, {
          code: JsonRpcErrorCode.METHOD_NOT_FOUND,
          message: `Unknown method: ${msg.method}`
        });
    }
  } catch (err: any) {
    reply(msg.id, null, {
      code: JsonRpcErrorCode.INTERNAL_ERROR,
      message: err?.message ?? "Internal server error"
    });
  }
}

function handleNotification(msg: JsonRpcNotification) {
  switch (msg.method) {
    case "notifications/initialized":
      // No-op: client acknowledges initialization complete
      break;
    default:
      // Silently ignore unknown notifications per JSON-RPC spec
      break;
  }
}

function reply(id: string | number | null, result: any, error: JsonRpcError | null) {
  const payload: any = {
    jsonrpc: "2.0",
    id: id!
  };
  if (error) payload.error = error;
  else payload.result = result;
  process.stdout.write(JSON.stringify(payload) + "\n");
}

// URI conversion functions
function pathToUri(relativePath: string): string {
  const parts = relativePath.split('/');
  const encoded = parts.map(p => encodeURIComponent(p)).join('/');
  return `switch-docs://${encoded}`;
}

function uriToPath(uri: string): string | null {
  if (!uri.startsWith('switch-docs://')) return null;
  const encoded = uri.slice('switch-docs://'.length);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

function sanitizeUri(uri: string): string | null {
  const path = uriToPath(uri);
  if (!path) return null;

  // Same security checks as before
  const clean = path.replace(/^\/+/, "");
  if (clean.includes("..")) return null;

  return clean;
}

// Resource metadata generation
function generateResourceName(relativePath: string): string {
  const filename = path.basename(relativePath, '.md');

  // Handle "Switch Scripting Node-js - Chapter X - Title.md"
  const chapterMatch = filename.match(/Chapter (\d+) - (.+)/);
  if (chapterMatch) {
    return `Chapter ${chapterMatch[1]}: ${chapterMatch[2]}`;
  }

  // Convert kebab-case/snake_case to Title Case
  return filename
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

async function generateResourceDescription(absPath: string): Promise<string> {
  try {
    const content = await fsp.readFile(absPath, 'utf8');
    const lines = content.split('\n');

    // Skip leading empty lines and find first meaningful content
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip markdown headers
      if (trimmed.startsWith('#')) continue;

      // Return first non-empty paragraph
      if (trimmed.length > 0) {
        const desc = trimmed.slice(0, 200);
        return desc + (trimmed.length > 200 ? '...' : '');
      }
    }

    return 'Switch scripting documentation';
  } catch {
    return 'Switch scripting documentation';
  }
}

// Search functionality (reused from original)
async function searchDocs(root: string, query: string, limit: number) {
  const needle = query.toLowerCase();
  const hits: { path: string; snippet: string }[] = [];
  await walk(root, async (abs, rel) => {
    if (!abs.endsWith(".md")) return;
    const content = await fsp.readFile(abs, "utf8");
    const idx = content.toLowerCase().indexOf(needle);
    if (idx === -1) return;
    const start = Math.max(0, idx - 80);
    const end = Math.min(content.length, idx + query.length + 80);
    const snippet = content.slice(start, end).replace(/\s+/g, " ").trim();
    hits.push({ path: rel, snippet });
  });
  return hits.slice(0, limit);
}

// Utility functions (unchanged from original)
async function walk(root: string, fn: (abs: string, rel: string) => Promise<void>) {
  const stack: string[] = [root];
  while (stack.length) {
    const current = stack.pop()!;
    const dir = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of dir) {
      const abs = path.join(current, entry.name);
      const rel = path.relative(root, abs);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        await fn(abs, rel);
      }
    }
  }
}

async function exists(p: string) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function parseArgs(argv: string[]) {
  const out: { docRoot?: string; help?: boolean } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--doc-root":
        out.docRoot = argv[++i];
        break;
      case "-h":
      case "--help":
        out.help = true;
        break;
      default:
        break;
    }
  }
  return out;
}

function printHelp() {
  const msg = `
switch-mcp-server v0.3.0 - MCP server for Switch scripting documentation

Usage: switch-mcp [options]

Options:
  --doc-root <path>   Override doc root (default: bundled mcp-switch-manual)
  -h, --help          Show help

MCP Protocol: JSON-RPC 2.0 over stdin/stdout
Methods:
  initialize                    - Initialize server connection
  resources/list                - List all documentation resources
  resources/read                - Read a specific resource by URI
  tools/list                    - List available tools
  tools/call (search_docs)      - Search documentation

For integration with Claude Desktop or Cursor, see README.md
`;
  process.stdout.write(msg);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
