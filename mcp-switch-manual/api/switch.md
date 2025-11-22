# Switch Class (Chapter 4.4)

Single `Switch` instance is passed to entry points; represents common functionality.

## Methods

### Server Version
- `static getServerVersion(): number` — current Switch Server version number.

### Global Data (scopes: Flow, Global, User)
- `getGlobalData(scope: Scope, tag: string, lock?: boolean): Promise<any>`
- `getGlobalData(scope: Scope, tags: string[], lock?: boolean): Promise<{tag: string, value: any}[]>`
  - Returns value(s) or empty string if not set. Dates returned as strings; parse yourself. Optional `lock` (default false) locks until `setGlobalData` or end of entry point.
- `setGlobalData(scope: Scope, tag: string, value: any): Promise<void>`
- `setGlobalData(scope: Scope, globalData: {tag: string, value: any}[]): Promise<void>`
  - Values can be string/number/boolean/object/array/Date/null. Tags in Global scope should be namespaced (e.g., `<company>.<feature>`), not `EnfocusSwitch`. Replaces existing values.
- `removeGlobalData(scope: Scope, tag: string): Promise<void>`
- `removeGlobalData(scope: Scope, tags: string[]): Promise<void>`
  - Remove when no longer needed. All above throw if args missing or scope unsupported.
  - Read/write each field once per entry point; if storing >100 fields, combine into one object.

### Webhooks
- `httpRequestSubscribe(method: HttpRequest.Method, path: string, args: any[]): Promise<void>`
  - Subscribes to webhook at `/scripting<path>` using method. `args` passed to webhook entry points. Request size limit 1MB (413 if exceeded). Security: use hard-to-guess paths.
- `httpRequestUnsubscribe(method: HttpRequest.Method, path: string): Promise<void>`
  - Cancels matching subscription; throws if none. All subscriptions for element auto-cancel on flow stop.

### Aborting Scripts
- `setAbortData(abortData: any): void` — store data retrievable in `abort` entry point.

### Translation Support
- `static tr(str: string): string` — mark string literal for translation; used by `SwitchScriptTool` to gather strings.

### Global User Preferences
- `getPreferenceSetting(settingKey: string): Promise<any>` — fetch user preference by key. If only settingGroup is supplied, returns entire group; with settingName, returns the specific setting.
  - Examples:  
    - Mail sender name/email: `mailSend/senderNameInEmail`, `mailSend/senderEmailAddress`  
    - HTTP proxy: `httpProxy/useHttpProxy`, `httpProxy/httpProxyHost`, `httpProxy/httpProxyPort`, `httpProxy/httpProxyAuthRequired`, `httpProxy/httpProxyBypassHosts`  
    - Processing language/env: `processing/language`, `processing/languageEnvironment`  
    - Problem alerts: `problemAlerts/sendProblemAlertsTo`  
    - Application data: `applicationData/applicationDataRoot`, `.../datasetsFolder`, `.../ticketsFolder`  
    - Web services: `webServices/switchWebServicePort`, `webServices/switchWebPortalPort`, `webServices/protocol`, `webServices/privacyPolicyPage`  
    - Reporting: `dashboardService/location`, `dashboardService/url`
