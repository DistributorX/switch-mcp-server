# HttpRequest & HttpResponse (Chapter 4.11–4.12)

Used for webhooks via `httpRequestSubscribe`. Not available in script expressions.

## HttpRequest
- Props:
  - `method: HttpRequest.Method` — HTTP method.
  - `path: string` — URL path (e.g., `/myscript/notify`); `/scripting` prefix not included.
  - `query: { [prop: string]: string | string[] }` — query params.
  - `headers: { [header: string]: string }` — request headers.
  - `remoteAddress: string` — origin IP.
  - `body?: ArrayBuffer` — request body.
- Methods:
  - `getBodyAsString(): string` — body as string.

## HttpResponse
- Methods:
  - `setStatusCode(statusCode: number): void` — default 200.
  - `setHeader(name: string, value: string): void`
  - `setBody(data: ArrayBuffer | string): void`
