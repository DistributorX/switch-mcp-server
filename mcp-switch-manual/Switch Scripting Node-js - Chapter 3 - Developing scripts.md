## 3. Developing scripts

### 3.1. Script declaration

#### 3.1.1. Main script properties

These properties are contained in the script declaration and edited via the Declaration pane in SwitchScripter[cite: 232].

| Property                       | Description                                                                                                                                                                                |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script ID                      | ID for user identification. For plug-ins, use tilde separator: "CompanyName\~ToolName"[cite: 233].                                                                                         |
| Display Name                   | Name displayed to the user. If empty, Script ID is used[cite: 233].                                                                                                                        |
| Type                           | Element type. Always 'Script' for script folders[cite: 233]. For packages: 'App' or 'Script'[cite: 233].                                                                                   |
| Legacy                         | No: Only Node.js scripts. Yes: Allows legacy JS/VBScript (see legacy docs). Must be No for script folders[cite: 233].                                                                      |
| Include JavaScript             | (Available if Legacy=Yes) Yes: Package includes JS program, program pane tab enabled[cite: 233].                                                                                           |
| Include VBScript               | (Available if Legacy=Yes) Yes: Package includes VBScript program, program pane tab enabled[cite: 233].                                                                                     |
| Include Node.js script         | (Available if Legacy=No) Node.js script to include. `node_modules` folder next to script is also included[cite: 236]. (See Developing script code p.44)                                    |
| Version                        | Script/plug-in version (integer, start at 1, increment on update). Minor versions (e.g., 1.1) possible for apps (hotfixes)[cite: 236].                                                     |
| Keywords                       | (For plug-ins) Space/comma/semicolon separated list for filtering in Elements pane ("Search keywords" on)[cite: 236].                                                                      |
| Tooltip                        | (For plug-ins) Tooltip shown for the icon in the Elements pane[cite: 236].                                                                                                                 |
| Icon                           | Icon for associated flow element (PNG, 32x32, RGB, transparency). Ext must be 'png'. (See Icon p.11)[cite: 236].                                                                           |
| Password protected             | (Packages only) Yes: Package requires password to open in SwitchScripter (view/edit), but can still be executed by Switch. (See Password protection p.12)[cite: 236].                      |
| Password / Verify password     | Defines the password if password protected[cite: 236].                                                                                                                                     |
| Incoming connections           | Yes: Script supports incoming connections[cite: 236].                                                                                                                                      |
| Require at least one (In)      | Yes: Script requires at least one incoming connection[cite: 236].                                                                                                                          |
| Outgoing connections           | Support for outgoing connections: "No", "One", or "Unlimited"[cite: 239].                                                                                                                  |
| Detailed info (Out)            | Extra info about outgoing connections[cite: 239].                                                                                                                                          |
| Require at least one (Out)     | Yes: Script requires at least one outgoing connection (data or data+log for traffic light)[cite: 239].                                                                                     |
| Connection type                | Type of outgoing connections: "Move", "Traffic light"[cite: 239].                                                                                                                          |
| Include/exclude folder         | (For outgoing filter connections) Yes: Add standard include/exclude folder properties[cite: 239].                                                                                          |
| Data success/warning/error     | (For outgoing traffic light) Yes: Add standard properties to send data (output jobs) on success/warning/error[cite: 239].                                                                  |
| Log success/warning/error      | (For outgoing traffic light) Yes: Add standard properties to send logs on success/warning/error[cite: 239].                                                                                |
| Execution mode                 | "Serialized": Instances in same group never invoked concurrently. "Concurrent": Different instances may execute concurrently[cite: 239].                                                   |
| Execution group                | Name of execution group. Serialized: determines scope. Concurrent: not used[cite: 239].                                                                                                    |
| Enable performance tuning      | Yes: Enables extra tuning. Adds "Idle after job (secs)" property. If mode=Concurrent, also adds "Number of slots"[cite: 239].                                                              |
| Idle after job (secs)          | (If tuning enabled) Default idle time after job processing. User can override[cite: 242].                                                                                                  |
| Number of slots                | (If tuning=Yes, mode=Concurrent) Concurrent slots ("0"=unlimited, "Default"=prefs, number \> 0). Can be overridden by Prefs \> "Concurrent external processes"[cite: 242].                 |
| Position in element pane       | (For plug-ins) Position format: `<section>:<sort-key>`. Sections: Basics, Tools, Communication, Processing, Metadata, Custom. Sorted alphabetically by sort-key within section[cite: 242]. |
| Flow upgrade warning           | Warning message shown during flow upgrade (e.g., if behavior changed)[cite: 242].                                                                                                          |
| Maximum version                | (If warning specified) Previous plug-in max version up to which warning is shown. No effect for flows before Switch 2021 Fall (warning always shown)[cite: 242].                           |
| Connections                    | Info about connections[cite: 242].                                                                                                                                                         |
| Obsolete properties            | List of removed property tags from previous versions. Suppresses warnings during flow import/update[cite: 242]. (See legacy docs: "Flow element update")                                   |
| Obsolete connection properties | List of removed connection property tags from previous versions. Suppresses warnings[cite: 245]. (See legacy docs: "Flow element update")                                                  |

#### 3.1.2. Execution mode

Switch is multi-threaded, but concurrency is limited to reduce complexity[cite: 247, 248]. (See legacy docs for legacy languages)[cite: 249]. Differentiate between a script folder/package (definition) and script instances (associated with flow elements)[cite: 250].

##### 3.1.2.1. Execution modes

The script declaration defines one mode for all instances[cite: 251]:

- **Serialized:** Entry points for all script instances in the _same execution group_ are never invoked concurrently[cite: 252].
- **Concurrent:** Entry points for the same or different script instances may be executed concurrently[cite: 253].

**Concurrent:**
Two or more instances of the same type may run in parallel, and even multiple entry points for one instance may run in parallel (e.g., multiple `jobArrived` calls)[cite: 255]. A flow with a single concurrent script element can process multiple jobs simultaneously within configured limits[cite: 256]. Implementations must synchronize access to shared resources[cite: 257].

**Serialized:**
Entry points for instances in the same execution group are never called concurrently (executed one after another)[cite: 258, 259]. Instances outside the group may run in parallel[cite: 260]. Scripts needing serialization with each other should use the same execution group[cite: 261]. Usually, a script only needs serialization with itself, requiring a unique execution group name[cite: 261].

##### 3.1.2.2. Execution group

