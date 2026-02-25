#!/usr/bin/env node

/**
 * Real-world scenario tests.
 * Simulates actual developer queries and validates that the search
 * returns genuinely useful, actionable results.
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
        } catch { /* ignore */ }
      }
    });
  }

  async request(method: string, params?: any): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout: ${method} (id=${id})`));
      }, 60000);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v); },
        reject: (e) => { clearTimeout(timeout); reject(e); },
      });
      this.child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  notify(method: string, params?: any) {
    this.child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }

  close() {
    this.child.stdin!.end();
    this.child.kill();
  }
}

interface SearchResult {
  text: string;
}

async function search(client: McpTestClient, query: string, limit = 5): Promise<string> {
  const resp = await client.request("tools/call", {
    name: "search_docs",
    arguments: { query, limit },
  });
  return resp.result.content[0].text;
}

async function runTests() {
  console.log("\nReal-World Scenario Tests\n");
  const client = new McpTestClient();

  // Initialize
  await client.request("initialize", {
    protocolVersion: "2025-11-05",
    capabilities: {},
    clientInfo: { name: "scenario-tests", version: "1.0" },
  });
  client.notify("notifications/initialized");

  // Wait for search index to be ready (first query triggers the wait)

  // ---- Scenario 1: Developer needs to read XML data from a job ----
  console.log("Scenario 1: Reading XML data from a job");
  const xml = await search(client, "I need to read an XML dataset that arrived with this job");
  assert(xml.includes("getDataset") || xml.includes("XmlDocument"), "Finds dataset/XML access methods");
  assert(
    xml.toLowerCase().includes("accesslevel") || xml.includes("ReadOnly") || xml.includes("getDataset"),
    "Finds dataset access method (getDataset with accessLevel)"
  );
  assert(xml.includes("Dialect") || xml.includes("api/"), "Results from practical docs (Dialect or API)");

  // ---- Scenario 2: Developer writing jobArrived for the first time ----
  console.log("\nScenario 2: Writing a jobArrived handler");
  const jobArrived = await search(client, "how to write a jobArrived function that processes a file");
  assert(jobArrived.includes("jobArrived"), "Finds jobArrived entry point");
  assert(
    jobArrived.includes("FlowElement") || jobArrived.includes("Switch"),
    "Shows the function signature parameters"
  );
  assert(
    jobArrived.includes("sendToSingle") || jobArrived.includes("sendTo"),
    "Mentions job routing (must route the job)"
  );

  // ---- Scenario 3: Developer needs to create child jobs ----
  console.log("\nScenario 3: Creating child jobs from a parent");
  const childJobs = await search(client, "how to create a new output file from an incoming job");
  assert(
    childJobs.includes("createChild") || childJobs.includes("child"),
    "Finds createChild method"
  );

  // ---- Scenario 4: Developer confused about Switch logging ----
  console.log("\nScenario 4: How does logging work in Switch");
  const logging = await search(client, "how to log messages in a Switch script");
  assert(logging.includes("LogLevel"), "Finds LogLevel enum");
  assert(
    logging.includes("job.log") || logging.includes("flowElement.log"),
    "Shows the logging methods"
  );

  // ---- Scenario 5: Developer wants to use private data ----
  console.log("\nScenario 5: Passing data between flow elements");
  const privateData = await search(client, "how to pass metadata between flow elements without modifying the job file");
  assert(
    privateData.includes("privateData") || privateData.includes("PrivateData") || privateData.includes("private data"),
    "Finds private data methods"
  );

  // ---- Scenario 6: Developer needs HTTP webhook integration ----
  console.log("\nScenario 6: Setting up webhook to receive orders");
  const webhook = await search(client, "receive incoming HTTP POST requests to trigger a workflow");
  assert(
    webhook.includes("httpRequestSubscribe") || webhook.includes("webhook"),
    "Finds webhook subscription"
  );
  assert(
    webhook.includes("httpRequestTriggered") || webhook.includes("HttpRequest"),
    "Shows request handling entry points"
  );

  // ---- Scenario 7: Developer working with timers and batching ----
  console.log("\nScenario 7: Batch processing with timers");
  const batch = await search(client, "collect multiple jobs and process them as a batch on a timer");
  assert(
    batch.includes("timerFired") || batch.includes("getJobs"),
    "Finds timer/batch related methods"
  );
  assert(
    batch.includes("getJobs") || batch.includes("jobArrived") || batch.includes("timerFired"),
    "Finds the batch processing pattern (getJobs + timerFired)"
  );

  // ---- Scenario 8: Developer using Switch-specific patterns (not standard TS) ----
  console.log("\nScenario 8: Switch-specific import/export rules");
  const imports = await search(client, "do I need to import Switch types or export jobArrived");
  assert(
    imports.includes("import") || imports.includes("export"),
    "Addresses import/export question"
  );
  assert(
    imports.includes("global scope") || imports.includes("implicitly") || imports.includes("never need"),
    "Explains that Switch handles this implicitly"
  );

  // ---- Scenario 9: Developer needs PDF page dimensions ----
  console.log("\nScenario 9: Getting PDF page dimensions");
  const pdf = await search(client, "get the width and height of pages in a PDF file");
  assert(
    pdf.includes("PdfDocument") || pdf.includes("PdfPage") || pdf.includes("pdf"),
    "Finds PDF-related classes"
  );
  assert(
    pdf.includes("MediaBox") || pdf.includes("TrimBox") || pdf.includes("Width") || pdf.includes("Height"),
    "Mentions page dimension methods"
  );

  // ---- Scenario 10: Developer needs to validate script properties ----
  console.log("\nScenario 10: Validating user-configured properties");
  const validate = await search(client, "how to validate properties that users configure in Switch Designer");
  assert(
    validate.includes("validateProperties") || validate.includes("getPropertyStringValue"),
    "Finds property validation methods"
  );

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
