# Switch MCP Server (stdio)

Stdio-based MCP server that serves the bundled Switch scripting manual and examples from this repo. Designed for use with tools like Claude Code/Cursor: the IDE spawns `switch-mcp` and communicates over stdin/stdout (no HTTP, no ports needed).

## Install / Run
- Via npm from GitHub (private):  
  `npx github:DistributorX/switch-mcp-server`
- Or install globally:  
  `npm install -g github:DistributorX/switch-mcp-server`  
  then run `switch-mcp`

Defaults:
- Serves resources from the bundled `mcp-switch-manual/` (including `examples/`).
- List/read resources and simple search across `.md` files.
- Binds to stdio; no network required.

## CLI options
- `--doc-root <path>` (optional) — override doc root (default: bundled `mcp-switch-manual`).
- `--log-level <level>` (not implemented; future).

## Protocol
Line-delimited JSON over stdin/stdout. Supported methods:
- `{id, method: "listResources"}` → `{id, result: {resources}}`
- `{id, method: "readResource", params: {path}}`
- `{id, method: "search", params: {query, limit?}}`

## Configure in IDE (Claude Code/Cursor)
Point the MCP server command to `switch-mcp` (or `npx github:DistributorX/switch-mcp-server`). No port or token needed.

## Development
```bash
npm install
npm run dev   # runs stdio server from src/stdio.ts
npm run build # emits dist/stdio.js
```

## Resources bundled
- `mcp-switch-manual/` (full manual and focused splits)
- `examples/` (starter snippets; add more over time)

## Notes
- All interactions are local via stdio; nothing served over HTTP.
- Update by pulling latest from GitHub and re-installing (`npm install -g github:DistributorX/switch-mcp-server` or rerun `npx ...`).
