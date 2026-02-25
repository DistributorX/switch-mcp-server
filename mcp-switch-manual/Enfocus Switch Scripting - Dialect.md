# Enfocus Switch Scripting - Dialect

Enfocus Switch uses TypeScript but has some dialectical additions and practices that should be used when writing scripts for Enfocus Switch.

This document is being built over time to provide a reference for coding agents.

## Transpiling

**What:** Switch transpiler for TypeScript to Javascript.

**Why:** Switch provides its own transpiler for TypeScript and does not use standard compiliers like `tsc`

**Usage:**
To compile `main.ts` to `main.js` in the current working directory.

```bash
SwitchScriptTool --transpile .
```

Note: Debug messages will display if transpiling fails.

## Imports Types

In Switch, you never need to import: `import type { Switch, FlowElement, Job } from 'switch-scripting';` or use `export` before a Switch function like, for example, `jobArrived()`

This is because this is handled implicitly by the scripting environment. Entry point functions like jobArrived don't need export because Switch expects them in the global scope, not as module exports.

--

## LogLevel Enum

**What:** An enumeration for specifying log message severity levels.

**Why:** Switch provides its own logging system that integrates with the Switch Server dashboard and job history. Standard `console.log` does not appear in the Switch UI.

**Usage:**
Available values: `LogLevel.Debug`, `LogLevel.Info`, `LogLevel.Warning`, `LogLevel.Error`

```typescript
await job.log(LogLevel.Info, 'Processing started');
await flowElement.log(LogLevel.Warning, 'Configuration missing');
```

Note: Debug messages only display if "Log debug messages" is enabled in Switch preferences.

--

## Job and FlowElement Logging

**What:** `job.log()` and `flowElement.log()` methods for writing messages to Switch logs with placeholder substitution.

**Why:** Switch logging integrates with the job history and dashboard. Messages support `%1`, `%2`, etc. placeholders that are replaced with values from an array parameter, avoiding string concatenation.

**Usage:**

```typescript
// Job-scoped logging (appears in job history)
await job.log(LogLevel.Info, 'Processing file: %1', [job.getName()]);
await job.log(LogLevel.Debug, 'Dimensions: %1 x %2', [width.toString(), height.toString()]);

// FlowElement-scoped logging (appears in element log)
await flowElement.log(LogLevel.Warning, 'Limit reached: %1 of %2', [current, max]);
```

--

## FlowElement Property Access

**What:** `flowElement.getPropertyStringValue()` retrieves configuration values defined in the script element's XML declaration.

**Why:** Switch scripts are configured via properties defined in the element's XML file and set by users in Switch Designer. This method provides access to those values at runtime, keeping configuration separate from code.

**Usage:**

```typescript
const clientId = await flowElement.getPropertyStringValue("AdobeClientId") as string;
const maxRetries = parseInt(await flowElement.getPropertyStringValue("MaxRetries") as string);
```

Properties are defined in the script's XML declaration and always return strings (cast or parse as needed).

--

## FlowElement Temporary Paths

**What:** `flowElement.createPathWithName()` creates a temporary folder path managed by Switch.

**Why:** Switch manages temporary storage and cleanup. When the second parameter is `true`, the folder is created immediately and automatically cleaned up when the script executor is discarded. This avoids manual temp folder management and prevents orphaned files.

**Usage:**

```typescript
// Create a managed temp folder (auto-cleaned by Switch)
const tempFolder = await flowElement.createPathWithName('workdir', true);

// Use for intermediate files
const tempFile = path.join(tempFolder, 'output.pdf');
```

--

## Creating Child Jobs

**What:** `job.createChild()` creates a new job from a file path, inheriting the parent job's properties (ticket, datasets, private data).

**Why:** In Switch workflows, you often need to produce new output files from an incoming job. Child jobs maintain lineage and inherit metadata, which is essential for job tracking and downstream processing.

**Usage:**

```typescript
// Create a child job from a file
const childJob = await job.createChild('/path/to/output.pdf');

// Child inherits parent's datasets, ticket, and private data
await childJob.sendToSingle();
```

Note: The file passed to `createChild` is not automatically deleted by Switch; you must clean it up manually after the job is sent.

--

## Job Datasets

**What:** `job.createDataset()` attaches metadata files (JSON, XML, etc.) to a job for use by downstream flow elements.

**Why:** Switch uses datasets to carry structured metadata alongside job files. This enables downstream elements to access information (like image dimensions or order details) without parsing the job file itself.

**Usage:**

```typescript
// Write metadata to a temp file
const metadataPath = path.join(tempFolder, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));

// Attach as a dataset
await job.createDataset("MyMetadata", metadataPath, DatasetModel.JSON);

// Important: clean up the temp file after sending the job
await job.sendToSingle();
fs.unlinkSync(metadataPath);
```

Supported models: `DatasetModel.JSON`, `DatasetModel.XML`, `DatasetModel.XMP`, `DatasetModel.JDF`, `DatasetModel.Opaque`

Note: Files passed to `createDataset` are NOT automatically cleaned up by Switch.

--

## jobArrived Entry Point

**What:** The primary entry point function that Switch calls when a new job arrives in the flow element's input folder.

**Why:** Switch scripts do not use a `main()` function or module exports. Instead, Switch automatically invokes `jobArrived` for each incoming job. This function must be declared in the global scope (no `export` keyword) and receives the Switch context, flow element, and job as parameters.

