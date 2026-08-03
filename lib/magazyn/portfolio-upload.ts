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

/** Po nadpisaniu pliku w Blob/CDN URL się nie zmienia — bust cache dla podglądu CMS i frontu. */
export function withAssetCacheBust(url: string, version = Date.now()): string {
  if (!url.trim()) return url

  if (url.startsWith('/')) {
    const [pathname, query = ''] = url.split('?', 2)
    const params = new URLSearchParams(query)
    params.set('v', String(version))
    const nextQuery = params.toString()
    return nextQuery ? `${pathname}?${nextQuery}` : pathname
  }

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('v', String(version))
    return parsed.toString()
  } catch {
    return url
  }
}

export function isValidPortfolioSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

async function toOptimizedWebp(file: File): Promise<Buffer> {
  if (file.size > MAX_BYTES) {
    throw new Error('Plik jest za duży (max 5 MB).')
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())
  const meta = await sharp(inputBuffer).metadata()
  if (!meta.format || !['jpeg', 'png', 'webp', 'avif', 'gif'].includes(meta.format)) {
    throw new Error('Dozwolone są tylko pliki graficzne (PNG, JPG, WebP).')
  }

  return sharp(inputBuffer).rotate().webp({ quality: 82, effort: 4 }).toBuffer()
}

async function saveWebpToPortfolioSlug(
  webpBuffer: Buffer,
  slug: string,
  filename: string,
  publicPath: string,
): Promise<{ url: string }> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (blobToken) {
    const blob = await put(`portfolio/${slug}/${filename}`, webpBuffer, {
      access: 'public',
      contentType: 'image/webp',
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return { url: withAssetCacheBust(blob.url) }
  }

  if (process.env.VERCEL === '1') {
    throw new Error(
      'Brak BLOB_READ_WRITE_TOKEN — ustaw token Vercel Blob albo wklej URL ręcznie.',
    )
  }

  const relativeDir = path.join('public', 'portfolio', slug)
  const absoluteDir = path.join(process.cwd(), relativeDir)
  await mkdir(absoluteDir, { recursive: true })
  await writeFile(path.join(absoluteDir, filename), webpBuffer)

  return { url: withAssetCacheBust(publicPath) }
}

export async function savePortfolioPageSpeedScreenshot(
  file: File,
  slug: string,
  slot: PageSpeedScreenshotSlot,
): Promise<{ url: string }> {
  if (!isValidPortfolioSlug(slug)) {
    throw new Error('Nieprawidłowy slug realizacji.')
  }

  const webpBuffer = await toOptimizedWebp(file)
  const filename = filenameForPageSpeedSlot(slot)

  return saveWebpToPortfolioSlug(
    webpBuffer,
    slug,
    filename,
    publicPathForPageSpeedScreenshot(slug, slot),
  )
}

const PREVIEW_IMAGE_FILENAME = 'preview.webp'

export async function savePortfolioPreviewImage(
  file: File,
  slug: string,
): Promise<{ url: string }> {
  if (!isValidPortfolioSlug(slug)) {
    throw new Error('Nieprawidłowy slug realizacji.')
  }

  const webpBuffer = await toOptimizedWebp(file)

  return saveWebpToPortfolioSlug(
    webpBuffer,
    slug,
    PREVIEW_IMAGE_FILENAME,
    `/portfolio/${slug}/${PREVIEW_IMAGE_FILENAME}`,
  )
}
