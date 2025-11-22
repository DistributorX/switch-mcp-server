## 2. Scripting concepts

### 2.1. Node.js scripting

#### 2.1.1. Node.js

Node.js is an open-source JavaScript runtime environment that allows executing JavaScript code on any platform[cite: 38]. This is basically the executable included in the Switch installation[cite: 39]. Node.js JavaScript (also referred to as 'Node.js scripting') is the JavaScript language syntax and the API (so the functions and objects) supported by the Node.js runtime environment[cite: 40].

Check the following links for detailed information about Node.js and JavaScript:

- The Node.js project website: [https://nodejs.org](https://nodejs.org) [cite: 40]
- Direct link to the Node.js API (v20.12.2): [https://nodejs.org/download/release/v20.12.2/docs/api/](https://nodejs.org/download/release/v20.12.2/docs/api/) [cite: 40]
- JavaScript tutorial: [https://javascript.info/](https://javascript.info/) [cite: 40]

In the Switch Scripting API the functions with callbacks are not supported, as they are difficult to use and the code is difficult to maintain[cite: 41]. Instead, promises and the `async`/`await` syntax sugar on top of them can be used[cite: 42]. More info on `async`/`await` can be found here: [https://javascript.info/async-await](https://javascript.info/async-await)[cite: 42].

#### 2.1.2. TypeScript

TypeScript extends JavaScript by adding the concept of types, which makes it possible for the TypeScript compiler to find common bugs in the script before running the code[cite: 44]. See [https://www.typescriptlang.org/](https://www.typescriptlang.org/) for more info[cite: 44].

#### 2.1.3. Visual Studio Code

Node.js scripts cannot be edited directly in the SwitchScripter development environment[cite: 45]. Therefore it is recommended to use Visual Studio Code to edit Node.js scripts to take full advantage of the many features and extensions it supports[cite: 46]. For more information about Visual Studio Code, refer to: [https://code.visualstudio.com/docs/setup/setup-overview](https://code.visualstudio.com/docs/setup/setup-overview)[cite: 46].

However, you can use any code editor you want; there is no limitation[cite: 47].

### 2.2. Script element and script expression

A **script element** is a flow element that encapsulates a script written in any of the supported scripting languages[cite: 49]. The script implements one or more "entry point" functions called by Switch automatically in appropriate moments[cite: 50]. For example, the `jobArrived` entry point is called for each job being processed through the flow element[cite: 51]. The script can be represented by a script folder or a script package[cite: 52].

A **script expression** is a text string associated with a flow element property[cite: 53]. To determine the value of the property, Switch evaluates the contents of the string as a JavaScript expression in the context of the job being processed[cite: 54]. Legacy JavaScript and Node.js TypeScript are supported in script expressions[cite: 54].

The Switch scripting API (application programming interface) provides script elements with access to information about the job being processed, as well as its metadata[cite: 55]. Script expressions are limited to read-only access, while script elements can update the job and its metadata information[cite: 56]. The scripting API objects and functions that are not available for use in Node.js script expressions are marked with this label: **NOT FOR SCRIPT EXPRESSIONS**[cite: 57]. Note that using third-party node modules is also not supported in Node.js script expressions[cite: 57].

### 2.3. Script folder

A script folder is one of the two ways to represent a Switch script[cite: 58]. It's a folder containing a number of unencrypted files that describe different parts of a Switch script as explained below[cite: 59].

**Advantages:**

- Better suited for inclusion in version control systems for professional script development[cite: 60].
- More convenient for developing and debugging the script code as there is no need to re-save the complete script in SwitchScripter after doing changes in script code only[cite: 61].
- Easier to share common library code between scripts when stored in version control[cite: 62].
- Allows for fully automated build processes to convert script folders into regular script packages[cite: 63].

A placeholder `.sscript` file in the script folder is used to select the script folder in SwitchScripter and Switch Designer[cite: 64]. Note that this placeholder file is empty and not a real script package[cite: 65].

**Limitations:**

- Meant only for local development and aren't copied into exported flows[cite: 66]. Keep this in mind when exporting flows or using automatic flow backup[cite: 67].
- Creating script folders and converting them into packages can only be done using the `SwitchScriptTool` command line tool[cite: 69].
- Available for Node.js scripts only[cite: 72].
- Since they are unencrypted, password protection won't work[cite: 73]. `SwitchScriptTool` will discard the password when converting a package to a folder[cite: 74].
- Code transpilation (for TypeScript) must be done using `SwitchScriptTool`[cite: 75].
- Can only have 'Script' as type (not 'App')[cite: 76].
- Cannot be used as a scripted plug-in without conversion to a script package[cite: 77]. To create apps, pack the script first, then set the type in SwitchScripter before creating the enfpack[cite: 78].

Once created, a script folder can be opened in SwitchScripter to edit and save changes to the script declaration[cite: 71].

#### 2.3.1. Script folder structure

A script folder contains the complete information needed to load and execute a script by a script element in Switch[cite: 79]. This includes the script program, ID, properties, and icon[cite: 80].

A script folder contains the following files[cite: 80]:

- `manifest.xml`: For Switch internal use only.
- `<ScriptID>.xml`: Script declaration created by SwitchScripter. **Do not edit manually**[cite: 81].
- `<IconFileName>.png`: Optional script icon (32x32 pixels, RGB, supports transparency)[cite: 120].
- `<ScriptID>.pdesc`: Optional enfpack description file created by SwitchScripter if extra files were specified. **Do not edit manually**[cite: 83].
- `<ScriptID>.sscript`: Zero-size placeholder script file for selection in SwitchScripter/Designer[cite: 84].
- `main.ts`: Main script code file for TypeScript scripts[cite: 85].
- `main.js`: Main script code file for non-TypeScript scripts OR the result of transpilation from TypeScript; executed by Switch[cite: 85].
- `main.js.map`: Optional source map file generated during transpiling from `main.ts`. Only present if TypeScript is used[cite: 86].
- `node_modules`: Optional node modules folder[cite: 87].
- `Resources` folder: For extra resource files used in the script; gets packed along with its content[cite: 88, 89].
- `<LanguageCode>.ts` files: Optional translation files (see Switch App SDK)[cite: 90].
- `.vscode/launch.json`: Configuration file for debugging Node.js script (created by `SwitchScriptTool create` mode)[cite: 91].
- `.vscode/switch.code-snippets`: Snippets file for entry points (created by `SwitchScriptTool create` mode for TypeScript)[cite: 92].
- `package.json`: NPM configuration file for installing type declarations (created by `SwitchScriptTool create` mode for TypeScript)[cite: 94, 95].
- `tsconfig.json`: Specifies transpilation options for TypeScript (created by `SwitchScriptTool create` mode for TypeScript)[cite: 96].
- `node_modules/@types/node`: Type declarations for Node.js (created by `SwitchScriptTool create` mode for TypeScript)[cite: 97, 98].
- `node_modules/@types/switch-scripting`: Type declarations for Switch scripting (created by `SwitchScriptTool create` mode for TypeScript)[cite: 99, 100].

**Notes:**

- If using TypeScript (`main.ts`), you must first transpile the script using `SwitchScriptTool` to generate `main.js` before using the script folder in a flow[cite: 101, 102].
- XML files inside script folders should not be edited manually; always use SwitchScripter[cite: 103].
- When packing a script folder, `SwitchScriptTool` adjusts the content to match the layout described above, removing extra files/folders[cite: 104].

#### 2.3.2. Script declaration

A script declaration is an XML file specifying script information like ID and property data types[cite: 105]. It can be edited with SwitchScripter[cite: 106].

**Purpose:**
When associated with a script element, the declaration is used to[cite: 107]:

- Produce appropriate behavior in Switch Designer (connections, properties)[cite: 107].
- Provide information to the run-time environment and API (e.g., access properties, move jobs according to connection semantics)[cite: 108].

**Main script properties**[cite: 109]:

- Script ID[cite: 109].
- Number and type of supported incoming/outgoing connections[cite: 109].
- Execution mode (concurrent or serialized)[cite: 110].
- List of custom properties for the script element[cite: 110].
- List of custom properties for outgoing connections[cite: 112].
  (See _Main script properties_ on page 22)[cite: 112].

**Property definition properties**[cite: 113]:
Each property definition includes:

- A unique tag and human-readable name[cite: 113].
- Type of property editors used[cite: 114].
- Specifications for validating the property value[cite: 114].
  (See _Defining custom properties_ on page 27 and _Property editors_ on page 29)[cite: 114].

#### 2.3.3. Script program

A script program is a plain text file containing the Node.js script to be executed[cite: 116]. A third-party `node_modules` folder found next to the selected Node.js script will also be included when saving in SwitchScripter[cite: 117]. The script program relies on the Switch scripting API, using objects like `Job`, `FlowElement`, and `Switch` for Switch-specific tasks[cite: 118, 119].

#### 2.3.4. Icon

The optional script icon is a PNG image file (non-interlaced), exactly 32x32 pixels, in RGB color space, with transparency support[cite: 120]. If present, Switch Designer uses this icon for the script element; otherwise, it uses the default icon[cite: 121]. The file extension must be `.png`[cite: 122].

### 2.4. Script package

A script package (`.sscript` file) is another way to represent a Switch script[cite: 123]. It's a ZIP archive created by SwitchScripter or `SwitchScriptTool`, containing mostly the same files as a script folder (see _Script folder structure_ on page 9)[cite: 124]. Some development-specific files (like VS Code configs) are excluded[cite: 125, 126]. Use `SwitchScriptTool` list mode to see contents[cite: 126].

Script packages are suitable for deploying scripts on different machines or exchanging them between users[cite: 127]. While script folders are better for development, packages are intended for production[cite: 129]. Typically, a script folder is packed into a package using `SwitchScriptTool` pack mode after development[cite: 130]. Since Switch 2020 Spring, embedding Node.js scripts in packages is recommended[cite: 131]. Legacy JavaScript and VBScript are still valid but considered 'legacy'[cite: 131].

#### 2.4.1. Password protection

A script package can be password-protected[cite: 133]. This prevents opening it in SwitchScripter (for viewing/editing) without the password[cite: 134]. However, the script can still be executed by Switch[cite: 135]. Blocking execution is not possible[cite: 135]. See _Protecting a script_[cite: 135].

### 2.5. Scripted plug-in

A scripted plug-in is a regular script package saved with the Type property set to "App" and placed in the appropriate folder so Switch can load it[cite: 136]. Once loaded, its icon appears in the Elements pane, and it can be used like a built-in tool[cite: 137]. The scripting API offers specific entry points, properties, and functions for optional plug-in features[cite: 138]. A regular script package can be turned into a plug-in easily as these features are not required[cite: 139]. All plug-in features can be developed and tested like regular scripts[cite: 140]. A scripted plug-in of type 'App' can be installed locally but cannot be distributed outside the Enfocus Appstore[cite: 141].

### 2.6. SwitchScriptTool

`SwitchScriptTool` is a command line tool located in the Switch installation folder used to work with script folders[cite: 142].

**Locations:**

- Windows: Typically `C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool.exe`[cite: 143]. Add folder to PATH for easier access[cite: 145].
- macOS: Typically `/Applications/Enfocus/Enfocus Switch/SwitchScripter.app/Contents/MacOS/SwitchScriptTool/SwitchScriptTool`[cite: 145]. A symbolic link is added to the installation root and `/usr/local/bin` by the installer[cite: 147].

**Modes of Operation:**

- Creating a script folder[cite: 147].
- Packing a script folder into a script package[cite: 147].
- Unpacking a script package into a script folder[cite: 147].
- Transpiling TypeScript to JavaScript in a script folder[cite: 147].
- Generating translations (for app script folders)[cite: 147].
- Listing files/folders in a script package[cite: 147].

#### 2.6.1. Create mode

Creates a new script folder. Requires script ID and path to the target folder[cite: 149].

- `--JavaScript` option: Creates `main.js` for JavaScript[cite: 150].
- Default (no option): Creates `main.ts` for TypeScript[cite: 151].

```bash
SwitchScriptTool --create <ScriptID> <PathToResultFolder> [--JavaScript]
```

Creates a folder named `<ScriptID>` in the specified path, creating parent folders if needed[cite: 152, 153].

**Files Created (Always):**

- `manifest.xml`
- `<ScriptID>.xml`
- `<ScriptID>.sscript`
- `main.ts` or `main.js` (with empty `jobArrived` entry point)
- `.vscode/launch.json`
- Empty `Resources` folder

**Files Created (TypeScript only):**

- `package.json`
- `tsconfig.json`
- `.vscode/switch.code-snippets`
- `node_modules/@types/node`
- `node_modules/@types/switch-scripting`

(See _Script folder_ on page 8 for details)

**Examples:**

```bash
# Create JavaScript script folder
"C:\Program Files\Enfocus Enfocus Switch SwitchScriptTool\SwitchScriptTool" --create JavaScript C:\Users\me\git\scripts --JavaScript [cite: 154]

# Create TypeScript script folder
"C:\Program Files\Enfocus\Enfocus Switch SwitchScriptTool\SwitchScriptTool" --create TypeScript C:\Users\me\git\scripts [cite: 154]
```

#### 2.6.2. Pack mode

Packs a script folder into a script package. Requires source script folder, target folder, and optional password[cite: 156].

```bash
SwitchScriptTool --pack <PathToScript Folder> <PathToResultFolder> [--password <Password>] [--verbose]
```

If a password is provided, the package is protected [cite: 157] (See _Protecting a script_).
The `--verbose` option lists all files/folders added to the package[cite: 162].

**Example:**

```bash
"C:\Program Files\Enfocus Enfocus Switch SwitchScriptTool SwitchScriptTool" --pack C:\Users\me\git\scripts\xsltproc C:\Users\me\sscripts --password 12345
```

_Note:_ `package.json`, `.vscode/launch.json`, and `.vscode/switch.code-snippets` are not included in the resulting package[cite: 158].

**Package contents:**
All files in the `node_modules` folder are added[cite: 159]. To reduce package size, remove unnecessary modules before packing, e.g., using `npm prune --production` to remove development dependencies[cite: 160, 161].

#### 2.6.3. Unpack mode

Unpacks a script package into a script folder. Requires source package file, result folder path, and password if protected[cite: 164].

```bash
SwitchScriptTool --unpack <PathToSscript> <PathToResultFolder> [--password <Password>]
```

The tool cannot unpack if the password is wrong or missing[cite: 165]. Password protection is removed, so the resulting script folder has no password[cite: 166].

**Example:**

```bash
"C:\Program Files\Enfocus\Enfocus Switch\SwitchScriptTool\SwitchScriptTool" --unpack C:\Users\me\sscripts\xsltproc.sscript C:\Users\me\Documents\xsltproc --password 12345
```

#### 2.6.4. Transpile mode

Necessary only for TypeScript scripts to convert them to JavaScript (`main.js`) so Switch can run them[cite: 168]. Transpilation is needed after editing a TypeScript script _folder_[cite: 169].
_Note:_ For script _packages_, transpilation happens automatically in SwitchScripter when saving[cite: 170].

Using `SwitchScriptTool` ensures consistent transpile options matching SwitchScripter, important for later packing and deployment[cite: 171]. Transpilation can be customized via `tsconfig.json` (if it exists); otherwise, defaults are used[cite: 172]. See [tsconfig.json documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)[cite: 172].
_Note:_ 'files', 'rootDir', 'outDir', and 'typeRoots' options cannot be customized as they are script folder bound[cite: 173].

Requires the source script folder path:

```bash
SwitchScriptTool --transpile <PathToScriptFolder>
```

Transpiles `main.ts` into `main.js` within the script folder[cite: 174].

**Example:**

```bash
"C:\Program Files\Enfocus Enfocus Switch\SwitchScriptTool\SwitchScriptTool" --transpile C:\Users\me\git\scripts\xsltproc
```

#### 2.6.5. Generate Translations mode

Exports strings for translation into languages enabled in SwitchScripter[cite: 175].

```bash
SwitchScriptTool --generate-translations <ScriptFolder> <ResultFolder>
```

Strings are stored in `.ts` files in the `<ResultFolder>`[cite: 176]. If `.ts` files already exist, existing translations are preserved, and new untranslated strings are added[cite: 177]. No files are saved if no languages are enabled in the script folder[cite: 177]. Languages are currently enabled only via SwitchScripter (Edit \> Localization)[cite: 179, 180]. (See Switch App SDK documentation for more on localization)[cite: 181].

**Examples:**

```bash
# Windows
"C:\Program Files\Enfocus\Enfocus Switch SwitchScriptTool\SwitchScriptTool" --generate-translations C:\Users\me\git\scripts\xsltproc C:\Users\me\git\scripts\xsltproc

# Mac
"/Applications/Enfocus/Enfocus Switch/SwitchScriptTool/SwitchScriptTool" --generate-translations /Users/me/git/scripts/xsltproc /Users/me/git/scripts/xsltproc
```

#### 2.6.6. List mode

Lists all files/folders included in a script package[cite: 183]. Requires the script package path[cite: 184]. No password needed as it doesn't decrypt files (same as unzipping the `.sscript` file manually)[cite: 185].

```bash
SwitchScriptTool --list <PathToSscript>
```

**Example:**

```bash
"C:\Program Files\Enfocus Enfocus Switch SwitchScriptTool\SwitchScriptTool" --list C:\Users\me\sscripts\xsltproc.sscript
```

### 2.7. SwitchScripter

#### 2.7.1. Launching SwitchScripter

Launch SwitchScripter by[cite: 186]:

- Double-clicking the SwitchScripter application icon.
- Double-clicking a Switch script package (`.sscript` file).
- Double-clicking a placeholder `.sscript` file from a script folder.
- Selecting a script element in Switch Designer and choosing "Edit in Scripter" from its context menu.

SwitchScripter offers a workspace window to edit a single script, and multiple instances can run simultaneously[cite: 188].

#### 2.7.2. Workspace window

The SwitchScripter window provides a workspace with several key areas[cite: 193]:

| Workspace area   | Description                                                                                     |
| :--------------- | :---------------------------------------------------------------------------------------------- |
| Toolbar          | Contains tool buttons for frequently used functions                                             |
| Declaration pane | Allows editing the script declaration, defining connections, custom properties, etc.            |
| Fixture pane     | Allows setting up an emulated test environment for legacy scripts (See legacy documentation).   |
| Properties pane  | Serves to edit the properties of the item currently selected in the declaration or fixture pane |
| Program pane     | Allows editing script programs in legacy scripting languages (See legacy documentation).        |
| Message pane     | Displays log messages issued by your script or the emulated run-time environment during testing |

Panes can be shown/hidden via the View menu, resized, rearranged (side-by-side or tabbed), or undocked[cite: 197, 198, 199]. Configuration settings persist across sessions[cite: 199].

#### 2.7.3. Toolbar

Provides buttons for frequent operations (also accessible via menus)[cite: 200].

**File Tools**[cite: 201]:
| Tool | Description |
| :----------- | :------------------------------------------- |
| New | Create a new empty script package |
| Open | Open an existing script folder or package |
| Save script | Save the script package or folder being edited |

**View Tools**[cite: 203]:
| Tool | Description |
| :--------------------- | :--------------------------------------------------------------- |
| Declaration/Fixture pane | Show/toggle between Declaration and Fixture panes |
| Properties pane | Show or hide the Properties pane |
| Messages pane | Show or hide the Messages pane |

**Edit Tools**[cite: 206]:
Undo, Redo, Copy, Paste, Delete (relevant for legacy scripts only - see legacy docs).

**Testing Tools**[cite: 207]:
Run, Step Into, Step Over, Step Out, Stop (for legacy scripts only - see legacy docs).

**Menu Bar**[cite: 209]:
Accesses all toolbar tools and additional options. Some options (e.g., File \> Create pack, Edit \> Localization, Edit \> Extra files) are only available for scripted plug-ins (apps) [cite: 210] (See App SDK docs).

#### 2.7.4. Declaration pane

Allows viewing and editing the script declaration information[cite: 211]. Selecting an item here displays its properties in the Properties pane[cite: 212].

**Terminology Note:** "Property" can mean[cite: 213]:

1.  A "custom" property defined by the script writer, shown in Switch Designer[cite: 213].
2.  One of the "settings" in the SwitchScripter Declaration pane for the selected item[cite: 214]. Context should clarify the meaning[cite: 216].

**Main script properties:**
Properties displayed when the main script item (e.g., "SwitchScript0") is selected are described in _Main script properties_[cite: 217].

**Property definitions:**
The "Flow element properties" and "Outgoing connections properties" sections define custom properties added to the flow element or its outgoing connections[cite: 219]. Use the tool buttons (+, -, arrows) at the top to add, remove, and reorder property definitions[cite: 221]. These custom property values are entered in Switch Designer and retrieved by the script at run-time[cite: 223]. Properties displayed when selecting a property definition (e.g., "Argument0") are described in _Property definition properties_[cite: 224].

#### 2.7.5. Properties pane

Allows viewing and editing properties for the item selected in the Declaration or Fixture pane[cite: 226]. Similar to the Properties pane in Switch Designer[cite: 228]. Properties are described in the Declaration/Fixture pane topics (see legacy docs for Fixture pane details)[cite: 227].

#### 2.7.6. Message pane

Displays log messages from the script or the emulated environment during testing[cite: 229]. Messages can be filtered and sorted using controls at the top[cite: 230].
