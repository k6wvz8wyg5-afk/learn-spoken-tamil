# PDF text-extraction / OCR tools

Swift shims for pulling text out of NRC PDFs (NUREG-1555, RG 4.2, NUREG-2249, etc.)
that the Read tool can't handle. Built for macOS; no third-party installs.

## Why these exist
Many NRC PDFs are large and the Read tool refuses them or returns nothing.
`pdftoppm`/poppler and LibreOffice are unavailable in this sandbox. These shims
use Apple's built-in PDFKit (native text layer) and Vision (OCR) frameworks via
`swift`, which needs write access to the macOS toolchain cache at
`/var/folders/.../T` and `/C`. That access is granted in
`.claude/settings.local.json` under `sandbox.filesystem.allowWrite`.

## Compile (recompile per session — binaries are not committed)
    swiftc tools/pdfpage.swift -o "$TMPDIR/pdfpage"
    swiftc tools/render.swift  -o "$TMPDIR/render"
    swiftc tools/ocr.swift     -o "$TMPDIR/ocr"

## Use
- `pdfpage <file.pdf> <pageIndex0> <out.png>` — prints the page's native text
  layer if present (`__NATIVE_TEXT__` then the text); otherwise rasterizes to PNG
  at 3x for OCR. This is the primary tool — most NRC PDFs have a real text layer.
- `render <file.pdf> <pageIndex0> <out.png>` — force-rasterize a page to PNG at
  2.5x regardless of text layer (for tables that render as graphics).
- `ocr <image.png>` — Vision OCR on a raster image; prints recognized text.

Page indices are 0-based; front matter shifts document page numbers vs. index.
To find a table: scan the List of Tables page for its document page number, then
map to an index by matching the footer page label from `pdfpage`.
