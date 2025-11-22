# PdfPage Class (Chapter 4.10)

Represents a specific PDF page (instance from `PdfDocument.getPage`). Read-only page info; wrap calls in try/catch.

## Methods
- `getRotation(): number` — degrees.
- `getScaling(): number` — scale factor.
- `getPageLabel(): string` — page label or empty string.
- `getHeight(effective?: boolean): number` — points; same as `getMediaBoxHeight`; `effective` accounts for rotation/scaling.
- `getWidth(effective?: boolean): number` — points; same as `getMediaBoxWidth`; `effective` accounts for rotation/scaling.
- Box dimensions (points; `effective` optional):
  - `getMediaBoxHeight/Width(effective?)`
  - `getCropBoxHeight/Width(effective?)`
  - `getBleedBoxHeight/Width(effective?)`
  - `getTrimBoxHeight/Width(effective?)`
  - `getArtBoxHeight/Width(effective?)`
