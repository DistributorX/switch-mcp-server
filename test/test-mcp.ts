#!/usr/bin/env node

/**
 * Automated MCP protocol test for switch-docs server.
 * Spawns the server as a child process, sends MCP messages, validates responses.
 */

import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_PATH = path.join(__dirname, "..", "dist", "stdio.js");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ ${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

class McpTestClient {
  private child: ChildProcess;
  private buffer = "";
  private pending: Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }> = new Map();
  private nextId = 1;

  constructor() {
    this.child = spawn("node", [SERVER_PATH], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.stdout!.setEncoding("utf-8");
    this.child.stdout!.on("data", (chunk: string) => {
      this.buffer += chunk;
      let idx: number;
      while ((idx = this.buffer.indexOf("\n")) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if ("id" in msg && this.pending.has(msg.id)) {
            this.pending.get(msg.id)!.resolve(msg);
            this.pending.delete(msg.id);
          }
        } catch { /* ignore non-JSON */ }
      }
    });
  }

  async request(method: string, params?: any): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
      }, 60000);

      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v); },
        reject: (e) => { clearTimeout(timeout); reject(e); },
      });

      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
      this.child.stdin!.write(msg + "\n");
    });
  }

  notify(method: string, params?: any) {
    const msg = JSON.stringify({ jsonrpc: "2.0", method, params });
    this.child.stdin!.write(msg + "\n");
  }

  close() {
    this.child.stdin!.end();
    this.child.kill();
  }
}