**Usage:**

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
  // Process the job
  const jobPath = await job.get(AccessLevel.ReadWrite);
  // ... do work ...
  await job.sendToSingle();
}
```

Note: A script must have at least `jobArrived` or `timerFired` defined. The function signature and parameter types are provided by the Switch scripting environment.

--

## AccessLevel Enum

**What:** An enumeration that specifies read or read-write access when retrieving job content or datasets.

**Why:** Switch manages job files in its internal storage. When accessing job content via `job.get()` or `job.getDataset()`, you must specify whether you intend to read only or also modify the content. This allows Switch to detect modifications and automatically update the job when routed.

**Usage:**
Available values:

- `AccessLevel.ReadOnly` - Read content without modification (any changes cause an error)
- `AccessLevel.ReadWrite` - Read and modify content (changes are automatically uploaded when job is routed)

```typescript
// Read-only access
const jobPath = await job.get(AccessLevel.ReadOnly);

// Read-write access (modifications will be saved)
const jobPath = await job.get(AccessLevel.ReadWrite);
```

--

## Job Content Access (job.get)

**What:** `job.get(accessLevel)` returns the file system path to the job's content (file or folder).

**Why:** Jobs in Switch are managed internally and not directly accessible. This method provides a path to read or modify the job content. When using `AccessLevel.ReadWrite`, any modifications are automatically detected and uploaded when the job is routed via `sendTo` methods.

**Usage:**

```typescript
// Read-only: inspect job content
const jobPath = await job.get(AccessLevel.ReadOnly);
const content = fs.readFileSync(jobPath, 'utf8');

// Read-write: modify job content
const jobPath = await job.get(AccessLevel.ReadWrite);
fs.writeFileSync(jobPath, modifiedContent);
await job.sendToSingle(); // modifications automatically saved
```

Note: If you modify content after requesting `AccessLevel.ReadOnly`, an error is thrown when routing the job.

--

## Job Private Data

**What:** `job.getPrivateData(tag)` and `job.setPrivateData(tag, value)` store and retrieve key-value metadata attached to a job.

**Why:** Private data allows scripts to pass information between flow elements without modifying the job file itself. Unlike datasets, private data is simple key-value storage that persists with the job through the workflow. Child jobs inherit their parent's private data.

**Usage:**

```typescript
// Get a single private data value (returns empty string if not set)
const orderId = await job.getPrivateData("numOrderID");

// Set private data (value can be string, number, boolean, object, array, Date, or null)
await job.setPrivateData("calendarPrintSize", "A3");
await job.setPrivateData("processedAt", new Date());

// Set multiple values at once
await job.setPrivateData([
  { tag: "status", value: "processed" },
  { tag: "count", value: 5 }
]);
```

Note: Use a company prefix for custom tags (e.g., `MyCompany.orderId`) to avoid conflicts with other scripts or Switch's reserved tags.

--

## Reading Job Datasets (job.getDataset)

**What:** `job.getDataset(name, accessLevel)` retrieves the file path to a metadata dataset attached to the job.

**Why:** Datasets are structured metadata files (XML, JSON, etc.) that accompany a job through the workflow. Unlike private data, datasets are full files that can be queried using XPath or JSONPath in Switch variables. This method provides file system access to read or modify dataset content.

**Usage:**

```typescript
// Read-only access to a dataset
const datasetPath = await job.getDataset("AmazonFullOrderXML", AccessLevel.ReadOnly);
const xml = XmlDocument.open(datasetPath);

// Read-write access (modifications saved when job is routed)
const jsonPath = await job.getDataset("OrderData", AccessLevel.ReadWrite);
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
data.processed = true;
fs.writeFileSync(jsonPath, JSON.stringify(data));
await job.sendToSingle();
```

Note: Throws an error if the dataset does not exist. Use `job.listDatasets()` to check available datasets.

--

## XmlDocument Class

**What:** A Switch-provided class for parsing and querying XML documents using XPath 1.0.

**Why:** Switch provides a built-in XML parser optimized for its scripting environment. While you could use third-party XML libraries, `XmlDocument` integrates seamlessly with Switch's dataset system and requires no npm dependencies.

**Usage:**

```typescript
// Open from file path
const xml = XmlDocument.open(datasetPath);

// Or parse from string
const xml = XmlDocument.parse(xmlString);

// Query using XPath (returns boolean, number, string, or undefined)
const itemCount = xml.evaluate("count(//OrderItem)");
const orderId = xml.evaluate("string(/Order/@id)");

// Handle namespaces with prefix map
const nsMap = xml.getDefaultNSMap();
const value = xml.evaluate("string(/ns:root/ns:element)", nsMap);
```

Note: `XmlDocument` is read-only and cannot modify XML content. For modifications, use standard Node.js XML libraries.

--

## Failing a Job (job.fail)

**What:** `job.fail(message, params?)` terminates job processing and moves the job to the Problem Jobs folder with an error message.

**Why:** When a job cannot be processed (missing files, invalid data, etc.), calling `job.fail()` properly reports the error in Switch's UI and moves the job out of the workflow for manual intervention. This is the standard way to handle unrecoverable errors.

**Usage:**

```typescript
// Simple failure message
job.fail("Required template not found");

// With placeholder substitution (uses %1, %2, etc.)
job.fail("Error: Job '%1', ASIN missing in JSON.", [job.getName()]);

