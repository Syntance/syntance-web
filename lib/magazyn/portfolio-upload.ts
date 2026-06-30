import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import {
  filenameForPageSpeedSlot,
  publicPathForPageSpeedScreenshot,
  type PageSpeedScreenshotSlot,
} from '@/lib/magazyn/portfolio-performance-cms'

const MAX_BYTES = 5 * 1024 * 1024
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidPortfolioSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

export async function savePortfolioPageSpeedScreenshot(
  file: File,
  slug: string,
  slot: PageSpeedScreenshotSlot,
): Promise<{ url: string }> {
  if (!isValidPortfolioSlug(slug)) {
    throw new Error('Nieprawidłowy slug realizacji.')
  }

  if (file.size > MAX_BYTES) {
    throw new Error('Plik jest za duży (max 5 MB).')
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())
  const meta = await sharp(inputBuffer).metadata()
  if (!meta.format || !['jpeg', 'png', 'webp', 'avif', 'gif'].includes(meta.format)) {
    throw new Error('Dozwolone są tylko pliki graficzne (PNG, JPG, WebP).')
  }

  const webpBuffer = await sharp(inputBuffer)
    .rotate()
    .webp({ quality: 82, effort: 4 })
    .toBuffer()

  const filename = filenameForPageSpeedSlot(slot)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (blobToken) {
    const blob = await put(`portfolio/${slug}/${filename}`, webpBuffer, {
      access: 'public',
      contentType: 'image/webp',
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return { url: blob.url }
  }

  if (process.env.VERCEL === '1') {
    throw new Error(
      'Brak BLOB_READ_WRITE_TOKEN — ustaw token Vercel Blob albo wklej URL zrzutu ręcznie.',
    )
  }

  const relativeDir = path.join('public', 'portfolio', slug)
  const absoluteDir = path.join(process.cwd(), relativeDir)
  await mkdir(absoluteDir, { recursive: true })
  await writeFile(path.join(absoluteDir, filename), webpBuffer)

  return { url: publicPathForPageSpeedScreenshot(slug, slot) }
}