async function runTests() {
  console.log("\nMCP Server Test Suite\n");
  const client = new McpTestClient();

  // ---- 1. Initialize ----
  console.log("1. Initialize handshake");
  const initResp = await client.request("initialize", {
    protocolVersion: "2025-11-05",
    capabilities: {},
    clientInfo: { name: "test-suite", version: "1.0" },
  });
  assert(initResp.result !== undefined, "Initialize returns result (no error)");
  assert(typeof initResp.result.protocolVersion === "string", "Response includes protocolVersion");
  assertEqual(initResp.result.serverInfo.name, "switch-docs", "Server name is switch-docs");
  assertEqual(initResp.result.serverInfo.version, "0.9.0", "Server version is 0.9.0");
  assert(initResp.result.capabilities.resources !== undefined, "Advertises resources capability");
  assert(initResp.result.capabilities.tools !== undefined, "Advertises tools capability");

  // Send initialized notification
  client.notify("notifications/initialized");

  // ---- 2. Resources/list ----
  console.log("\n2. Resources list");
  const listResp = await client.request("resources/list");
  const resources = listResp.result.resources;
  assert(Array.isArray(resources), "Returns resources array");
  assert(resources.length >= 27, `Has at least 27 resources (got ${resources.length})`);

  // Check resource structure
  const firstResource = resources[0];
  assert(typeof firstResource.uri === "string", "Resource has uri (string)");
  assert(typeof firstResource.name === "string", "Resource has name (string)");
  assert(firstResource.uri.startsWith("switch-docs://"), "URI uses switch-docs:// scheme");

  // Check for Dialect file
  const dialectResource = resources.find((r: any) =>
    r.uri.includes("Dialect") || r.name.includes("Dialect")
  );
  assert(dialectResource !== undefined, "Dialect file is listed as a resource");

  // Check for known API docs
  const xmlDoc = resources.find((r: any) => r.uri.includes("xml_document"));
  assert(xmlDoc !== undefined, "api/xml_document.md is listed");

  // Check name generation (SDK puts display name in 'title', not 'name')
  const chapterResource = resources.find((r: any) =>
    (r.title || "").startsWith("Chapter ")
  );
  assert(chapterResource !== undefined, "Chapter files have generated titles (Chapter X: Title)");

  // Check descriptions exist
  const withDescriptions = resources.filter((r: any) => r.description && r.description.length > 0);
  assert(withDescriptions.length > 20, `Most resources have descriptions (${withDescriptions.length}/${resources.length})`);

  // ---- 3. Resources/read ----
  console.log("\n3. Resources read");

  // Read a known resource
  const readResp = await client.request("resources/read", {
    uri: "switch-docs://api/xml_document.md",
  });
  assert(readResp.result !== undefined, "Read returns result (no error)");
  const contents = readResp.result.contents;
  assert(Array.isArray(contents) && contents.length === 1, "Returns one content item");
  assert(typeof contents[0].text === "string", "Content has text field");
  assert(contents[0].text.includes("XmlDocument"), "Content contains expected text (XmlDocument)");
  assert(contents[0].text.length > 100, `Content has substantial length (${contents[0].text.length} chars)`);

  // Read a resource with spaces in the URI
  const dialectUri = dialectResource?.uri;
  if (dialectUri) {
    const dialectResp = await client.request("resources/read", { uri: dialectUri });
    assert(dialectResp.result !== undefined, "Can read Dialect file (URI with encoded spaces)");
    assert(
      dialectResp.result.contents[0].text.includes("Enfocus Switch"),
      "Dialect content is correct"
    );
  }

  // Read a nonexistent resource
  const badResp = await client.request("resources/read", {
    uri: "switch-docs://nonexistent.md",
  });
  assert(badResp.error !== undefined, "Reading nonexistent resource returns error");

  // Path traversal attempt
  const traversalResp = await client.request("resources/read", {
    uri: "switch-docs://..%2F..%2Fetc%2Fpasswd",
  });
  assert(traversalResp.error !== undefined, "Path traversal attempt returns error");

  // ---- 4. Tools/list ----
  console.log("\n4. Tools list");
  const toolsResp = await client.request("tools/list");
  const tools = toolsResp.result.tools;
  assert(Array.isArray(tools), "Returns tools array");
  assert(tools.length >= 1, `Has at least 1 tool (got ${tools.length})`);
  const searchTool = tools.find((t: any) => t.name === "search_docs");
  assert(searchTool !== undefined, "search_docs tool is listed");
  assert(typeof searchTool.description === "string" && searchTool.description.length > 0, "Tool has description");
  assert(searchTool.inputSchema !== undefined, "Tool has inputSchema");

  // ---- 5. Search tool ----
  console.log("\n5. Search tool (tools/call)");

  // Basic search
  const searchResp = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "XmlDocument", limit: 5 },
  });
  assert(searchResp.result !== undefined, "Search returns result");
  const searchContent = searchResp.result.content[0].text;
  assert(searchContent.includes("XmlDocument"), "Search results contain the query term");
  assert(searchContent.includes("result"), "Search results include result count");

  // Search across Dialect content
  const dialectSearch = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "jobArrived", limit: 10 },
  });
  const dialectText = dialectSearch.result.content[0].text;
  assert(dialectText.includes("Dialect"), "Search finds content in Dialect file");

  // Search with nonsense query — should return no or very few low-relevance results
  const emptySearch = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "zzz_nonexistent_term_xyz_12345" },
  });
  const emptyText = emptySearch.result.content[0].text;
  assert(
    emptyText.includes("No results") || emptyText.includes("Found"),
    "Nonsense search returns a valid response"
  );

  // Search with default limit
  const defaultSearch = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "Switch" },
  });
  assert(defaultSearch.result !== undefined, "Search with default limit works");

  // Unknown tool (SDK returns result with isError: true, not a JSON-RPC error)
  const unknownTool = await client.request("tools/call", {
    name: "nonexistent_tool",
    arguments: {},
  });
  assert(
    unknownTool.result?.isError === true || unknownTool.error !== undefined,
    "Calling unknown tool returns error"
  );

  // ---- 6. Semantic search quality ----
  console.log("\n6. Semantic search quality");

  // Natural language: reading XML data
  const xmlQuery = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "how do I read XML data from a job", limit: 5 },
  });
  const xmlResults = xmlQuery.result.content[0].text;
  assert(
    xmlResults.includes("xml") || xmlResults.includes("Xml") || xmlResults.includes("XML"),
    "Natural language XML query finds XML-related docs"
  );
  assert(
    xmlResults.includes("Dialect") || xmlResults.includes("xml_document"),
    "XML query surfaces Dialect or API reference"
  );

  // Natural language: webhooks
  const webhookQuery = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "how do I set up a webhook in Switch", limit: 5 },
  });
  const webhookResults = webhookQuery.result.content[0].text;
  assert(
    webhookResults.toLowerCase().includes("http") || webhookResults.toLowerCase().includes("webhook"),
    "Webhook query finds HTTP/webhook docs"
  );

  // Natural language: batching
  const batchQuery = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query: "batch jobs with timerFired", limit: 5 },
  });
  const batchResults = batchQuery.result.content[0].text;
  assert(
    batchResults.includes("timerFired") || batchResults.includes("getJobs"),
    "Batch query finds timerFired or getJobs content"
  );

  // Results include relevance scores
  assert(
    xmlResults.includes("relevance:"),
    "Search results include relevance scores"
  );

  // Results include section headings
  assert(
    xmlResults.includes("—"),
    "Search results include section headings (source — heading format)"
  );

  // Results include content type tags
  assert(
    xmlResults.includes("[patterns]") || xmlResults.includes("[reference]") || xmlResults.includes("[manual]"),
    "Search results include content type tags"
  );

  // ---- 7. Error handling ----
  console.log("\n7. Error handling");

  // Unknown method
  const unknownMethod = await client.request("some/unknown/method");
  assert(unknownMethod.error !== undefined, "Unknown method returns error");

  // ---- Results ----
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`${"=".repeat(50)}\n`);

  client.close();

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
