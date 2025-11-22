# Job Class (Chapter 4.6)

Represents a job (file or folder) in an input for the flow element. `jobArrived` receives the arriving job. Jobs stay until sent via `sendTo*` or `fail()`. `createJob` (FlowElement) and `Job.createChild` produce new jobs. `jobArrived` is called once per job; on flow restart, remaining jobs trigger again.

## Info
- `getName(includeExtension: boolean = true): string` — name without unique prefix; include extension by default.
- `getId(): string` — unique job ID (prefix without underscores); syntax may change between versions.
- `isFile(): boolean` / `isFolder(): boolean`
- `getVariableAsString(variable: string): Promise<any>` — evaluates variable from Switch Designer metadata options; returns string. Limitations: no text indexing for XML/XMP/JDF; no embedded HTML; Model must be JDF/XML/XMP/JSON (no Automatic); works with external types.

## Content Access
- `get(accessLevel: AccessLevel): Promise<string>` — returns filesystem path; use `ReadOnly` to read, `ReadWrite` to modify. Modifications auto-uploaded at routing stage. Errors if access level unknown or content issues. In script expressions only `ReadOnly` allowed.

## Logging
- `log(level: LogLevel, message: string, messageParams?: (number | boolean | string)[]): Promise<void>` — job-scoped logging; `%` must be passed via params (`'%1'`).

## Private Data
- `getPrivateData(tag: string | EnfocusSwitchPrivateDataTag): Promise<any>`
- `getPrivateData(tags?: (string | EnfocusSwitchPrivateDataTag)[]): Promise<{tag: string | EnfocusSwitchPrivateDataTag, value: any}[]>`
  - Returns value(s) or empty string if not set. Dates returned as strings. If tags provided, only those returned (non-existing tags omitted); no tags returns all.
- `setPrivateData(tag: string | EnfocusSwitchPrivateDataTag, value: any): Promise<void>`
- `setPrivateData(privateData: {tag: string | EnfocusSwitchPrivateDataTag, value: any}[]): Promise<void>`
  - Values: string/number/boolean/object/array/Date/null. Recommend namespacing custom tags (e.g., `<company>.feature`). Do not use `EnfocusSwitch` namespace.
- `removePrivateData(tag: string | EnfocusSwitchPrivateDataTag): Promise<void>`
- `removePrivateData(tags: (string | EnfocusSwitchPrivateDataTag)[]): Promise<void>`
  - Errors on missing args/empty arrays.
- Built-in private data (readable; most writable except `EnfocusSwitch.origin`):  
  `EnfocusSwitch.hierarchy` (string[] path), `...emailAddresses` (string[]), `...emailBody` (string), `...userName` (string), `...userFullName` (string), `...userEmail` (string), `...origin` (string, read-only), `...initiated` (ISO string), `...submittedTo` (string), `...state` (string; writing not reflected in stats/dashboard).

## Datasets
- `listDatasets(): Promise<{name: string, model: DatasetModel, extension: string}[]>` — all datasets (excludes ones created in same entry point).
- `createDataset(name: string, pathToFile: string): Promise<void>` — attach dataset from file; throws on invalid name/path; overwrites if exists.
- `getDataset(name: string, accessLevel: AccessLevel): Promise<string>` — path to dataset; `ReadOnly`/`ReadWrite`; errors on missing dataset/invalid level/content issues.
- `removeDataset(name: string): Promise<void>` — remove by name; errors if missing.

## Child Jobs
- `createChild(type: string, path: string): Promise<Job>` — create child job (inherits properties) from file/folder at `path`. Common types: "File", "Folder".

## Routing
- `sendToSingle(): Promise<void>` — send to single outgoing connection (must exist/allowed).
- `sendTo(connection: Connection): Promise<void>` — send to specified connection.
- `sendToData(connection: Connection): Promise<void>` — send to data connection of traffic-light element.
- `sendToLog(connection: Connection): Promise<void>` — send to log connection.
- `sendTo(jobState: Job.JobState, connection?: Connection, sendToLogger?: boolean): Promise<void>` — generic send with state.
- `sendToNull(): Promise<void>` — discard.
- `fail(): Promise<void>` / `fail(message: string, messageParams?: (string | number | boolean)[]): Promise<void>` — mark as failed; optional log message.
  - Routing honors connection constraints; ensure outgoing connections configured.

## Priority
- `getPriority(): Promise<number>` — get job priority.
- `setPriority(priority: number): Promise<void>` — set priority.
