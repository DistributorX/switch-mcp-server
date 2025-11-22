## 4. Scripting reference

### 4.1. About the Switch scripting API

Provides script elements access to job info (file/folder), metadata, processing environment[cite: 704]. Documentation here is for Node.js scripting[cite: 705]. Current Node.js support includes[cite: 706]:

- Accessing script flow element properties (incl. outgoing connections)
- Moving jobs to connections
- Accessing current job info (incl. associated metadata datasets)
  Request other legacy API functionality via feature request to Enfocus[cite: 706].

### 4.2. Differences between the legacy and the Node.js based API

Explains differences for script writers switching from legacy JS[cite: 708, 709]. Node.js advantage: vast module ecosystem via NPM[cite: 710]. Provides functionality previously in legacy API + much more[cite: 711]. Node.js API provides essential Switch context features, will be extended[cite: 712, 713].

**Methods documentation:** Methods listed with name/params vs. preceded by `async`[cite: 714]. `async` methods return a Promise, recommended to call with `await`[cite: 714, 715]. Others called without `await`[cite: 715].

#### 4.2.1. Entry points

**Available:**
`jobArrived`, `timerFired`, `getLibraryForProperty`, `getLibraryForConnectionProperty`, `validateProperties` (replaces `isPropertyValid`), `validateConnectionProperties` (replaces `isConnectionPropertyValid`), `findExternalEditorPath`, `httpRequestTriggeredSync`, `httpRequestTriggeredAsync`, `flowStartTriggered`, `flowStopTriggered` [cite: 716] (See _Script entry points_ p.71).

**Unavailable:**
`getUpdatedValueForProperty`, `getUpdatedValueForConnectionProperty`, `findApplicationPath`, `checkApplicationPath`, `getApplicationLicensing`, `licenseApplication`[cite: 716].

#### 4.2.2. Property values

Use `getPropertyType` instead of `getPropertyEditor` [cite: 718] (See _PropertyType_ p.116 for mapping).
`getPropertyStringValue` combines legacy `getPropertyValue` (string return) and `getPropertyValueList` (array return)[cite: 719]. Values always returned as strings[cite: 720]; casting to other types up to developer[cite: 721].

Legacy `getPropertyValue` returned empty string for non-visible dependent properties[cite: 722]. New API throws error[cite: 723]. Use `getPropertyStringValue` inside conditional logic matching visibility or try-catch block[cite: 724].

Property value evaluation timing differs: legacy evaluated at call time inside script[cite: 728, 729]; Node.js evaluates when script starts[cite: 730]. Usually no difference, but theoretically possible if value changes during script execution (e.g., variable from DB in loop)[cite: 730, 731, 732, 733].

In Node.js, properties using variables/script expressions only available in `jobArrived`[cite: 734]. Attempting to get value in `timerFired` or other entry points throws exception[cite: 735].

#### 4.2.3. Job file and dataset file access

Cannot directly modify job/dataset file in element's input folder[cite: 736]. `Job::get` / `Job::getDataset` have `accessLevel` argument[cite: 737]. If ReadWrite requested, file copied to temp location for modification[cite: 378]. If modified, automatically updated in flow (moved to output) when `sendTo` called[cite: 739].

Legacy API (`createPathWithName`/`Extension`) returned temp path for new job content; path passed to `sendTo` method[cite: 740, 741]. New API: script creates file/folder first, passes path to `FlowElement::createJob`, `Job::createChild`, or `Job::createDataset` to explicitly create Switch job/dataset[cite: 743]. `Job::sendTo` methods no longer require path parameter for routing[cite: 744]. Files/folders passed to create methods NOT automatically removed by Switch[cite: 745]; script must remove temp files/folders after sending/failing job[cite: 746].

#### 4.2.4. Sending jobs

After job sent, no other calls allowed for that `Job` object except other `sendTo` calls and `Job::fail`[cite: 747]. Good practice to create new/child job for routing to multiple connections[cite: 748]. Child job inherits parent properties (ticket, datasets)[cite: 749]. Allowed to call `sendTo` multiple times for same _unmodified_ incoming job[cite: 752].

#### 4.2.5. Scripting API - Mapping table

| Legacy Module/Class  | Legacy Call                                                                                                                                                                                                              | Node.js Scripting                                                                                            |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Utility module       | -                                                                                                                                                                                                                        | Node.js built-in features + 3rd-party node modules                                                           |
| XML module           | -                                                                                                                                                                                                                        | 3rd-party node modules                                                                                       |
| Network module       | -                                                                                                                                                                                                                        | Node.js built-in features + 3rd-party node modules                                                           |
| Database module      | -                                                                                                                                                                                                                        | 3rd-party node modules                                                                                       |
| Metadata module      |                                                                                                                                                                                                                          |                                                                                                              |
| CP2 classes          | All                                                                                                                                                                                                                      | Not available                                                                                                |
| XMP data model       | getString, getNumber, getBoolean                                                                                                                                                                                         | XmpDocument::evaluate                                                                                        |
|                      | All except above                                                                                                                                                                                                         | All 3rd-party node modules                                                                                   |
| Flow element module  |                                                                                                                                                                                                                          |                                                                                                              |
|                      | Maintaining global data                                                                                                                                                                                                  | Switch::getGlobalData, Switch::setGlobalData, Switch::removeGlobalData                                       |
|                      | log                                                                                                                                                                                                                      | FlowElement::log                                                                                             |
|                      | copy, move, isWindows, isMac, findRegisteredApplication, findApplicationOnDisk, find64BitApplicationOnDisk, sleep, compress, uncompress, extract, archive, unarchive, download, createPathWithName, createFileStatistics | Node.js built-in features + 3rd-party node modules                                                           |
| Environment class    | getApplicationPath, getApplicationLicense, getServerName, getLanguage, getLanguageEnvironment, getLicenseSerial, isInTrialMode, isLicenseFeatureEnabled, getSecondsLeft, getClientConnection                             | Not available                                                                                                |
|                      | getSpecialFolderPath                                                                                                                                                                                                     | Implemented only for plug-in resources - FlowElement::getPluginResourcesPath, FlowElement::getScriptDataPath |
|                      | getElementID, getElementUniqueID, getScriptName, getInConnections, getOutgoingName, getAvailableCodecs, getCounter, isPropertyValueStatic, isPropertyValueActual, getJobsForConnection, getTimerInterval, isDeactivating | Not available                                                                                                |
|                      | getElementName                                                                                                                                                                                                           | FlowElement::getName                                                                                         |
|                      | getFlowName                                                                                                                                                                                                              | FlowElement::getFlowName                                                                                     |
|                      | getOutConnections                                                                                                                                                                                                        | FlowElement::getOutConnections                                                                               |
|                      | getPropertyValue, getPropertyValueList                                                                                                                                                                                   | FlowElement::getPropertyStringValue                                                                          |
|                      | getPropertyEditor                                                                                                                                                                                                        | FlowElement::getPropertyType                                                                                 |
|                      | getPropertyLocalizedName                                                                                                                                                                                                 | FlowElement::getPropertyDisplayName                                                                          |
|                      | hasProperty                                                                                                                                                                                                              | FlowElement::hasProperty                                                                                     |
|                      | createNewJob                                                                                                                                                                                                             | FlowElement::createJob, Job::createChild                                                                     |
|                      | failProcess                                                                                                                                                                                                              | FlowElement::failProcess                                                                                     |
|                      | setTimerInterval                                                                                                                                                                                                         | FlowElement::setTimerInterval                                                                                |
|                      | Remote processing                                                                                                                                                                                                        | Not available                                                                                                |
|                      | getJobs                                                                                                                                                                                                                  | FlowElement::getJobs                                                                                         |
| Switch class         | webhookSubscribe                                                                                                                                                                                                         | Switch::httpRequestSubscribe                                                                                 |
|                      | webhookUnsubscribe                                                                                                                                                                                                       | Switch::httpRequestUnsubscribe                                                                               |
| Connection class     | getName                                                                                                                                                                                                                  | Connection::getName                                                                                          |
|                      | getElementID                                                                                                                                                                                                             | Connection::getId                                                                                            |
|                      | getElementUniqueID, getConnectionType, allowsSuccess, allowsWarning, allowsError, isOnHold, getFolderName, getByteCount                                                                                                  | Not available                                                                                                |
|                      | getFileCount                                                                                                                                                                                                             | Connection::getFileCount                                                                                     |
|                      | getPropertyLocalizedName                                                                                                                                                                                                 | Connection::getPropertyDisplayName                                                                           |
|                      | hasProperty                                                                                                                                                                                                              | Connection::hasProperty                                                                                      |
|                      | getPropertyValue, getPropertyValueList                                                                                                                                                                                   | Connection::getPropertyStringValue                                                                           |
|                      | getPropertyEditor                                                                                                                                                                                                        | Connection::getPropertyType                                                                                  |
| Job class            | getPath                                                                                                                                                                                                                  | Job::get                                                                                                     |
|                      | getUniqueNamePrefix                                                                                                                                                                                                      | Job::getId                                                                                                   |
|                      | getName, getNameProper                                                                                                                                                                                                   | Job::getName                                                                                                 |
|                      | getExtension, getMacType, getMacCreator, isType, getFileCount, getByteCount, createPathWithExtension, getEmbeddedDataset, activateFonts, deactivateFonts                                                                 | Node.js built-in features + 3rd-party node modules                                                           |
|                      | createPathWithName                                                                                                                                                                                                       | FlowElement::createPathWithName                                                                              |
|                      | isFile                                                                                                                                                                                                                   | Job::isFile                                                                                                  |
|                      | isFolder                                                                                                                                                                                                                 | Job::isFolder                                                                                                |
|                      | sendToNull                                                                                                                                                                                                               | Job::sendToNull                                                                                              |
|                      | sendToSingle                                                                                                                                                                                                             | Job::sendToSingle                                                                                            |
|                      | sendToData                                                                                                                                                                                                               | Job::sendToData                                                                                              |
|                      | sendToLog                                                                                                                                                                                                                | Job::sendToLog                                                                                               |
|                      | sendTo                                                                                                                                                                                                                   | Job::sendTo                                                                                                  |
|                      | getHierarchyPath                                                                                                                                                                                                         | Available as private data 'EnfocusSwitch.hierarchy'                                                          |
|                      | getEmailAddresses                                                                                                                                                                                                        | Available as private data 'EnfocusSwitch.emailAddresses'                                                     |
|                      | getEmailBody                                                                                                                                                                                                             | Available as private data 'EnfocusSwitch.emailBody'                                                          |
|                      | getUserName                                                                                                                                                                                                              | Available as private data 'EnfocusSwitch.userName'                                                           |
|                      | getUserFullName                                                                                                                                                                                                          | Available as private data 'EnfocusSwitch.userFullName'                                                       |
|                      | getUserEmail                                                                                                                                                                                                             | Available as private data 'EnfocusSwitch.userEmail'                                                          |
|                      | setHierarchyPath, addBottomHierarchySegment, addTopHierarchySegment                                                                                                                                                      | Available as private data 'EnfocusSwitch.hierarchy'                                                          |
|                      | setEmailAddresses, addEmailAddress                                                                                                                                                                                       | Available as private data 'EnfocusSwitch.emailAddresses'                                                     |
|                      | setEmailBody, appendEmailBody                                                                                                                                                                                            | Available as private data 'EnfocusSwitch.emailBody'                                                          |
|                      | setUserName                                                                                                                                                                                                              | Available as private data 'EnfocusSwitch.userName'                                                           |
|                      | setUserFullName                                                                                                                                                                                                          | Available as private data 'EnfocusSwitch.userFullName'                                                       |
|                      | setUserEmail                                                                                                                                                                                                             | Available as private data 'EnfocusSwitch.userEmail'                                                          |
|                      | sendToFilter, sendToFolderFilter, failAndRetry, failProcess, getArrivalStamp, refreshArrivalStamp, setAutoComplete                                                                                                       | Not available                                                                                                |
|                      | getJobState                                                                                                                                                                                                              | Available as private data 'EnfocusSwitch.state'                                                              |
|                      | setJobState                                                                                                                                                                                                              | Available as private data 'EnfocusSwitch.state'                                                              |
|                      | getPriority                                                                                                                                                                                                              | Job::getPriority                                                                                             |
|                      | setPriority                                                                                                                                                                                                              | Job::setPriority                                                                                             |
|                      | fail                                                                                                                                                                                                                     | Job::fail                                                                                                    |
|                      | log                                                                                                                                                                                                                      | Job::log                                                                                                     |
|                      | Private data access/manipulation                                                                                                                                                                                         | Job::getPrivateData, Job::setPrivateData, Job::removePrivateData                                             |
|                      | Managing external metadata datasets                                                                                                                                                                                      | Job::listDatasets, Job::createDataset, Job::getDataset, Job::removeDataset                                   |
|                      | Managing job families                                                                                                                                                                                                    | Not available                                                                                                |
|                      | Accessing the occurrence trail                                                                                                                                                                                           | Not available                                                                                                |
|                      | Evaluating variables                                                                                                                                                                                                     | Not available                                                                                                |
| Occurrence class     | -                                                                                                                                                                                                                        | Not available                                                                                                |
| Webhook Request cls  | -                                                                                                                                                                                                                        | HttpRequest class                                                                                            |
| Webhook Response cls | -                                                                                                                                                                                                                        | HttpResponse class                                                                                           |
| Connection List cls  | -                                                                                                                                                                                                                        | Node.js built-in feature (Array)                                                                             |
| JobList class        | -                                                                                                                                                                                                                        | Node.js built-in feature (Array)                                                                             |
| File Statistics cls  | -                                                                                                                                                                                                                        | PdfDocument, PdfPage, ImageDocument                                                                          |

