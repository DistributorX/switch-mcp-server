# FlowElement Class (Chapter 4.5)

Instance passed to entry points operating in the context of the flow element. Methods marked NOT FOR SCRIPT EXPRESSIONS require full script context.

## Methods
- `getName(): string` — flow element name.
- `getFlowName(): string` — flow name.
- `getType(): string` — connection type: "Move", "Filter", "Traffic-data", "Traffic-log", "Traffic-datawithlog".
- `getOutConnections(): Connection[]` — outgoing connections (arbitrary order); empty if none.
- `setTimerInterval(seconds: number): void` — set interval for `timerFired` (default 300s). Only call from `timerFired`. Actual interval may be longer, never shorter.
- `getPropertyStringValue(tag: string): Promise<string | string[]>` — value of custom script property by tag; throws if tag missing/hidden. OAuthToken type resolves to valid token (auto-refresh). Properties with variables/expressions available only in `jobArrived`; calling in other entry points throws.
- `getPropertyType(tag: string): PropertyType` — property value type; throws if tag missing/hidden. Same availability rule as above.
- `hasProperty(tag: string): boolean` — whether property exists/visible. For variable/expression properties, returns false outside `jobArrived`.
- `getPropertyDisplayName(tag: string): string` — untranslated English name (useful for logs).
- `failProcess(message: string, messageParam?: string | number | boolean): void` — log fatal error and put element in “problem process” when used in `jobArrived`/`timerFired`; otherwise just logs. `messageParam` substitutes `%1`.
- `log(level: LogLevel, message: string, messageParams?: (number | boolean | string)[]): Promise<void>` — log at level.
- `createJob(path: string): Promise<Job>` — create job from existing file/folder; use `sendTo*` to route. Valid only in `jobArrived`, `timerFired`, `httpRequestTriggeredAsync`. Changes between creation and routing are lost.
