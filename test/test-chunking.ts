#!/usr/bin/env node

/**
 * Unit tests for document chunking logic.
 * Validates that markdown files are split into correct, well-formed chunks.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocs, chunkAllDocs, chunkMarkdown, pathToUri, generateName } from "../src/docs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOC_ROOT = path.join(__dirname, "..", "mcp-switch-manual");

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

// ---- 1. Document discovery ----
console.log("\n1. Document discovery");

const docFiles = discoverDocs(DOC_ROOT);
assert(docFiles.length >= 31, `Discovers at least 31 docs (got ${docFiles.length})`);

const dialectFile = docFiles.find(d => d.relativePath.includes("Dialect"));
assert(dialectFile !== undefined, "Finds Dialect file");

const apiFiles = docFiles.filter(d => d.relativePath.startsWith("api/"));
assert(apiFiles.length >= 8, `Finds API docs (got ${apiFiles.length})`);

// ---- 2. Chunking a multi-section file ----
console.log("\n2. Multi-section file chunking");

// Must be >500 chars to trigger splitting
const multiContent = `# API Reference Guide

This is the introduction to the API reference. It covers the main classes and methods
available in the Switch scripting environment for automating print workflows.

## Connection Class

The Connection class represents an outgoing connection from a flow element.
Use flowElement.getOutConnections() to get an array of Connection instances.
Each connection has a name that you set in Switch Designer.

\`\`\`typescript
const connections = flowElement.getOutConnections();
const processConn = connections.find(c => c.getName() === "process");
await job.sendTo(processConn);
\`\`\`

## Job Class

The Job class represents a file or folder being processed in the workflow.
Jobs arrive via jobArrived and must be explicitly routed via sendTo methods.

\`\`\`typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  const jobPath = await job.get(AccessLevel.ReadWrite);
  await job.sendToSingle();
}
\`\`\`
`;

const multiChunks = chunkMarkdown(multiContent, "test.md", "switch-docs://test.md");
assertEqual(multiChunks.length, 3, "Multi-section file splits into 3 chunks (intro + 2 sections)");
assertEqual(multiChunks[0].heading, "Test", "First chunk heading is file title");
assert(multiChunks[0].text.includes("API Reference"), "First chunk contains the title");
assert(multiChunks[0].text.includes("introduction"), "First chunk contains intro text");
assertEqual(multiChunks[1].heading, "Connection Class", "Second chunk heading is Connection Class");
assert(multiChunks[1].text.includes("getOutConnections"), "Second chunk has correct content");
assertEqual(multiChunks[2].heading, "Job Class", "Third chunk heading is Job Class");
assert(multiChunks[2].text.includes("jobArrived"), "Third chunk has correct content");

// Verify chunks don't bleed into each other
assert(!multiChunks[1].text.includes("Job class"), "Connection chunk doesn't contain Job content");
assert(!multiChunks[2].text.includes("Connection class"), "Job chunk doesn't contain Connection content");

// ---- 3. Short file stays as single chunk ----
console.log("\n3. Short file handling");

const shortContent = `# Short Doc

This is a very short document.
`;

const shortChunks = chunkMarkdown(shortContent, "short.md", "switch-docs://short.md");
assertEqual(shortChunks.length, 1, "Short file (<500 chars) stays as single chunk");
assertEqual(shortChunks[0].heading, "Short", "Short chunk uses file title as heading");

// ---- 4. Dialect file chunking ----
console.log("\n4. Dialect file chunking");

const dialectPath = path.join(DOC_ROOT, "Enfocus Switch Scripting - Dialect.md");
const dialectContent = fs.readFileSync(dialectPath, "utf-8");
const dialectChunks = chunkMarkdown(
  dialectContent,
  "Enfocus Switch Scripting - Dialect.md",
  pathToUri("Enfocus Switch Scripting - Dialect.md")
);

assert(dialectChunks.length >= 20, `Dialect splits into many chunks (got ${dialectChunks.length})`);

// Check that known dialect entries get their own chunks
const knownEntries = [
  "XmlDocument Class",
  "jobArrived Entry Point",
  "Job Routing Methods",
  "timerFired Entry Point",
  "Job Datasets",
  "AccessLevel Enum",
  "FlowElement Property Access",
  "HTTP Webhook Subscription",
];

for (const entry of knownEntries) {
  const found = dialectChunks.find(c => c.heading.includes(entry) || c.text.includes(`## ${entry}`));
  assert(found !== undefined, `Dialect entry "${entry}" has its own chunk`);
}

// Verify no chunk is excessively large (>5000 chars)
const oversizedChunks = dialectChunks.filter(c => c.text.length > 5000);
assert(
  oversizedChunks.length === 0,
  `No oversized Dialect chunks (${oversizedChunks.length} over 5000 chars)`
);

// Verify no empty chunks
const emptyChunks = dialectChunks.filter(c => c.text.trim().length === 0);
assertEqual(emptyChunks.length, 0, "No empty Dialect chunks");

// Verify each chunk has a hash
const unhashed = dialectChunks.filter(c => !c.hash || c.hash.length === 0);
assertEqual(unhashed.length, 0, "All Dialect chunks have content hashes");

// ---- 5. All docs chunking ----
console.log("\n5. All docs chunking");

const allChunks = chunkAllDocs(DOC_ROOT, docFiles);
assert(allChunks.length >= 100, `Total chunks >= 100 (got ${allChunks.length})`);
assert(allChunks.length <= 500, `Total chunks <= 500 (got ${allChunks.length})`);

// Verify all chunks have required fields
for (const chunk of allChunks) {
  if (!chunk.source || !chunk.heading || !chunk.text || !chunk.hash || !chunk.uri) {
    failed++;
    console.log(`  ✗ Chunk missing fields: ${JSON.stringify({ source: chunk.source, heading: chunk.heading })}`);
    break;
  }
}
passed++;
console.log("  ✓ All chunks have required fields (source, heading, text, hash, uri)");

// Verify no duplicate hashes within same source
const hashMap = new Map<string, string>();
let dupeCount = 0;
for (const chunk of allChunks) {
  const key = `${chunk.source}::${chunk.hash}`;
  if (hashMap.has(key)) {
    dupeCount++;
  }
  hashMap.set(key, chunk.heading);
}
assertEqual(dupeCount, 0, "No duplicate content hashes within same source file");

// Check chunk size distribution
const sizes = allChunks.map(c => c.text.length);
const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
const maxSize = Math.max(...sizes);
const minSize = Math.min(...sizes);
console.log(`  ℹ Chunk size: min=${minSize}, avg=${avgSize}, max=${maxSize} chars`);
assert(maxSize < 15000, `No chunk exceeds 15000 chars (max: ${maxSize})`);
assert(minSize > 5, `No nearly-empty chunks (min: ${minSize} chars)`);

// ---- 6. Chapter files ----
console.log("\n6. Chapter file chunking");

const chapterFile = docFiles.find(d => d.relativePath.includes("Chapter 4"));
if (chapterFile) {
  const chapterContent = fs.readFileSync(path.join(DOC_ROOT, chapterFile.relativePath), "utf-8");
  const chapterChunks = chunkMarkdown(chapterContent, chapterFile.relativePath, chapterFile.uri);
  assert(chapterChunks.length >= 5, `Chapter 4 splits into multiple chunks (got ${chapterChunks.length})`);
  console.log(`  ℹ Chapter 4: ${chapterChunks.length} chunks from ${chapterContent.length} chars`);
} else {
  failed++;
  console.log("  ✗ Chapter 4 not found");
}

// ---- 7. URI generation ----
console.log("\n7. URI and name generation");

assertEqual(pathToUri("api/xml_document.md"), "switch-docs://api/xml_document.md", "Simple path URI");
assertEqual(
  pathToUri("Enfocus Switch Scripting - Dialect.md"),
  "switch-docs://Enfocus%20Switch%20Scripting%20-%20Dialect.md",
  "Path with spaces URI"
);
assertEqual(generateName("api/xml_document.md"), "Xml Document", "Kebab-to-title name");
assertEqual(
  generateName("Switch Scripting Node-js - Chapter 4 - Scripting reference.md"),
  "Chapter 4: Scripting reference",
  "Chapter name generation"
);

// ---- Results ----
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${"=".repeat(50)}\n`);

if (failed > 0) process.exit(1);
