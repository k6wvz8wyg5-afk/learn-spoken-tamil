import Foundation
import PDFKit
import AppKit
let a = CommandLine.arguments
guard a.count >= 4, let doc = PDFDocument(url: URL(fileURLWithPath: a[1])) else { exit(2) }
let idx = Int(a[2]) ?? 0
guard idx < doc.pageCount, let page = doc.page(at: idx) else { exit(3) }
let rect = page.bounds(for: .mediaBox)
let scale: CGFloat = 2.5
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
    try? png.write(to: URL(fileURLWithPath: a[3])); print("ok \(idx)")
}
