# Project Roadmap — switch-mcp-server v1.0

> Refreshed February 2026.

## Context

This project provides an MCP (Model Context Protocol) server that gives AI assistants (Claude Code, Cursor, VS Code Copilot) access to Enfocus Switch scripting documentation and examples. When a developer is writing Switch scripts, the LLM can query this server to get accurate, Switch-specific guidance rather than hallucinating standard TypeScript patterns that don't apply.

### Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Transport | **stdio (local)** | Zero latency, offline, no server to maintain. Claude Code and VS Code natively support stdio. |
| Search | **Semantic (vector)** | Natural language queries ("how do I read an XML dataset?") need to find relevant docs even when exact terms don't match. |
| Embedding | **@huggingface/transformers** with `all-MiniLM-L6-v2` | Runs locally in Node.js, no external API, ~80MB model. |
| Protocol | **@modelcontextprotocol/sdk** | Official SDK handles all protocol plumbing. Cuts hand-rolled code from ~550 lines to ~150 lines of business logic. Auto-compliant with latest spec. |
| Content sources | **Single directory** (`mcp-switch-manual/`) | Dialect doc symlinked in. All content in one place for indexing. |
| Distribution | **GitHub repo (company-owned)** | Devs clone, `npm install`, configure IDE. Company owns code, visible to team, updates via `git pull`. |

---

## Phase 1: SDK Migration & Modernization

**Goal**: Replace hand-rolled JSON-RPC with the official MCP SDK. Modernize the protocol version. Keep all existing functionality working.

### Tasks

- [ ] Install `@modelcontextprotocol/sdk` and `zod` as dependencies
- [ ] Rewrite `src/stdio.ts` using `McpServer` class and `StdioServerTransport`
  - Register all markdown files as resources (SDK handles `resources/list` and `resources/read`)
  - Register `search_docs` as a tool with Zod schema validation
  - Keep existing business logic: file walking, URI conversion, name generation, description extraction
- [ ] Remove all hand-rolled JSON-RPC code (state machine, error codes, line parsing, transport)
- [ ] Update protocol version to latest supported by SDK
- [ ] Update `tsconfig.json` if needed for SDK compatibility (may need ESM modules)
- [ ] Verify with Claude Code and VS Code that the server works identically
- [ ] Update `CLAUDE.md` to reflect new architecture

### Acceptance Criteria

- Server starts via stdio and completes MCP handshake with Claude Code
- `resources/list` returns all docs with names, descriptions, URIs
- `resources/read` returns file content by URI
- `search_docs` tool returns results
- Codebase is ~150-200 lines of business logic (down from ~550)

---

## Phase 2: Semantic Search

**Goal**: Replace case-insensitive substring search with vector-based semantic search so natural language queries return relevant results.

### Tasks

- [ ] Install `@huggingface/transformers` as dependency
- [ ] Design document chunking strategy
  - Split each markdown file into sections (by `##` headings)
  - Each chunk: section heading + content, with source file metadata
  - Target chunk size: ~500-1000 tokens (semantic units, not arbitrary splits)
- [ ] Build embedding pipeline
  - At startup: load `all-MiniLM-L6-v2` model via Transformers.js
  - Generate 384-dimensional embeddings for each chunk
  - Store in-memory (corpus is small enough: ~31 docs + Dialect = ~50-100 chunks)
- [ ] Implement embedding cache
  - Cache embeddings to disk (e.g. `.cache/embeddings.json`) with file content hashes
  - On startup: only re-embed chunks whose source files have changed
  - Speeds up subsequent starts from seconds to near-instant
- [ ] Implement search
  - At query time: embed the query, compute cosine similarity against all chunks
  - Return top-N results ranked by similarity, with source file, section heading, and snippet
  - Consider hybrid approach: combine semantic score with keyword match bonus
- [ ] Update the `search_docs` MCP tool
  - Keep same tool interface (query string, optional limit)
  - Return richer results: relevance score, source file, section, snippet
- [ ] Test with real Switch scripting queries
  - "How do I read an XML dataset attached to a job?"
  - "What's the difference between sendToSingle and sendTo?"
  - "How do I set up a webhook in Switch?"
  - "How do I batch jobs with timerFired?"

### Acceptance Criteria

- Natural language queries return relevant results (not just exact keyword matches)
- First startup downloads model and generates embeddings (~5-10s)
- Subsequent startups load from cache (<1s)
- Search returns results with relevance scores and source context

---

## Phase 3: Content Integration

**Goal**: Integrate the Dialect document and establish patterns for adding more content over time.

### Tasks