### 4.3. Entry points

Mechanism for passing control from Switch to script[cite: 757]. An entry point is a function defined in script, called by Switch at appropriate times[cite: 758]. Other API functions called _from_ script[cite: 759]. Switch invokes defined entry points at certain times[cite: 760]. First two arguments always instances of `Switch` and `FlowElement` classes (provide common functionality/context)[cite: 761, 762].

**Remarks:**

- Likely need `async` declaration as they often call functions returning Promises[cite: 763, 764].
- Script must have at least `jobArrived` or `timerFired` entry point[cite: 766].
- Entry points other than `jobArrived`/`timerFired` often invoked while flow inactive (no valid run-time/job context)[cite: 767]; calling some methods (e.g., `createJob`) may not be allowed[cite: 768].

### 4.3.1. Script entry points

**Overview:**

- `jobArrived(s: Switch, flowElement: FlowElement, job: Job): Promise<void>`
  Invoked each time new job arrives in input folders[cite: 769]. Newly arrived job passed as argument[cite: 770].
- `timerFired(s: Switch, flowElement: FlowElement): Promise<void>`
  Invoked first time immediately after flow activation, then at regular intervals (default 300s/5min) regardless of job arrival[cite: 771, 772]. Interval changeable via `flowElement.setTimerInterval`[cite: 773].
- `flowStartTriggered(s : Switch, flowElement: FlowElement): Promise<void>`
  Invoked during flow startup[cite: 774]. Executed before any `jobArrived`/`timerFired`[cite: 775]. May run in parallel for concurrent elements of same type[cite: 776]; use `Switch.getGlobalData` with `lock=true` to synchronize[cite: 776]. Not available for debugging[cite: 777].
- `flowStopTriggered(s : Switch, flowElement: FlowElement): Promise<void>`
  Invoked during flow stop, after other entry points stopped and 'Release acquired slots' timeout finished[cite: 778]. May run in parallel for concurrent elements[cite: 779]; use `Switch.getGlobalData` with `lock=true` to sync[cite: 779]. Not available for debugging[cite: 780].
- `getLibraryForProperty(s: Switch, flowElement: FlowElement, tag: string): Promise<string[]>`
  Invoked when "select from library" editor chosen for script property[cite: 781]. `tag` specifies property involved[cite: 782]. Returns list of strings for editor dialog[cite: 783]. Not available for debugging[cite: 783].
- `getLibraryForConnectionProperty(s: Switch, flowElement: FlowElement, c: Connection, tag: string): Promise<string[]>`
  Invoked when "select from library" editor chosen for outgoing connection property[cite: 784]. `c` and `tag` specify connection/property[cite: 785]. Returns list of strings[cite: 786]. Not available for debugging[cite: 786].
- `validateProperties(s: Switch, flowElement: FlowElement, tag: string[]): Promise<{ tag: string, valid: boolean }[]>`
  Allows custom validation logic for regular script properties with "custom" validation[cite: 787]. Invoked when value changes, flow activated, or before `jobArrived`[cite: 788]. `tag` specifies properties to validate[cite: 788]. Returns array of `{tag: string, valid: boolean}` pairs[cite: 789]. Must contain all input tags; missing tag means invalid property[cite: 790]. Not available for debugging[cite: 791].
  _(See example code in original text)_
- `validateConnectionProperties(s: Switch, flowElement: FlowElement, c: Connection, tag: string[]): Promise<{ tag: string, valid: boolean }[]>`
  Allows custom validation for outgoing connection properties with "custom" validation[cite: 802]. Invoked similarly to `validateProperties`[cite: 803]. `c` and `tag` specify connection/property[cite: 804]. Returns array of `{tag: string, valid: boolean}` pairs[cite: 805]. Must contain all input tags[cite: 805]. Not available for debugging[cite: 806].
- `findExternalEditorPath(s: Switch, flowElement: FlowElement, tag: string): Promise<string>`
  Invoked when "External Editor" chosen for script property[cite: 807]. `tag` specifies property[cite: 808]. Returns path for external editor[cite: 809].
- `httpRequestTriggeredSync(request: HttpRequest, args: any[], response: HttpResponse, s: Switch): Promise<void>`
  Invoked immediately on HTTP request if script subscribed to method/URL path[cite: 811]. E.g., POST to `/next` sent to `<protocol>://<address>:<port>/scripting/next`[cite: 811, 812]. Port/protocol from Web services prefs (not legacy Webhooks)[cite: 813]. `/scripting` part hard-coded[cite: 814].
  `request`: `HttpRequest` instance (query, headers, body, etc.)[cite: 815].
  `args`: Extra args from `httpRequestSubscribe` call[cite: 816].
  `response`: `HttpResponse` instance to construct response[cite: 817].
  `s`: `Switch` instance[cite: 818].
  **Notes:**
  - If entry point doesn't exist, default response sent (200 OK, `{"status": true}`)[cite: 819].
  - Request size limited to 1MB (413 error otherwise)[cite: 820, 821].
  - Webhook queue limit 10000 per element (429 error otherwise)[cite: 822, 823, 824].
  - Must execute in \< 1 min (aborted with 524 error otherwise)[cite: 825, 826].
  - Called in concurrent mode (can run parallel with other entry points)[cite: 827, 828].
  - Not available for debugging[cite: 828].
- `httpRequestTriggeredAsync(request: HttpRequest, args: any[], s: Switch, flowElement: FlowElement): Promise<void>`
  Invoked for HTTP request if[cite: 829]:
  - `httpRequestTriggeredSync` doesn't exist OR
  - `httpRequestTriggeredSync` succeeded with 2xx status code.
    `request`: `HttpRequest` instance[cite: 830].
    `args`: Extra args from `httpRequestSubscribe`[cite: 831].
    `s`: `Switch` instance[cite: 831].
    `flowElement`: `FlowElement` instance (fully functional, can create/get jobs)[cite: 832].
    **Notes:**
  - Handled asynchronously by Switch Server[cite: 834].
  - Follows same rules as `jobArrived` for this element (concurrency mode, slots)[cite: 835, 836, 837].
    _(See example code combining sync/async webhooks and global data in original text)_
- `abort(s: Switch, flowElement: FlowElement, job: Job, abortData: any): Promise<void>`
  Invoked when timeout for another entry point exceeded[cite: 847]. Executed by same executor running main entry point[cite: 848]. Use to gracefully interrupt long tasks / free resources[cite: 849].
  `abortData`: Custom data passed via `Switch::setAbortData`[cite: 850].
  Abortable entry points: `jobArrived`, `timerFired`, `httpRequestTriggeredSync`, `httpRequestTriggeredAsync`, `flowStartTriggered`, `flowStopTriggered`[cite: 851].
  **Notes:**
  - Max 60 seconds to finish; executor killed forcibly after[cite: 852].
  - If absent, executor killed immediately[cite: 853].
  - Not called if script hangs on synchronous operation (avoid sync calls like `readFileSync`)[cite: 854, 855].
  - If entry point aborted, produces no jobs[cite: 856]. If `jobArrived` aborted, job moved to Problem jobs[cite: 856].
    _(See example code using Abortable class pattern in original text)_

### 4.3.2. Script expressions entry point

- `calculateScriptExpression(s: Switch, flowElement: FlowElement, job: Job): Promise<string | number | boolean>`
  **Note:** Only used in script expressions (Define script expression editor), not a regular script entry point[cite: 869, 870]. Invoked when property value defined by expression is calculated[cite: 872]. Returns calculated value (string, number, or boolean)[cite: 873]; fails otherwise[cite: 874]. `Switch`/`FlowElement`/`Job` instances passed have limitations (generally read-only)[cite: 875]. Not available for debugging[cite: 875].

  ```typescript
  // Example: Calculate PDF page count
  async function calculateScriptExpression(s: Switch, flowElement: FlowElement, job: Job): Promise<string | number | boolean> {
    return PdfDocument.getNumberOfPages(await job.get(AccessLevel.ReadOnly));
  }
  ```

### 4.4. Switch class

The single instance of the Switch class is passed as an argument to the script entry points[cite: 2]. It represents common Switch functionality[cite: 3].

### 4.4.1. Methods

#### 4.4.1.1. Switch Server version

```typescript
// NOT FOR SCRIPT EXPRESSIONS
static getServerVersion(): number;
```

Provides the current switch version number[cite: 4]. It returns the version of the Switch server where the script is running[cite: 4].

**Example:** [cite: 5]

```typescript
async function jobArrived(s, flowElement, job) {
  let result = s.getServerVersion();
  await flowElement.log(LogLevel.Info, "Result: %1", [result]);
}
```

#### 4.4.1.2. Managing global data [cite: 6]

**Note:**

- All these methods throw an error if no arguments are provided, or if the scope value is not supported[cite: 7].
- A global data field should be read/written only once per entry point execution[cite: 8].
- If more than 100 fields must be stored, the script should combine them into one object that can be read/written in one operation[cite: 9].

<!-- end list -->

```typescript
async getGlobalData(scope: Scope, tag: string, lock?: boolean): Promise<any>
```

Returns the value of a global data variable with the specified scope and tag, or returns an empty string if no global data variable with that scope and tag was set[cite: 10].
**Important:** Any instance of Date (either tag value OR as part of tag value) will be returned as a string and should be parsed in the script itself[cite: 11].
The `lock` parameter (false by default) is optional and determines whether or not a lock is set on global data[cite: 13]. A lock can be released by calling the `setGlobalData` function[cite: 13]. If the script doesn't update the global data, the data remains locked until the end of the script[cite: 15].

```typescript
async getGlobalData(scope: Scope, tags: string[], lock?: boolean): Promise<{tag: string, value: any}[]>
```

Returns a list of objects in the format defined above[cite: 16]. The result will contain only the data for the provided tags[cite: 16]. If non-existing tags are provided, the result will not contain the data for these tags[cite: 16].
**Important:** Any instance of Date (either tag value OR as part of tag value) will be returned as a string and should be parsed in the script itself.
The `lock` parameter (false by default) is optional and determines whether or not a lock is set on global data[cite: 16]. A lock can be released by calling the `setGlobalData` function[cite: 16]. If the script doesn't update the global data, the data remains locked until the end of the script[cite: 16].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async setGlobalData(scope: Scope, tag: string, value: any): Promise<void>
```

Sets the value of the global data with the specified scope and tag[cite: 20]. The value can be any of type: string, number, boolean, object, Array, Date, or null[cite: 21]. If global data with the same tag name exists, the value of the global data will be replaced with the new one[cite: 21].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async setGlobalData(scope: Scope, globalData: {tag: string, value: any}[]): Promise<void>
```

**Note:** We strongly recommend that tags created by scripts in Global scope always start with `<companyname>` for `Switch.setGlobalData`[cite: 17]. This is to prevent clashes with tags set by other scripts or by the end user[cite: 17]. Scripts should not use `EnfocusSwitch` as namespace, to avoid clashes with global data tags created by Switch[cite: 19].
Sets the global data values for the specified tags and scope[cite: 20]. If global data with the same tag name exists, the value of the global data will be replaced with the new one[cite: 21]. The value can be any of type: string, number, boolean, object, Array, Date, or null[cite: 22].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async removeGlobalData(scope: Scope, tag: string): Promise<void>
```

Removes the global data for the specified scope and tag[cite: 23].
**Note:** It's recommended to remove global data as soon as it is not needed anymore[cite: 24].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async removeGlobalData(scope: Scope, tags: string[]): Promise<void>
```

Removes the global data for the specified scope and tags[cite: 25].
**Note:** It's recommended to remove global data as soon as it is not needed anymore[cite: 25].

#### 4.4.1.3. Webhooks [cite: 26]

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async httpRequestSubscribe(method: HttpRequest.Method, path: string, args: any[]): Promise<void>
```

Subscribes to incoming webhook requests that use the HTTP method to URL path[cite: 28]. For the allowed values for method, see the `HttpRequest.Method` enum[cite: 28]. The extra `args` provided here will be passed to the `httpRequestTriggeredSync` and `httpRequestTriggeredAsync` entry points[cite: 29]. The size of the incoming webhook request is limited to 1MB[cite: 30]. HTTP error 413 will be returned to the webhook caller in case of bigger incoming requests[cite: 31].
When an actual webhook is received by the Switch Web Services, the entry point `httpRequestTriggeredSync` is invoked if it exists[cite: 32]. It allows providing the HTTP response to the webhook caller[cite: 33]. See `httpRequestTriggeredSync` entry point description for more details[cite: 33].
Next to that, the `httpRequestTriggeredAsync` entry point is invoked if it exists[cite: 34]. See the `httpRequestTriggeredAsync` entry point description for more details[cite: 34].
**Note:** For security reasons we advise using URL paths that are not easy to guess and keeping them private[cite: 35].

**Example:** [cite: 36]

```typescript
async function timerFired(s: Switch, flowElement: FlowElement) {
  try {
    await s.httpRequestSubscribe(HttpRequest.Method.POST, "/next", [1, 1]);
  } catch (error: any) {
    // Added type annotation
    flowElement.failProcess("Failed to subscribe to the request %1", error.message);
  }
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async httpRequestUnsubscribe(method: HttpRequest.Method, path: string): Promise<void>
```

Cancels a subscription[cite: 37]. The arguments must have the same values as used for the corresponding subscribe call[cite: 38]. If there is no matching active subscription found, the function will throw an exception[cite: 39]. Note that all subscriptions for the element instance are cancelled automatically when the flow is stopped[cite: 39].

#### 4.4.1.4. Aborting scripts [cite: 40]

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setAbortData(abortData: any): void
```

Stores any data that later can be used in an `abort` entry point.

#### 4.4.1.5. Translation support [cite: 41]

```typescript
// NOT FOR SCRIPT EXPRESSIONS
static tr(str: string): string
```

Marks a string literal for translation[cite: 42]. It allows `SwitchScriptTool` to recognize the strings which must be gathered for translation[cite: 43].

**Example:** [cite: 43]

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  await job.log(LogLevel.Info, Switch.tr("Job name is %1"), [job.getName()]);
}
```

#### 4.4.1.6. Getting global user preferences

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPreferenceSetting(settingKey: string): Promise<any>
```

