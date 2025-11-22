# Entry Points (Chapter 4.3)

Mechanism for passing control from Switch to script. First two args always `Switch` and `FlowElement`. Most should be `async`. Script must define at least one of `jobArrived` or `timerFired`. Entry points other than those may run without an active run-time/job context—avoid job-dependent calls (e.g., `createJob`) unless allowed.

## Script Entry Points
- `jobArrived(s: Switch, flowElement: FlowElement, job: Job): Promise<void>` — called per incoming job.
- `timerFired(s: Switch, flowElement: FlowElement): Promise<void>` — fired immediately after flow activation, then at interval (default 300s) set via `flowElement.setTimerInterval`.
- `flowStartTriggered(s: Switch, flowElement: FlowElement): Promise<void>` — during flow startup before other entry points; may run in parallel for concurrent elements; use `Switch.getGlobalData(lock=true)` to synchronize; not available in debugging.
- `flowStopTriggered(s: Switch, flowElement: FlowElement): Promise<void>` — during flow stop after other entry points stop; may run parallel for concurrent; use `getGlobalData(lock=true)`; not available in debugging.
- `getLibraryForProperty(s: Switch, flowElement: FlowElement, tag: string): Promise<string[]>` — populate “select from library” editor for a script property; not in debugging.
- `getLibraryForConnectionProperty(s: Switch, flowElement: FlowElement, c: Connection, tag: string): Promise<string[]>` — populate library editor for an outgoing connection property; not in debugging.
- `validateProperties(s: Switch, flowElement: FlowElement, tag: string[]): Promise<{ tag: string, valid: boolean }[]>` — custom validation for script properties marked “custom”; invoked on change/activation/before `jobArrived`; must return all tags passed; missing tag = invalid; not in debugging.
- `validateConnectionProperties(s: Switch, flowElement: FlowElement, c: Connection, tag: string[]): Promise<{ tag: string, valid: boolean }[]>` — custom validation for connection properties; same rules as above; not in debugging.
- `findExternalEditorPath(s: Switch, flowElement: FlowElement, tag: string): Promise<string>` — supply path when “External Editor” chosen.
- `httpRequestTriggeredSync(request: HttpRequest, args: any[], response: HttpResponse, s: Switch): Promise<void>` — immediate webhook handler (Switch Web Services, `/scripting/<path>`). Defaults to 200/`{"status":true}` if absent. Limits: 1MB request (413), queue 10000 (429), must finish <1 min (524), concurrent mode, not in debugging.
- `httpRequestTriggeredAsync(request: HttpRequest, args: any[], s: Switch, flowElement: FlowElement): Promise<void>` — async webhook handler if sync absent or returned 2xx. Runs like `jobArrived` (same concurrency/slots). Can use full `FlowElement`/`Job` APIs. Not in debugging.
- `abort(s: Switch, flowElement: FlowElement, job: Job, abortData: any): Promise<void>` — called when another entry point exceeds timeout; same executor as main entry point. Must finish <60s or executor killed; if absent, executor killed immediately. Abortable: `jobArrived`, `timerFired`, webhook sync/async, flow start/stop. Avoid blocking sync code. Aborted `jobArrived` jobs move to Problem jobs and produce no output.

## Script Expressions Entry Point
- `calculateScriptExpression(s: Switch, flowElement: FlowElement, job: Job): Promise<string | number | boolean>` — used only for script expressions (Define script expression editor). Returns value (string/number/boolean) or fails. Receives read-oriented `Switch`/`FlowElement`/`Job`; not in debugging.
