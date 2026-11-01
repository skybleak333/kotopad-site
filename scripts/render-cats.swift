import AppKit
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// Uses the game's own painters. No new or AI-generated character art.
let output = URL(fileURLWithPath: CommandLine.arguments[1])
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

func drawCat(_ kind: CatKind, expression: CatExpression = .normal, accessory: AccessoryID? = nil) -> CGImage {
    let side = 800
    let c = CGContext(data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: 0,
        space: DrawKit.srgb, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    c.translateBy(x: 400, y: 370)
    c.scaleBy(x: 260, y: -260)
    let look = CatLook.look(for: kind)
    CatPainter.drawBody(look, in: c, radius: 260)
    CatPainter.drawFaceUnit(look, expression, c, radius: 260)
    if let accessory { AccessoryPainter.drawUnit(accessory, c, line: 0.045) }
    return c.makeImage()!
}
func save(_ image: CGImage, _ name: String) {
    let dest = CGImageDestinationCreateWithURL(output.appendingPathComponent(name + ".png") as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, image, nil)
    precondition(CGImageDestinationFinalize(dest))
}
for kind in CatKind.allCases { save(drawCat(kind), kind.key) }
save(drawCat(.crumb, expression: .love, accessory: .bow), "crumb-bow")
save(drawCat(.siam, expression: .happy, accessory: .flowerCrown), "siam-flower")
save(drawCat(.ginger, expression: .happy, accessory: .chefHat), "ginger-chef")
save(drawCat(.coal, expression: .happy, accessory: .witchHat), "coal-witch")
save(drawCat(.peach, expression: .sleepy), "peach-sleepy")

// A social preview made with the actual characters.
let w = 1200, h = 630
let c = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
    space: DrawKit.srgb, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
c.setFillColor(RGBA(hex: 0xFFF8ED).cgColor); c.fill(CGRect(x: 0, y: 0, width: w, height: h))
c.setFillColor(RGBA(hex: 0xF6D4BC).cgColor); c.fillEllipse(in: CGRect(x: 610, y: -50, width: 650, height: 650))
c.draw(drawCat(.ginger, expression: .happy), in: CGRect(x: 760, y: 10, width: 430, height: 430))
c.draw(drawCat(.crumb, expression: .love, accessory: .bow), in: CGRect(x: 715, y: 310, width: 280, height: 280))
NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(cgContext: c, flipped: false)
let font = NSFont.systemFont(ofSize: 100, weight: .black)
let rounded = NSFont(descriptor: font.fontDescriptor.withDesign(.rounded)!, size: 100)!
("Котопад" as NSString).draw(at: CGPoint(x: 65, y: 330), withAttributes: [.font: rounded, .foregroundColor: NSColor(cgColor: RGBA(hex: 0x50372F).cgColor)!])
("Маленькая коробка.\nБольшая кошачья семья." as NSString).draw(at: CGPoint(x: 70, y: 180), withAttributes: [.font: NSFont.systemFont(ofSize: 35, weight: .medium), .foregroundColor: NSColor(cgColor: RGBA(hex: 0x50372F).cgColor)!])
("kotopad.fun" as NSString).draw(at: CGPoint(x: 70, y: 70), withAttributes: [.font: NSFont.systemFont(ofSize: 25, weight: .semibold), .foregroundColor: NSColor(cgColor: RGBA(hex: 0xB7553F).cgColor)!])
NSGraphicsContext.restoreGraphicsState()
save(c.makeImage()!, "social")