// Typical error handling pattern
try {
  // ... processing logic ...
} catch (e: any) {
  job.fail("Failed to process job '%1': %2", [job.getName(), e.message]);
}
```

Note: After calling `fail()`, no further operations should be performed on the job. The job is moved to Problem Jobs and removed from the input folder.

--

## Job Routing Methods

**What:** Methods for sending jobs to output connections or discarding them: `sendToSingle()`, `sendToNull()`, `sendToData()`, `sendTo()`.

**Why:** Switch requires explicit routing of every job. Unlike standard file processing, jobs must be explicitly sent to an output connection or discarded. Failing to route a job causes it to remain stuck in the element.

**Usage:**

```typescript
// Send to the single outgoing connection
await job.sendToSingle();

// Send with a new name
await job.sendToSingle('renamed-output.pdf');

// Discard the job (e.g., after creating child jobs)
await job.sendToNull();

// Send to data connection with level
await job.sendToData(Connection.Level.Success);
```

After calling any `sendTo` method, you cannot modify the job (except calling `sendTo` again for unmodified jobs or `fail()`).

--

## DatasetModel Enum

**What:** An enumeration specifying the type/format of a dataset attachment.

**Why:** Switch needs to know the data model to properly handle and expose datasets to downstream elements and variables. Different models enable different query capabilities (e.g., XPath for XML, JSONPath for JSON).

**Usage:**
Available values:

- `DatasetModel.JSON` - JSON files
- `DatasetModel.XML` - Generic XML files
- `DatasetModel.XMP` - Adobe XMP metadata
- `DatasetModel.JDF` - Job Definition Format
- `DatasetModel.Opaque` - Binary/unknown format (no query support)

```typescript
await job.createDataset("OrderData", jsonPath, DatasetModel.JSON);
await job.createDataset("PrintSpec", xmlPath, DatasetModel.XML);
```

--

## flowStartTriggered Entry Point

**What:** An entry point function that Switch calls once when a flow is activated, before any jobs are processed.

**Why:** Standard TypeScript/Node.js applications use `main()` or module initialization. Switch uses `flowStartTriggered` to perform one-time setup tasks when a flow starts, such as spawning background processes, initializing connections, or subscribing to channels. This runs before any `jobArrived` or `timerFired` calls.

**Usage:**

```typescript
async function flowStartTriggered(s: Switch, flowElement: FlowElement) {
  // One-time initialization when flow starts
  await flowElement.log(LogLevel.Info, 'Flow starting, initializing resources...');

  // Example: spawn a background process, open connections, etc.
}
```

Note: May run in parallel for concurrent elements of the same type. Use `Switch.getGlobalData` with `lock=true` to synchronize if needed. Not available for debugging.

--

## flowStopTriggered Entry Point

**What:** An entry point function that Switch calls when a flow is deactivated, after all other entry points have stopped.

**Why:** Standard TypeScript/Node.js applications handle shutdown via process signals or explicit calls. Switch uses `flowStopTriggered` to perform cleanup when a flow stops, such as terminating background processes, closing connections, or releasing resources. This runs after all `jobArrived` and `timerFired` calls have completed.

**Usage:**

```typescript
async function flowStopTriggered(s: Switch, flowElement: FlowElement) {
  // Cleanup when flow stops
  await flowElement.log(LogLevel.Info, 'Flow stopping, cleaning up...');

  // Example: kill background processes, close connections
  const pid = await getServerProcessId();
  await killProcess(pid);
}
```

Note: Runs after 'Release acquired slots' timeout has finished. May run in parallel for concurrent elements; use `Switch.getGlobalData` with `lock=true` to synchronize. Not available for debugging.

--

## FlowElement Plugin Resources Path

**What:** `flowElement.getPluginResourcesPath()` returns the file system path to the script's resources folder.

**Why:** Switch scripts may need to access bundled resources (templates, configuration files, external scripts). This method provides a reliable path that works both during development (pointing to the script folder) and in production (pointing to the resources folder inside the `.sscript` package).

**Usage:**

```typescript
const scriptFolder = flowElement.getPluginResourcesPath();
await flowElement.log(LogLevel.Debug, `Script resources at: ${scriptFolder}`);

// Access bundled resources
const templatePath = path.join(scriptFolder, 'templates', 'default.xml');
const configPath = path.join(scriptFolder, 'config.json');

// In dev: points to the folder where the script package is located
// In production: points to resources folder inside .sscript package
```

Note: Primarily intended for scripted plug-ins. For regular script packages, it returns the script package folder location, which is useful for accessing bundled dependencies or configuration files.

--

## Job Name and ID (job.getName, job.getId)

**What:** `job.getName()` returns the job's filename (without the internal job ID prefix), and `job.getId()` returns the unique job identifier.

**Why:** Switch internally prefixes job filenames with a unique ID (e.g., `_0G63D_myjob.txt`). These methods provide clean access to the job name and ID separately, which is useful for logging, renaming outputs, and tracking jobs through workflows.

**Usage:**

```typescript
// Get the job name (with extension by default)
const fileName = job.getName(); // e.g., "order_12345.pdf"

// Get the job name without extension
const baseName = job.getName(false); // e.g., "order_12345"

// Get the unique job ID
const jobId = job.getId(); // e.g., "0G63D"

