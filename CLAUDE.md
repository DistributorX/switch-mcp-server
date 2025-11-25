# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a stdio-based MCP (Model Context Protocol) server that serves the Enfocus Switch scripting documentation and examples. The server runs locally via stdin/stdout (no HTTP/network), designed for IDE integrations like Claude Code and Cursor.

**Purpose**: Enable AI assistants to access comprehensive Switch scripting documentation through MCP, helping developers build Switch automation scripts with Node.js/TypeScript.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development (runs TypeScript directly)
npm run dev

# Build (compile TypeScript to dist/)
npm run build

# Run production build
npm start

# Run CLI directly
node dist/stdio.js
# or with options:
node dist/stdio.js --doc-root /custom/path
```

## Architecture

### Single-file stdio MCP Server
The entire MCP server is implemented in `src/stdio.ts` (~210 lines). It's a minimal, focused implementation that:

1. **Communication Layer**: Line-delimited JSON over stdin/stdout
   - Reads JSON request messages from stdin
   - Writes JSON response messages to stdout
   - No HTTP, no ports, no authentication needed

2. **Three Core Methods**:
   - `listResources`: Returns all `.md` files in doc root with metadata (path, size, mtime)
   - `readResource`: Returns full content of a specific markdown file
   - `search`: Simple case-insensitive text search across all markdown files with snippet extraction

3. **File System Operations**:
   - Doc root defaults to bundled `mcp-switch-manual/` (configurable via `--doc-root` or `DOC_ROOT` env var)
   - Recursive directory walking to find all `.md` files
   - Path sanitization to prevent directory traversal attacks
   - All paths validated to stay within doc root

4. **Request/Response Flow**:
   - Each request has an `id` and `method`
   - Responses include the same `id` plus either `result` or `error`
   - Error codes: `parse_error`, `invalid`, `bad_path`, `bad_query`, `unknown_method`, `server_error`

### Documentation Structure

Documentation lives in `mcp-switch-manual/`:

- **Full manual chapters**: `Switch Scripting Node-js - Chapter 0-5*.md` (complete reference from legacy docs)
- **High-level guides**: `overview.md`, `script-elements.md`, `script-folders.md`, `script-packages.md`
- **Tooling**: `switchscripttool.md`, `switchscripter.md`
- **API reference** (`api/`): Entry points, classes (Switch, FlowElement, Job, Connection), document helpers (PDF, Image, XML, XMP), HTTP, enums
- **Development** (`dev/`): Declarations, debugging, deployment
- **Examples** (`examples/`): Curated, tested code snippets with `README.md` and individual examples like `timer-log.md`

The `old-switch-manual/` folder contains the original, unstructured documentation (kept for reference but not served by MCP).

## TypeScript Configuration

- Target: ES2020
- Module: CommonJS (required for `#!/usr/bin/env node` and npm bin execution)
- Strict mode enabled
- Output: `dist/` directory
- Single source file: `src/stdio.ts`

## Key Implementation Details

### Path Security
The `sanitizePath()` function (src/stdio.ts:149) ensures:
- Paths are strings
- Leading slashes stripped
- No `..` directory traversal allowed
- All resolved paths verified to stay within `DOC_ROOT`

### Search Algorithm
The `searchDocs()` function (src/stdio.ts:116):
- Case-insensitive search across all markdown content
- Returns first match per file
- Extracts 160-character snippets (80 chars before/after match)
- Configurable limit (default 20, max 50 results)
- Normalizes whitespace in snippets

### Resource Discovery
The `walk()` function (src/stdio.ts:132) implements non-recursive directory traversal using a stack, processing only `.md` files and following subdirectories.

## Development Workflow

When modifying this codebase:

1. **Changes to MCP protocol**: Edit `src/stdio.ts`, update the `RequestMessage` type and add new method handlers in the switch statement (line 58)
2. **Changes to documentation**: Edit files in `mcp-switch-manual/` (changes take effect immediately; no rebuild needed)
3. **Testing**: Run `npm run dev` and interact via stdin/stdout (send JSON requests manually or via MCP client)
4. **Building**: Always run `npm run build` before publishing/distributing

## Common Patterns

### Adding a New MCP Method
1. Add method to `RequestMessage` type union
2. Add case to switch statement in `handleLine()`
3. Implement handler function (similar to `listResources`, `readResource`, `searchDocs`)
4. Use `reply()` helper for responses

### Adding Documentation
1. Create `.md` file in appropriate `mcp-switch-manual/` subdirectory
2. Follow existing naming/structure patterns (see `mcp-switch-manual/README.md`)
3. Keep files focused and token-efficient
4. Include TypeScript code examples in fenced blocks
5. File appears automatically in `listResources` results

## Package Details

- **Name**: `@distributorx/switch-mcp-server`
- **Version**: 0.2.0
- **Private**: Yes (unlicensed)
- **Bin**: Installs `switch-mcp` command globally
- **Entry point**: `dist/stdio.js` (shebang: `#!/usr/bin/env node`)

## IDE Integration

Configure your MCP-compatible IDE to run:
```bash
switch-mcp
# or
npx github:DistributorX/switch-mcp-server
```

The server binds to stdio automatically; no additional configuration needed.