Defined in the script declaration for all instances[cite: 264]. Should be a unique string, structured like a reverse domain name (e.g., `com.enfocus.myProject.myExecutionGroup`) to avoid collisions[cite: 265]. If empty, defaults to the Script ID (weak protection against collisions)[cite: 266, 267].

**Concurrent:** Execution group is not used[cite: 269].
**Serialized:** Name collision is mostly harmless but can cause performance issues due to lack of concurrency[cite: 270]. Strongly recommended to use unique names for widely deployed scripts[cite: 270].

##### 3.1.2.3. Selecting the appropriate execution mode

| Execution Mode | Instances in same group serialized | Information preserved across invocations | Example Usage                                                                    |
| :------------- | :--------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------- |
| Concurrent     | No                                 | No                                       | Gather job metadata, produce XML (all in scripting)                              |
| Serialized     | Yes                                | No                                       | Control command-line app launched/terminated within each `jobArrived` invocation |

#### 3.1.3. Defining custom properties

Settings in the Declaration pane to define custom properties for the script or its outgoing connections[cite: 274].

| Property              | Description                                                                                                                                                           |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tag                   | Internal property name used in the script[cite: 276].                                                                                                                 |
| Name                  | Display name in Switch Designer's Properties pane[cite: 276].                                                                                                         |
| Tooltip               | Brief description shown as a tooltip in Switch Designer[cite: 276].                                                                                                   |
| Inline editor         | Inline property editor in Switch Designer (see inline property editors)[cite: 276].                                                                                   |
| Editor 1/2/3/4/5      | Extra property editors (up to 5 + inline) shown in Switch Designer (see other editors). Must be at least one (defaults to single-line text if all "None")[cite: 276]. |
| Default               | Default value for the property[cite: 276].                                                                                                                            |
| Depends on master     | Yes: Property displayed only if its master property has a specific value. Master is nearest preceding property with "Depends on master" = "No"[cite: 276].            |
| Show if master equals | String value(s) of the master for which this property is displayed. Multiple values separated by semicolon[cite: 276].                                                |
| Validation            | Validation method: None, Standard, Custom (`validateProperties` entry point), Standard and custom[cite: 276]. (See Validating property values p.32).                  |

#### 3.1.4. Property editors

Regardless of editor, property value is accessed as a string or string list (`getPropertyStringValue()`)[cite: 281].

**Inline property editors:** Contained inside the property value field in Switch Designer[cite: 283].

| Property Editor   | Resulting Value                                                                                   |
| :---------------- | :------------------------------------------------------------------------------------------------ |
| Single-line text  | The text line entered, as a string[cite: 284].                                                    |
| Password          | Hidden value entered, as a string (hidden single-line text)[cite: 284].                           |
| Number            | Decimal integer number entered, as a string (single-line text, only digits allowed)[cite: 284].   |
| Hours and minutes | String "hh:mm" (hh/mm have leading zero if needed). (single-line text, only 4 digits)[cite: 284]. |
| No-yes list       | One of the strings "No" or "Yes"[cite: 284].                                                      |
| Dropdown list     | Selected item (one of the provided custom strings). See _Extra properties_ p.31[cite: 284].       |

**Other property editors:** Mostly modal dialogs[cite: 286].

| Property Editor                 | Resulting Value                                                                                                           |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| Literal                         | Fixed string value corresponding to the editor name (predefined list). See _Extra properties_[cite: 287].                 |
| Choose file                     | Selected absolute file path, as a string[cite: 287].                                                                      |
| Choose folder                   | Selected absolute folder path, as a string[cite: 290].                                                                    |
| Regular expression              | Regular expression entered in the dialog, as a string[cite: 290].                                                         |
| File type                       | File type selected from standard types dialog, as string with Windows filename pattern(s)[cite: 290].                     |
| Select from library             | String value selected from "library" dialog. Content determined by `getLibraryForProperty` entry point[cite: 290].        |
| Multi-line text                 | Text entered in dialog as single string (may include newlines)[cite: 290].                                                |
| Script expression               | Result of script expression evaluated in job context, converted to string (see legacy docs)[cite: 290].                   |
| Single-line text with variables | Text line entered in dialog, as string, after variable replacement[cite: 290].                                            |
| Multi-line text with variables  | Text entered in dialog as single string (may include newlines), after variable replacement[cite: 290].                    |
| Condition with variables        | Result of conditional expression after variable replacement, as "true" or "false" string[cite: 290].                      |
| File patterns                   | List of pattern strings entered in dialog[cite: 290].                                                                     |
| Folder patterns                 | List of pattern strings entered in dialog[cite: 290].                                                                     |
| File types                      | List of selected file types, each as string with Windows filename pattern(s)[cite: 290].                                  |
| String list                     | String values entered in generic list dialog (each line is a separate string)[cite: 290].                                 |
| Select many from library        | String values selected from "library" dialog (each item separate string). Content via `getLibraryForProperty`[cite: 290]. |
| External editor                 | File path to property set edited by third-party app. See _External property editor_ p.36[cite: 290].                      |
| OAuth 2.0 authorization         | String containing OAuth 2.0 access token (or empty if not authorized). See _OAuth 2.0 editor_[cite: 293].                 |

##### 3.1.4.1. Extra properties for certain property editors

Displayed after "Editor" properties when a specific editor is chosen[cite: 295].

**Dropdown list**[cite: 296]:
| Property | Description |
| :--------------- | :------------------------------------ |
| Dropdown items | List of choices for the dropdown list |

**Choose file**[cite: 298]:
| Property | Description |
| :--------------------- | :---------------------------------------------------------------------------------- |
| Include file for export | Yes: Copy of the file indicated by this property's value included in exported flow |

**Literal**[cite: 300]:
| Property | Description |
| :------------------- | :---------------------------------------------------------------------------------------------------------- |
| Literal editor name | One of: Default, None, Automatic, No jobs, All jobs, All Other jobs, No Folders, All Folders |

Used to enable a constant value with specific meaning (e.g., 'Default' for a file path property means use default file)[cite: 301, 302, 303]. 'None' allows an empty value without disabling validation[cite: 304, 305].

Values returned by `getPropertyStringValue()` for literal editors[cite: 306]:
| Property Editor | Returns |
| :--------------- | :-------------- |
| Default | "Default" |
| None | "" (empty string) |
| Automatic | "Automatic" |
| No jobs | "No Files" |
| All jobs | "All Files" |
| All other jobs | "All Other Files"|
| No folders | "No Folders" |
| All folders | "All Folders" |

Check editor type using `getPropertyType()` before checking the value[cite: 311].

