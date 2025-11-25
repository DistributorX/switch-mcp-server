# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **fully MCP-compliant** stdio-based server that serves Enfocus Switch scripting documentation to AI assistants like Claude Desktop and Cursor.

**Current State**: Version 0.3.0 implements the complete MCP (Model Context Protocol) specification with:
- JSON-RPC 2.0 format with `"jsonrpc": "2.0"` field
- Full initialization handshake: `initialize` → response → `initialized`
- Standard MCP methods: `resources/list`, `resources/read`, `tools/list`, `tools/call`
- URI-based resource addressing (`switch-docs://path/to/file.md`)
- Rich resource metadata (names and descriptions extracted from content)
- Search functionality as MCP tool (`search_docs`)

**Purpose**: Enable AI assistants to access comprehensive Switch scripting documentation, helping developers build Switch automation scripts with Node.js/TypeScript.

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

# Test MCP protocol
node test-mcp.js
```

## Architecture

### Single-file MCP Server
The entire MCP server is implemented in `src/stdio.ts` (~550 lines). It's a clean, focused implementation:

1. **Communication Layer**: JSON-RPC 2.0 over stdin/stdout
   - Reads line-delimited JSON request messages from stdin
   - Writes JSON-RPC 2.0 response messages to stdout
   - No HTTP, no ports, no authentication needed
   - Fully MCP-compliant

2. **MCP Methods Implemented**:
   - `initialize`: Handshake with protocol version and capabilities negotiation
   - `notifications/initialized`: Client acknowledgment (no-op)
   - `resources/list`: Returns all 31 `.md` files with URI, name, description, mimeType
   - `resources/read`: Returns full content of a specific markdown file by URI
   - `tools/list`: Exposes `search_docs` tool schema
   - `tools/call`: Executes search and returns formatted results

3. **Server State Machine**:
   - States: `UNINITIALIZED` → `READY`
   - Rejects all non-initialize requests when uninitialized
   - Validates protocol version (supports "2024-11-05")

4. **URI System**:
   - Scheme: `switch-docs://`
   - Path encoding: Each component properly URI-encoded
   - Security: Path sanitization prevents directory traversal
   - Example: `switch-docs://api/Switch.md` or `switch-docs://Switch%20Scripting%20Node-js%20-%20Chapter%204%20-%20Scripting%20reference.md`

5. **Resource Metadata**:
   - Names generated from filenames (handles chapter format, converts kebab-case to Title Case)
   - Descriptions extracted from first non-header paragraph (up to 200 chars)
   - All resources include `uri`, `name`, `description`, `mimeType: "text/markdown"`

6. **File System Operations**:
   - Doc root defaults to bundled `mcp-switch-manual/` (configurable via `--doc-root` or `DOC_ROOT` env var)
   - Recursive directory walking to find all `.md` files (31 total)
   - Path/URI sanitization prevents directory traversal attacks
   - All paths validated to stay within `DOC_ROOT`

7. **Error Handling** (JSON-RPC 2.0 numeric codes):
   - `-32700`: Parse error (invalid JSON)
   - `-32600`: Invalid request (bad JSON-RPC format or uninitialized)
   - `-32601`: Method not found
   - `-32602`: Invalid params
   - `-32603`: Internal error

### Documentation Structure

Documentation lives in `mcp-switch-manual/` (31 files):

- **Full manual chapters**: `Switch Scripting Node-js - Chapter 0-5*.md` (complete reference, legacy format)
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

### URI Conversion (src/stdio.ts:382-407)

```typescript
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
  const clean = path.replace(/^\/+/, "");
  if (clean.includes("..")) return null;
  return clean;
}
```

### Resource Name Generation (src/stdio.ts:410-425)

Handles special cases like chapter files and converts paths to readable names:
- `"Switch Scripting Node-js - Chapter 4 - Scripting reference.md"` → `"Chapter 4: Scripting reference"`
- `"api/flow-element.md"` → `"Flow Element"`

### Description Extraction (src/stdio.ts:427-450)

Reads file content and extracts first non-header paragraph (up to 200 chars) for rich resource metadata.

### Search Algorithm (src/stdio.ts:453-467)

- Case-insensitive substring search across all markdown content
- Returns first match per file
- Extracts 160-character snippets (80 chars before/after match)
- Configurable limit (default 20, max 50 results)
- Results include path, snippet, and converted URI

### Resource Discovery (src/stdio.ts:470-485)

The `walk()` function implements non-recursive directory traversal using a stack, processing only `.md` files and following subdirectories.

## Development Workflow

When modifying this codebase:

1. **Changes to MCP protocol**: Edit `src/stdio.ts`, update the `RequestMessage` type and add new method handlers in the switch statement (line 187)
2. **Changes to documentation**: Edit files in `mcp-switch-manual/` (changes take effect immediately; no rebuild needed)
3. **Testing**: Run `npm run build && node test-mcp.js` to verify MCP protocol
4. **Building**: Always run `npm run build` before publishing/distributing (outputs to `dist/stdio.js`)

## Testing the Server

Test with the included test script:

```bash
# Build first
npm run build

# Run MCP protocol test
node test-mcp.js
```

This tests:
1. Initialize handshake
2. Initialized notification
3. resources/list (verifies all 31 files)
4. resources/read (specific file by URI)
5. tools/list
6. tools/call with search

You should see complete JSON-RPC 2.0 request/response flow.

## Common Patterns

### Adding a New MCP Method

1. Add method to `RequestMessage` type union (src/stdio.ts:67-73)
2. Add case to switch statement in `handleLine()` (src/stdio.ts:187)
3. Implement handler function following MCP spec
4. Use `reply()` helper for responses (src/stdio.ts:371)

### Adding Documentation

1. Create `.md` file in appropriate `mcp-switch-manual/` subdirectory
2. Follow existing naming/structure patterns (see `mcp-switch-manual/README.md`)
3. Keep files focused and token-efficient
4. Include TypeScript code examples in fenced blocks
5. File appears automatically in `resources/list` results with generated metadata

## Package Details

- **Name**: `@distributorx/switch-mcp-server`
- **Version**: 0.3.0 (MCP-compliant)
- **License**: UNLICENSED (private)
- **Bin**: Installs `switch-mcp` command globally
- **Entry point**: `dist/stdio.js` (shebang: `#!/usr/bin/env node`)
- **Dependencies**: Zero (Node.js built-ins only)

## MCP Client Integration

### Claude Desktop Configuration

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "switch-docs": {
      "command": "npx",
      "args": ["github:DistributorX/switch-mcp-server"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "switch-docs": {
      "command": "switch-mcp"
    }
  }
}
```

### Cursor Configuration

```json
{
  "mcp": {
    "servers": {
      "switch-docs": {
        "command": "switch-mcp"
      }
    }
  }
}
```

Restart your IDE and the server will be available.

## Version History

### v0.3.0 (Current) - Full MCP Compliance
- **Breaking change**: Complete protocol rewrite
- Implemented JSON-RPC 2.0 with proper error codes
- Added initialization handshake
- Renamed methods to MCP standard (resources/list, resources/read)
- Implemented URI-based addressing (switch-docs://)
- Added rich resource metadata
- Search implemented as MCP tool
- Works with Claude Desktop, Cursor, and all MCP clients

### v0.2.0 - Custom Protocol (Deprecated)
- Custom stdio protocol (incompatible with MCP)
- Simple methods: listResources, readResource, search

## References

For MCP protocol details:
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [JSON-RPC Protocol Guide](https://mcpcat.io/guides/understanding-json-rpc-protocol-mcp/)
- [MCP Message Types Reference](https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/)
