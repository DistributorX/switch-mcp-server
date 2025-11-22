# Debugging, IDE Setup, Deployment (Chapter 3.3-3.4)

## VS Code Setup
- Use VS Code for Node.js/TypeScript scripts; SwitchScriptTool `--create` scaffolds `.vscode/launch.json` and snippets.
- ESLint + Prettier recommended; TypeScript rules like `require-await` and `@typescript-eslint/no-floating-promises` catch async mistakes. Sample `.eslintrc`/`.prettierrc` from manual.
- Auto-completion: install `@types/switch-scripting` (via npm to `node_modules/@types/switch-scripting` or drop `index.d.ts` there). Ensure `tsconfig.json` present for TypeScript projects.

## Debugging in Switch
- Debugging works for script folders and non-password packages only.
- In Switch Designer Script element properties: point to folder/package, set **Enable debug mode** = Yes (forces Serialized, only one Node.js script debug at a time); set **Port** (default 9229); choose **Debug entry points** (`jobArrived`, `timerFired`, `httpRequestTriggeredAsync`, `findExternalEditorPath`).
- Build a test flow and activate; attach Chrome or VS Code debugger to the port. Execution halts at selected entry points. Turn debug mode off afterward or flows will hang.
- Valid debug entry points limited; others (e.g., flow start/stop) are not available.

## Iteration Tips
- Switch reloads declaration on activate/deactivate; reloads script code automatically after modification without re-activating (for folders/packages referenced directly). Exported `.sflow` embeds packages but only references folders.
- Use mock Switch API objects to run scripts as pure Node.js for quick unit checks before Switch testing.

## Deployment
- For production, transpile TypeScript (`SwitchScriptTool --transpile`) and pack (`--pack`) into `.sscript`; include resources under `Resources/`.
- Password-protect packages if you need to prevent opening in SwitchScripter (execution still allowed).
- Choose execution mode/group thoughtfully (Serialized vs Concurrent) before shipping; document performance tuning options (Idle after job, Number of slots).