**Select from library, Select many from library, String list**[cite: 313]:
| Property | Description |
| :--------------- | :----------------------------------------- |
| Message | Custom message displayed on the editor dialog |

**External editor:** See _Property editors_ on page 29[cite: 314].
**OAuth 2.0 authorization:** See _OAuth 2.0 authorization editor_ on page 38[cite: 314].

#### 3.1.5. Validating property values

**Introduction:**
The "Validation" property specifies the validation mechanism[cite: 316]. Default is 'standard validation' (validates at design-time or run-time depending on editor)[cite: 317]. For custom logic, use 'custom validation' via `validateProperties` / `validateConnectionProperties` entry points[cite: 318].

**Validation at design time:**
Most properties validated during flow design or before activation[cite: 319]. Invalid properties prevent flow activation[cite: 320]. Switch assumes design-time validation remains valid during activation (mostly true, but e.g., a file path becomes invalid if file removed)[cite: 321, 322, 323].

Standard design-time validation rules[cite: 324]:

| Property Editor          | Design-time validation requires that the value...                                       |
| :----------------------- | :-------------------------------------------------------------------------------------- |
| Single-line text         | Is non-empty [cite: 326]                                                                |
| Password                 | Is non-empty [cite: 326]                                                                |
| Number                   | Is non-empty and contains only decimal digits [cite: 326]                               |
| Hours and minutes        | Is non-empty, format "hh:mm", hh 00..23, mm 00..59 [cite: 326]                          |
| No-yes list              | Is "No" or "Yes" (exact spelling/case) [cite: 326]                                      |
| Dropdown list            | Is one of the provided custom strings [cite: 326]                                       |
| Literal                  | Is the fixed string value selected [cite: 326]                                          |
| Choose file              | Represents a valid absolute path and a file exists at the path [cite: 326]              |
| Choose folder            | Represents a valid absolute path and a folder exists at the path [cite: 326]            |
| Regular expression       | Is non-empty and has valid regex syntax [cite: 326]                                     |
| File type                | Is non-empty and has valid filename pattern syntax [cite: 326]                          |
| Select from library      | Is one of the strings from `getLibraryForProperty` [cite: 326]                          |
| Multi-line text          | Is non-empty [cite: 326]                                                                |
| Script expression        | N/A [cite: 326]                                                                         |
| Single-line text w/ vars | N/A (if no variables: Is non-empty) [cite: 326]                                         |
| Multi-line text w/ vars  | N/A (if no variables: Is non-empty) [cite: 326]                                         |
| Condition with variables | N/A [cite: 326]                                                                         |
| File patterns            | Has \>=1 item, each item has valid filename pattern syntax [cite: 326]                  |
| Folder patterns          | Has \>=1 item, each item has valid filename pattern syntax [cite: 326]                  |
| File types               | Has \>=1 item, each item has valid filename pattern syntax [cite: 326]                  |
| String list              | Has \>=1 item, each item is non-empty [cite: 326]                                       |
| Select many from library | Has \>=1 item, each item is one of the strings from `getLibraryForProperty` [cite: 326] |
| External editor          | Represents a valid absolute path and a file exists at the path [cite: 329]              |
| OAuth 2.0 authorization  | Contains an OAuth 2.0 access token [cite: 329]                                          |

**Validation at run-time:**
Properties with variables or script expressions are validated during flow execution (value indeterminable at design time)[cite: 331]. Before each `jobArrived` invocation, Switch performs run-time validation for these properties[cite: 332]. If invalid, the job fails with an error message[cite: 333]. **NO run-time validation before `timerFired` or other entry points** (risky anyway due to lack of job context)[cite: 334, 335].

Standard run-time validation allows the computed value to conform to the validation scheme of **ANY** of the property's editors[cite: 336, 337].
Algorithm[cite: 338]:

1.  Compile a list of validation schemes based on the property's editors (see table below).
2.  The computed value must be non-empty AND comply with at least one scheme in the list (unless list is empty).

| Property Editor          | Run-time validation scheme                                             |
| :----------------------- | :--------------------------------------------------------------------- |
| Single-line text         | --                                                                     |
| Password                 | --                                                                     |
| Number                   | Same as design-time scheme [cite: 339]                                 |
| Hours and minutes        | Same as design-time scheme [cite: 339]                                 |
| No-yes list              | Same as design-time scheme, or a Boolean value (\*) [cite: 339]        |
| Dropdown list            | Same as design-time scheme [cite: 339]                                 |
| Literal                  | Same as design-time scheme [cite: 339]                                 |
| Choose file              | Same as design-time scheme [cite: 339]                                 |
| Choose folder            | Same as design-time scheme [cite: 339]                                 |
| Regular expression       | Same as design-time scheme, or a Boolean value (\*) [cite: 339]        |
| File type                | Same as design-time scheme [cite: 342]                                 |
| Select from library      | Same as design-time scheme [cite: 342]                                 |
| Multi-line text          | --                                                                     |
| Script expression        | --                                                                     |
| Single-line text w/ vars | --                                                                     |
| Multi-line text w/ vars  | --                                                                     |
| Condition with variables | --                                                                     |
| File patterns            | Same as design-time scheme (for one item), or Boolean (\*) [cite: 342] |
| Folder patterns          | Same as design-time scheme (for one item), or Boolean (\*) [cite: 342] |
| File types               | Same as design-time scheme (for one item), or Boolean (\*) [cite: 342] |
| String list              | --                                                                     |
| Select many from library | Same as design-time scheme (for one item) [cite: 342]                  |
| External editor          | Same as design-time scheme [cite: 342]                                 |
| OAuth 2.0 authorization  | Same as design-time scheme [cite: 342]                                 |

(\*) Boolean value is "true" or "false" string[cite: 343].

**Validation example:**
Property for a property set (file or library item), with standard validation and editors[cite: 344]:

- Choose file
- Select from library
- Script expression
- Single-line text with variables

First two validated at design time[cite: 345]. Last two at run-time (unless text has no variables)[cite: 346]. Property value guaranteed to contain either a valid existing file path OR a library item returned by `getLibraryForProperty`[cite: 347]. Usually mutually exclusive; script can check editor used if needed[cite: 349].

#### 3.1.6. External property editor

**Introduction:**
Integrates editing for third-party property sets (e.g., Preflight Profile) stored in files, using an external application without embedding third-party code in Switch[cite: 351, 352].

**Designing a flow:**
User invokes editor -\> Switch launches external app, passes path to a _copy_ of the property set[cite: 353]. External app shows dialog, user edits, app saves changes back to the file and exits[cite: 354]. Switch recognizes updated set[cite: 354].

