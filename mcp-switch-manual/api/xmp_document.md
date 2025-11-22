# XmpDocument Class (Chapter 4.14)

Query XMP metadata (read-only). Uses XMP path query language (see namespaces below). Wrap calls in try/catch.

## Query Language
- XPath-like; standard XMP namespaces available (see Standard Namespaces list). Use prefixes in queries.

## Methods
- `static open(path: string): Promise<XmpDocument>` — load XMP from file.
- `static fromString(xmpContent: string): XmpDocument` — create from string.
- `close(): void`
- `query(xmpPath: string, namespaceContext?: { [namespace: string]: string }): any` — evaluate XMP path; returns value per query.
- `queryAsNumber(xmpPath: string, namespaceContext?: { [namespace: string]: string }): number`
- `queryAsBoolean(xmpPath: string, namespaceContext?: { [namespace: string]: string }): boolean`
- `queryAsString(xmpPath: string, namespaceContext?: { [namespace: string]: string }): string`

## Standard Namespaces (default prefix map)
- AEScart: https://www.google.com/search?q=http://ns.adobe.com/aes/cart/
- album: https://www.google.com/search?q=http://ns.adobe.com/album/1.0/
- asf: https://www.google.com/search?q=http://ns.adobe.com/asf/1.0/
- aux: https://www.google.com/search?q=http://ns.adobe.com/exif/1.0/aux/
- bext: https://www.google.com/search?q=http://ns.adobe.com/bwf/bext/1.0/
- bmsp: https://www.google.com/search?q=http://ns.adobe.com/StockPhoto/1.0/
- creatorAtom: https://www.google.com/search?q=http://ns.adobe.com/creatorAtom/1.0/
- crs: https://www.google.com/search?q=http://ns.adobe.com/camera-raw-settings/1.0/
- dc: http://purl.org/dc/elements/1.1/
- DICOM: https://www.google.com/search?q=http://ns.adobe.com/DICOM/
- exif: https://www.google.com/search?q=http://ns.adobe.com/exif/1.0/
- exifEX: https://www.google.com/search?q=http://cipa.jp/exif/1.0/
- Iptc4xmpCore: http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/
- Iptc4xmpExt: http://iptc.org/std/Iptc4xmpExt/2008-02-29/
- iX: https://www.google.com/search?q=http://ns.adobe.com/iX/1.0/
- iXML: https://www.google.com/search?q=http://ns.adobe.com/ixml/1.0/
- jpeg: https://www.google.com/search?q=http://ns.adobe.com/jpeg/1.0/
- jp2k: https://www.google.com/search?q=http://ns.adobe.com/jp2k/1.0/
- pdf: https://www.google.com/search?q=http://ns.adobe.com/pdf/1.3/
- pdfaExtension: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/extension/
- pdfaField: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/field%23
- pdfaid: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/id/
- pdfaProperty: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/property%23
- pdfaSchema: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/schema%23
- pdfaType: https://www.google.com/search?q=http://www.aiim.org/pdfa/ns/type%23
- pdfx: https://www.google.com/search?q=http://ns.adobe.com/pdfx/1.3/
- pdfxid: https://www.google.com/search?q=http://www.npes.org/pdfx/ns/id/
- photoshop: https://www.google.com/search?q=http://ns.adobe.com/photoshop/1.0/
- plus: https://www.google.com/search?q=http://ns.useplus.org/ldf/xmp/1.0/
- png: https://www.google.com/search?q=http://ns.adobe.com/png/1.0/
- rdf: https://www.google.com/search?q=http://www.w3.org/1999/02/22-rdf-syntax-ns%23
- riffinfo: https://www.google.com/search?q=http://ns.adobe.com/riff/info/
- stDim: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Dimensions%23
- stEvt: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ResourceEvent%23
- stFnt: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Font%23
- stJob: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Job%23
- stMfs: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ManifestItem%23
- stRef: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/ResourceRef%23
- stVer: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/sType/Version%23
- tiff: https://www.google.com/search?q=http://ns.adobe.com/tiff/1.0/
- wav: https://www.google.com/search?q=http://ns.adobe.com/xmp/wav/1.0/
- x: adobe:ns:meta/
- xml: http://www.w3.org/XML/1998/namespace
- xmp: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/
- xmpBJ: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/bj/
- xmpDM: https://www.google.com/search?q=http://ns.adobe.com/xmp/1.0/DynamicMedia/
- xmpG: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/g/
- xmpGImg: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/g/img/
- xmpidq: https://www.google.com/search?q=http://ns.adobe.com/xmp/Identifier/qual/1.0/
- xmpMM: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/mm/
- xmpNote: https://www.google.com/search?q=http://ns.adobe.com/xmp/note/
- xmpRights: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/rights/
- xmpScript: https://www.google.com/search?q=http://ns.adobe.com/xmp/1.0/Script/
- xmpT: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/t/
- xmpTPg: https://www.google.com/search?q=http://ns.adobe.com/xap/1.0/t/pg/
