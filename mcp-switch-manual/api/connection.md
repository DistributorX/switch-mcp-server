# Connection Class (Chapter 4.7)

Represents an outgoing connection for the flow element. Obtain via `FlowElement.getOutConnections()`.

## Methods
- `getName(): string` — destination folder name if connection name is empty.
- `getId(): string` — stable identifier (unique among active flows; unchanged unless flow edited/exported/imported). Never equals an element ID.
- `getPropertyStringValue(tag: string): Promise<string | string[]>` — outgoing connection property value by tag.
- `getPropertyType(tag: string): PropertyType` — property value type.
- `hasProperty(tag: string): boolean` — whether property exists/visible.
- `getPropertyDisplayName(tag: string): string` — untranslated UI name (English), useful for logs.
- `getFileCount(nested: boolean = false): Promise<number>` — count files in destination; `nested=false` counts direct items, `true` counts recursively (folders not counted).
