import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count > 1 else { print("usage: ocr <image>"); exit(1) }
guard let img = NSImage(contentsOfFile: args[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("cannot load image\n".data(using:.utf8)!); exit(2)
}
let req = VNRecognizeTextRequest { (request, error) in
    guard let obs = request.results as? [VNRecognizedTextObservation] else { return }
    for o in obs { if let t = o.topCandidates(1).first { print(t.string) } }
}
req.recognitionLevel = .accurate
req.usesLanguageCorrection = true
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try? handler.perform([req])