// Common pattern: logging and renaming
await job.log(LogLevel.Info, "Processing job: %1", [job.getName()]);
await job.sendToSingle("processed_" + job.getName());
```

Note: The job ID format may change between Switch versions; do not rely on its specific syntax.

--

## Job Type Checking (job.isFile, job.isFolder)

**What:** `job.isFile()` returns true if the job is a single file; `job.isFolder()` returns true if the job is a folder.

**Why:** Switch jobs can be either files or folders. These methods allow scripts to handle each type appropriately, since file and folder operations often differ (e.g., reading content vs. iterating directory contents).

**Usage:**

```typescript
const jobPath = await job.get(AccessLevel.ReadOnly);

if (job.isFile()) {
  // Handle single file
  const content = fs.readFileSync(jobPath, 'utf8');
} else if (job.isFolder()) {
  // Handle folder job
  const files = fs.readdirSync(jobPath);
  for (const file of files) {
    // Process each file in the folder
  }
}
```

--

## FlowElement Outgoing Connections

**What:** `flowElement.getOutConnections()` returns an array of `Connection` instances representing the outgoing connections for the flow element.

**Why:** Switch flow elements can have multiple named outgoing connections (e.g., "success", "error", "process"). This method allows scripts to route jobs to specific connections based on processing logic, rather than using a single output.

**Usage:**

```typescript
const outConnections = flowElement.getOutConnections();

// Find a specific named connection
const processConnection = outConnections.find(conn => conn.getName() === "process");
const errorConnection = outConnections.find(conn => conn.getName() === "error");

if (processConnection) {
  await job.sendTo(processConnection);
}
```

Note: Returns an empty array if there are no outgoing connections. The list order is arbitrary.

--

## Connection Class and getName

**What:** `Connection` instances represent outgoing connections from a flow element. `connection.getName()` returns the name assigned to the connection in Switch Designer.

**Why:** When routing jobs to specific outputs, you need to identify connections by their configured names. Connection names are set in Switch Designer and allow scripts to make routing decisions programmatically.

**Usage:**

```typescript
const outConnections = flowElement.getOutConnections();

for (const connection of outConnections) {
  const name = connection.getName();
  await flowElement.log(LogLevel.Info, "Connection found: %1", [name]);

  if (name === "approved") {
    await job.sendTo(connection);
  }
}
```

Note: Returns the name of the destination folder if the connection name is empty.

--

## Sending to Named Connections (job.sendTo)

**What:** `job.sendTo(connection, newName?)` sends the job to a specific outgoing connection, with an optional new filename.

**Why:** Unlike `sendToSingle()` which requires exactly one outgoing connection, `sendTo()` allows routing to any of multiple named connections. This enables branching logic where different jobs are sent to different outputs based on processing results.

**Usage:**

```typescript
const outConnections = flowElement.getOutConnections();
const processConnection = outConnections.find(conn => conn.getName() === "process");
const excludeConnection = outConnections.find(conn => conn.getName() === "exclude");

// Send to specific connection
if (shouldProcess) {
  await job.sendTo(processConnection);
} else {
  await job.sendTo(excludeConnection, "excluded_" + job.getName());
}

// Common pattern: create child jobs, send to different connections, discard original
const childJob = await job.createChild(outputPath);
await childJob.sendTo(processConnection, job.getName());
await job.sendToNull();
```

Note: The script must be configured to use 'move' connections in the element XML. After calling `sendTo()`, you cannot modify the job further.

--

## timerFired Entry Point

**What:** An entry point function that Switch calls at regular intervals, regardless of job arrivals.

**Why:** Standard TypeScript/Node.js uses `setInterval` or cron jobs for periodic tasks. Switch provides `timerFired` for timer-based processing such as batching jobs, polling external services, or releasing held jobs after a timeout. Unlike `jobArrived`, it runs on a schedule rather than in response to incoming jobs.

**Usage:**

```typescript
async function timerFired(s: Switch, flowElement: FlowElement): Promise<void> {
  // Called immediately after flow activation, then every 300 seconds (default)
  const jobs = await flowElement.getJobs(jobIds);
  for (const job of jobs) {
    await job.sendToSingle();
  }
}
```

Note: The default interval is 300 seconds (5 minutes). Use `flowElement.setTimerInterval()` to change it. A script must have at least `jobArrived` or `timerFired` defined. Properties containing variables or script expressions throw exceptions when accessed in `timerFired`.

--

## Scope Enum and Global Data

**What:** `Scope` enum with `s.getGlobalData()` and `s.setGlobalData()` for persisting data across entry point invocations and flow elements.

**Why:** Standard TypeScript/Node.js uses module-level variables or external storage for persistence. Switch scripts run in isolated contexts where local variables are lost between invocations. Global data provides Switch-managed persistence with different scopes for sharing data between invocations, elements, or flows.

**Usage:**

```typescript
// Scope options:
// - Scope.FlowElement: Data for this specific element instance only
// - Scope.FlowElements: Data shared by all instances of this element type in the same flow
// - Scope.Element: Data shared by all instances of this element type across all flows
// - Scope.Global: Data shared across all elements and flows

// Get global data (returns empty string if not set)
const jobsInfo = (await s.getGlobalData(Scope.FlowElement, "jobsInfo")) || {};

// Set global data (value can be string, number, boolean, object, Array, Date, or null)
await s.setGlobalData(Scope.FlowElement, "jobsInfo", jobsInfo);

// With locking for synchronization (lock released when setGlobalData is called)
const data = await s.getGlobalData(Scope.Global, "counter", true); // lock=true
await s.setGlobalData(Scope.Global, "counter", data + 1); // releases lock

