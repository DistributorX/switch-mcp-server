# XmlDocument Class (Chapter 4.13)

XPath 1.0 querying of XML content (read-only). Instance references XML loaded from file/memory. Wrap calls in try/catch.

## Methods
- `static open(path: string): Promise<XmlDocument>` — load XML from file.
- `static fromString(xmlContent: string): XmlDocument` — create from string.
- `close(): void` — free resources.
- `evaluateXPath(xPath: string, namespaceContext?: { [namespace: string]: string }): any` — evaluate XPath; returns string/number/boolean/node-set per XPath result.
- `evaluateXPathAsNumber(xPath: string, namespaceContext?: { [namespace: string]: string }): number`
- `evaluateXPathAsBoolean(xPath: string, namespaceContext?: { [namespace: string]: string }): boolean`
- `evaluateXPathAsString(xPath: string, namespaceContext?: { [namespace: string]: string }): string`
