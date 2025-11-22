# SwitchScriptTool (CLI)

## Location
- Windows: `C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe`
- macOS: `/Applications/Enfocus/Enfocus Switch/SwitchScripter.app/Contents/MacOS/SwitchScriptTool/SwitchScriptTool` (symlink added to install root and `/usr/local/bin`)

## Modes
- `--create <ScriptID> <Path> [--JavaScript]`: scaffold folder with entry-point stub, VS Code config, and TypeScript typings by default.
- `--pack <Folder> <PackagePath> [--Password <pwd>]`: folder → `.sscript`.
- `--unpack <Package> <Folder>`: package → folder (password removed).
- `--transpile <Folder>`: TypeScript → JavaScript (`main.ts` → `main.js`, optional source map).
- `--translate <Folder>`: generate translation files for app script folders.
- `--list <Package>`: list files inside a package.

## Examples
```bash
# Create TypeScript folder
SwitchScriptTool --create MyScript ~/switch-scripts

# Create JavaScript folder
SwitchScriptTool --create MyScriptJS ~/switch-scripts --JavaScript

# Transpile and pack
SwitchScriptTool --transpile ~/switch-scripts/MyScript
SwitchScriptTool --pack ~/switch-scripts/MyScript ~/packages/MyScript.sscript
```