// Remove global data
await s.removeGlobalData(Scope.FlowElement, "jobsInfo");
```

Note: Use a company namespace prefix for Global scope tags (e.g., `MyCompany.counter`) to avoid conflicts. Date values are returned as strings and must be parsed. Maximum 100 fields per scope; combine into one object if more are needed.

--

## FlowElement Timer Interval (setTimerInterval)

**What:** `flowElement.setTimerInterval(seconds)` sets the interval between `timerFired` invocations.

**Why:** The default `timerFired` interval is 300 seconds (5 minutes). This method allows scripts to dynamically adjust the polling frequency based on workload or requirements, enabling faster response times or reducing server load.

**Usage:**

```typescript
async function timerFired(s: Switch, flowElement: FlowElement): Promise<void> {
  // Set interval to 30 seconds
  flowElement.setTimerInterval(30);

  // Process jobs...
}
```

Note: Can only be called from the `timerFired` entry point. The actual interval may be longer than specified depending on system load. Switch guarantees only that the time between invocations will not be less than the specified seconds.

--

## FlowElement Get Jobs (getJobs)

**What:** `flowElement.getJobs(ids)` retrieves multiple Job instances from the input folder by their IDs.

**Why:** Switch only allows one `getJobs` call per entry point invocation. When processing multiple jobs (e.g., for batching), you must collect job IDs first, then retrieve all jobs in a single call. This is essential for `timerFired` batch processing where no job is passed as a parameter.

**Usage:**

```typescript
async function jobArrived(s: Switch, flowElement: FlowElement, job: Job): Promise<void> {
  // Track job IDs in global data
  const jobsInfo = (await s.getGlobalData(Scope.FlowElement, "jobsInfo")) || {};
  jobsInfo[job.getId()] = Date.now();
  await s.setGlobalData(Scope.FlowElement, "jobsInfo", jobsInfo);
}

async function timerFired(s: Switch, flowElement: FlowElement): Promise<void> {
  const jobsInfo = (await s.getGlobalData(Scope.FlowElement, "jobsInfo")) || {};
  const jobIds = Object.keys(jobsInfo);

  if (jobIds.length > 0) {
    // Retrieve all jobs in one call (max 10000 jobs)
    const jobs = await flowElement.getJobs(jobIds);
    for (const job of jobs) {
      await job.sendToSingle();
    }
  }
}
```

Note: Returns a maximum of 10000 jobs. If more jobs exist, split into multiple batches. Only one `getJobs` call is allowed per entry point invocation.

--

## FlowElement Create Job (createJob)

**What:** `flowElement.createJob(path)` creates a new job from an existing file or folder path without a parent job.

**Why:** Unlike `job.createChild()` which inherits from a parent job, `createJob` produces independent jobs. This is essential in `timerFired` where no incoming job exists, or when injecting external files into a workflow. The created job has default values and must be routed separately.

**Usage:**

```typescript
async function timerFired(s: Switch, flowElement: FlowElement): Promise<void> {
  // Create a job from an external file or assembled folder
  const newJob = await flowElement.createJob('/path/to/file.pdf');
  await newJob.sendToSingle('output-name.pdf');

  // Clean up the source file (not done automatically)
  await fs.unlink('/path/to/file.pdf');
}
```

Note: Valid only in `jobArrived`, `timerFired`, and `httpRequestTriggeredAsync` entry points. The source file/folder is NOT automatically cleaned up by Switch; you must delete it manually after routing the job. If the new job should inherit parent properties, use `job.createChild()` instead.

--

## validateProperties Entry Point

**What:** An entry point function that Switch calls to perform custom validation on script properties.

**Why:** Standard TypeScript validation happens at compile time. Switch uses `validateProperties` for runtime validation of property values configured in Switch Designer. This allows scripts to enforce business rules (e.g., valid email formats, file existence, value ranges) before the flow activates or jobs are processed.

**Usage:**

```typescript
async function validateProperties(
  s: Switch,
  flowElement: FlowElement,
  tags: string[]
): Promise<{ tag: string; valid: boolean }[]> {
  let validProperties: { tag: string; valid: boolean }[] = [];

  for (const tag of tags) {
    if (tag === "emailForNotifications") {
      const email = (await flowElement.getPropertyStringValue(tag)) as string;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      validProperties.push({
        tag: tag,
        valid: emailRegex.test(email),
      });
    } else {
      validProperties.push({ tag: tag, valid: true });
    }
  }
  return validProperties;
}
```

Note: Invoked when a property value changes, when the flow is activated, or before `jobArrived`. The `tags` array contains only properties with "Custom" validation set in the XML declaration. The returned array must include all input tags; a missing tag is treated as invalid. Not available for debugging.

--

## Connection.Level Enum

**What:** An enumeration for specifying traffic light connection levels when routing jobs.

**Why:** Switch supports "traffic light" connections that route jobs to different outputs based on success, warning, or error states. This enum provides the levels used with `sendToData()` and `sendToLog()` methods, enabling conditional routing based on processing outcomes.

**Usage:**
Available values:

- `Connection.Level.Success` - Route to success connections
- `Connection.Level.Warning` - Route to warning connections
- `Connection.Level.Error` - Route to error connections

```typescript
// Route job to success output
await job.sendToData(Connection.Level.Success);

// Route job to error output with new name
await job.sendToData(Connection.Level.Error, "failed_" + job.getName());

