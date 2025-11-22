# Declarations, Properties, Editors, Validation (Chapter 3.1)

## Main Script Properties
Set in SwitchScripter Declaration pane.
- Script ID (plug-ins: use `CompanyName~ToolName`), Display Name (fallback to ID).
- Type: Script (folders), Script/App (packages). Legacy flag controls JS/VBScript inclusion (must be No for folders).
- Include Node.js script (includes adjacent `node_modules`).
- Version: integer (start 1; apps support minor like 1.1 for hotfixes).
- Keywords/Tooltip (plug-ins), Icon (32x32 PNG), Password protection (packages only; blocks opening, not execution).
- Connections: incoming? require at least one? outgoing (No/One/Unlimited), details, require at least one, connection type Move/Traffic light, include/exclude folders, data/log on success/warning/error.
- Execution: mode Serialized/Concurrent; Execution group (string, prefer reverse-domain uniqueness). Performance tuning: Idle after job (secs), Number of slots (concurrent only; 0=unlimited, Default=prefs).
- Position in Elements pane (plug-ins): `<section>:<sort-key>`; Flow upgrade warning + maximum version; Obsolete properties/connection properties.

## Execution Mode
- Concurrent: entry points can run in parallel per instance; implement synchronization for shared resources.
- Serialized: entry points for instances in same execution group never run concurrently; outside group may. Use unique group names to avoid accidental serialization across deployments. Execution group ignored in concurrent mode.

## Custom Properties
- Fields: Tag (script internal), Name (UI), Tooltip, Inline editor, Editors 1–5 (at least one; default single-line text), Default value.
- Depends on master: show only if prior master property matches values (semicolon-separated list). Validation: None, Standard, Custom (`validateProperties`), or both.

## Property Editors
- Inline editors: Single-line text, Password, Number (digits), Hours and minutes (`hh:mm`), No-yes list ("No"/"Yes"), Dropdown list (custom items).
- Other editors (mostly modal): Literal (predefined string), Choose file/folder (absolute path), Regular expression, File type, Select from library, Multi-line text, Script expression, Single-/Multi-line with variables, Condition with variables, File/Folder patterns, File types (list), String list, Select many from library, External editor (path), OAuth 2.0 authorization (access token).

### Extra Properties per Editor
- Dropdown list: items list.
- Choose file: include file for export (copies into exported flow).
- Literal: editor name (Default/None/Automatic/No jobs/All jobs/All other jobs/No folders/All folders). Values returned: Default="Default", None="", Automatic="Automatic", No jobs="No Files", All jobs="All Files", All other jobs="All Other Files", No folders="No Folders", All folders="All Folders". Check editor type via `getPropertyType()` before interpreting.
- Select from library / Select many / String list: optional dialog message.
- External editor & OAuth 2.0: see respective sections when expanded.

## Validation
- Standard (design-time) rules by editor: non-empty for text/password/multi-line; number digits only; hh:mm valid; No-yes exactly; dropdown one of items; literal fixed value; choose file/folder valid path exists; regex syntax valid; file type patterns valid; select-from-library must be in list. Variable-backed editors skip strict checks except fallback to non-empty when no variables.
- Custom validation: implement `validateProperties` / `validateConnectionProperties` and set Validation to Custom or Standard and custom. Invoked on value change, flow activation, or before `jobArrived`. Must return array of `{tag, valid}` for all tags requested; missing tag => invalid.
- Note: design-time validation assumed valid at activation; may become invalid if underlying resources deleted.
