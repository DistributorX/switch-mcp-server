# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-25

### Breaking Changes
- Complete protocol rewrite from custom stdio to full MCP specification compliance
- All custom methods renamed to MCP standard names
- Path-based addressing replaced with URI-based addressing
- Response formats changed to match MCP specification

### Added
- Full JSON-RPC 2.0 compliance with `"jsonrpc": "2.0"` field in all messages
- Initialization handshake: `initialize` method with protocol version negotiation
- Server state management (UNINITIALIZED → READY)
- Standard MCP methods:
  - `initialize`: Server initialization with capabilities negotiation
  - `notifications/initialized`: Client acknowledgment (no-op)
  - `resources/list`: List all documentation resources with rich metadata
  - `resources/read`: Read specific resource by URI
  - `tools/list`: List available tools (search_docs)
  - `tools/call`: Execute tools
- URI-based resource addressing with `switch-docs://` scheme
- Rich resource metadata:
  - Auto-generated names from filenames (handles chapter format, title case conversion)
  - Descriptions extracted from file content (first non-header paragraph)
  - MIME type specification (text/markdown)
- Search functionality as MCP tool (`search_docs`)
- Proper JSON-RPC 2.0 error codes (-32700 to -32603)
- Comprehensive test script (`test-mcp.js`)

### Changed
- Method names:
  - `listResources` → `resources/list`
  - `readResource` → `resources/read`
  - `search` → `tools/call` with `search_docs` tool
- Resource addressing:
  - `{path: "api/job.md"}` → `{uri: "switch-docs://api/job.md"}`
- Resource list response format now includes URI, name, description, mimeType
- Resource read response now returns `contents` array with URI, mimeType, text
- Error codes changed from strings to JSON-RPC 2.0 numeric codes
- Help message updated to reflect MCP protocol
- Updated all documentation (README.md, CLAUDE.md)

### Fixed
- Server now properly validates JSON-RPC 2.0 format
- Server rejects requests before initialization (except `initialize`)
- URI encoding/decoding handles special characters in filenames
- Path sanitization prevents directory traversal attacks

### Technical Details
- Implementation: Single TypeScript file (~546 lines)
- Compiled output: ~446 lines of JavaScript
- Zero runtime dependencies (Node.js built-ins only)
- All 31 documentation files properly served with metadata

## [0.2.0] - 2024-11-25

### Added
- Custom stdio protocol (not MCP-compliant)
- Methods: `listResources`, `readResource`, `search`
- Simple JSON message format
- Path-based resource access
- Basic search functionality

### Notes
- This version is incompatible with MCP clients
- Deprecated in favor of v0.3.0

## [0.1.0] - Initial Release

Initial version with basic functionality.