// Route log file to warning output
await reportJob.sendToLog(Connection.Level.Warning, DatasetModel.XML);
```

Note: Requires the script element to be configured for traffic light connections in the XML declaration. If no outgoing connections of the specified level exist, the job is discarded with a warning. Also available globally as `EnfocusSwitch.Connection.Level`.

--

## FlowElement Temporary File Paths (for Datasets)

**What:** `flowElement.createPathWithName(filename)` with a single argument creates a temporary file path (not folder) managed by Switch.

**Why:** When creating datasets to attach to jobs, you need a temporary file path to write the data before calling `job.createDataset()`. Using `createPathWithName` with just a filename generates a unique temporary path that Switch can manage, avoiding manual temp directory handling.

**Usage:**

```typescript
// Create a temporary file path for a dataset
const datasetPath = await flowElement.createPathWithName("job-data.json");

// Write data to the temporary file
const jsonString = JSON.stringify(data, null, 2);
await fs.promises.writeFile(datasetPath, jsonString, "utf-8");

// Attach as dataset to the job
await job.createDataset("MyDataset", datasetPath, DatasetModel.JSON);

// Send the job (dataset file is managed by Switch after this)
await job.sendToSingle();
```

Note: This differs from `createPathWithName(name, true)` which creates a folder. Without the second parameter, it returns a file path only (the file is not created automatically). The file must be written before attaching as a dataset.

--

## PdfDocument Class

**What:** A Switch-provided class for retrieving PDF document information without external libraries.

**Why:** Switch provides a built-in PDF parser optimized for its scripting environment. While you could use third-party PDF libraries like `pdf-lib` or `pdfjs-dist`, `PdfDocument` is always available in Switch without npm dependencies and provides direct access to PDF metadata and page information.

**Usage:**

```typescript
let pdfDoc: PdfDocument | null = null;
try {
  // Open PDF file (static method)
  pdfDoc = PdfDocument.open(jobPath);

  // Get document properties
  const numPages = pdfDoc.getNumberOfPages();
  const version = pdfDoc.getPDFVersion();
  const security = pdfDoc.getSecurityMethod();

  // Get XMP metadata
  const xmpDoc = pdfDoc.getXMP();

  // Access individual pages
  const page = pdfDoc.getPage(1); // 1-based index

  // Close when done (important for resource cleanup)
  pdfDoc.close();
  pdfDoc = null;
} catch (err: any) {
  job.fail("PDF error: %1", [err.message]);
  if (pdfDoc) pdfDoc.close();
}

// Static convenience methods (for single queries)
const pageCount = await PdfDocument.getNumberOfPages(jobPath);
const pdfVersion = await PdfDocument.getPDFVersion(jobPath);
```

Note: `PdfDocument` is read-only and cannot modify PDF content. For modifications, use external PDF libraries. Always wrap in try-catch as methods may throw exceptions. Close the document when finished to release resources.

--

## PdfPage Class

**What:** A Switch-provided class for retrieving information about individual PDF pages.

**Why:** When analysing PDF page properties (dimensions, rotation, page boxes), Switch provides direct access through `PdfPage` instances obtained from `PdfDocument.getPage()`. This avoids the complexity of parsing PDF structures manually or depending on external libraries.

**Usage:**

```typescript
const pdfDoc = PdfDocument.open(jobPath);
const page = pdfDoc.getPage(1); // 1-based page index

// Page dimensions and rotation
const rotation = page.getRotation(); // 0, 90, 180, or 270 degrees
const scaling = page.getScaling();

// Page boxes (dimensions in points; pass false to ignore rotation)
const mediaWidth = page.getMediaBoxWidth(false);
const mediaHeight = page.getMediaBoxHeight(false);
const trimWidth = page.getTrimBoxWidth(false);
const trimHeight = page.getTrimBoxHeight(false);
const cropWidth = page.getCropBoxWidth(false);
const cropHeight = page.getCropBoxHeight(false);
const bleedWidth = page.getBleedBoxWidth(false);
const bleedHeight = page.getBleedBoxHeight(false);
const artWidth = page.getArtBoxWidth(false);
const artHeight = page.getArtBoxHeight(false);

// Page label (if defined in PDF)
const label = page.getPageLabel(); // Empty string if not set

pdfDoc.close();
```

Note: Page indices are 1-based. Box dimensions are returned in points (1 point = 1/72 inch). Pass `false` to dimension methods to get the original box size ignoring rotation; pass `true` (or omit) to get dimensions with rotation applied.

--

## FlowElement Fail Process (failProcess)

**What:** `flowElement.failProcess(message, messageParam?)` logs a fatal error and puts the flow element into a "problem process" state.

**Why:** Unlike `job.fail()` which handles errors for individual jobs, `failProcess` is used when the entire flow element cannot function correctly (e.g., missing configuration, inaccessible resources). This is particularly useful in `timerFired` where there is no job to fail, or when an error affects the element's ability to process any jobs.

**Usage:**

```typescript
// Simple error message
flowElement.failProcess("Configuration file not found");

// With placeholder substitution (%1)
flowElement.failProcess("Could not read the contents of the folder %1", folderPath);