Property value is a file path to the copy stored in a temporary Switch location[cite: 355, 356]. Works well with "Choose file" editor[cite: 357]. Copy mechanism ensures[cite: 358]:

- Original property set selected via "Choose file" is never changed[cite: 359].
- Edited sets are never shared between flow elements[cite: 360].

**Specifying in SwitchScripter:**
Extra properties for "External editor"[cite: 361]:

| Property           | Description                                                                                                                                                                                                                                                                                                                                                                                                     |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application        | Path (absolute/relative) to the editor executable. Empty value requires implementing `findExternalEditorPath` entry point. Relative path checked against system Applications folder (Program Files/Applications). If no path, `findExternalEditorPath` is executed[cite: 361].                                                                                                                                  |
| Arguments for new  | Argument string passed when creating new set, after %1/%2 substitution[cite: 364].                                                                                                                                                                                                                                                                                                                              |
| Arguments for edit | Argument string passed when editing existing set, after %1/%2 substitution[cite: 364].                                                                                                                                                                                                                                                                                                                          |
| Editor name        | Name shown to user[cite: 364].                                                                                                                                                                                                                                                                                                                                                                                  |
| Value overlay      | String shown after editor closes (Default: 'External properties defined')[cite: 364].                                                                                                                                                                                                                                                                                                                           |
| File format        | Custom: Use own format. Switch: Use specific XML format Switch can understand[cite: 364]. XML format allows listing file paths (`<Path id="...">...</Path>`) within `<PathsForExport>` under `<SwitchExternalEditor>`. These files are exported with flows. List is sorted by `id` before returning to script[cite: 364]. _Note:_ If format=custom, Switch doesn't read content, files not exported[cite: 366]. |

**Substitutions in argument strings**[cite: 367]:
| Placeholder | Replaced by |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| %1 | File path for property set. Existing file: app should load/replace (edit args used). Non-existing path: app should create new set at this path (new args used)[cite: 367]. |
| %2 | Current Switch locale (four-letter: ISO 639 lang lowercase + ISO 3166 country uppercase, e.g., "enUS")[cite: 370]. |

**External application behavior:**
Must open specified property set (or create default), display UI[cite: 372]. On save/cancel, must exit with code[cite: 373]:
| Exit Code | Meaning | Switch Action |
| :-------- | :-------------------------- | :-------------------------------- |
| Zero | Changes saved successfully | Use new/updated property set |
| Nonzero | User cancelled or error | Discard changes |
_Note:_ If using Switch file format, app must save in the described XML format[cite: 374].

**Entry point `findExternalEditorPath`**[cite: 375]:

```typescript
findExternalEditorPath(s: Switch, flowElement: FlowElement, tag: String): String
```

Starts when "External Editor" is selected in Switch Designer[cite: 376]. `tag` is the property involved[cite: 377]. Returns the path to the external editor application[cite: 377].

#### 3.1.7. OAuth 2.0 authorization editor

**Important:** Implemented for Node.js scripting only[cite: 379].
**Recommended setup:** Inline editor: None; Editor 1: OAuth 2.0 authorization; Editors 2-5: None[cite: 379].

**Introduction:**
Stores OAuth 2.0 access token, provides UI for user to request token from third-party service directly from Switch Designer[cite: 380]. Intended for scripts calling REST APIs on end-user data (e.g., email, cloud storage, social media)[cite: 381, 385]. Script writers need to register their script/app with the third-party service[cite: 382].

**About OAuth 2.0:**
Authorization protocol allowing client service (e.g., flow element) to request access to user data from resource service[cite: 384]. User authenticates on resource service webpage, grants permissions[cite: 387]. Client receives temporary code, exchanges for access token[cite: 388]. Client uses token to query resource service API[cite: 389]. Switch automatically refreshes access tokens if they expire[cite: 390]. Resource service usually requires client registration [cite: 391] (refer to service docs for procedure)[cite: 393].

**Extra properties in SwitchScripter:**
Values provided by resource service after app registration[cite: 394]:

| Property             | Description                                                                                                                                                                                                                                                                                                                                                                           |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application ID       | Identifier of the registered application[cite: 394].                                                                                                                                                                                                                                                                                                                                  |
| Application password | Password created during registration. Set to `None` if service doesn't require one[cite: 394].                                                                                                                                                                                                                                                                                        |
| Authorization URL    | URL of resource service for user authentication & authorization (found in service docs)[cite: 394].                                                                                                                                                                                                                                                                                   |
| Token URL            | URL of resource service to exchange auth code for access token & refresh tokens (found in service docs)[cite: 394].                                                                                                                                                                                                                                                                   |
| Scope                | Defines which REST APIs should be available. Specific to resource service (found in docs). Names separated by spaces or on separate lines via string list editor. Set to `None` if service requires no scope[cite: 397].                                                                                                                                                              |
| Redirection port     | Free network port on client machine for resource service to return authorization results. Comma-separated list of ports Switch should try. Needed due to firewall/service restrictions. If no restrictions, set to `Automatic` (OS chooses dynamic port). If service requires fixed redirection URI(s), specify as `http://127.0.0.1:<port>` using port(s) from this list[cite: 397]. |

**OAuth 2.0 Authorization Parameters dialog:**
If an extra property is left blank, its value is asked in this dialog when the user invokes the editor in Switch Designer[cite: 399]. Allows only a single redirection port (not a list)[cite: 401]. If port is occupied, auth fails, user must try another[cite: 402].

### 3.2. Creating and using a script in Switch

Describes creating/using a script folder[cite: 403]. _Recommended ways to work with scripts_ section provides detailed step-by-step guide[cite: 404].

#### 3.2.1. Creating a script

Use `SwitchScriptTool` for creating new scripts and converting folders\<-\>packages[cite: 406]. Use `SwitchScripter` to edit script declarations[cite: 407]. Script = declaration + program + optional icon[cite: 408].

**Steps for new script folder:**

1.  Run `SwitchScriptTool --create` [cite: 409] (See _Create mode_).
2.  Launch SwitchScripter, File \> Open, select placeholder `.sscript` file in the created folder[cite: 410].
3.  Select the root element (script itself) in Declaration pane[cite: 412].
4.  Include the required Node.js script file (`main.js` or `main.ts`) or edit the template using an external editor[cite: 413, 414].
5.  Configure other declaration settings (connections, custom properties)[cite: 415].
6.  File \> Save script[cite: 416].