- [ ] Move/symlink Dialect document into `mcp-switch-manual/`
  - Real file: `mcp-switch-manual/switch-dialect.md`
  - Symlink: `/Users/pat/Developer/Switch/! Switch Docs/Enfocus Switch Scripting - Dialect.md` → real file
  - Verify symlink works with the automated dialect writing process
- [ ] Review chunking for Dialect content
  - Dialect uses `##` sections with What/Why/Usage structure — natural chunk boundaries
  - Ensure each dialect entry becomes its own chunk for precise retrieval
- [ ] Tag/annotate content types
  - Distinguish between "reference manual" and "dialect/patterns" content in search results
  - When returning results, indicate whether it's from the manual or from dialect examples
  - This helps the LLM understand if it's reading API reference vs practical guidance
- [ ] Document the process for adding new content
  - How to add new dialect entries
  - How to add new manual sections
  - How to add standalone example files
  - Embedding cache auto-invalidates when files change

### Acceptance Criteria

- Dialect document is indexed and searchable alongside manual docs
- Search results indicate content source/type
- New content added to `mcp-switch-manual/` is automatically picked up on next server start

---

## Phase 4: Distribution & Developer Setup

**Goal**: Make it dead simple for team members to set up and use the server.

### Tasks

- [ ] Move repo to company GitHub organization
- [x] Write setup instructions in README (git clone → npm install → configure IDE)
- [x] Document IDE configuration (Claude Code, VS Code, Cursor)
- [x] Add update instructions: `git pull && npm install`
- [ ] Consider a `postinstall` script that pre-downloads the embedding model so first query isn't slow
- [x] Remove npm publish configuration (`bin`, `files`, `.npmignore` removed)
- [x] Clean up package.json: removed `bin`, updated `name`, removed `.npmignore`
- [x] Add `dist/` to `.gitignore` (built on install via `prepare` script)
- [x] Update `CLAUDE.md` to reflect current architecture
- [x] Version bumped to 0.9.0

### Acceptance Criteria

- A new team member can go from zero to working MCP server in under 5 minutes
- `git pull && npm install` picks up all changes (code, docs, and model)
- Works in Claude Code, VS Code, and Cursor

---

## Phase 5: Polish & Future

**Goal**: Quality-of-life improvements after core functionality is solid.

### Tasks

- [ ] Add a proper test suite
  - Unit tests for chunking and embedding
  - Integration test that starts the server and runs MCP queries
  - Test with sample natural language queries and verify result quality
- [ ] Consider a `search_docs` tool enhancement: accept optional `content_type` filter ("manual", "dialect", "examples")
- [ ] Consider adding MCP prompts (pre-built prompt templates for common Switch tasks)
  - e.g., "Write a jobArrived handler that..." with proper Switch boilerplate
- [ ] Monitor embedding model updates — newer/smaller models may become available
- [ ] Consider whether the old `switch-docs://` URI scheme should change or stay
- [x] Removed `old-switch-manual/` (duplicate of chapters in `mcp-switch-manual/`)
- [x] Removed `AGENTS.md` (not needed)

---

## Architecture Overview (Post-Refresh)

```
switch-mcp-server/
├── src/
│   ├── server.ts          # MCP server setup (McpServer + StdioServerTransport)
│   ├── resources.ts       # File walking, URI conversion, metadata generation
│   ├── search.ts          # Semantic search: chunking, embedding, similarity
│   └── cache.ts           # Embedding cache (disk-backed, hash-validated)
├── mcp-switch-manual/     # All content (manual + dialect + examples)
│   ├── api/               # API reference docs
│   ├── dev/               # Development guides
│   ├── examples/          # Curated code examples
│   ├── switch-dialect.md  # Dialect patterns (symlinked)
│   └── ...                # Manual chapters and guides
├── .cache/                # Generated embedding cache (gitignored)
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

### Dependencies (Post-Refresh)

| Package | Purpose |
|---|---|
| `@modelcontextprotocol/sdk` | MCP protocol handling |
| `zod` | Schema validation (required by SDK) |
| `@huggingface/transformers` | Local embedding model for semantic search |

### Data Flow

```
Developer asks question in IDE
        ↓
IDE invokes MCP server (stdio)
        ↓
Server receives search_docs tool call
        ↓
Query embedded with all-MiniLM-L6-v2
        ↓
Cosine similarity against pre-computed chunk embeddings
        ↓
Top-N results returned with source, section, snippet, score
        ↓
LLM uses results to write accurate Switch-specific code
```

---

## Version Target

All phases complete → **v1.0.0**

| Phase | Version |
|---|---|
| Phase 1 complete | 0.5.0 |
| Phase 2 complete | 0.7.0 |
| Phase 3 complete | 0.8.0 |
| Phase 4 complete | 0.9.0 |
| Phase 5 complete | 1.0.0 |
