# PdfDocument Class (Chapter 4.9)

Read-only PDF info. Each instance references a PDF file. Wrap calls in try/catch. Use instance methods if calling multiple functions.

## Static
- `open(path: string): Promise<PdfDocument>` — create instance for a PDF (absolute path).
- `getNumberOfPages(path: string): Promise<number>`
- `getPDFVersion(path: string): Promise<string>` — e.g., "1.6".
- `getPDFXVersion(path: string): Promise<string>` — PDF/X version or empty string (claim of conformance only).
- `getSecurityMethod(path: string): Promise<string>`
- `getPageHeight(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>` — points; effective accounts for rotation/scaling.
- `getPageWidth(path: string, pageNumber: number = 1, effective: boolean = true): Promise<number>`
- `getPageRotation(path: string, pageNumber: number = 1): Promise<number>`
- `getPageScaling(path: string, pageNumber: number = 1): Promise<number>`
- `getPageLabel(path: string, pageNumber: number = 1): Promise<string>`
- Box dimensions (points; `effective` accounts for rotation/scaling):
  - `getPageMediaBoxHeight/Width(path, pageNumber = 1, effective = true)`
  - `getPageCropBoxHeight/Width(path, pageNumber = 1, effective = true)`
  - `getPageBleedBoxHeight/Width(path, pageNumber = 1, effective = true)`
  - `getPageTrimBoxHeight/Width(path, pageNumber = 1, effective = true)`
  - `getPageArtBoxHeight/Width(path, pageNumber = 1, effective = true)`

## Instance
- Created via `PdfDocument.open(path)`.
- `close(): void`
- `getNumberOfPages(): number`
- `getPDFVersion(): string`
- `getPDFXVersion(): string`
- `getSecurityMethod(): string`
- `getPageHeight(pageNumber = 1, effective = true): number`
- `getPageWidth(pageNumber = 1, effective = true): number`
- `getPageRotation(pageNumber = 1): number`
- `getPageScaling(pageNumber = 1): number`
- `getPageLabel(pageNumber = 1): string`
- Box dimensions (points; `effective` accounts for rotation/scaling):
  - `getPageMediaBoxHeight/Width(pageNumber = 1, effective = true)`
  - `getPageCropBoxHeight/Width(pageNumber = 1, effective = true)`
  - `getPageBleedBoxHeight/Width(pageNumber = 1, effective = true)`
  - `getPageTrimBoxHeight/Width(pageNumber = 1, effective = true)`
  - `getPageArtBoxHeight/Width(pageNumber = 1, effective = true)`