When saving, Node.js script is copied/embedded[cite: 417]. If TypeScript (`main.ts`) in a _package_, SwitchScripter transpiles to JS first, includes both original TS and resulting JS[cite: 418, 419]. For _folders_, transpile manually with `SwitchScriptTool`[cite: 420]. When reopening a folder, `Include Node.js script` points to file inside folder[cite: 421]. `node_modules` folder next to script is also included[cite: 422]. When reopening a package, property points to temporary unpacked location[cite: 424]. View/edit script via context menu (Open file / Show file)[cite: 425].

_Note:_ As of Switch 2024 Spring, ES modules and CommonJS modules are supported in Node.js scripting[cite: 427]. Scripts must be packed with SwitchScriptTool 2024 Spring or later[cite: 427].

#### 3.2.2. Using a script in a flow

**Testing/using a script folder:**

1.  Start Switch Designer, create new flow[cite: 429].
2.  Drag Script element onto canvas[cite: 430].
3.  Set "Script package" property to the path of the placeholder `.sscript` inside the script folder[cite: 431].
4.  Add connections, configure properties for element/connections[cite: 432].
5.  Activate the flow[cite: 433].
6.  Test with input jobs[cite: 433].

Switch retains a reference (path) to the script folder[cite: 434]. Declaration reloaded on each activate/deactivate[cite: 435]. Script code reloaded automatically after modification (no need to deactivate/activate flow)[cite: 436]. Allows rapid modification cycle[cite: 437]. Script packages used similarly[cite: 438].
_Note:_ Exported `.sflow` contains full copy of _packages_, but only references to _folders_[cite: 439, 440].

### 3.3. Developing script code

Recommend using Visual Studio Code[cite: 441].

#### 3.3.1. Configuring Visual Studio Code

**Debugging:** VS Code enables debugging [cite: 442] (See [VS Code Node.js debugging docs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging))[cite: 443]. See _Debugging script code_ p.45 for Switch environment details.

**Static code analyzer:** Use extensions like ESLint [cite: 444, 445] (See [VS Code extensions](https://code.visualstudio.com/docs/nodejs/extensions)). ESLint helps maintainability, finds bugs early (e.g., `require-await` rule for async race conditions)[cite: 445, 446]. For TypeScript, use `@typescript/eslint` plugin and `@typescript-eslint/no-floating-promises` rule [cite: 447, 448] (See [no-floating-promises rule](https://www.google.com/search?q=https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-floating-promises.md)).

**Example `.eslintrc` (with Prettier):**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/eslint-recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "no-console": 1, // Means warning
    "prettier/prettier": 2, // Means error
    "require-await": 2,
    "@typescript-eslint/no-floating-promises": 2 // Means error
  }
}
```

**Example `.prettierrc`:**

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 120
}
```

**Auto-completion:**
If script folder created via `SwitchScriptTool --create`, data is included[cite: 451]. Otherwise, enable via:

