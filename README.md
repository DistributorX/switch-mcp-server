# Switch MCP Server

MCP server that gives AI assistants access to Enfocus Switch scripting documentation. When configured in your IDE, the AI can browse API reference docs, read the Switch Dialect patterns guide, and run semantic search queries — so it writes accurate Switch-specific code instead of guessing.

## Setup

```bash
git clone <repo-url> switch-mcp-server
cd switch-mcp-server
npm install    # builds TypeScript and downloads embedding model on first run
```

That's it. The `npm install` step compiles the TypeScript source and on the first search query the embedding model (~80MB) downloads automatically. Subsequent starts load cached embeddings in under a second.

## IDE Configuration

Point your IDE at the compiled server entry point. Replace `/path/to/switch-mcp-server` with your actual clone path.

### Claude Code

Add to `~/.claude.json` (global) or `.mcp.json` (per-project):

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

### VS Code

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "switch-docs": {
      "command": "node",
      "args": ["/path/to/switch-mcp-server/dist/stdio.js"]
    }
  }
}
```

### Cursor

Add to Cursor MCP settings:

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

Restart your IDE after adding the configuration. You should see "switch-docs" appear as a connected MCP server.

## Updating

When code or documentation changes are pushed to the repo:

```bash
cd switch-mcp-server
git pull && npm install
```

Restart your IDE to pick up the changes. If only documentation files changed (no code changes), you can skip `npm install` — just restart the IDE.

## What's Included

### Documentation Resources (28 files)

All served as MCP resources via `switch-docs://` URIs:

- **API Reference** (`api/`) — Core classes: Switch, Job, FlowElement, Connection, plus document helpers for PDF, Image, XML, XMP
- **Dialect Patterns** — Real-world Switch scripting patterns with What/Why/Usage structure (jobArrived, timerFired, datasets, XML handling, webhooks, batching, etc.)
- **Development Guides** (`dev/`) — Declarations, debugging, deployment
- **Examples** (`examples/`) — Tested code snippets
- **Manual Chapters** — Complete Switch Scripting Node.js reference (Chapters 0-5)

### Semantic Search Tool

The `search_docs` tool understands natural language:

```
"how do I read XML data from a job"     → finds XmlDocument API + Dialect patterns
"batch jobs with timerFired"             → finds timerFired entry point + batching patterns
"set up a webhook in Switch"             → finds HTTP request docs
```

Results include relevance scores, content type tags (`[reference]`, `[patterns]`, `[manual]`, etc.), and text snippets.

## Updating Content

The documentation in `mcp-switch-manual/` is the knowledge base. You can edit any file, add new files, or remove files — the search index rebuilds automatically on next server start.

### Editing existing files

Edit any `.md` file in `mcp-switch-manual/` directly. For example, to add a new Dialect entry:

1. Open `mcp-switch-manual/Enfocus Switch Scripting - Dialect.md`
2. Add your new `##` section following the existing What/Why/Usage pattern
3. Restart your IDE (this restarts the MCP server)

That's it. The server re-chunks the changed file, re-embeds only the new/modified chunks (unchanged chunks load from cache), and the new content is immediately searchable.

### Adding new files

Drop a `.md` file into `mcp-switch-manual/` or any subdirectory. It's automatically discovered on next server start. Use `##` headings to create natural chunk boundaries for search.

### How the search index works

On every server start:
1. All `.md` files in `mcp-switch-manual/` are discovered and split into chunks (by `##`/`###` headings)
2. Each chunk is hashed by content — if the hash matches the cached embedding, it's loaded instantly
3. Only new or changed chunks are re-embedded (takes a few seconds)
4. The cache is saved to `.cache/embeddings.json` for next time

So after editing content, you just restart the IDE. No build step, no manual re-indexing.

### Content types

Content type tags are assigned based on file path and appear in search results:

| Path | Content Type |
|------|-------------|
| `api/` | reference |
| `examples/` | examples |
| `dev/` | guide |
| Files containing "Dialect" | patterns |
| Files containing "Chapter" | manual |
| Everything else | guide |

## CLI Options

```
node dist/stdio.js [options]

Options:
  --doc-root <path>   Override documentation root (default: bundled mcp-switch-manual/)
  -h, --help          Show help
```

## Development

```bash
npm run build          # Compile TypeScript to dist/
npm start              # Run the server
npm test               # Build + run all test suites (101 tests)
```

### Test Suites

- `test/test-chunking.ts` — Document discovery, chunking, and metadata (38 tests)
- `test/test-mcp.ts` — Full MCP protocol: handshake, resources, tools, search (44 tests)
- `test/test-scenarios.ts` — Real-world developer queries and search quality (19 tests)

### Architecture

```
src/
  stdio.ts    Server entry point — MCP setup, resource registration, search tool
  docs.ts     Document discovery, markdown chunking, metadata generation
  search.ts   Semantic search — embeddings, caching, cosine similarity
```

Built on `@modelcontextprotocol/sdk` with `StdioServerTransport`. Search uses `@huggingface/transformers` with the `all-MiniLM-L6-v2` embedding model (384-dim vectors, runs locally, no API key needed).

## License

UNLICENSED - Private internal use
