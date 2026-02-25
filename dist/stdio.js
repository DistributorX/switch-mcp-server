#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocs, chunkAllDocs } from "./docs.js";
import { SearchIndex } from "./search.js";
// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VERSION = "0.5.0";
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const args = parseArgs(process.argv.slice(2));
if (args.help) {
    printHelp();
    process.exit(0);
}
const DOC_ROOT = path.resolve(args.docRoot ?? process.env.DOC_ROOT ?? path.join(__dirname, "..", "mcp-switch-manual"));
if (!fs.existsSync(DOC_ROOT)) {
    console.error(`Doc root not found: ${DOC_ROOT}`);
    process.exit(1);
}
const CACHE_DIR = path.join(path.dirname(DOC_ROOT), ".cache");
// ---------------------------------------------------------------------------
// Document discovery & search index
// ---------------------------------------------------------------------------
const docFiles = discoverDocs(DOC_ROOT);
const searchIndex = new SearchIndex();
// Build search index in background (non-blocking — server starts immediately)
const indexReady = (async () => {
    const chunks = chunkAllDocs(DOC_ROOT, docFiles);
    console.error(`Discovered ${docFiles.length} docs, ${chunks.length} chunks.`);
    await searchIndex.build(chunks, CACHE_DIR);
    console.error("Search index ready.");
})();
// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({
    name: "switch-docs",
    version: VERSION,
});
// Register each doc as a static resource
for (const doc of docFiles) {
    server.resource(doc.relativePath, doc.uri, { title: doc.displayName, description: doc.description, mimeType: "text/markdown" }, async (uri) => {
        const fullPath = path.resolve(DOC_ROOT, doc.relativePath);
        if (!fullPath.startsWith(DOC_ROOT)) {
            throw new McpError(ErrorCode.InvalidParams, "Path traversal detected");
        }
        try {
            const text = await fsp.readFile(fullPath, "utf-8");
            return { contents: [{ uri: uri.href, text }] };
        }
        catch {
            throw new McpError(ErrorCode.InternalError, `Failed to read: ${doc.relativePath}`);
        }
    });
}
// Register semantic search tool
server.tool("search_docs", "Search Switch scripting documentation using semantic search. Understands natural language queries like 'how do I read XML data from a job' as well as specific terms like 'XmlDocument'.", {
    query: z.string().min(1).describe("Search query — natural language or specific terms"),
    limit: z.number().min(1).max(50).default(10).optional()
        .describe("Maximum number of results (default 10, max 50)"),
}, async ({ query, limit }) => {
    const max = limit ?? 10;
    // Wait for search index if still building
    await indexReady;
    const results = await searchIndex.search(query, max);
    if (results.length === 0) {
        return {
            content: [{ type: "text", text: `No results found for "${query}". Try rephrasing your question.` }],
        };
    }
    let text = `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}":\n\n`;
    for (const [idx, hit] of results.entries()) {
        text += `${idx + 1}. [${hit.contentType}] **${hit.source}** — ${hit.heading} (relevance: ${hit.score})\n`;
        text += `   URI: ${hit.uri}\n`;
        text += `   ${hit.snippet}\n\n`;
    }
    return { content: [{ type: "text", text }] };
});
// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Switch MCP Server v${VERSION} running on stdio (${docFiles.length} docs from ${DOC_ROOT})`);
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
// ---------------------------------------------------------------------------
// CLI helpers
// ---------------------------------------------------------------------------
function parseArgs(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--doc-root")
            out.docRoot = argv[++i];
        else if (a === "-h" || a === "--help")
            out.help = true;
    }
    return out;
}
function printHelp() {
    console.error(`
switch-mcp-server v${VERSION} - MCP server for Switch scripting documentation

Usage: switch-mcp [options]

Options:
  --doc-root <path>   Override doc root (default: bundled mcp-switch-manual)
  -h, --help          Show help

Features:
  - Semantic search powered by all-MiniLM-L6-v2 (local, no API key)
  - 32+ Switch scripting documentation resources
  - Embedding cache for fast startup

Built on @modelcontextprotocol/sdk with stdio transport.
For IDE integration, see README.md
`);
}