1.  **Using `index.d.ts`:**

    - Download declarations file: [index.d.ts on GitHub](https://github.com/enfocus-switch/types-switch-scripting/blob/main/index.d.ts)[cite: 452].
    - Place `index.d.ts` in `node_modules/@types/switch-scripting` subfolder of folder containing `main.ts`[cite: 453].

2.  **Using npm and `package.json`:**

    - Create `package.json` (manually or `npm init -y`)[cite: 454, 455].
    - Add `"@types/switch-scripting": "https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz"` to dependencies[cite: 455].
    - Run `npm install`[cite: 456].

3.  **Using npm:**

    - Create `package.json` (manually or `npm init -y`)[cite: 457].
    - Run `npm install --save https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz`[cite: 458].

_Note:_ Always recommended to use types in `main.ts` for better auto-completion[cite: 459].

#### 3.3.2. Debugging script code

Debug Node.js scripts using Chrome or VS Code[cite: 460]. Can try script as pure Node.js by mocking Switch API calls first[cite: 462]. (See [VS Code Node.js debugging docs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging))[cite: 463].
_Note:_ Debugging only possible for script folders and non-password-protected packages[cite: 460].

**How to debug in Switch environment:**

1.  In Switch Designer, create flow, add Script element[cite: 464].
2.  In Script element properties:
    - a. Set "Script package" property to script folder/package path[cite: 465]. New properties appear:
      | Extra Property | Meaning |
      | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
      | Enable debug mode | Yes: Allows debugging with Chrome/VS Code. _Note:_ Execution mode forced to 'Serialized'. Only one Node.js script can be debugged at a time[cite: 466]. |
      | Port | (If debug enabled) Port number debugger connects to (Default: 9229)[cite: 466]. |
      | Debug entry points | (If debug enabled) List of entry points to debug (Default: jobArrived)[cite: 466]. |
    - b. Set "Enable debug mode" to Yes[cite: 468].
    - c. Enter port number (9229 default)[cite: 469].
    - d. Select entry point(s) to debug from list[cite: 470]. Debuggable entry points: `jobArrived`, `timerFired`, `httpRequestTriggeredAsync`, `findExternalEditorPath`[cite: 471, 472].
3.  Build meaningful test flow and activate[cite: 474].
4.  Debug using Chrome or VS Code (see below)[cite: 475]. Execution stops at selected entry points[cite: 476]. Debugger can access script code automatically[cite: 476].

**Important:** Set debug option back to No when finished\! Otherwise, flow hangs[cite: 477, 478].

**Debugging in Visual Studio Code:**

1.  Do one of the following:
    - Script folder: Open folder in VS Code. `launch.json` should exist[cite: 480, 481].
    - Script package:
      - 1.  Open any folder in VS Code[cite: 482].
      - 2.  Create `launch.json` (Run \> Add Configuration... or Ctrl+Shift+D)[cite: 482]:
        <!-- end list -->
        ```json
        {
          "version": "0.2.0",
          "configurations": [
            {
              "type": "node",
              "request": "attach",
              "name": "Attach",
              "port": <port specified in script element>, // 9229 default
              "skipFiles": [
                "<node_internals>/**"
              ],
              "address": "remote host IP" // optional for remote debugging
            }
          ]
        }
        ```
2.  Start debugging (Run \> Start debugging or F5). Debugger stops in internal obfuscated Switch code[cite: 484].
3.  Click F5 again. Script code displayed, stops at first line[cite: 484].
4.  Put breakpoint in entry point, press F5 to run to it[cite: 484].
5.  Inspect arguments/local variables[cite: 485]. _Note:_ Private variables (start with `_`) visible but shouldn't be changed[cite: 485].

### 3.4. Deploying a script

Script folders not intended for production because[cite: 487]:

- No password-protection[cite: 487].
- Not included in flow export/backup[cite: 487].
- Code runs slower than in package[cite: 488].
- Modifications have immediate effect on running version (risk of errors)[cite: 489, 490].

Node.js script packages supported since Switch 2020 Spring[cite: 491]. Strongly recommended to convert folder to package before production using `SwitchScriptTool` pack mode[cite: 492].

#### 3.4.1. Protecting a script

Encrypt Node.js script code with password via[cite: 494]:

1.  `SwitchScriptTool --pack` with `-password` option[cite: 494].
2.  Open package in SwitchScripter, set "Password protected" property to Yes, enter password twice[cite: 495].
    _Note:_ Password protection not available for script folders[cite: 495].

Same password needed to decrypt in SwitchScripter or `SwitchScriptTool --unpack`[cite: 496]. If correct, `Include Node.js script` property points to decrypted script in temp location[cite: 497].

**Important:** Enfocus cannot read code from password-protected Node.js script packages without the password[cite: 499]. Do not forget the password[cite: 500].

**Obfuscation:**
When password-protecting a package (or creating tool/app), Node.js code is obfuscated[cite: 501]. Obfuscated version included alongside encrypted original[cite: 501]. Switch executes obfuscated version[cite: 502]. Avoids decryption need and prevents code theft via unpacking/debugging[cite: 503]. `node_modules` folder is NOT obfuscated (intended for 3rd-party modules)[cite: 504, 505]. Obfuscation only applied to password-protected Node.js packages[cite: 505].

### 3.5. Recommended ways to work with scripts

Since Switch 2020 Fall, developing/debugging using script folders is possible and recommended[cite: 507, 508]. TypeScript support also introduced and recommended (better checking/autocompletion)[cite: 509, 510]. Working with packages involves opening/saving `.sscript` file[cite: 511]. Working with folders requires steps depending on starting point (new script, existing Node.js package, legacy package)[cite: 512]. Example script dismantles job folder into files based on subfolder level property[cite: 513, 514].

#### 3.5.1. Developing a brand-new script

Steps[cite: 515]:

1.  Create pre-configured script folder (`SwitchScriptTool --create`)[cite: 515].
2.  Open placeholder `.sscript` in SwitchScripter, edit declaration[cite: 516].
3.  Edit `main.ts` in VS Code, transpile (`SwitchScriptTool --transpile`). Install needed packages (`npm install`)[cite: 517].
4.  Test/debug folder in Switch Designer / VS Code[cite: 518].
5.  Deploy by converting to package (`SwitchScriptTool --pack`)[cite: 520].
6.  Debug deployed script if needed[cite: 520].
    (Steps 2-4 repeated until script works)[cite: 521].

##### 3.5.1.1. Creating a new script folder

Separate development folders (`dev`) from production packages (`production`)[cite: 523].
Example structure: `SwitchScripts/dev/TestScript`, `SwitchScripts/production`[cite: 524].

1.  `cd` to `SwitchScripts` in Command Prompt/Terminal[cite: 525, 526].
2.  Run:
    ```bash
    "C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe" --create TestScript .\dev
    ```
    Creates `SwitchScripts/dev/TestScript` folder with standard files[cite: 527]. (`.vscode` folder hidden on Mac)[cite: 528]. _Note:_ Script folder name must match script ID[cite: 528].

##### 3.5.1.2. Editing the .sscript file using SwitchScripter

Edit declaration in placeholder file[cite: 530]:

1.  Open SwitchScripter[cite: 531].
2.  File \> Open \> `TestScript.sscript`[cite: 531]. Properties displayed, `Include Node.js script` links to `main.ts`[cite: 532].
3.  Change `Execution mode` to `Concurrent`[cite: 533].
4.  Add flow element property[cite: 534]:
    - Select `Flow element properties`.
    - Right-click \> Add.
    - Select `Argument0`.
    - Configure: Tag=`SubfolderLevels`, Name=`Subfolder levels`, Inline editor=`Number`, Default=`1`[cite: 535]. (Used in example script for dismantle depth limit)[cite: 537].
5.  File \> Save script[cite: 537]. Updates `TestScript.xml`[cite: 538].

**Important:** After changing properties of a script already loaded in a test flow, stop the flow, right-click script element \> Reload script package[cite: 539].

##### 3.5.1.3. Editing the main.ts file using Visual Studio Code

1.  Open script folder (`TestScript`) in VS Code[cite: 541].
2.  Click `main.ts`[cite: 542]. Contains empty `jobArrived`[cite: 543].
3.  Replace content with example code[cite: 544]:

    ```typescript
    import * as fs from "fs-extra";
    import * as path from "path";

    async function getFiles(dir: string, levels: number, currentLevel: number, files: string[] = []) {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const itemStat = await fs.stat(itemPath);
        if (itemStat.isDirectory() && currentLevel < levels) {
          await getFiles(itemPath, levels, currentLevel + 1, files);
        } else {
          files.push(itemPath);
        }
      }
      return files;
    }

    async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
      try {
        const jobPath = await job.get(AccessLevel.ReadOnly);
        if (job.isFile()) {
          await job.log(LogLevel.Warning, "The file '%1' cannot be dismantled", [job.getName()]);
          await job.sendToSingle();
        } else {
          const levelsValue = await flowElement.getPropertyStringValue("SubfolderLevels");
          const levels = parseInt(levelsValue.toString());
          const files = await getFiles(jobPath, levels, 1);
          await Promise.all(
            files.map(async (file) => {
              const childJob = await job.createChild(file);
              await childJob.sendToSingle();
            })
          );
          await job.sendToNull();
        }
      } catch (e: any) {
        // Added type annotation for 'e'
        job.fail("Failed to process the job '%1': %2", [job.getName(), e.message]);
      }
    }
    ```

4.  Save the script[cite: 552]. (Recursively dismantles job folder)[cite: 553].

**Notes:**

- Install Node.js/npm if needed[cite: 555].
- Example code uses `fs-extra` package. Install it[cite: 556, 557]:
  - Open Terminal in VS Code (in `TestScript` folder)[cite: 558].
  - Run `npm install fs-extra --save`[cite: 558]. Downloads to `node_modules`, updates `package.json`, creates `package-lock.json`[cite: 559, 560].
- Standard `path` module needs import but not npm install[cite: 561].

<!-- end list -->

5.  Transpile TypeScript to JavaScript[cite: 562]:
    - Open command prompt in script folder.
    - Run: `"C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe" --transpile .` [cite: 563] (Note the dot `.` for current folder)[cite: 566].
    - Customizable via `tsconfig.json` [cite: 564] (See _Transpile mode_).
    - Creates `main.js` (executed by Switch) and `main.js.map` (for debugging)[cite: 567, 568, 569].

**Notes:**

- Must transpile after every `main.ts` modification[cite: 570]. Switch Messages warns if `main.ts` is newer[cite: 571, 572, 573].
- Avoid VS Code extensions for transpiling; use `SwitchScriptTool` for consistent settings[cite: 574].

Script folder is now ready[cite: 574].

##### 3.5.1.4. Testing and debugging the script in a flow

1.  **Test:**
    - a. Place Script element in new flow[cite: 576].
    - b. Choose placeholder `TestScript.sscript` from `dev` folder[cite: 577].
    - c. Add input/output folders, activate flow[cite: 578].
    - d. Place job folder in input, check output[cite: 579]. Check Switch Messages logs[cite: 580, 581].
2.  **Debug (if needed):**
    - a. In Script element properties, set `Enable debug mode` to Yes[cite: 582]. Port defaults to 9229 (matches `launch.json`)[cite: 583, 584]. Switch pauses on input job, waits for debugger[cite: 585].
    - b. Go to VS Code, start debugging (F5)[cite: 586]. Attaches, breaks in internal code[cite: 587].
    - c. Press F5 again, stops at start of `main.ts`[cite: 588]. (Debugging TS directly possible due to `main.js.map`)[cite: 589, 590].
    - d. Execute step-by-step, set breakpoints (F5 to continue to breakpoint)[cite: 591, 592]. Inspect variables[cite: 593]. F5 without breakpoints executes to end[cite: 594]. (See _Debugging script code_)[cite: 595].
    - e. If problem found: fix `main.ts`, save, transpile again[cite: 596, 597]. Continue debugging[cite: 597]. Repeat "debug-fix-save-transpile" cycle[cite: 598]. _Note:_ No need to restart flow/reload script if only code changed[cite: 599].

##### 3.5.1.5. Deploying the script

1.  Pack the script folder from `dev` to `production` using Terminal in VS Code (current folder `dev/TestScript`):

    ```bash
    # Windows
    C:\"Program Files"\Enfocus\"Enfocus Switch"\SwitchScriptTool\SwitchScriptTool.exe --pack . ..\..\production

    # Mac
    SwitchScriptTool --pack . ../../production
    ```

    (`.` refers to current folder, `..\..\production` or `../../production` refers to target)[cite: 601, 602]. Add `--password` option for protection [cite: 602] (See _Protecting a script_)[cite: 603]. Creates `TestScript.sscript` in `production` folder[cite: 604].

2.  In Switch, replace folder with package in Script element:
    - a. Copy property values (context menu)[cite: 605].
    - b. Choose script package[cite: 606].
    - c. Paste property values[cite: 606].

##### 3.5.1.6. Debugging the deployed script

Recommended to debug folders before packing[cite: 607]. Debugging packages possible (e.g., for production-only issues) but requires package has no password[cite: 608, 609, 610]. Keep in mind:

- Package lacks `launch.json`; may need to create manually[cite: 611].
- Cannot edit `main.ts` being debugged (it's temp file from cache)[cite: 612]. To modify: open package in SwitchScripter, edit temp file via `Include Node.js script` property, save package[cite: 613].
- Modifying package loads new copy to cache, previously set breakpoints lost[cite: 614].

#### 3.5.2. Starting from a script package

If starting from Node.js JavaScript package (not TS) and want to use script folder workflow:

1.  Unpack package to `dev` folder:
    ```bash
    "C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe" --unpack .\TestScript.sscript .\dev
    ```
2.  Use placeholder `.sscript` in flow, edit `main.js` (or `.ts`), test, iterate (as described above, steps 2-5)[cite: 615].
3.  To change/add properties: open placeholder `.sscript` in SwitchScripter, change, save, reload script package in flow[cite: 616].
4.  Pack folder for deployment[cite: 618].

Some items missing from unpacked folder may be needed:

##### 3.5.2.1. Debugging

Unpacked folder lacks `.vscode/launch.json`[cite: 619, 620]. Easiest fix: copy `.vscode` folder from another script folder created with `SwitchScriptTool` (content always same for Switch scripting)[cite: 621, 622].

##### 3.5.2.2. Packages

Unpacked folder lacks `package.json`[cite: 623]. Generate by running `npm init` in Terminal (in script folder)[cite: 624]. Adds existing `node_modules` dependencies to the file[cite: 625].

##### 3.5.2.3. Support for TypeScript

To convert unpacked JavaScript folder to TypeScript:

1.  Open placeholder `.sscript` in SwitchScripter[cite: 626].
2.  Rename `main.js` to `main.ts` (JS is valid TS)[cite: 627].
3.  Update `Include node.js property` link to `main.ts`[cite: 628].
4.  Install Node.js/Switch types for autocompletion[cite: 629]:
    - a. Open `package.json` from another TS script folder created with tool[cite: 630].
    - b. Copy `devDependencies` section, paste into current `package.json`, save[cite: 631]:
      ```json
      "devDependencies": {
        "@types/node": "12.12.70", // Use appropriate Node version
        "@types/switch-scripting": "[https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz](https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz)"
      },
      ```
    - c. Run `npm install` in Terminal[cite: 632]. Creates/updates `node_modules/@types`[cite: 632].
5.  Add types to entry point parameters in code[cite: 633, 634]:
    ```typescript
    // From: async function jobArrived(s, flowElement, job)
    // To:
    async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {}
    ```
6.  Transpile before testing[cite: 635]:
    ```bash
    "C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe" --transpile .
    ```
    _Note:_ Can customize via `tsconfig.json`. Copy file from another TS script folder if needed[cite: 636, 637, 638].

Now develop, debug, deploy as described before[cite: 638].

#### 3.5.3. Starting from a legacy script

Recommended to convert legacy script to Node.js script folder[cite: 640]. Backup legacy package first[cite: 640].

1.  Create new script folder with `SwitchScriptTool`[cite: 641].
2.  Open legacy package in SwitchScripter[cite: 642].
3.  Set `Legacy` property to No[cite: 642].
4.  Link `Include Node.js script` property to empty `main.ts` or `main.js` in the new folder[cite: 643].
5.  File \> Save script[cite: 643].
6.  Convert resulting package to script folder (using unpack) as described earlier[cite: 644]. Ensures folder has same declaration[cite: 644].

Now develop Node.js code, test, debug, deploy[cite: 645, 646].

#### 3.5.4. Updating older Node.js apps to work with Switch 2024

To make older Node.js apps compatible:

1.  Update `"devDependencies" -> "@types/switch-scripting"` in `package.json` to the new version link from GitHub[cite: 647].
    _Example (Switch 2022 -\> 2024):_
    ```diff
    -    "@types/node": "16.11.7",
    -    "@types/switch-scripting": "[https://github.com/enfocus-switch/types-switch-scripting/archive/22.0.0.tar.gz](https://github.com/enfocus-switch/types-switch-scripting/archive/22.0.0.tar.gz)"
    +    "@types/node": "20.12.2",
    +    "@types/switch-scripting": "[https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz](https://github.com/enfocus-switch/types-switch-scripting/archive/refs/tags/v24.1.1-final.tar.gz)"
    ```
2.  Run `npm install` in script folder[cite: 648].

### 3.6. Automating third-party applications

Introduces mechanisms and guidelines for scripts automating third-party apps[cite: 649].

#### 3.6.1. Third-party application settings

Persistent preferences/settings in the third-party app not controlled by Switch are acceptable if user can influence them independently (e.g., via app's own UI)[cite: 650, 651].

#### 3.6.2. Property sets

Collection of controls/settings/options configuring a third-party app[cite: 652]. Simplifies Switch UI by referring to set as single entity[cite: 653].

**Referring to a property set:**
Depends on storage model[cite: 655]:
| Storage Model | Reference in Switch | Stored in Exported Flow |
| :-------------------------------------------------------------- | :------------------ | :---------------------- |
| Regular file anywhere | Absolute file path | Full copy of file |
| File in open repository (folder accessible to Switch) | Absolute file path | Full copy of file |
| Item in private repository (database, accessible only by name) | Name | Name |

Some apps support multiple models (e.g., named item or file path)[cite: 656]. Switch scripts can accommodate via multiple property editors[cite: 657].

**Selecting a property set:**
Switch allows Browse for file (model 1) or selecting from list of names (models 2, 3)[cite: 658]. No tree structure support, only linear list[cite: 658].

Implementation mechanisms[cite: 660]:
| Storage Model | Action in Switch | Implemented Through | Cooperation Required from App |
| :--------------------- | :------------------------------- | :----------------------------------------------------------------------------- | :------------------------------------------- |
| Regular file | Allow user browse for file | "Choose file" property editor | -- |
| File in open repo | List files in repo (show names) | "Select from library" editor + `getLibraryForProperty` iterating repo folder | Document repo location |
| Item in private repo | Request names list, show dialog | "Select from library" editor + `getLibraryForProperty` interacting with app | Provide run-time mechanism to retrieve names |

_Note:_ "External editor" integrates external GUI into Switch Designer[cite: 661, 662, 663]. (See _External property editor_ p.36)[cite: 663].

#### 3.6.3. Communication requirements

Scripts automating apps need communication mechanism for[cite: 664]:

- Passing property values[cite: 665].
- Starting action on input file(s)[cite: 665].
- Detecting action termination[cite: 666].
- Locating output file(s)[cite: 666].
- Determining success/warning/error status[cite: 666].

**Error handling:**
App should document how Switch discriminates between[cite: 667]:

- Success vs. failure[cite: 667].
- Relevant log messages vs. irrelevant output[cite: 668].
- Log message level (info/warning/error)[cite: 669].

**Serialized communication:**
Switch can serialize communication if needed (even with multiple script instances) [cite: 670] (See _Execution modes_ p.26). Switch can auto-terminate app if action exceeds timeout (configurable preference)[cite: 671].

**Platform considerations:**
Acceptable (not preferable) to use different communication mechanisms on Mac/Windows if app available on both[cite: 672]. Script can include platform-specific code if user view/behavior is same[cite: 673].

#### 3.6.4. Communication mechanisms

Implemented mostly in `jobArrived` entry point[cite: 674].

**Command line:** Often easiest[cite: 675]. Script compiles options from properties, potentially provides console input / parses output[cite: 676]. App return code, log files also sources of info[cite: 677].

**Hotfolder:** Possible if app behavior configurable via single watched folder + control file[cite: 678]. Setups include[cite: 679]:

- Control file in watched folder points to input file(s)[cite: 679].
- Input file + control file in same watched folder (matched by filename pattern)[cite: 680].
  _Script **cannot** control app requiring different watched folder per configuration_[cite: 681]. Preferably, app allows Switch to set watched folder path[cite: 682, 683]. Failing that, app should document mechanism for script to determine path[cite: 684].

**Loadable library:** Functionality via DLL/dylib accessed using independent helper application[cite: 685]. Helper calls library functions, provides simple interface to Switch (e.g., command line)[cite: 686].

**Network communication:** Script can use protocols (e.g., REST) to communicate with external app/service[cite: 686].

#### 3.6.5. Text encoding issues

Modern OS allows any Unicode code point in file/folder names (except separators)[cite: 688, 689]. Switch is fully Unicode enabled, requires configured third-party app to be too[cite: 690, 691]. App must[cite: 691]:

- Work correctly with filenames containing any Unicode code point[cite: 692].
- Perform text communication with Switch using appropriate, well-defined encoding[cite: 692].

**Command line on Mac OS X:** Uses UTF-8 default[cite: 693]. App can usually take path as 8-bit string, pass to file system calls even if not Unicode aware[cite: 694, 695].

**Command line on Windows:** App MUST invoke Windows-specific Unicode-enabled function calls for retrieving command line AND opening files[cite: 696]. E.g., C/C++ use Unicode (`W`) version of `GetCommandLine`, not `argv[]`[cite: 697].

**Other text input/output:** (Console I/O, control files). Strongly recommend UTF-8 (represents all Unicode, compatible with 7-bit ASCII)[cite: 698, 699]. If not feasible, encoding must be well-defined/documented[cite: 699]. Guidelines[cite: 699]:

- Text with filenames/paths must represent any Unicode point (UTF-8 or UTF-16)[cite: 700].
- Text with non-ASCII chars (e.g., localized messages) must use well-defined encoding covering used languages (Preferably same on all platforms, UTF-8 best)[cite: 701, 702].
- Text with only 7-bit ASCII (e.g., non-localized keywords) not encoding-sensitive, but UTF-8 still fine (compatible)[cite: 703].