// Typical pattern in timerFired
async function timerFired(s: Switch, flowElement: FlowElement) {
  try {
    const files = fs.readdirSync(folderPath);
  } catch (error) {
    await flowElement.failProcess("Could not access folder %1", folderPath);
    return;
  }
}
```

Note: When used in entry points other than `jobArrived` and `timerFired`, this method only logs the error message without failing the element. Unlike `job.fail()` which uses an array for multiple placeholders, `failProcess` accepts a single `messageParam` for the `%1` placeholder.

--

## HTTP Webhook Subscription (httpRequestSubscribe)

**What:** `s.httpRequestSubscribe(method, path, args)` subscribes the script to receive incoming HTTP webhook requests at a specified URL path.

**Why:** Standard Node.js uses Express or native HTTP servers to handle incoming requests. Switch provides a managed webhook system via its Web Services, allowing scripts to receive HTTP requests without managing server infrastructure. The subscription automatically routes matching requests to the script's entry points.

**Usage:**

```typescript
async function flowStartTriggered(s: Switch, flowElement: FlowElement) {
  try {
    // Subscribe to POST requests at /scripting/myWebhook
    // The args array is passed to httpRequestTriggeredSync/Async
    await s.httpRequestSubscribe(HttpRequest.Method.POST, "/myWebhook", ["auth_token"]);
  } catch (error: any) {
    flowElement.failProcess("Failed to subscribe: %1", error.message);
  }
}
```

Note: The full URL becomes `<protocol>://<address>:<port>/scripting/<path>`. The `/scripting` prefix is hard-coded by Switch. Request size is limited to 1MB (returns HTTP 413 if exceeded). Use `s.httpRequestUnsubscribe()` to cancel, or subscriptions are automatically cancelled when the flow stops. For security, use URL paths that are not easy to guess.

--

## httpRequestTriggeredSync Entry Point

**What:** An entry point function that Switch calls immediately when an HTTP request arrives at a subscribed webhook path, allowing the script to construct the HTTP response.

**Why:** Standard Node.js handles HTTP requests via Express middleware or HTTP server callbacks. Switch uses `httpRequestTriggeredSync` for immediate, synchronous response handling. This entry point runs in concurrent mode and must respond within 1 minute. Use it to validate requests, send acknowledgements, or perform quick operations.

**Usage:**

```typescript
async function httpRequestTriggeredSync(
  request: HttpRequest,
  args: any[],
  response: HttpResponse,
  s: Switch
): Promise<void> {
  // Parse the request body
  const data = JSON.parse(request.getBodyAsString());

  // Validate and respond
  if (data.orderId) {
    response.setStatusCode(200);
    response.setHeader('Content-Type', 'application/json');
    response.setBody(JSON.stringify({ status: "accepted", orderId: data.orderId }));
  } else {
    response.setStatusCode(400);
    response.setBody(JSON.stringify({ error: "Missing orderId" }));
  }
}
```

Note: If this entry point does not exist, a default response (200 OK, `{"status": true}`) is sent. Must complete within 1 minute or a 524 timeout error is returned. Runs in concurrent mode (can run in parallel with other entry points). Not available for debugging. If the response status is 2xx, `httpRequestTriggeredAsync` is invoked next.

--

## httpRequestTriggeredAsync Entry Point

**What:** An entry point function that Switch calls asynchronously after a successful `httpRequestTriggeredSync` response (or if `httpRequestTriggeredSync` does not exist).

**Why:** While `httpRequestTriggeredSync` handles immediate responses, `httpRequestTriggeredAsync` provides full access to the flow element and can create jobs, access global data, and perform longer-running operations. This separation allows quick HTTP responses while heavy processing happens asynchronously.

**Usage:**

```typescript
async function httpRequestTriggeredAsync(
  request: HttpRequest,
  args: any[],
  s: Switch,
  flowElement: FlowElement
): Promise<void> {
  // Parse request data
  const data = JSON.parse(request.getBodyAsString());

  // Download a file and create a job
  const filePath = await downloadFile(data.fileUrl);
  const job = await flowElement.createJob(filePath);

  // Attach metadata as a dataset
  const metadataPath = await flowElement.createPathWithName("metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(data));
  await job.createDataset("OrderData", metadataPath, DatasetModel.JSON);

  // Send the job to the workflow
  await job.sendToSingle(data.filename);

  // Clean up
  fs.unlinkSync(filePath);
  fs.unlinkSync(metadataPath);
}
```

Note: Invoked only if `httpRequestTriggeredSync` returns a 2xx status or does not exist. Has full access to `FlowElement` (can create/get jobs). Follows the same concurrency rules as `jobArrived`. The `args` parameter contains the extra arguments passed to `httpRequestSubscribe`.

--

## HttpRequest Class

**What:** A Switch-provided class representing an incoming webhook request, providing access to method, path, headers, query parameters, and body.

**Why:** Standard Node.js uses the `http.IncomingMessage` object or Express's `req` object. Switch provides `HttpRequest` as a simplified interface specifically for webhook handling within the Switch scripting environment.

**Usage:**

```typescript
async function httpRequestTriggeredSync(
  request: HttpRequest,
  args: any[],
  response: HttpResponse,
  s: Switch
): Promise<void> {
  // Access request properties
  const method = request.method;              // HttpRequest.Method enum value
  const path = request.path;                  // URL path (without /scripting prefix)
  const headers = request.headers;            // Object: { [header: string]: string }
  const query = request.query;                // Object: { [param: string]: string | string[] }
  const remoteAddress = request.remoteAddress; // Client IP address

  // Get body as string (most common for JSON)
  const bodyString = request.getBodyAsString();
  const data = JSON.parse(bodyString);

  // Or access raw body as ArrayBuffer
  const rawBody = request.body;
}
```

