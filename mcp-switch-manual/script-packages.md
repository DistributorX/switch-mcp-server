# Script Packages & Plug-ins

## Script Packages (`.sscript`)
- ZIP archives produced by SwitchScripter or `SwitchScriptTool --pack`; contain the same essentials as folders (declarations, main.js, resources) but omit dev-only files.
- Best for sharing/installing on other machines or moving into production flows.
- Use `SwitchScriptTool --list <package>` to inspect contents.

## Password Protection
- Packages can be password-protected to block opening in SwitchScripter without the password; execution still allowed.
- Not available for script folders (password removed when unpacking).

## Scripted Plug-ins (Apps)
- A package saved with type `App` becomes a plug-in; place in the proper folder so Switch can load it.
- Features (entry points/properties) are optional; develop/test like regular scripts first, then set type before creating the `enfpack`.
- App distribution outside the Enfocus Appstore is not supported; use locally or via the store.
