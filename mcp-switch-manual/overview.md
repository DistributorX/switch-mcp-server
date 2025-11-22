# Switch Scripting Overview

## Languages
- Preferred: Node.js JavaScript (Switch 2020 Spring+) and TypeScript (Switch 2020 Fall+).
- TypeScript adds static types and supports the provided `@types/switch-scripting` declarations for autocomplete.
- Legacy JS/VBScript still run but are treated as legacy; focus new work on Node.js/TypeScript.

## Compatibility
- Scripts built in a given Switch version run on that version or newer.
- Node.js versions by Switch release (authoring target):  
  - 2020 Spring/Fall: Node 12  
  - 2021 Spring: 12/14; 2021 Fall–2022 Fall: 12/14/16  
  - 2023 Fall: 12/14/16/18  
  - 2024 Spring: 12/14/16/18; 2024 Fall: 12/14/16/18/20
- For widest support, develop with the oldest Switch/Node.js pair you plan to support.

## Mac/Architecture Notes
- Scripts/apps from pre-2021 Fall may rely on Intel-only Node.js (Rosetta). Provide ARM+Intel binaries going forward.
- Switch 2021 Fall+ launches native Node.js per architecture; test on both when shipping binaries.
