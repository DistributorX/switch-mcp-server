# Switch MCP Server

**Fully MCP-compliant** stdio server providing Enfocus Switch scripting documentation to AI assistants like Claude Desktop and Cursor.

## What is this?

This is an MCP (Model Context Protocol) server that gives AI assistants access to comprehensive Switch scripting documentation. When configured in Claude Desktop or Cursor, the AI can:

- Browse all Switch API documentation (31 markdown files)
- Read specific documentation files
- Search documentation for specific terms
- Get context-aware help while writing Switch scripts

## Quick Start

### Install

```bash
# Run directly via npx (recommended for quick testing)
npx github:DistributorX/switch-mcp-server

# Or install globally
npm install -g github:DistributorX/switch-mcp-server
switch-mcp --help
```

### Configure in Claude Desktop

Add to your Claude Desktop configuration file:

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

Restart Claude Desktop, and you'll see "switch-docs" connected in the MCP section.

### Configure in Cursor

Add to your Cursor MCP settings:

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

## Features

### Resources (31 Documentation Files)

Browse all Switch scripting documentation via MCP resources:

- **API Reference**: Core classes (Switch, Job, FlowElement, Connection)
- **Document Helpers**: PDF, Image, XML, XMP manipulation
- **Entry Points**: How Switch calls your scripts
- **Guides**: Script elements, folders, packages, deployment
- **Examples**: Tested code snippets
- **Complete Manual**: Full Switch Scripting Node.js reference (Chapters 0-5)

All resources use the `switch-docs://` URI scheme (e.g., `switch-docs://api/job.md`).

### Search Tool

The `search_docs` tool lets AI search documentation for specific terms:

```
search_docs(query="FlowElement", limit=5)
```

Returns snippets with context from matching files.

## MCP Protocol

This server implements the full MCP specification (JSON-RPC 2.0):

### Supported Methods

| Method | Description |
|--------|-------------|
| `initialize` | Initialize MCP connection |
| `notifications/initialized` | Client acknowledgment |
| `resources/list` | List all 31 documentation files with descriptions |
| `resources/read` | Read a specific doc by URI |
| `tools/list` | List available tools (search_docs) |
| `tools/call` | Execute search tool |

### Example Protocol Flow

```json
→ {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude-desktop","version":"1.0"}}}
← {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"resources":{},"tools":{}},"serverInfo":{"name":"switch-mcp-server","version":"0.3.0"}}}

→ {"jsonrpc":"2.0","method":"notifications/initialized"}

→ {"jsonrpc":"2.0","id":2,"method":"resources/list"}
← {"jsonrpc":"2.0","id":2,"result":{"resources":[{"uri":"switch-docs://api/job.md","name":"Job","description":"Represents a job...","mimeType":"text/markdown"}...]}}

→ {"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"switch-docs://api/job.md"}}
← {"jsonrpc":"2.0","id":3,"result":{"contents":[{"uri":"switch-docs://api/job.md","mimeType":"text/markdown","text":"# Job API\n..."}]}}

→ {"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"search_docs","arguments":{"query":"FlowElement","limit":3}}}
← {"jsonrpc":"2.0","id":4,"result":{"content":[{"type":"text","text":"Found 3 results...\n"}],"isError":false}}
```

## CLI Options

```
switch-mcp [options]

Options:
  --doc-root <path>   Override documentation root (default: bundled mcp-switch-manual)
  -h, --help          Show help
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build to dist/
npm run build

# Test MCP protocol
node test-mcp.js
```

## Documentation Structure

The bundled `mcp-switch-manual/` directory contains:

- `api/` - Core API classes (Switch, Job, FlowElement, etc.)
- `dev/` - Development tools, debugging, declarations
- `examples/` - Tested code snippets
- Root guides (overview, script-elements, script-folders, etc.)
- Complete manual chapters (Chapter 0-5)

All documentation is optimized for MCP/LLM consumption with rich metadata extracted from content.

## Updating

To get the latest version:

```bash
# If using npx (always pulls latest)
npx github:DistributorX/switch-mcp-server

# If installed globally
npm install -g github:DistributorX/switch-mcp-server
```

## Technical Details

- **Protocol**: JSON-RPC 2.0 over stdin/stdout
- **Dependencies**: Zero runtime dependencies (Node.js built-ins only)
- **Size**: ~360KB bundled with documentation
- **Implementation**: Single TypeScript file (~550 lines)
- **Security**: Path sanitization prevents directory traversal

## Version History

### 0.3.0 (Current)
- **Breaking Change**: Full MCP protocol compliance
- Implemented JSON-RPC 2.0 format
- Added initialization handshake (initialize/initialized)
- Renamed methods to MCP standard (resources/list, resources/read)
- Implemented URI-based addressing (switch-docs://)
- Added rich resource metadata (names, descriptions extracted from content)
- Search implemented as MCP tool (tools/call)
- Works with Claude Desktop, Cursor, and other MCP clients

### 0.2.0
- Custom stdio protocol (incompatible with MCP)
- Simple methods: listResources, readResource, search

## License

UNLICENSED - Private internal use

## Links

- [MCP Specification](https://modelcontextprotocol.io/)
- [Enfocus Switch](https://www.enfocus.com/en/switch)
- [Switch Scripting Samples](https://github.com/EnfocusSW)
