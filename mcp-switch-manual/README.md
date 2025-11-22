# Switch Scripting MCP Manual

Purpose-built for MCP/LLM use: concise, chunked references about Enfocus Switch scripting with Node.js/TypeScript. Use these files as MCP resources for quick retrieval rather than linear reading.

Key goals
- Answer “how do I script this in Switch?” with minimal tokens.
- Keep headings stable for retrieval; prefer small, focused files.
- Include code/examples in fenced blocks with `ts` where helpful.

Contents map
- `Switch Scripting Node-js - Chapter 0-5*.md`: full source chapters copied from the legacy manual (complete reference).
- `overview.md`: language choices, compatibility, platform notes.
- `script-elements.md`: elements vs expressions, entry-point basics.
- `script-folders.md`: folder layout, pros/cons, TypeScript specifics.
- `script-packages.md`: packages, passwords, scripted plug-ins.
- `switchscripttool.md`: CLI modes and examples.
- `switchscripter.md`: IDE capabilities.
- `entry-points.md`: invocation model and guardrails.
- `api/entry-points.md`: detailed entry point behaviors/limits.
- `api/switch.md`: Switch class methods (global data, webhooks, prefs).
- `api/flowelement.md`: FlowElement methods.
- `api/job.md`: Job class (content access, private data, datasets, routing, priority).
- `api/connection.md`: Connection class.
- `api/image_document.md`: ImageDocument helpers.
- `api/pdf_document.md`: PdfDocument helpers.
- `api/pdf_page.md`: PdfPage helpers.
- `api/http.md`: HttpRequest/HttpResponse for webhooks.
- `api/xml_document.md`: XML querying helpers.
- `api/xmp_document.md`: XMP querying helpers.
- `api/enums.md`: common enumerations.
- `dev/declarations.md`: declaration fields, property editors, validation.
- `dev/debugging_deployment.md`: IDE setup, debugging in Switch, deployment tips.
- `samples.md`: link to official sample scripts.
- `examples/`: curated, tested snippets (see `examples/README.md`); e.g., `examples/timer-log.md`.
- Add more focused files (Job, Connection, document classes, enums, debugging, deployment) to complete MCP-friendly coverage.
