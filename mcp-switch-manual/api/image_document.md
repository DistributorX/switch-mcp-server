# ImageDocument Class (Chapter 4.8)

Read-only access to image info (JPEG, TIFF, PNG) via EXIF/XMP. Each instance references a file. Static methods may throw; wrap in try/catch.

## Static
- `open(path: string): Promise<ImageDocument>` — open for instance methods.
- `getWidth(path: string): Promise<number>`
- `getHeight(path: string): Promise<number>`
- `getColorMode(path: string): Promise<ImageDocument.ColorMode>`
- `getColorSpace(path: string): Promise<ImageDocument.ColorSpace>`
- `getICCProfile(path: string): Promise<string>` — ICC profile name (Photoshop only).
- `getSamplesPerPixel(path: string): Promise<number>`

## Instance
- `close(): void` — close when done.
- `getWidth(): number`
- `getHeight(): number`
- `getColorMode(): ImageDocument.ColorMode`
- `getColorSpace(): ImageDocument.ColorSpace`
- `getICCProfile(): string`
- `getSamplesPerPixel(): number`
