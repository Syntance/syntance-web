/**
 * Generuje statyczne obrazy Open Graph z sygnetu Syntance.
 * Uruchom: node scripts/generate-og-images.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sygnetSvg = fs.readFileSync(path.join(root, 'public/icons/Sygnet białe.svg'))
const BG = { r: 8, g: 8, b: 10, alpha: 1 }

async function makeSquare(size, outPath, logoScale = 0.5) {
  const logoSize = Math.round(size * logoScale)
  const sygnetPng = await sharp(sygnetSvg).resize(logoSize, logoSize).png().toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: sygnetPng, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const meta = await sharp(outPath).metadata()
  console.log(`${outPath} → ${meta.width}×${meta.height}`)
}

async function makeOgHome(outPath) {
  const width = 1200
  const height = 630
  const logoSize = 320
  const leftPad = 120
  const sygnetPng = await sharp(sygnetSvg).resize(logoSize, logoSize).png().toBuffer()

  await sharp({
    create: { width, height, channels: 4, background: BG },
  })
    .composite([{ input: sygnetPng, left: leftPad, top: Math.round((height - logoSize) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const meta = await sharp(outPath).metadata()
  console.log(`${outPath} → ${meta.width}×${meta.height}`)
}

await makeSquare(1200, path.join(root, 'public/og/og-sygnet-1200x1200.png'))
await makeSquare(512, path.join(root, 'public/og/syntance-logo.png'))
await makeSquare(512, path.join(root, 'public/logo.png'))
await makeOgHome(path.join(root, 'public/og/og-home-1200x630.png'))

console.log('Gotowe.')
