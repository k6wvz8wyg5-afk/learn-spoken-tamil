import Foundation
import PDFKit
import AppKit

let a = CommandLine.arguments
guard a.count >= 4 else { print("usage: pdfpage <pdf> <pageIndex0> <outpng>"); exit(1) }
guard let doc = PDFDocument(url: URL(fileURLWithPath: a[1])) else { FileHandle.standardError.write("no pdf\n".data(using:.utf8)!); exit(2) }
let idx = Int(a[2]) ?? 0
guard idx < doc.pageCount, let page = doc.page(at: idx) else { FileHandle.standardError.write("bad page\n".data(using:.utf8)!); exit(3) }
// First: try native text layer
let txt = page.string ?? ""
FileHandle.standardError.write("pageCount=\(doc.pageCount) textlen=\(txt.count)\n".data(using:.utf8)!)
if txt.count > 20 { print("__NATIVE_TEXT__"); print(txt); exit(0) }
// Else rasterize at 2x for OCR
let rect = page.bounds(for: .mediaBox)
let scale: CGFloat = 3.0
let w = Int(rect.width*scale), h = Int(rect.height*scale)
let img = NSImage(size: NSSize(width: w, height: h))
img.lockFocus()
NSColor.white.set(); NSRect(x:0,y:0,width:w,height:h).fill()
let ctx = NSGraphicsContext.current!.cgContext
ctx.scaleBy(x: scale, y: scale)
page.draw(with: .mediaBox, to: ctx)
img.unlockFocus()
if let tiff = img.tiffRepresentation, let bmp = NSBitmapImageRep(data: tiff),
   let png = bmp.representation(using: .png, properties: [:]) {
    try? png.write(to: URL(fileURLWithPath: a[3]))
    print("__RASTERIZED__")
}
