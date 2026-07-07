/**
 * Generuje statyczne obrazy Open Graph z pełnego logo Syntance (sygnet + wordmark).
 * Uruchom: pnpm generate:og
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const logoSvg = fs.readFileSync(
  path.join(root, 'public/icons/Logo Sygnet + Syntance V.3 białe.svg'),
)
const BG = { r: 8, g: 8, b: 10, alpha: 1 }
const LOGO_ASPECT = 1440 / 480 // 3:1

async function renderLogo(maxWidth, maxHeight) {
  const widthByHeight = Math.round(maxHeight * LOGO_ASPECT)
  const heightByWidth = Math.round(maxWidth / LOGO_ASPECT)
  const width = widthByHeight <= maxWidth ? widthByHeight : maxWidth
  const height = widthByHeight <= maxWidth ? maxHeight : heightByWidth
  return sharp(logoSvg).resize(width, height).png().toBuffer()
}

async function makeCanvas(width, height, outPath, logoMaxWidth, logoMaxHeight) {
  const logoPng = await renderLogo(logoMaxWidth, logoMaxHeight)

  await sharp({
    create: { width, height, channels: 4, background: BG },
  })
    .composite([{ input: logoPng, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const meta = await sharp(outPath).metadata()
  console.log(`${outPath} → ${meta.width}×${meta.height}`)
}

await makeCanvas(1200, 1200, path.join(root, 'public/og/og-sygnet-1200x1200.png'), 1080, 360)
await makeCanvas(512, 512, path.join(root, 'public/og/syntance-logo.png'), 460, 153)
await makeCanvas(512, 512, path.join(root, 'public/logo.png'), 460, 153)
await makeCanvas(1200, 630, path.join(root, 'public/og/og-home-1200x630.png'), 1080, 360)

console.log('Gotowe.')