Note: The `path` property does not include the `/scripting` prefix. The `body` property is an `ArrayBuffer`; use `getBodyAsString()` for text/JSON content.

--

## HttpResponse Class

**What:** A Switch-provided class for constructing the HTTP response to send back to the webhook caller.

**Why:** Standard Node.js uses `http.ServerResponse` or Express's `res` object with methods like `res.status()`, `res.json()`, etc. Switch provides `HttpResponse` as a simplified interface for setting status codes, headers, and body content within the `httpRequestTriggeredSync` entry point.

**Usage:**

```typescript
async function httpRequestTriggeredSync(
  request: HttpRequest,
  args: any[],
  response: HttpResponse,
  s: Switch
): Promise<void> {
  // Set HTTP status code (default is 200)
  response.setStatusCode(200);

  // Set response headers
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('X-Custom-Header', 'value');

  // Set response body (string or Buffer)
  const result = { status: "success", timestamp: Date.now() };
  response.setBody(JSON.stringify(result));

  // Or use Buffer for binary data
  response.setBody(Buffer.from(JSON.stringify(result)));
}
```

Note: If you do not set a status code, the default is 200. The response is sent automatically after `httpRequestTriggeredSync` completes. Setting a non-2xx status code will prevent `httpRequestTriggeredAsync` from being invoked.

--

## HttpRequest.Method Enum

**What:** An enumeration defining the HTTP methods that can be used when subscribing to webhooks.

**Why:** Switch limits webhook subscriptions to specific HTTP methods (POST, PUT, DELETE) that are appropriate for receiving data. This enum provides the allowed values for use with `s.httpRequestSubscribe()`.

**Usage:**
Available values:

- `HttpRequest.Method.POST` - For receiving new data or triggering actions
- `HttpRequest.Method.PUT` - For updating or replacing data
- `HttpRequest.Method.DELETE` - For deletion requests

```typescript
// Subscribe to POST requests
await s.httpRequestSubscribe(HttpRequest.Method.POST, "/orders", []);

// Subscribe to PUT requests
await s.httpRequestSubscribe(HttpRequest.Method.PUT, "/orders/update", []);

// Subscribe to DELETE requests
await s.httpRequestSubscribe(HttpRequest.Method.DELETE, "/orders/cancel", []);
```

Note: GET requests are not supported for webhook subscriptions. Also available globally as `EnfocusSwitch.HttpRequest.Method`.

--

## getLibraryForProperty Entry Point

**What:** An entry point function that Switch calls to populate the "Select from library" property editor dialog with a list of available options.

**Why:** Standard TypeScript/Node.js applications use hardcoded dropdowns or fetch options from external sources at build time. Switch uses `getLibraryForProperty` to dynamically populate library selection dialogs at design time, enabling scripts to query external APIs, enumerate files in repositories, or build option lists based on current system state.

**Usage:**

```typescript
async function getLibraryForProperty(
  s: Switch,
  flowElement: FlowElement,
  tag: string
): Promise<string[]> {
  let items: string[] = [];

  if (tag === "LeagueSeasonName") {
    // Query an external API to build the options list
    const leagues = await fetchLeagues();
    for (const league of leagues) {
      const seasons = await fetchSeasons(league.id);
      for (const season of seasons) {
        items.push(`${league.name} - ${season.name}`);
      }
    }
  }

  return items;
}
```

Note: Invoked when the "Select from library" or "Select many from library" editor is chosen for a script property in Switch Designer. The `tag` parameter identifies which property is requesting the library list. Returns an array of strings that populate the selection dialog. Not available for debugging.

--

## Listing Job Datasets (job.listDatasets)

**What:** `job.listDatasets()` returns an array of objects describing all datasets currently attached to the job.

**Why:** Before accessing or removing a dataset, you may need to check what datasets exist on a job. This method provides a complete inventory of attached datasets, including their names, data models, and file extensions.

**Usage:**

```typescript
// Get all datasets attached to the job
const datasets = await job.listDatasets();

for (const ds of datasets) {
  await job.log(LogLevel.Info, "Dataset: %1 (%2, .%3)", [ds.name, ds.model, ds.extension]);
}

// Check if a specific dataset exists before accessing it
const hasOrderData = datasets.some(ds => ds.name === "OrderData");
if (hasOrderData) {
  const datasetPath = await job.getDataset("OrderData", AccessLevel.ReadOnly);
  // ... process dataset ...
}
```

Note: The returned list does not contain datasets created in the same entry point invocation. Each object in the array contains `name` (string), `model` (DatasetModel), and `extension` (string) properties.

--

## Removing Job Datasets (job.removeDataset)

**What:** `job.removeDataset(name)` removes a dataset with the specified name from the job.

**Why:** When replacing or updating a dataset on a job, you may need to remove an existing dataset with the same name before creating a new one. This prevents errors when `createDataset` encounters a duplicate name.

**Usage:**

```typescript
// Try to remove existing dataset before creating a new one
try {
  await job.removeDataset("OrderMetadata");
} catch (error) {
  // Dataset does not exist, which is fine
}

// Now safe to create the dataset
await job.createDataset("OrderMetadata", metadataPath, DatasetModel.JSON);
```

Note: Throws an error if the dataset does not exist or if no name is specified. Use a try-catch block when removing datasets that may or may not exist.

--