Retrieves the preference setting based on the provided `settingKey` from the database[cite: 45]. If only the settingGroup is specified, it returns the entire settingGroup object[cite: 46]. If both settingGroup and settingName are specified, it returns the specific setting value[cite: 46].

| User preference   | Property                                                                                                                                         | settingKey                                   |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| Mail send         | Sender name in emails                                                                                                                            | "mailSend/senderNameInEmail"                 |
|                   | Sender email address                                                                                                                             | "mailSend/senderEmailAddress"                |
| HTTP proxy        | Use HTTP proxy                                                                                                                                   | "httpProxy/useHttpProxy"                     |
|                   | Proxy server                                                                                                                                     | "httpProxy/httpProxyHost"                    |
|                   | Proxy port                                                                                                                                       | "httpProxy/httpProxyPort"                    |
|                   | Authenticate                                                                                                                                     | "httpProxy/httpProxyAuthRequired"            |
|                   | Bypass proxy for these servers                                                                                                                   | "httpProxy/httpProxyBypassHosts"             |
| Processing        | Server language                                                                                                                                  | "processing/language"                        |
|                   | Language environment                                                                                                                             | "processing/languageEnvironment"             |
| Problem alerts    | Send problem alerts to                                                                                                                           | "problemAlerts/sendProblemAlertsTo"          |
| Application data  | Application data root                                                                                                                            | "applicationData/applicationDataRoot"        |
|                   | Datasets folder                                                                                                                                  | "applicationData/datasetsFolder"             |
|                   | Job tickets folder                                                                                                                               | "applicationData/ticketsFolder"              |
| Web services      | Port for the Switch Web Service                                                                                                                  | "webServices/switchWebServicePort"           |
|                   | Port for the Switch Web Portal                                                                                                                   | "webServices/switchWebPortalPort"            |
|                   | Protocol                                                                                                                                         | "webServices/protocol"                       |
|                   | Privacy policy page                                                                                                                              | "webServices/privacyPolicyPage"              |
| Reporting         | Dashboard Service location                                                                                                                       | "dashboardService/location"                  |
|                   | The complete URL to the Dashboard Service (\<protocol\>://\<Address\>:\<Port\>, Example: https://www.google.com/search?q=http://127.0.0.1:55092) | "dashboardService/url"                       |
|                   | Keep historical data for (days)                                                                                                                  | "dashboardService/keepHistoricalDataforDays" |
| Remote processing | HTTP port                                                                                                                                        | "SwitchEnvironmentService/httpPort"          |
|                   | Enable HTTPS                                                                                                                                     | "SwitchEnvironmentService/useHttps"          |
|                   | Port                                                                                                                                             | "SwitchEnvironmentService/httpsPort"         |

[cite: 47, 48, 50]

### 4.5. FlowElement class

The single instance of the `FlowElement` class is passed as an argument to the script entry points that operate in the context of a particular flow element[cite: 52].

### 4.5.1. Methods

**Note:** Methods with the word 'async' return a Promise. It is therefore recommended to call these functions with 'await'[cite: 53]. The other functions can be called as they are[cite: 53].

```typescript
getName(): string
```

Returns the name of the flow element[cite: 54].

```typescript
getFlowName(): string
```

Returns the name of the flow.

```typescript
getType(): string
```

Returns the type of the connection as one of the following strings: "Move", "Filter", "Traffic-data", "Traffic-log", "Traffic-datawithlog".

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getOutConnections(): Connection[]
```

Returns a list of `Connection` instances representing the outgoing connections for the flow element associated with this script[cite: 55]. The list is in arbitrary order[cite: 55]. If there are no outgoing connections, the list is empty[cite: 55].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setTimerInterval(seconds: number): void
```

Sets the interval, in seconds, between subsequent invocations of the `timerFired` entry point (if it has been declared in the script)[cite: 55]. The implementation guarantees only that the time between invocations will not be less than the specified number of seconds[cite: 55]. Depending on run-time circumstances the actual interval may be (much) longer[cite: 55].
The default value for the timer interval is 300 seconds (5 minutes).
**Note:** `setTimerInterval` can only be called from a `timerFired` entry point\!

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async getPropertyStringValue(tag: string): Promise<string | string[]>
```

Returns the value of a custom script property as string[cite: 57]. The property for which to return the value is specified by its property tag[cite: 58]. The function throws an "invalid tag" error, if the property with the given tag:

- is not defined in the script declaration OR [cite: 59]
- is a dependent property which is not visible for the current value of the parent property[cite: 60].
  In case of an OAuthToken property type, the function resolves with a valid OAuth2 token[cite: 61]. It is refreshed automatically if needed[cite: 61].
  **Note:** Properties containing variables or script expressions are available in the `jobArrived` entry point only[cite: 62]. An attempt to get the value of such properties in `timerFired` or any entry point other than `jobArrived` will throw an exception[cite: 63].

<!-- end list -->

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPropertyType(tag: string): PropertyType
```

Returns the property value type[cite: 64]. In case a property value can be entered via different editors, the property value type is required to correctly interpret the property value[cite: 65]. The function throws an error if the property with the given tag:

- is not defined in the script declaration OR [cite: 66]
- is a dependent property, which is not visible for the current value of the parent property[cite: 66].
  See the `PropertyType` enumeration for the possible return values[cite: 67].
  **Note:** Properties containing variables or script expressions are available in the `jobArrived` entry point only[cite: 68]. An attempt to get the type of such properties in `timerFired` or any entry point other than `jobArrived` will throw an exception[cite: 69].

<!-- end list -->

```typescript
// NOT FOR SCRIPT EXPRESSIONS
hasProperty(tag: string): boolean
```

Returns true if a property with the specified tag is available for the flow element, otherwise returns false[cite: 70].
**Note:** Properties containing variables or script expressions are available in the `jobArrived` entry point only[cite: 71]. Calling `hasProperty` for such properties in `timerFired` or any entry point other than `jobArrived` will return false in this case[cite: 72].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPropertyDisplayName(tag: string): string
```

Returns the untranslated name of the property as visible in the user interface in English[cite: 73]. This method is mostly intended for including the property name in a log message[cite: 74].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
failProcess(message : string, messageParam?: (string | number | boolean)): void
```

Logs a fatal error for this flow element with the specified message and puts the element instance in the "problem process" state[cite: 75]. `messageParam` is used as a substitute for %1 in the message[cite: 75].
**Example:** [cite: 76]

```typescript
flowElement.failProcess("Something went wrong with the %1 flow", "Superman");
```

**Note:** When used in entry points other than `jobArrived` and `timerFired`, this method doesn't fail the element, it just logs the error message[cite: 77].

```typescript
async log(level: LogLevel, message: string, messageParams?: (number | boolean | string)[]): Promise<void>
```

Logs a message of the specified level for this flow element[cite: 78]. Returns when the message is successfully logged, otherwise throws an error[cite: 78].
**Example:** [cite: 80]

```typescript
async function() {
  try {
    await flowElement.log(LogLevel.Warning, 'You are reaching the limits: %1 of %2 attempts remaining.', ['only 1', 10]);
  } catch (error) {
    // do something in case of an error
  }
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async createJob(path: string): Promise<Job>
```

Creates a new job from a file or folder that already exists at the specified path[cite: 81]. Returns a `Job` instance representing a new job with default values that does not correspond to an incoming job[cite: 81]. It should be separately routed using `sendTo` methods[cite: 81]. If the new job should inherit the job properties of the input job, then use the method `Job::createChild` instead[cite: 81].
**Note:**

- This method is valid only in `jobArrived`, `timerFired` and `httpRequestTriggeredAsync` entry points[cite: 81].
- The changes done to the job between creating and routing the job will be lost[cite: 81].
  **Example:** [cite: 81]

<!-- end list -->

```typescript
async function timerFired(s, flowElement) {
  try {
    const newJob = //... create file/folder at path ...
      await flowElement.createJob(path);
    await newJob.sendToSingle();
  } catch (e) {
    //catch the error
  }
  //remove path if temporary
}
```

**Note:** The file or folder that was passed to `createJob` will not automatically be removed by Switch when sending or failing the job[cite: 82]. Therefore it's up to the script to make sure that temporary files or folders passed to `createJob` are correctly removed after sending or failing the job[cite: 82].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPluginResourcesPath(): string
```

For scripted plug-ins, returns the location of the script resources folder[cite: 83]. This function is intended for use by scripted plug-ins and should not be used from regular script packages except for testing; there is no reliable way to transport external resources with regular script packages[cite: 84, 85]. When used in regular script packages for testing, this function returns the path to the folder where the script package is located[cite: 86]. When used in script folders for testing, this function returns the path to the script folder[cite: 87].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getScriptDataPath(): string
```

This function returns the path to the Script Data folder which serves as a common repository for custom "global" Switch script data[cite: 89]. It is shared by all scripts and users, so callers must provide unique names for any files stored in this folder[cite: 90]. This is a subfolder of the Switch application data root, which has the advantage that its contents are relocated with all other information relevant to the operation of Switch and can be easily located for diagnostic purposes[cite: 91]. If such a folder does not exist, the function tries to create it[cite: 92].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
subscribeToChannel( channelId: string, backingFolderPath: string ): Promise<void>; // Corrected return type
```

The methods `job.sendToChannel` and `flowElement.subscribeToChannel` allow elements to exchange jobs without requiring any direct connection between them in the flow[cite: 93]. The sender and receiver can be located in the same or in different flows[cite: 94]. Each channel should have its own Id that should be unique for the complete Switch environment to prevent jobs being sent to/received from the wrong elements[cite: 95]. Once the receiving element has successfully subscribed, jobs that are sent to the subscribed channel will come in through its `jobArrived` entrypoint[cite: 96]. i.e. in the same way as if there would be a direct connection between both elements[cite: 97]. One sender element can send a job to just one receiver element[cite: 98]. When multiple receiver elements subscribe to the same channel, only the element that was activated first will receive it[cite: 99]. Subscribing to a channel that is already active does not throw an error, so it is up to the script writer to manage this, or up to the flow designer not to mix channel names[cite: 100]. One receiver element can receive jobs from multiple sender elements[cite: 100].

- `channelId`: identifies the channel to receive jobs from[cite: 101].
- `backingFolderPath`: folder path where received files will be stored until they are routed by the receiving element[cite: 102].
  **Note:** `subscribeToChannel` can only be called from a `flowStartTriggered` entry point[cite: 103]. On flow deactivation, the element will get automatically unsubscribed[cite: 103]. See also `sendToChannel`[cite: 103].
  **Example:** [cite: 103]

<!-- end list -->

```typescript
async function flowStartTriggered(s, flowElement) {
  flowElement.subscribeToChannel("channelToSubscribe", "/path/to/a/folder");
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async getJobs(ids: string[]): Promise<Job[]>
```

Returns a list of job instances representing all the jobs currently waiting in the input folders for the flow element[cite: 104]. The list includes all jobs that have "arrived" in the `jobArrived` entry point, including the job passed to the current invocation of the `jobArrived` entry point[cite: 105]. If there are no such jobs, the list is empty[cite: 106].
**Note:** For optimal performance of the script and to reduce the load on the server, this call should only be used to request up to 10,000 jobs that are known to be ready for processing[cite: 107]. Job IDs to be passed to this call and data needed to decide when each job will be ready to be processed, can be calculated based on the `jobArrived` notification of the particular job and stored as global data to retrieve the result later[cite: 108]. This method must not be called more than once per entry point execution[cite: 110]. It is NOT allowed to get private data and metadata for jobs returned by the call or for child jobs created from jobs that were returned by this call in the same entry point execution[cite: 111]. We do allow setting private data and setting metadata for jobs returned by `getJobs`[cite: 112]. It is not possible to use this call in a `jobArrived` and `httpRequestTriggeredAsync` entry points within a concurrent script[cite: 113]. In that case, an error will be returned[cite: 113].
**Example:** [cite: 114]

```typescript
async function jobArrived(s, flowElement, job) {
  let jobsInfo = (await s.getGlobalData(Scope.FlowElement, "jobsInfo")) || {};
  const jobId = job.getId();
  jobsInfo[jobId] = jobsInfo[jobId] ? jobsInfo[jobId] : new Date().getTime();
  await s.setGlobalData(Scope.FlowElement, "jobsInfo", jobsInfo);
  // collect jobs IDs to use them afterwards as parameter for the getJobs call
}

async function timerFired(s, flowElement) {
  await flowElement.setTimerInterval(30); // interval for 'holding' jobs
  const jobsInfo = await s.getGlobalData(Scope.FlowElement, "jobsInfo");
  const currentTimestamp = new Date().getTime();
  let filteredIds = [];
  for (let id in jobsInfo) {
    // choose only jobs that have been staying for >= 1 hour
    if (jobsInfo[id] + 60 * 60 * 1000 <= currentTimestamp && filteredIds.length <= 10000) {
      filteredIds.push(id);
      delete jobsInfo[id];
    }
  }
  if (filteredIds.length > 0) {
    const jobs = await flowElement.getJobs(filteredIds); // note: returns max 10000 jobs
    for (let job of jobs) {
      await job.sendToSingle(); // move each job to the outgoing connection
    }
    await s.setGlobalData(Scope.FlowElement, "jobsInfo", jobsInfo);
  }
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
createPathWithName(name: string, createFolder: boolean): Promise<string>; // Corrected return type
```

**Note:** Apps/Scripts using the `createPathWithName` method are only supported in Switch 2024 Fall and later[cite: 116].
This method serves the purpose of generating a temporary folder inside, for example: `C:\Users\<username>\AppData\Local\Temp\SwitchNodeScriptExecutor\<flowID>\NodeScriptElement\<random_string>\sample`[cite: 116]. Each time this method is invoked in entry points, it generates a unique folder with a random value[cite: 117]. Once the Node script executor is discarded, it will clean up those created folders[cite: 118]. The creation of the temporary folder depends on user input[cite: 118]. For instance, `await flowElement.createPathWithName("sample", true);` generates the "sample" folder inside the unique path[cite: 119]. Conversely, `await flowElement.createPathWithName("sample", false);` creates the unique parent folder but not "sample" itself, returning the full path including "sample" to the user[cite: 120, 121].
**Example:** [cite: 122]

```typescript
// main.ts
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  try {
    let result = await flowElement.createPathWithName("sample", true);
    await flowElement.log(LogLevel.Info, "Result: %1", [result]);
    await job.sendToSingle(job.getName());
  } catch (error: any) {
    // Added type annotation
    // Handle any errors that occur during execution
    await flowElement.log(LogLevel.Error, `Error in jobArrived: ${error}`);
  }
}
```

[cite: 123]

### 4.6. Job class

An instance of the `Job` class represents a job (file or job folder) waiting to be processed in one of the input folders for the flow element associated with the script[cite: 124]. The third argument passed to the `jobArrived` entry point is the newly arrived job that triggered the entry point's invocation[cite: 124].
New job objects can be created using the `createJob` function of the `FlowElement` class[cite: 124].
Processing a job in a script usually consists of the following steps:

- Decide on how to process the job based on file type etc[cite: 124].
- Get the path to the incoming job using `Job::get()` call with the appropriate access level[cite: 124].
- Generate a temporary path for one or more output files or folders[cite: 124].
- Create the output(s) in the temporary location[cite: 124].
- Create the output job(s) using `Job::createChild()` call[cite: 125].
- In addition to (or instead of) creating new jobs it is possible to modify the incoming job[cite: 125].
- Call one of the `sendTo` functions for each output[cite: 125].
  If the incoming job is passed along without change, the `Job::sendTo()` functions can be called directly on the incoming job object, skipping all intermediate steps[cite: 126].

A job remains in the input folder until one of the `Job::sendTo()` or `Job::fail()` functions has been called for the job[cite: 128]. The `jobArrived` entry point will be invoked only once for each job, so if the entry point does not call a `sendTo()` or `fail()` function for the job, the script should do so at a later time (in a `timerFired` entry point or in a subsequent invocation of the `jobArrived` entry point for a different job)[cite: 129].
**Note:** After the flow restarts, the `jobArrived` entry point will be invoked once again for all jobs in the input folder[cite: 130].

### 4.6.1. Methods

#### 4.6.1.1. Getting job information

**Note:** To get the path to the input job look under Accessing job content[cite: 131].

```typescript
getName(includeExtension: boolean = true): string
```

Returns the file or folder name for the job, but excluding the unique filename prefix (job ID)[cite: 132]. By default the returned name includes the file extension[cite: 133]. The user can exclude the file extension by setting the `includeExtension` argument to false[cite: 133].

```typescript
getId(): string
```

Returns the unique job ID[cite: 134]. This is a filename prefix used for the job, without the underscores[cite: 134]. For example, for a job named "`_0G63D_myjob.txt`", this function would return "`0G63D`"[cite: 135]. Callers should not rely on the syntax of the returned string as this may change between Switch versions[cite: 136].

```typescript
isFile(): boolean
```

Returns true if the job is a single file, false otherwise[cite: 137].

```typescript
isFolder(): boolean
```

Returns true if the job is a folder, false otherwise[cite: 138].

```typescript
getVariableAsString(variable: string): Promise<any>
```

Takes the variable format from the Switch Designer and based on the metadata options (Boolean, Integer, Date, Text, Rational, TextIndexed), it outputs the result as a string[cite: 139].
**Example:** [cite: 140]

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  try {
    let result = await job.getVariableAsString('[Metadata.Rational:Dataset="JSON",Model="JSON",Path="dc:creator/*[1]"] ');
    await flowElement.log(LogLevel.Info, "Result: %1", [result]);
  } catch (error: any) {
    // Added type annotation
    await flowElement.log(LogLevel.Error, `Error retrieving variable: ${error}`);
  }
}
```

**Note:** There are still some limitations to this method:

- Text indexing is not supported in XML, XMP and JDF[cite: 140].
- Embedded HTML is not supported[cite: 141].
- In the Model option, Automatic selection is not supported[cite: 142]. You can choose either JDF, XML, XMP or JSON[cite: 142].
- This method only works with external types such as XMP, XML, JSON and JDF[cite: 143].

#### 4.6.1.2. Accessing job content

```typescript
async get(accessLevel: AccessLevel): Promise<string>
```

Returns the path to the job on the file system[cite: 144]. It allows the user to read file/folder contents (if called with `AccessLevel.ReadOnly`) and/or manipulate it (if called with `AccessLevel.ReadWrite`)[cite: 145]. Any file/folder modification will be detected and uploaded automatically on the routing stage (see Routing a job on page 95)[cite: 146].
**Note:** If job content modification is detected:

- If called with `AccessLevel.ReadOnly`, an error is thrown[cite: 147].
- If called with `AccessLevel.ReadWrite`, the job content is updated with the modified content[cite: 147].
- The above applies to `Job::sendToSingle`, `Job::sendTo`, `Job::sendToLog` and `Job::sendToData`[cite: 148].
  Throws an error if:
- Unknown `AccessLevel` is provided; [cite: 149]
- Any error happens when job content is transferred/accessed[cite: 149].
  **Remark:** This method can be used in script expressions but only with `AccessLevel.ReadOnly`[cite: 149].

**Example 1 (Read-Write):** [cite: 150]

```typescript
const fs = require("fs-extra");
async function jobArrived(s, flowElement, job) {
  // READ-WRITE example
  const tempPath = await job.get(AccessLevel.ReadWrite);
  if (job.isFile()) {
    // await fs.copy(sourceFile, tempPath); // i.e. replace job file
  } else {
    // await fs.emptyDir(tempPath); // i.e. replace folder structure
    // await fs.copy(sourceFolder, tempPath);
  }
  await job.sendToSingle(); // new job content uploaded automatically
}
```

**Example 2 (Read-Only):** [cite: 151, 152]

```typescript
const fs = require("fs-extra");
async function jobArrived(s, flowElement, job) {
  // READ-ONLY example
  const jobPath = await job.get(AccessLevel.ReadOnly);
  if (job.isFile()) {
    // const content = await fs.readFile(jobPath, { encoding: "utf8" }); // read file
    // await job.log(LogLevel.Info, "Job content is: " + content);
  } else {
    // const folderStructure = await fs.readdir(jobPath); // read folder structure
    // await job.log(LogLevel.Info, "Job content structure is: " + folderStructure);
  }
  await job.sendToSingle(); // dataset content uploaded automatically (if modified via getDataset)
}
```

#### 4.6.1.3. Logging messages [cite: 153]

```typescript
async log(level: LogLevel, message: string, messageParams?: (number | boolean | string)[]): Promise<void>
```

Logs a message of the specified level for this job, automatically including the appropriate job information[cite: 154]. If the message string contains references to non-existing message parameters, an error is thrown[cite: 155]. If you want to log a message that contains '%', pass it in the message parameters: `await job.log(LogLevel.Info, '%1', [message]);`[cite: 156].
**Example:** [cite: 156]

```typescript
async function() {
  try {
    await job.log(LogLevel.Warning, 'Something takes longer for job %1 with name "%2"', [job.getId(), job.getName()])
  } catch (error) {
    // do something in case of an error
  }
}
```

#### 4.6.1.4. Manipulating private data [cite: 157]

```typescript
async getPrivateData(tag: string | EnfocusSwitchPrivateDataTag): Promise<any>
```

Returns the value of the private data with the specified tag, or an empty string if no private data with that tag was set for the job[cite: 158].
**Important:** Any instance of Date (either tag value OR as part of tag value) will be returned as a string and should be parsed in the script itself[cite: 159]. See examples below[cite: 159].

```typescript
async getPrivateData(tags?: (string | EnfocusSwitchPrivateDataTag)[]): Promise<{tag: string | EnfocusSwitchPrivateDataTag, value: any}[]>
```

Returns:

- If `tags` are provided, a list of objects containing data only for the provided tags[cite: 160, 161]. If non-existing tags are provided, the result will not contain the data for these tags[cite: 161].
- If `tags` are not provided, a list of objects containing all available private data for the job[cite: 162, 163].
  **Important:** Any instance of Date (either tag value OR as part of tag value) will be returned as a string and should be parsed in the script itself[cite: 164]. See examples below[cite: 164].

<!-- end list -->

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async setPrivateData(tag: string | EnfocusSwitchPrivateDataTag, value: any): Promise<void>
```

Sets the value of the private data with the specified tag to the specified value[cite: 166]. The value can be any of type: string, number, boolean, object, Array, Date, or null[cite: 167]. If private data with the same tag name exists, the value of the private data will be replaced with the new one[cite: 168].
**Note:** Throws an error if no arguments are provided, or if the value argument is missing[cite: 169].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async setPrivateData(privateData: {tag: string | EnfocusSwitchPrivateDataTag, value: any}[]): Promise<void>
```

**Note:** We strongly recommend that tags created by scripts always start with `<companyname>` for `job.setPrivateData`[cite: 170]. This is to prevent clashes with tags set by other scripts or by the end user[cite: 171]. Scripts should not use `EnfocusSwitch` as namespace, to avoid clashes with private data tags created by Switch[cite: 172].
Sets the private data values for the specified tags[cite: 173]. The value can be any of type: string, number, boolean, object, Array, Date, or null[cite: 173]. If private data with the same tag name exists, the value of the private data will be replaced with the new one[cite: 174].
**Note:** Throws an error if no data is specified or if `privateData` is not an array[cite: 175].
**Example for getPrivateData and setPrivateData:** [cite: 175, 176]

```typescript
const expectedPrivateData = [
  { tag: "tag1", value: 1 },
  { tag: "tag2", value: true },
  { tag: "tag3", value: { key: [2, 3, 4] } },
];
try {
  await job.setPrivateData("tag4", "value4");
  await job.setPrivateData(EnfocusSwitchPrivateDataTag.userEmail, "john.doe@example.com");
  await job.setPrivateData(expectedPrivateData);
  let actual = await job.getPrivateData();
  console.log("get all private data:", actual);
  actual = await job.getPrivateData("tag1");
  console.log("get one existing:", actual);
  actual = await job.getPrivateData(EnfocusSwitchPrivateDataTag.userEmail);
  console.log("get for predefined:", actual);
  actual = await job.getPrivateData("nonExisting");
  console.log("get one non-existing:", actual);
  actual = await job.getPrivateData(["tag2", "tag3"]);
  console.log("get specific:", actual);
  await job.sendToSingle();
} catch (e: any) {
  // Added type annotation
  console.log(e);
  job.fail(`${job.getName()} : ${e.message}`, []);
}
/* Output:
 get all private data: [
 { tag: 'BeingProcessedByRemoteProcessElement_7.2', value:'1' },{ tag: 'tag4', value: 'value4' },
 { tag: 'tag1', value: 1 },
 { tag: 'tag2', value: true },
 { tag: 'tag3', value: {key: [2,3,4]} }
 ]
 get one existing:1
 get for predefined:john.doe@example.com
 get one non-existing:
 get specific: [ { tag: 'tag2', value: true }, { tag: 'tag3', value: {key: [2,3,4]} } ]
 */
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async removePrivateData(tag: string | EnfocusSwitchPrivateDataTag): Promise<void>
```

Removes private data with the specified tag from the job[cite: 178].
**Note:** Throws an error if no tag is specified[cite: 178].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async removePrivateData(tags: (string | EnfocusSwitchPrivateDataTag)[]): Promise<void>
```

Removes private data with the specified tags from the job[cite: 179].
**Note:** Throws an error if the tags are not specified, or if the array is empty[cite: 179].
**Example:** [cite: 180, 181]

```typescript
try {
  await job.setPrivateData([
    { tag: "survived1", value: "value_survived1" },
    { tag: "survived2", value: "value_survived2" },
    { tag: "toBeRemoved1", value: "value_removed1" },
    { tag: "toBeRemoved2", value: "value_removed2" },
    { tag: "toBeRemoved3", value: "value_removed3" },
    { tag: EnfocusSwitchPrivateDataTag.userName, value: "Admin" },
  ]);
  await job.removePrivateData("toBeRemoved1");
  await job.removePrivateData(["toBeRemoved2", "toBeRemoved3"]);
  await job.removePrivateData(EnfocusSwitchPrivateDataTag.userName);
  await job.sendToSingle();
} catch (e: any) {
  // Added type annotation
  console.log(e);
  job.fail(`${job.getName()} : ${e.message}`, []);
}
```

#### 4.6.1.5. Private data used by built-in elements [cite: 182]

Some private data tags are reserved for Switch built-in elements and can be read by the scripts[cite: 183]. Except for the `EnfocusSwitch.origin`, these private data fields can be changed by scripts using `job.setPrivateData` calls[cite: 184].

- `EnfocusSwitch.hierarchy` (string[]): Array with hierarchy location path segments (topmost at index 0), or empty array[cite: 185].
- `EnfocusSwitch.emailAddresses` (string[]): Array with email addresses, or empty array[cite: 186].
- `EnfocusSwitch.emailBody` (string): Email body text, or empty string[cite: 187].
- `EnfocusSwitch.userName` (string): Short user name, or empty string[cite: 188, 189].
- `EnfocusSwitch.userFullName` (string): Full user name, or empty string[cite: 190].
- `EnfocusSwitch.userEmail` (string): User email address, or empty string[cite: 191].
- `EnfocusSwitch.origin` (string): Indication of job origin (e.g., Submit point writes original client path)[cite: 192, 193]. Currently read-only; writing has no effect[cite: 194].
- `EnfocusSwitch.initiated` (string): Initiated date as string in "`YYYY-MM-DD'T'hh:mm:ss`" format (e.g. "`2021-06-10T00:01:02`")[cite: 195]. Time job reached first entry point[cite: 196].
- `EnfocusSwitch.submittedTo` (string): Display name of the Submit point[cite: 196].
- `EnfocusSwitch.state` (string): Job state[cite: 197]. Setting this from scripting will not be reflected in Statistics pane or History dashboard/GraphQL API[cite: 198].
  For possible values and examples, refer to `EnfocusSwitchPrivateDataTag` enumeration[cite: 198].

#### 4.6.1.6. Manipulating datasets [cite: 199]

```typescript
async listDatasets(): Promise<{name: string, model: DatasetModel, extension: string}[]>
```

Returns a list of all datasets' names with models and extensions associated with the job[cite: 200]. The returned list does not contain datasets created in the same entry point invocation[cite: 201].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async removeDataset(name: string): Promise<void>
```

Removes the dataset with the specified name for the job[cite: 202].
**Note:**

- Throws an error in case the dataset does not exist[cite: 202].
- Throws an error if no name is specified[cite: 203].

<!-- end list -->

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async createDataset(name: string, filePath: string, model: DatasetModel): Promise<void>
```

Creates a new dataset with the specified model and associates it with the specified name[cite: 205]. The new dataset will be uploaded when any `sendTo` method for the job is called[cite: 206]. When failing the job, the dataset will not be added[cite: 206]. Changing the name, model or extension of a dataset is only possible by creating a new dataset and removing the old one[cite: 207]. The values allowed for the dataset model are: XML, JDF, XMP, JSON, and Opaque[cite: 208].
**Note:**

- Throws an error if neither name, `filePath`, nor model are specified[cite: 209].
- The file or folder that was passed to `createDataset` will not automatically be removed by Switch when sending or failing the job[cite: 210]. Therefore it's up to the script to make sure that temporary files or folders passed to `createDataset` are correctly removed after sending or failing the job[cite: 211].

<!-- end list -->

```typescript
async getDataset(name: string, accessLevel: AccessLevel): Promise<string>
```

Returns the file path for the metadata dataset for the job associated with the specified name[cite: 212]. When calling any `sendTo` method, the scripting module automatically uploads/replaces the dataset if the dataset was modified, i.e the returned dataset does not include changes made in the same entry point invocation[cite: 213]. This also means that when failing the job, the dataset will not be changed[cite: 214].
**Note:** If dataset content modification is detected:

- If called with `AccessLevel.ReadOnly`, an error is thrown[cite: 215].
- If called with `AccessLevel.ReadWrite`, the dataset content is updated with the modified content[cite: 216].
- The above applies to `Job::sendToSingle`, `Job::sendTo`, `Job::sendToLog` and `Job::sendToData`[cite: 217].
  Throws an error if:
- Unknown `AccessLevel` is provided; [cite: 218]
- Any error happens when the dataset content is transferred/accessed[cite: 218].
  **Remark:** This method can be used in script expressions but only with `AccessLevel.ReadOnly`[cite: 219].

**Example 1 (Read-Write):** [cite: 218]

```typescript
const fs = require("fs-extra");
async function jobArrived(s, flowElement, job) {
  // READ-WRITE example
  const sourceFile = await flowElement.getPropertyStringValue("SourceFilePath");
  const tempPath = await job.getDataset("XMLDataset", AccessLevel.ReadWrite); // Corrected name
  await fs.copy(sourceFile, tempPath); // i.e. replace dataset file
  await job.sendToSingle();
}
```

**Example 2 (Read-Only):** [cite: 219]

```typescript
async function jobArrived(s, flowElement, job) {
  // READ-ONLY example
  const jobPath = await job.get(AccessLevel.ReadOnly);
  const tempPath = await job.getDataset("XMLDataset", AccessLevel.ReadOnly); // Corrected name
  // const content = await fs.readFileSync(tempPath, { encoding: "utf8" }); // read file
  // await job.log(LogLevel.Info, "Dataset content is: ", content); // no changes allowed
  await job.sendToSingle();
}
```

#### 4.6.1.7. Creating a new child job

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async createChild(path: string): Promise<Job>
```

Creates a child job from a file or folder that already exists at the specified path[cite: 221]. Returns a job instance representing a new job that inherits the processing history, external metadata and private data from the 'parent' job[cite: 222]. It should be separately routed using one of the `sendTo` methods[cite: 223]. If the new job should not inherit the properties of the input job, or if there is no input job (e.g., inside `timerFired`), then use `FlowElement::createJob`[cite: 224].
**Example:** [cite: 225]

```typescript
async function jobArrived(s, flowElement, job) {
  try {
    const reportJob = await job.createChild(/*<path_to_report_file>*/ "/path/to/report.xml");
    await reportJob.sendToLog(Connection.Level.Success, DatasetModel.XML); // Added model
    await job.sendToData(Connection.Level.Success);
  } catch (e: any) {
    // Added type annotation
    // catch an error
  }
  // remove <path_to_report_file> if temporary
}
```

**Note:** The file or folder that was passed to `createChild` will not automatically be removed by Switch when sending or failing the job[cite: 226]. Therefore it's up to the script to make sure that temporary files or folders passed to `createChild` are correctly removed after sending or failing the job[cite: 227].

#### 4.6.1.8. Routing a job

After a job is sent to an output connection, no other calls for this `Job` object are allowed, except the other `sendTo` calls and `Job::fail`[cite: 228]. It's good practice to create a new or child job if you want to route the original job to more than one connection[cite: 229]. A child job is a new job that inherits all the properties of the parent job (job ticket, datasets, etc.)[cite: 230]. There is a new method in the `Job` class to create a child job[cite: 231]. The creation of a child job was not possible in legacy scripting[cite: 232]. It is allowed to call `sendTo` methods multiple times for the same incoming job, on the condition that it is not modified in the entry point[cite: 233]. Sending a modified job multiple times will result in unpredictable behavior[cite: 234].
Contrary to legacy scripting, the original file/folder used for newly created jobs is NOT removed from its location when using a `sendTo` method; it is up to the script writer to do that (see example below)[cite: 235]. The `Job::fail` method can still be called after a `sendTo` method[cite: 236]. In such a case it overrides the previously called `sendTo` method and fails the job[cite: 237]. If none of the `sendTo` methods is called for a newly created job, the job is discarded[cite: 238]. In case of an incoming job, the job stays in the input folder and its content is not modified[cite: 239].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendToNull(): Promise<void>
```

Marks the job as completed without generating any output[cite: 240].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendToSingle(newName?: string): Promise<void>
```

Sends the job to the single outgoing 'move' connection[cite: 241]. Throws an error in case there are no outgoing connections[cite: 241]. The optional argument `newName` allows renaming the job[cite: 242]. If the script is not configured to use 'move' connections, the element is failed with an appropriate error message[cite: 243]. If the flow element instance has two or more outgoing connections, the job is moved to only one connection[cite: 243].
**Example:** [cite: 244]

```typescript
await job.sendToSingle("newName.pdf");
await job.sendToSingle();
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendTo(c: Connection, newName?: string): Promise<void>
```

Sends the job to the specified outgoing 'move' connection[cite: 245]. If the script is not configured to use 'move' connections, the element is failed with an appropriate error message[cite: 246]. The optional argument `newName` allows renaming the job[cite: 246].
**Example:** [cite: 247]

```typescript
const outConnections = flowElement.getOutConnections();
for (const connection of outConnections) {
  if (job.isFile() && connection.getName() === "move") {
    // Assuming connection name check
    await job.sendTo(connection, "sendTo.txt");
  }
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendToData(level: Connection.Level, newName?: string): Promise<void>
```

Sends the jobs to the outgoing "data" traffic light connections that have the specified connection level property enabled[cite: 248]. The optional argument `newName` allows renaming the job[cite: 248]. If the script is not configured to use traffic light connections, this function logs an error and does nothing[cite: 249]. If the flow element has no outgoing connections of the specified level, this function logs a warning and the job is discarded[cite: 250].
**Example:** [cite: 250]

```typescript
await job.sendToData(Connection.Level.Warning, "data_warning.txt");
await job.sendToData(Connection.Level.Success, "data_success.txt");
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendToLog(level: Connection.Level, model: DatasetModel, newName?: string): Promise<void>
```

Sends the job to the outgoing "log" traffic light connections that have the specified connection level property enabled[cite: 252]. The optional argument `newName` allows renaming the job[cite: 252]. For "data with log" traffic light connections, the job is attached as a metadata dataset to all "data" jobs (routed via `SendToData`)[cite: 254]. The `model` argument defines the metadata dataset model and the metadata dataset name is taken from the "Dataset name" property of the outgoing connections[cite: 255]. Note that metadata datasets have automatically generated names and defined extensions[cite: 256]. Therefore after the job is attached as a metadata dataset, its name is lost but the filename extension is preserved[cite: 257]. If the `newName` argument is defined, the extension of `newName` will be used for the attached metadata datasets[cite: 258]. If the script is not configured to use traffic light connections, this function logs an error and does nothing[cite: 259]. If the flow element has no outgoing connections of the specified level, this function logs a warning and the job is discarded[cite: 260]. For possible values of the model argument, see `DatasetModel`[cite: 261]. If the model argument has an unsupported value, an exception is thrown[cite: 261].
**Example:** [cite: 261]

```typescript
await job.sendToLog(Connection.Level.Error, DatasetModel.XML, "log_error.xml");
await job.sendToLog(Connection.Level.Warning, DatasetModel.XML, "log_warning.xml");
await job.sendToLog(Connection.Level.Success, DatasetModel.XML, "log_success.xml");
```

**Note:** For "data with log" traffic light connections, the `ConnectionLevel` argument is ignored[cite: 262]. For example, if one job is routed via `sendToLog(Connection.Level.Error, ...)` and another job via `sendToLog(Connection.Level.Success, ...)`, the job that was routed last will be attached as a dataset in the end[cite: 263, 264]. To consider the level argument, use a "log" traffic light connection instead[cite: 264].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
fail(message: string, messageParams?: (number | boolean | string)[]): void
```

Logs a fatal error for the job with the specified message and moves the job to the problem jobs folder[cite: 266]. `messageParams` are used as substitutes for %1, %2 etc. in the message[cite: 267]. The job and its dataset's content is not modified[cite: 267]. Newly created datasets are discarded as well[cite: 268]. Note that removing existing datasets and operations on the job's private data are preserved[cite: 269]. Newly created jobs are not moved to the problem jobs folder (i.e. a job created using `createChild()` or `createJob()` and failed during the same entry point invocation is not moved)[cite: 270]. If the message string contains references to non-existing message parameters, an error is thrown[cite: 271]. See Log[cite: 271].
**Example:** [cite: 271]

```typescript
job.fail("Something went wrong with the job %1", [job.getName()]);
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async processLater(seconds: number): Promise<void>
```

Schedules the job to be processed at a later moment so that `jobArrived` will be called again for the same job and dynamic properties set on the element will be re-evaluated[cite: 272]. The `<seconds>` parameter specifies the minimum time interval after which Switch will schedule the job for processing again[cite: 272]. The default value for the interval is 300 seconds (5 minutes)[cite: 273]. When `processLater` is called from `jobArrived`, a minimum of 10 seconds will be applied and a warning will be logged if a smaller value was passed[cite: 275]. The job and its dataset's content are not modified[cite: 275]. Newly created datasets are discarded as well[cite: 276]. Note that removing existing datasets and operations on the job's private data are preserved[cite: 277]. `processLater` cannot be called on new or child jobs created in the current entry point[cite: 278].
**Note:** It is allowed to change the private data of the job[cite: 278].
**Example:** [cite: 279]

```typescript
const thePrivateData = await job.getPrivateData("ProcessLater");
if (thePrivateData == 1) {
  await job.setPrivateData("ProcessLaterTime", ""); // Assuming this was set before
  await job.sendToSingle();
} else {
  await job.setPrivateData("ProcessLater", 1);
  const delay = Number(await flowElement.getPropertyStringValue("Delay"));
  await job.processLater(delay);
}
```

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async sendToChannel( channelId: string, newName?: string ): Promise<void>
```

To be called from the sending element to move the incoming job to the subscribed receiving element in the same or other flow the moment that the current entry point finishes[cite: 280]. If there are no active subscribers for the channel, this method will not throw an error, instead an error will be logged and the job will remain in the input folder (e.g. if the receiving element wasn't activated yet)[cite: 280].

- `channelId`: identifies the channel to which the job needs to be sent[cite: 280].
- The optional argument `newName` allows you to rename the job[cite: 280].
  See also `subscribeToChannel`[cite: 280].
  **Example:** [cite: 280]

<!-- end list -->

```typescript
await job.sendToChannel("channelId");
```

**Routing a job: Example** [cite: 281]

```typescript
const fs = require("fs");
const rmdir = require("rimraf"); // recursively delete non-empty folders
async function timerFired(s, flowElement) {
  let fileToBeInjected = "/path/to/a/file";
  try {
    let newJob = await flowElement.createJob(fileToBeInjected); // Added await
    await newJob.sendToSingle();
    fs.unlinkSync(fileToBeInjected); // delete the injected file
  } catch (err: any) {
    // Added type annotation
    await flowElement.log(LogLevel.Error, err.message); // just log message
    // return; // Consider if process should stop here
  }

  let folderToBeInjected = "/path/to/a/folder";
  try {
    let newJob = await flowElement.createJob(folderToBeInjected); // Added await
    await newJob.sendToSingle();
    rmdir.sync(folderToBeInjected); // delete the non-empty injected folder
  } catch (err: any) {
    // Added type annotation
    await flowElement.failProcess(err.message); // put element in error state
    // return;
  }
}
```

#### 4.6.1.9. Job priority

The job priority determines the order in which jobs are processed[cite: 283]. For more information, refer to "Job priorities" in the Switch Reference Guide[cite: 283].

```typescript
getPriority(): number
```

Returns the priority of the job[cite: 284].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setPriority(priority: number): void
```

Sets the priority of the job[cite: 285]. For possible values, refer to `Priority` enumeration[cite: 285].

### 4.7. Connection class

An instance of the `Connection` class represents an outgoing connection for the flow element associated with the script[cite: 286]. Connection objects can be obtained through functions of the `FlowElement` class[cite: 286].

### 4.7.1. Methods

**Note:** Methods with the word 'async' return a Promise[cite: 287]. It is therefore recommended to call these functions with 'await'[cite: 287]. The other functions can be called as they are[cite: 288].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getName(): string
```

Returns the name of the destination folder if the connection name is empty[cite: 289].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getId(): string
```

Returns a string that uniquely identifies the connection (within limits described below)[cite: 290]. Callers should not rely on the syntax of the returned string as this may change between Switch versions[cite: 291]. The element ID guarantees:

- It differs from any other element ID in any currently active flow[cite: 292].
- It remains unchanged as long as the flow is not edited (even across deactivation/reactivation/sessions)[cite: 293].
- A connection ID is never equal to a non-connection element ID[cite: 294].
  Holding/releasing connections or renaming the flow doesn't count as editing[cite: 295]. Exporting/re-importing, upgrading, or renaming an element inside the flow _does_ count as editing[cite: 295].

<!-- end list -->

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async getPropertyStringValue(tag: string): Promise<string | string[]>
```

Returns the value of a custom outgoing connection property as string[cite: 297]. Property specified by tag[cite: 297]. See `FlowElement.getPropertyStringValue`[cite: 298].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPropertyType(tag: string): PropertyType
```

Returns the connection property value type[cite: 298]. See `FlowElement.getPropertyType`[cite: 299].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
hasProperty(tag: string): boolean
```

Returns true if a property with the specified tag is available for the connection, otherwise returns false[cite: 300].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getPropertyDisplayName(tag: string): string
```

Returns the untranslated name of the property as visible in the user interface[cite: 301]. Mostly intended for log messages[cite: 302].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
async getFileCount(nested: boolean = false): Promise<number> // Added default value for clarity
```

Returns the number of files currently residing in the folder at the other end of this connection[cite: 303]. If `nested` is false, only items directly inside are counted[cite: 304]. If `nested` is true, files in subfolders counted recursively (subfolders themselves don't count)[cite: 305].
**Example:** [cite: 306, 307, 308]

```typescript
async function timerFired(s, flowElement) {
  var connlist = flowElement.getOutConnections();
  for (var i = 0; i < connlist.length; i++) {
    var conn = connlist[i]; // Corrected .at(i) to [i]
    var name = await conn.getName();
    await flowElement.log(LogLevel.Info, "name is: " + JSON.stringify(name));
    var fcount = await conn.getFileCount(false); // count files directly in connection
    await flowElement.log(LogLevel.Info, "File count: " + fcount);
    var fcountDeep = await conn.getFileCount(true); // deep count files in connection
    await flowElement.log(LogLevel.Info, "File count (deep counted): " + fcountDeep);
  }
}
```

### 4.8. ImageDocument class [cite: 309]

Allows retrieving certain information about image file contents (JPEG, TIFF, PNG)[cite: 310]. Reads values from EXIF and XMP[cite: 310]. Does not allow modifying file contents[cite: 311]. Each instance references a file[cite: 311]. Static methods might throw exceptions; wrap in try-catch[cite: 312, 313].

### 4.8.1. Static methods

```typescript
static open(path: string): Promise<ImageDocument>;
```

Opens the image document to extract image data.

```typescript
static getWidth(path: string): Promise<number>;
```

Returns the valid image width, in pixels[cite: 314].

```typescript
static getHeight(path: string): Promise<number>;
```

Returns the valid image height, in pixels.

```typescript
static getColorMode(path: string): Promise<ImageDocument.ColorMode>;
```

Returns the color mode used[cite: 315].

```typescript
static getColorSpace(path: string): Promise<ImageDocument.ColorSpace>;
```

Returns the color space used.

```typescript
static getICCProfile(path: string): Promise<string>;
```

Returns the name of ICC color profile used (Photoshop only)[cite: 316].

```typescript
static getSamplesPerPixel(path: string): Promise<number>;
```

Returns the number of components per pixel[cite: 317].

**Example script:** [cite: 318, 319, 320, 321, 322, 323, 324]

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  const jobPath = await job.get(AccessLevel.ReadOnly);
  try {
    // Instance methods via open()
    const image: ImageDocument = await EnfocusSwitch.ImageDocument.open(jobPath);
    const imageWidth: number = image.getWidth();
    const imageHeight: number = image.getHeight();
    const imageColorMode: ImageDocument.ColorMode = image.getColorMode();
    const imageColorSpace: ImageDocument.ColorSpace = image.getColorSpace();
    const imageICCProfile: string = image.getICCProfile();
    const imageSamplesPerPixel: number = image.getSamplesPerPixel();
    await job.log(
      LogLevel.Warning,
      `Result: ${imageWidth}, height: ${imageHeight}, colorMode: ${imageColorMode}, colorSpace: ${imageColorSpace}, ICCProfile: ${imageICCProfile}, SamplesPerPixel: ${imageSamplesPerPixel}`,
      []
    );
    image.close();

    // Static methods
    const width: number = await EnfocusSwitch.ImageDocument.getWidth(jobPath);
    const height: number = await EnfocusSwitch.ImageDocument.getHeight(jobPath);
    const colorMode: ImageDocument.ColorMode = await EnfocusSwitch.ImageDocument.getColorMode(jobPath);
    const colorSpace: ImageDocument.ColorSpace = await EnfocusSwitch.ImageDocument.getColorSpace(jobPath);
    const ICCProfile: string = await EnfocusSwitch.ImageDocument.getICCProfile(jobPath);
    const samplesPerPixel: number = await EnfocusSwitch.ImageDocument.getSamplesPerPixel(jobPath);
    await job.log(
      LogLevel.Warning,
      `Result 2: ${width}, height: ${height}, colorMode: ${colorMode}, colorSpace: ${colorSpace}, ICCProfile: ${ICCProfile}, SamplesPerPixel: ${samplesPerPixel}`,
      []
    );

    await job.sendToSingle();
  } catch (e: any) {
    // Added type annotation
    job.fail(`${job.getName()} : ${e.message}`, []);
  }
}
```

### 4.8.2. Instance methods

```typescript
close();
```

Closes the image file[cite: 325]. Call when instance no longer required[cite: 325].

```typescript
getWidth(): number;
```

Returns the valid image width, in pixels[cite: 326].

```typescript
getHeight(): number;
```

Returns the valid image height, in pixels[cite: 326].

```typescript
getColorMode(): ImageDocument.ColorMode;
```

Returns the color mode used[cite: 327].

```typescript
getColorSpace(): ImageDocument.ColorSpace;
```

Returns the color space used[cite: 327].

```typescript
getICCProfile(): string;
```

Returns the name of ICC color profile used (Photoshop only)[cite: 328].

```typescript
getSamplesPerPixel(): number;
```

Returns the number of components per pixel[cite: 329].

_(Example script is identical to the one in 4.8.1)_ [cite: 330, 331, 332, 333, 334, 335]

### 4.9. PdfDocument class

Allows retrieving certain PDF information about PDF file contents[cite: 336]. Does not allow modifying file contents[cite: 336]. Each instance references a file[cite: 337].

### 4.9.1. Static methods

**Note:**

- All methods might throw exceptions; wrap in try-catch[cite: 338].
- `path` is always absolute path to PDF file[cite: 339].
- If calling multiple functions on one PDF, use instance methods[cite: 340].

<!-- end list -->

```typescript
static open(path: string): Promise<PdfDocument>; // Corrected return type (Promise)
```

Constructs a `PdfDocument` instance associated with a file specified by absolute path[cite: 341].
**Note:** Use instance methods after creating instance[cite: 342].

```typescript
static getNumberOfPages(path: string): Promise<number>; // Corrected return type
```

Returns the number of pages in the PDF document[cite: 343].

```typescript
static getPDFVersion(path: string): Promise<string>; // Corrected return type
```

Returns the version of the PDF file format (e.g., "1.6")[cite: 343].

```typescript
static getPDFXVersion(path: string): Promise<string>; // Corrected return type
```

Returns the PDF/X version, or empty string if none[cite: 344].
**Note:** PDF/X version indicates claim of conformance, not guarantee[cite: 346].

```typescript
static getSecurityMethod(path: string): Promise<string>; // Corrected return type
```

Returns the method used to protect the document[cite: 348].

```typescript
static getPageHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>; // Corrected return type
```

Returns height of PDF page (points)[cite: 349]. Same as `getPageMediaBoxHeight`[cite: 349]. If `effective`=true, rotation/scaling accounted for[cite: 350].

```typescript
static getPageWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>; // Corrected return type
```

Returns width of PDF page (points)[cite: 351]. Same as `getPageMediaBoxWidth`[cite: 351]. If `effective`=true, rotation/scaling accounted for[cite: 352].

```typescript
static getPageRotation(path: string, pageNumber: number = 1): Promise<number>; // Corrected return type
```

Returns rotation (degrees)[cite: 353].

```typescript
static getPageScaling(path: string, pageNumber: number = 1): Promise<number>; // Corrected return type
```

Returns scaling (factor)[cite: 354].

```typescript
static getPageLabel(path: string, pageNumber: number = 1): Promise<string>; // Corrected return type
```

Returns page label, or empty string if none[cite: 354].

The following return height/width (points) of corresponding page box:

```typescript
static getPageMediaBoxHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageCropBoxHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageBleedBoxHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageTrimBoxHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageArtBoxHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageMediaBoxWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageCropBoxWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageBleedBoxWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageTrimBoxWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
static getPageArtBoxWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>;
```

[cite: 355, 356]
**Note:** If `effective`=true, rotation/scaling accounted for[cite: 357].

**Example script with static method:** [cite: 359]

```typescript
try {
  // Get the number of pages directly using the static method
  const numPages: number = await PdfDocument.getNumberOfPages(jobPath); // Added await
} catch (err: any) {
  // Added type annotation
  job.fail("PDF error: %1", [err]);
}
```

**Example script with static and instance methods:** [cite: 360, 361, 362]

```typescript
let pdfDoc: PdfDocument | null = null; // Allow null
try {
  // Open PDF file using the static open method
  pdfDoc = await PdfDocument.open(jobPath); // Added await
  // Get the number of pages using the instance method
  const numPages: number = pdfDoc.getNumberOfPages(); // Instance method is sync
  // Close the PDF document
  pdfDoc.close();
  pdfDoc = null;
} catch (err: any) {
  // Added type annotation
  job.fail("PDF error: %1", [err]);
  if (pdfDoc) {
    pdfDoc.close();
  }
}
```

### 4.9.2. Instance methods

**Note:**

- All methods might throw exceptions; wrap in try-catch[cite: 364].
- Instance created by static `PdfDocument.open`[cite: 364].

<!-- end list -->

```typescript
close();
```

Closes the PDF file[cite: 365]. Call when instance no longer required[cite: 365].

```typescript
getNumberOfPages(): number;
```

Returns number of pages[cite: 366].

```typescript
getPDFVersion(): string;
```

Returns PDF version (e.g., "1.6")[cite: 367].

```typescript
getPDFXVersion(): string;
```

Returns PDF/X version, or empty string[cite: 368].
**Note:** Claim of conformance, not guarantee[cite: 370].

```typescript
getSecurityMethod(): string;
```

Returns protection method[cite: 370].

```typescript
getPage(pageNumber: number = 1): PdfPage;
```

Constructs `PdfPage` instance for page `<pageNumber>` (1-based)[cite: 371].

```typescript
getXMP(): XmpDocument;
```

Returns `XmpDocument` instance with PDF's XMP metadata stream[cite: 372].

### 4.10. PdfPage class [cite: 373]

Allows retrieving PDF page information[cite: 374]. Does not allow modifying page contents[cite: 374]. Instance references specific page, constructed via `PdfDocument.getPage`[cite: 375].

### 4.10.1. Methods

**Note:**

- All methods might throw exceptions; wrap in try-catch[cite: 376].
- Instance created by `PdfDocument.getPage`[cite: 377].

<!-- end list -->

```typescript
getRotation(): number;
```

Returns rotation (degrees)[cite: 377].

```typescript
getScaling(): number;
```

Returns scaling (factor)[cite: 378].

```typescript
getPageLabel(): string;
```

Returns page label, or empty string[cite: 379].

```typescript
getHeight(effective?: boolean): number;
```

Returns page height (points)[cite: 380]. Same as `getMediaBoxHeight`[cite: 381]. If `effective`=true, rotation/scaling accounted for[cite: 381].

```typescript
getWidth(effective?: boolean): number;
```

Returns page width (points)[cite: 382]. Same as `getMediaBoxWidth`[cite: 383]. If `effective`=true, rotation/scaling accounted for[cite: 383].

The following return height/width (points) of corresponding page box: [cite: 384]

```typescript
getMediaBoxHeight(effective?: boolean): number;
getCropBoxHeight(effective?: boolean): number;
getBleedBoxHeight(effective?: boolean): number;
getTrimBoxHeight(effective?: boolean): number;
getArtBoxHeight(effective?: boolean): number;
getMediaBoxWidth(effective?: boolean): number;
getCropBoxWidth(effective?: boolean): number;
getBleedBoxWidth(effective?: boolean): number;
getTrimBoxWidth(effective?: boolean): number;
getArtBoxWidth(effective?: boolean): number;
```

[cite: 385, 386, 387]
**Note:** If `effective`=true, rotation/scaling accounted for[cite: 388].

**Example script (Check if all pages have identical page boxes):** [cite: 389, 390, 391, 392, 393]

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  const jobPath = await job.get(AccessLevel.ReadOnly);
  let pdfDoc: PdfDocument | null = null; // Allow null
  try {
    // Open PDF file
    pdfDoc = await PdfDocument.open(jobPath); // Added await
    const numPages: number = pdfDoc.getNumberOfPages();
    let pageBoxesEqual: boolean = true;
    let pdfPage: PdfPage;
    let abHeight: number = 0,
      abWidth: number = 0,
      bbHeight: number = 0,
      bbWidth: number = 0; // Init vars
    let cbHeight: number = 0,
      cbWidth: number = 0,
      mbHeight: number = 0,
      mbWidth: number = 0;
    let tbHeight: number = 0,
      tbWidth: number = 0;

    if (numPages >= 1) {
      // Get page boxes for the first page
      pdfPage = pdfDoc.getPage(1);
      abHeight = pdfPage.getArtBoxHeight(false);
      abWidth = pdfPage.getArtBoxWidth(false);
      bbHeight = pdfPage.getBleedBoxHeight(false);
      bbWidth = pdfPage.getBleedBoxWidth(false);
      cbHeight = pdfPage.getCropBoxHeight(false);
      cbWidth = pdfPage.getCropBoxWidth(false);
      mbHeight = pdfPage.getMediaBoxHeight(false);
      mbWidth = pdfPage.getMediaBoxWidth(false);
      tbHeight = pdfPage.getTrimBoxHeight(false);
      tbWidth = pdfPage.getTrimBoxWidth(false);
    }

    // Go over all the pages
    for (let i = 2; i <= numPages; ++i) {
      pdfPage = pdfDoc.getPage(i);
      // Compare page boxes
      if (
        pdfPage.getArtBoxHeight(false) !== abHeight ||
        pdfPage.getBleedBoxHeight(false) !== bbHeight ||
        pdfPage.getCropBoxHeight(false) !== cbHeight ||
        pdfPage.getMediaBoxHeight(false) !== mbHeight ||
        pdfPage.getTrimBoxHeight(false) !== tbHeight ||
        pdfPage.getArtBoxWidth(false) !== abWidth ||
        pdfPage.getBleedBoxWidth(false) !== bbWidth ||
        pdfPage.getCropBoxWidth(false) !== cbWidth ||
        pdfPage.getMediaBoxWidth(false) !== mbWidth ||
        pdfPage.getTrimBoxWidth(false) !== tbWidth
      ) {
        pageBoxesEqual = false;
        break;
      }
    }

    // Close the PDF document
    pdfDoc.close();
    pdfDoc = null;

    if (pageBoxesEqual) {
      await job.sendToData(Connection.Level.Success);
    } else {
      await job.sendToData(Connection.Level.Error);
    }
  } catch (err: any) {
    // Added type annotation
    job.fail("PDF error: %1", [err]);
    if (pdfDoc) {
      pdfDoc.close();
    }
  }
}
```

### 4.11. HttpRequest class

Represents the incoming webhook request.

### 4.11.1. Methods

**Note:** Methods cannot be used in Node.js script expressions[cite: 397].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
getBodyAsString(): string
```

Returns the body of the request as a string.

### 4.11.2. Properties

- `method`: `HttpRequest.Method` - The HTTP request method.
- `path`: string - Request URL path (e.g., "/myscript/notify")[cite: 394]. Note `/scripting` not part of path here[cite: 394].
- `query`: `{ [propName: string]: string | string[] }` - Object representing query string parameters[cite: 394].
- `headers`: `{ [header: string]: string }` - Object representing HTTP request headers (e.g., 'Content-Type')[cite: 394].
- `remoteAddress`: string - Request's origin IP address[cite: 395].
- `body?`: `ArrayBuffer` - The body of the request[cite: 395].

### 4.12. HttpResponse class

Represents the response to the webhook request[cite: 396].

### 4.12.1. Methods

**Note:** Methods cannot be used in Node.js script expressions[cite: 397].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setStatusCode(statusCode: number): void
```

Sets response status code (default 200)[cite: 397].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setHeader(name: string, value: string): void
```

Sets header `name` to `value`[cite: 398].

```typescript
// NOT FOR SCRIPT EXPRESSIONS
setBody(data: ArrayBuffer | string): void
```

Sets response body to `data`[cite: 398].

### 4.13. XmlDocument class [cite: 399]

Allows finding info in XML documents using XPath 1.0[cite: 400]. Does not allow modifying XML contents[cite: 400]. Instance references XML content loaded from file/memory[cite: 401].

### 4.13.1. Methods

**Note:** All methods might throw exceptions; wrap in try-catch[cite: 402].

```typescript
static open(path: string): XmlDocument;
```

Constructs `XmlDocument` instance from file specified by absolute path[cite: 402].

```typescript
static parse(xmlString: string): XmlDocument;
```

Constructs `XmlDocument` instance from XML string[cite: 403].

```typescript
evaluate(xpath: string, prefixMap?: { [name: string]: string }): boolean | number | string | undefined;
```

Evaluates XPath 1.0 expression against loaded XML, returns result[cite: 405, 406].
**Note:** XPath does not support default namespace concept; explicitly provide prefixes[cite: 407]. `prefixMap` maps prefixes in XPath expression to namespace URIs (may differ from doc prefixes)[cite: 408, 409].

```typescript
getDefaultNSMap(): { [name: string]: string };
```

Returns new prefix map containing all mappings from XML content[cite: 410]. Includes default namespace (if any) with special prefixes "`default_switch_ns`" and "`dn`"[cite: 411]. Allows XPath queries to refer to default namespace using these prefixes[cite: 412].

**Example:** [cite: 413, 414, 415, 416, 417]

```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
 <message>Hello world!</message>
 <jobComplete>false</jobComplete>
 <jobType>B</jobType>
 <price>4567.5</price>
</root>
```

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  let result = "";
  let dataset = "Xml"; // Assume dataset name is "Xml"
  result = await getXpath(job, dataset, "string(/root/message)");
  result = await getXpath(job, dataset, "string(/root/price)");
  result = await getXpath(job, dataset, "ceiling(/root/price)");
  result = await getXpath(job, dataset, "floor(/root/price)");
  result = await getXpath(job, dataset, "string-length(/root/price)");
  result = await getXpath(job, dataset, "contains(/root/price, '5')");
  result = await getXpath(job, dataset, "starts-with(/root/price, '5')");
  result = await getXpath(job, dataset, "substring-after(/root/price, '5')");
  await job.sendToSingle();
}

async function getXpath(job: Job, dataset: string, xpath: string): Promise<string> {
  let result: string | number | boolean | undefined; // Allow undefined
  try {
    const datasetPath = await job.getDataset(dataset, AccessLevel.ReadOnly);
    const XML = XmlDocument.open(datasetPath);
    const NSmap = XML.getDefaultNSMap();
    const evaluation = XML.evaluate(xpath, NSmap);
    result = String(evaluation); // Ensure result is string for logging
    await job.log(LogLevel.Warning, xpath + " " + result);
  } catch (error: any) {
    // Added type annotation
    result = error.message;
  }
  return result as string; // Return as string
}
```

### 4.14. XmpDocument class

Allows finding info in XMP documents[cite: 419]. Does not allow modifying XMP contents[cite: 419].

### 4.14.1. Query language

Expects backing file conforming to Adobe XMP spec (June 2005)[cite: 420]. Parsed into XMP DOM, queried with XMP location path (subset of XPath 1.0)[cite: 420, 421]. Standard built-in aliases resolved[cite: 422].
**Note:** XMP packet is subset of RDF serialized to XML[cite: 423]. RDF can be serialized variously, so generic XPath 1.0 often fails[cite: 424]. Query functions don't take separate top-level namespace argument; all property names in path must have prefix[cite: 425, 426].

### 4.14.2. Methods

**Note:** All methods might throw exceptions; wrap in try-catch[cite: 427].

```typescript
static open(path: string): XmpDocument;
```

Constructs `XmpDocument` instance from file specified by absolute path[cite: 428]. File should contain only XMP info (not path to PDF/image)[cite: 429].

```typescript
save(path: string): void;
```

Saves XMP packet to file specified by absolute path[cite: 430].

```typescript
evaluate(xmpLocationPath: string, additionalPrefixMap?: { [name: string]: string; }): boolean | number | string | undefined;
```

Evaluates XMP location path against XMP content, returns result[cite: 431, 432]. Returns `undefined` if path doesn't point to leaf property (not present, or array/struct)[cite: 433]. Otherwise returns appropriate type:

- Boolean: if string is "true", "false", "t", "f" (case insensitive)[cite: 434].
- Number: if string is decimal (w/ or w/o point) or rational (e.g., "1.25", "5/4")[cite: 435].
- String: in all other cases[cite: 435].
  Namespace prefixes resolved using `additionalPrefixMap`[cite: 437]. If omitted/empty, default map used (standard XMP namespaces + extra mappings from file)[cite: 438].
  **Note:** Can partly replace legacy `getLocalizedText` using language selectors (e.g., `[@xml:lang="en-US"]`, `[@xml:lang="x-default"]`)[cite: 440, 441].

**Example:** [cite: 442, 443, 444, 445, 446, 447, 448]

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  try {
    const jobPath = await job.get(AccessLevel.ReadOnly);
    // For demonstration purposes, let's assume we'll only get PDF files.
    // We get the PDF document's XMP data, query it for the document title
    // and log the result in the Switch messages.
    let pdfFile = await PdfDocument.open(jobPath); // Added await
    const xmpDocument = pdfFile.getXMP(); // Instance method is sync
    pdfFile.close(); // Instance method is sync

    let result = xmpDocument.evaluate("dc:title/*[1]");
    await job.log(LogLevel.Warning, "XMP query to get the title of job %1 returned: %2", [job.getName(), JSON.stringify(result)]);

    // Additional prefix mappings can be passed easily as well.
    result = xmpDocument.evaluate("custom:field", { custom: "[http://ns.yourdomain.com/custom/1.0](http://ns.yourdomain.com/custom/1.0)" });

    let prefixMap = {
      yourns1: "[http://ns.yourdomain.com/yourns1/1.0/](http://ns.yourdomain.com/yourns1/1.0/)",
      yourns2: "[http://ns.yourdomain.com/yourns2/1.0/](http://ns.yourdomain.com/yourns2/1.0/)",
    };
    result = xmpDocument.evaluate("yourns1:thing/yourns2:field", prefixMap);

    await job.sendToSingle();
  } catch (error: any) {
    // Added type annotation
    await job.fail("Failed to process the job '%1': %2.", [job.getName(), JSON.stringify(error)]);
  }
}
```

### 4.14.3. Standard XMP namespaces

Default prefix map includes mappings for standard XMP namespaces[cite: 449].

| Prefix        | Namespace                                                                          |
| :------------ | :--------------------------------------------------------------------------------- |
| AEScart       | https://www.google.com/search?q=http://ns.adobe.com/aes/cart/                      |
| album         | https://www.google.com/search?q=http://ns.adobe.com/album/1.0/                     |
| asf           | https://www.google.com/search?q=http://ns.adobe.com/asf/1.0/                       |
| aux           | https://www.google.com/search?q=http://ns.adobe.com/exif/1.0/aux/                  |
| bext          | https://www.google.com/search?q=http://ns.adobe.com/bwf/bext/1.0/                  |
| bmsp          | https://www.google.com/search?q=http://ns.adobe.com/StockPhoto/1.0/                |
| creatorAtom   | https://www.google.com/search?q=http://ns.adobe.com/creatorAtom/1.0/               |
| crs           | https://www.google.com/search?q=http://ns.adobe.com/camera-raw-settings/1.0/       |
| dc            | http://purl.org/dc/elements/1.1/                                                   |
| DICOM         | https://www.google.com/search?q=http://ns.adobe.com/DICOM/                         |
| exif          | https://www.google.com/search?q=http://ns.adobe.com/exif/1.0/                      |
| exifEX        | https://www.google.com/search?q=http://cipa.jp/exif/1.0/                           |
| Iptc4xmpCore  | http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/                                        |
| Iptc4xmpExt   | http://iptc.org/std/Iptc4xmpExt/2008-02-29/                                        |
| iX            | https://www.google.com/search?q=http://ns.adobe.com/iX/1.0/                        |
| iXML          | https://www.google.com/search?q=http://ns.adobe.com/ixml/1.0/                      |
| jpeg          | https://www.google.com/search?q=http://ns.adobe.com/jpeg/1.0/                      |
| jp2k          | https://www.google.com/search?q=http://ns.adobe.com/jp2k/1.0/                      |
| pdf           | https://www.google.com/search?q=http://ns.adobe.com/pdf/1.3/                       |
| pdfaExtension | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/extension/             |
| pdfaField     | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/field%23               |
| pdfaid        | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/id/                    |
| pdfaProperty  | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/property%23            |
| pdfaSchema    | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/schema%23              |
| pdfaType      | https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/type%23                |
| pdfx          | https://www.google.com/search?q=http://ns.adobe.com/pdfx/1.3/                      |
| pdfxid        | https://www.google.com/search?q=http://www.npes.org/pdfx/ns/id/                    |
| photoshop     | https://www.google.com/search?q=http://ns.adobe.com/photoshop/1.0/                 |
| plus          | https://www.google.com/search?q=http://ns.useplus.org/ldf/xmp/1.0/                 |
| png           | https://www.google.com/search?q=http://ns.adobe.com/png/1.0/                       |
| rdf           | https://www.google.com/search?q=http://www.w3.org/1999/02/22-rdf-syntax-ns%23      |
| riffinfo      | https://www.google.com/search?q=http://ns.adobe.com/riff/info/                     |
| stDim         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Dimensions%23    |
| stEvt         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ResourceEvent%23 |
| stFnt         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Font%23          |
| stJob         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Job%23           |
| stMfs         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ManifestItem%23  |
| stRef         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ResourceRef%23   |
| stVer         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Version%23       |
| tiff          | https://www.google.com/search?q=http://ns.adobe.com/tiff/1.0/                      |
| wav           | https://www.google.com/search?q=http://ns.adobe.com/xmp/wav/1.0/                   |
| x             | adobe:ns:meta/                                                                     |
| xml           | http://www.w3.org/XML/1998/namespace                                               |
| xmp           | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/                       |
| xmpBJ         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/bj/                    |
| xmpDM         | https://www.google.com/search?q=http://ns.adobe.com/xmp/1.0/DynamicMedia/          |
| xmpG          | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/g/                     |
| xmpGImg       | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/g/img/                 |
| xmpidq        | https://www.google.com/search?q=http://ns.adobe.com/xmp/Identifier/qual/1.0/       |
| xmpMM         | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/mm/                    |
| xmpNote       | https://www.google.com/search?q=http://ns.adobe.com/xmp/note/                      |
| xmpRights     | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/rights/                |
| xmpScript     | https://www.google.com/search?q=http://ns.adobe.com/xmp/1.0/Script/                |
| xmpT          | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/t/                     |
| xmpTPg        | https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/t/pg/                  |

[cite: 450, 451, 452, 454]

### 4.15. Enumerations [cite: 455]

### 4.15.1. AccessLevel

Enumeration defining access rights to job content[cite: 456]. Used with `job::get`[cite: 457].
Allowed values:

- `AccessLevel.ReadOnly` [cite: 457]
- `AccessLevel.ReadWrite` [cite: 457]
  **Note:** Also available globally as `EnfocusSwitch.AccessLevel`[cite: 458].

### 4.15.2. Connection.Level [cite: 459]

Enumeration defining traffic light level of a `Connection`. Used to easily provide levels:

- `Connection.Level.Error` [cite: 460]
- `Connection.Level.Warning` [cite: 460]
- `Connection.Level.Success` [cite: 460]
  **Note:** Also available globally as `EnfocusSwitch.Connection.Level`[cite: 461].
  **Example:** [cite: 462, 463]

<!-- end list -->

```typescript
await job.sendToLog(Connection.Level.Error, DatasetModel.XML, "log_error.xml");
await job.sendToLog(Connection.Level.Warning, DatasetModel.XML, "log_warning.xml");
await job.sendToLog(Connection.Level.Success, DatasetModel.XML, "log_success.xml");

await job.sendToData(Connection.Level.Error, "data_error.txt");
await job.sendToData(Connection.Level.Warning, "data_warning.txt");
await job.sendToData(Connection.Level.Success, "data_success.txt");
```

### 4.15.3. DatasetModel

Enumeration defining metadata data model[cite: 464].
Possible values:

- `DatasetModel.Opaque` [cite: 464]
- `DatasetModel.XML` [cite: 464]
- `DatasetModel.XMP` [cite: 464]
- `DatasetModel.JDF` [cite: 464]
- `DatasetModel.JSON` [cite: 464]
  **Note:** Also available globally as `EnfocusSwitch.DataModel`[cite: 465].

### 4.15.4. LogLevel [cite: 466]

Enumeration representing supported log message levels[cite: 467]. Used with `Job::log` or `FlowElement::log`[cite: 467].
Allowed values:

- `LogLevel.Error` [cite: 468]
- `LogLevel.Warning` [cite: 468]
- `LogLevel.Info` [cite: 468]
- `LogLevel.Debug` [cite: 468]
  **Note:**
- Also available globally as `EnfocusSwitch.LogLevel`[cite: 469].
- Debug messages only displayed if 'Log debug messages' preference enabled[cite: 469].

### 4.15.5. PropertyType [cite: 470]

Enumeration defining property value type[cite: 471].
Possible values:

- `PropertyType.Literal` [cite: 471]
- `PropertyType.Number` [cite: 471]
- `PropertyType.Date` [cite: 471]
- `PropertyType.HoursAndMinutes` [cite: 471]
- `PropertyType.Boolean` [cite: 471]
- `PropertyType.String` [cite: 471]
- `PropertyType.FilePath` [cite: 471]
- `PropertyType.FolderPath` [cite: 471]
- `PropertyType.FileType` [cite: 471]
- `PropertyType.FolderPattern` [cite: 471]
- `PropertyType.Regex` [cite: 471]
- `PropertyType.OAuthToken` [cite: 471]
  **Note:** Also available globally as `EnfocusSwitch.PropertyType`[cite: 472].

**Editors:** Property value type depends on editor used[cite: 473]. Correspondence:

| PropertyType    | Editor                                                                                                                  |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Literal         | Literal                                                                                                                 |
| Number          | Inline editor: Number                                                                                                   |
| Date            | Inline editor: Date (YYYY-MM-DD), Inline editor: Date and time (YYYY-MM-DDTHH:MM:SS) (Both supported by `Date.parse()`) |
| HoursAndMinutes | Inline editor: Hours and minutes (HH:MM)                                                                                |
| Boolean         | Inline editor: No/Yes list, Condition with variables                                                                    |
| FilePath        | Choose file                                                                                                             |
| FolderPath      | Choose folder                                                                                                           |
| FileType        | File type, File types, File patterns                                                                                    |
| FolderPattern   | Folder patterns                                                                                                         |
| Regex           | Regular expression                                                                                                      |
| OAuthToken      | OAuth 2.0 authorization                                                                                                 |
| String          | Everything else                                                                                                         |

[cite: 474, 475, 477]

**Remarks:**

- If Inline editor: String used, but Choose file/folder allowed, type is `FilePath`/`FolderPath`[cite: 478].
- Literal editor with name `None` returns empty string ("")[cite: 479]. Other literal names return the name string[cite: 480].
- `PropertyType.Number` is integer (no editor produces floats)[cite: 482].

### 4.15.6. Scope [cite: 483]

Enumeration representing scope for global data[cite: 483]. Used with `Switch::getGlobalData`, `setGlobalData`, `removeGlobalData`[cite: 484].
Possible values:

- `Scope.FlowElement`: Data for this specific element instance[cite: 485]. Other instances cannot access[cite: 485].
- `Scope.FlowElements`: Data for all instances of this element type _in the same flow_[cite: 487]. Other element types cannot access[cite: 487].
- `Scope.Element`: Data for all instances of this element type _in all flows_[cite: 488]. Other element types cannot access[cite: 488].
- `Scope.Flow`: Data for all instances of all elements _in the same flow_[cite: 489]. Instances in other flows cannot access[cite: 489].
- `Scope.Global`: Data in global space; any element instance using any script can access[cite: 490].
  **Note:** Strongly advised to use `Element` or `FlowElement` scope where possible[cite: 491]. If using `Global`, programmer must ensure distinct tag names to prevent clashes[cite: 491].
  **Note:** Also available globally as `EnfocusSwitch.Scope`[cite: 492].

**Overview:** [cite: 493, 494]

| Scope              | Element types/instances | Flows     |
| :----------------- | :---------------------- | :-------- |
| Scope.Global       | All                     | All       |
| Scope.Flow         | All                     | Same flow |
| Scope.Element      | Same element type       | All       |
| Scope.FlowElements | Same element type       | Same flow |
| Scope.FlowElement  | Same instance only      | --        |

### 4.15.7. EnfocusSwitchPrivateDataTag [cite: 495]

Enumeration defining private data tags reserved for Switch built-in elements, readable by scripts[cite: 496]. See Private data used by built-in elements for details[cite: 496].
Possible values:

- `EnfocusSwitchPrivateDataTag.emailAddresses` [cite: 496]
- `EnfocusSwitchPrivateDataTag.emailBody` [cite: 496]
- `EnfocusSwitchPrivateDataTag.hierarchy` [cite: 496]
- `EnfocusSwitchPrivateDataTag.origin` [cite: 496]
- `EnfocusSwitchPrivateDataTag.userEmail` [cite: 496]
- `EnfocusSwitchPrivateDataTag.userFullName` [cite: 496]
- `EnfocusSwitchPrivateDataTag.userName` [cite: 496]
- `EnfocusSwitchPrivateDataTag.initiated` [cite: 496]
- `EnfocusSwitchPrivateDataTag.submittedTo` [cite: 496]
- `EnfocusSwitchPrivateDataTag.state` [cite: 496]

### 4.15.8. ImageDocument.ColorMode [cite: 497]

Enumeration defining metadata data model for image color mode.
Allowed values:

- `ImageDocument.ColorMode.Bitmap` [cite: 497]
- `ImageDocument.ColorMode.Gray` [cite: 497]
- `ImageDocument.ColorMode.IndexedColor` [cite: 497]
- `ImageDocument.ColorMode.RGB` [cite: 497]
- `ImageDocument.ColorMode.CMYK` [cite: 497]
- `ImageDocument.ColorMode.Multichannel` [cite: 497]
- `ImageDocument.ColorMode.Duotone` [cite: 497]
- `ImageDocument.ColorMode.LabColor` [cite: 497]
- `ImageDocument.ColorMode.Unknown` [cite: 497]

### 4.15.9. ImageDocument.ColorSpace [cite: 498]

Enumeration defining metadata data model for image color space.
Allowed values:

- `SRGB` = 'sRGB' [cite: 499]
- `Uncalibrated` = 'uncalibrated' [cite: 499]

### 4.15.10. HttpRequest.Method

Enumeration defining possible values for HTTP method to subscribe on[cite: 500].
Used values:

- `HttpRequest.Method.POST` [cite: 500]
- `HttpRequest.Method.PUT` [cite: 500]
- `HttpRequest.Method.DELETE` [cite: 500]
  **Note:** Also available globally as `EnfocusSwitch.HttpRequest.Method`[cite: 500].

### 4.15.11. Priority [cite: 501]

Enumeration defining job priority[cite: 502]. See Job priority on page 99[cite: 502].
Possible values:

- `Low` = -100000 [cite: 502]
- `BelowNormal` = -10000 [cite: 502]
- `Normal` = 0 [cite: 502]
- `AboveNormal` = 10000 [cite: 502]
- `High` = 100000 [cite: 502]
  **Note:** Predefined values, but any number can be used for job priority[cite: 503].
  **Example:** [cite: 503]

<!-- end list -->

```typescript
Myjob.setPriority(Priority.High);
```
