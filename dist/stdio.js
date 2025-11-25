#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const args = parseArgs(process.argv.slice(2));
const DOC_ROOT = path_1.default.resolve(args.docRoot ?? process.env.DOC_ROOT ?? path_1.default.join(__dirname, "..", "mcp-switch-manual"));
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
        let idx;
        while ((idx = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line)
                continue;
            handleLine(line);
        }
    });
    process.stdin.on("end", () => process.exit(0));
}
async function handleLine(line) {
    let msg;
    try {
        msg = JSON.parse(line);
    }
    catch {
        reply(null, null, { code: "parse_error", message: "Invalid JSON" });
        return;
    }
    if (!msg || typeof msg !== "object" || msg.id === undefined || !("method" in msg)) {
        reply(null, null, { code: "invalid", message: "Invalid message" });
        return;
    }
    try {
        switch (msg.method) {
            case "listResources": {
                const resources = await listResources(DOC_ROOT);
                reply(msg.id, { resources }, null);
                break;
            }
            case "readResource": {
                const rel = sanitizePath(msg.params?.path);
                if (!rel) {
                    reply(msg.id, null, { code: "bad_path", message: "Invalid path" });
                    break;
                }
                const abs = path_1.default.join(DOC_ROOT, rel);
                if (!abs.startsWith(DOC_ROOT)) {
                    reply(msg.id, null, { code: "bad_path", message: "Path escapes doc root" });
                    break;
                }
                const content = await promises_1.default.readFile(abs, "utf8");
                const stat = await promises_1.default.stat(abs);
                reply(msg.id, { path: rel, size: stat.size, mtime: stat.mtimeMs, content }, null);
                break;
            }
            case "search": {
                const query = msg.params?.query?.trim();
                if (!query) {
                    reply(msg.id, null, { code: "bad_query", message: "Missing query" });
                    break;
                }
                const limit = clamp(Number(msg.params?.limit ?? 20), 1, 50);
                const results = await searchDocs(DOC_ROOT, query, limit);
                reply(msg.id, { query, results }, null);
                break;
            }
            default:
                reply(msg.id, null, { code: "unknown_method", message: String(msg.method) });
        }
    }
    catch (err) {
        reply(msg.id, null, { code: "server_error", message: err?.message ?? "error" });
    }
}
function reply(id, result, error) {
    const payload = { id };
    if (error)
        payload.error = error;
    else
        payload.result = result;
    process.stdout.write(JSON.stringify(payload) + "\n");
}
async function listResources(root) {
    const entries = [];
    await walk(root, async (abs, rel) => {
        if (!abs.endsWith(".md"))
            return;
        const stat = await promises_1.default.stat(abs);
        entries.push({ path: rel, size: stat.size, mtime: stat.mtimeMs });
    });
    return entries.sort((a, b) => a.path.localeCompare(b.path));
}
async function searchDocs(root, query, limit) {
    const needle = query.toLowerCase();
    const hits = [];
    await walk(root, async (abs, rel) => {
        if (!abs.endsWith(".md"))
            return;
        const content = await promises_1.default.readFile(abs, "utf8");
        const idx = content.toLowerCase().indexOf(needle);
        if (idx === -1)
            return;
        const start = Math.max(0, idx - 80);
        const end = Math.min(content.length, idx + query.length + 80);
        const snippet = content.slice(start, end).replace(/\s+/g, " ").trim();
        hits.push({ path: rel, snippet });
    });
    return hits.slice(0, limit);
}
async function walk(root, fn) {
    const stack = [root];
    while (stack.length) {
        const current = stack.pop();
        const dir = await promises_1.default.readdir(current, { withFileTypes: true });
        for (const entry of dir) {
            const abs = path_1.default.join(current, entry.name);
            const rel = path_1.default.relative(root, abs);
            if (entry.isDirectory()) {
                stack.push(abs);
            }
            else if (entry.isFile()) {
                await fn(abs, rel);
            }
        }
    }
}
function sanitizePath(p) {
    if (typeof p !== "string")
        return null;
    const clean = p.replace(/^\/+/, "");
    if (clean.includes(".."))
        return null;
    return clean;
}
async function exists(p) {
    try {
        await promises_1.default.access(p);
        return true;
    }
    catch {
        return false;
    }
}
function clamp(n, min, max) {
    if (Number.isNaN(n))
        return min;
    return Math.min(Math.max(n, min), max);
}
function parseArgs(argv) {
    const out = {};
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
switch-mcp (stdio) - Switch scripting MCP resources

Options:
  --doc-root <path>   Override doc root (default: bundled mcp-switch-manual)
  -h, --help          Show help

Protocol: line-delimited JSON over stdin/stdout
  {id, method:"listResources"}
  {id, method:"readResource", params:{path}}
  {id, method:"search", params:{query, limit?}}
`;
    process.stdout.write(msg);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
