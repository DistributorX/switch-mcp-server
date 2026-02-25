# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server that serves Enfocus Switch scripting documentation to AI assistants. Built on the official `@modelcontextprotocol/sdk` with semantic search powered by local embeddings.

**Version**: 0.9.0
**Transport**: stdio (local, no network)
**Distribution**: Git clone (not npm registry)

## Build & Development Commands

```bash
npm install            # Install deps + build (prepare script)
npm run build          # Compile TypeScript to dist/
npm start              # Run the server
npm test               # Build + run all 3 test suites (101 tests)

node dist/stdio.js                      # Run directly
node dist/stdio.js --doc-root /custom   # Custom doc root
```

## Architecture

Three source files in `src/`:

### `src/stdio.ts` — Server entry point (~170 lines)
- Creates `McpServer` from `@modelcontextprotocol/sdk`
- Registers each doc file as a static MCP resource via `server.resource()`
- Registers `search_docs` as an MCP tool via `server.tool()` with Zod schema
- Builds search index in background (non-blocking — server starts immediately)
- CLI arg parsing for `--doc-root` and `--help`

### `src/docs.ts` — Document discovery & chunking (~285 lines)
- `discoverDocs(docRoot)` — Walks directory tree for `.md` files, generates metadata (URI, display name, description)
- `chunkAllDocs(docRoot, docFiles)` — Reads all files and splits into chunks
- `chunkMarkdown(content, path, uri)` — Splits by `##`/`###` headings, then by paragraphs/lines for oversized chunks (max 3000 chars)
- `classifyContent(path)` — Categorizes files: `api/` → reference, `examples/` → examples, `dev/` → guide, Dialect → patterns, Chapter → manual
- `pathToUri(path)` — Converts relative path to `switch-docs://` URI with encoded components

### `src/search.ts` — Semantic search (~238 lines)
- `SearchIndex` class with `build()` and `search()` methods
- Embeds chunks using `Xenova/all-MiniLM-L6-v2` (384-dim vectors) via `@huggingface/transformers`
- Disk-backed embedding cache in `.cache/embeddings.json` — keyed by `source::hash` for content-based invalidation
- Cosine similarity search with 0.25 minimum relevance threshold
- Deduplicates results by source+heading pair

## TypeScript Configuration

- Target: ES2022, Module: Node16 (ESM)
- Strict mode, output to `dist/`
- `"type": "module"` in package.json

## Testing

Three test suites, all runnable via `npm test`:

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Chunking | `test/test-chunking.ts` | 38 | Discovery, splitting, metadata, size limits |
| MCP Protocol | `test/test-mcp.ts` | 44 | Handshake, resources, tools, search quality, errors |
| Scenarios | `test/test-scenarios.ts` | 19 | Real developer queries, search relevance |

MCP tests spawn the server as a child process and communicate via JSON-RPC over stdio. Timeout is 60s per request (model download on first run).

## Key Design Decisions

- **Chunking max size 3000 chars** — Keeps within the embedding model's effective window (~512 tokens). Oversized sections (tables, long code blocks) are split by paragraph then by line.
- **Cache key is `source::hash`** — Not `source::heading`, because duplicate headings within a file caused cache collisions.
- **Background index build** — `indexReady` promise allows server to start handling requests immediately; search tool awaits it before first query.
- **Content type tags** — Search results show `[reference]`, `[patterns]`, `[manual]`, etc. so the LLM knows if it's reading API docs vs practical patterns.

## Documentation Structure

Content lives in `mcp-switch-manual/` (28 files):

- `api/` — API reference (Switch, Job, FlowElement, Connection, XML, PDF, Image, XMP, HTTP, enums)
- `dev/` — Development guides (declarations, debugging, deployment)
- `examples/` — Tested code snippets
- `Enfocus Switch Scripting - Dialect.md` — Real-world patterns (symlinked to working copy)
- Root — Manual chapters (0-5), overview, script-elements, script-folders, etc.

## Development Workflow

1. Edit source in `src/` → `npm run build` → `npm test`
2. Edit docs in `mcp-switch-manual/` → restart server (no build needed, but cache auto-invalidates)
3. Add new content: drop `.md` file into `mcp-switch-manual/` subdirectory

## IDE Integration

Configure in Claude Code (`~/.claude.json`), VS Code (`.vscode/mcp.json`), or Cursor:

```json
{
  "mcpServers": {
    "switch-docs": {
      "command": "node",
      "args": ["/path/to/switch-mcp-server/dist/stdio.js"]
    }
  }
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP protocol (McpServer, StdioServerTransport) |
| `@huggingface/transformers` | Local embedding model (all-MiniLM-L6-v2) |
| `zod` | Schema validation for tool parameters |

## References

- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [ROADMAP.md](./ROADMAP.md) — 5-phase project roadmap
