# Script Folders

## Purpose
- Dev-friendly representation: plain folder with unencrypted files; ideal for version control and debugging.
- Use a zero-byte `<ScriptID>.sscript` placeholder to select the folder in Switch Designer/Scripter.

## Structure (Node.js/TypeScript)
- `manifest.xml` (internal, do not edit)
- `<ScriptID>.xml` declaration (edit via SwitchScripter only)
- `<ScriptID>.pdesc` (optional, generated if extra files)
- `<ScriptID>.sscript` placeholder
- `main.ts` (TypeScript) → transpile to `main.js` (executed)
- `main.js.map` (optional source map when transpiling)
- `node_modules/` (optional dependencies)
- `Resources/` (bundled assets)
- `<lang>.ts` translations (optional)
- `.vscode/launch.json` + `.vscode/switch.code-snippets` (from create)
- `package.json`, `tsconfig.json`, `node_modules/@types/{node,switch-scripting}` (TypeScript scaffolding)
- Optional 32x32 PNG icon referenced by `<ScriptID>.xml`

## Advantages
- Works well with git; no need to repack after code edits.
- Easy to share common libs; supports automated build/pack pipelines.

## Limitations
- Only for Node.js scripts (type `Script`, not `App`).
- Not copied into exported flows; convert to package for deployment.
- Password protection dropped when unpacking; XML files should not be hand-edited.
- TypeScript must be transpiled via `SwitchScriptTool` before running in flows.

## Workflow Tips
- Keep `main.ts` as source of truth; regenerate `main.js` after edits.
- Store large assets in `Resources/`; keep root clean for fast packing.
