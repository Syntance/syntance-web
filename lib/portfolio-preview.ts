const OG_IMAGE_PATTERNS = [
  /property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i,
  /content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i,
  /name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
  /content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
] as const

export function getPortfolioOgPreviewUrl(url: string): string {
  return `${url.replace(/\/$/, '')}/opengraph-image`
}

export async function fetchOpenGraphImageUrl(siteUrl: string): Promise<string | null> {
  try {
    const response = await fetch(siteUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'SyntancePortfolioBot/1.0 (+https://syntance.com)',
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    for (const pattern of OG_IMAGE_PATTERNS) {
      const match = html.match(pattern)
      const candidate = match?.[1]?.trim()
      if (!candidate) continue
      return new URL(candidate, siteUrl).toString()
    }
  } catch {
    return null
  }

  return null
}

export async function resolvePortfolioPreviewImage(input: {
  url: string
  previewImageFallback?: string
}): Promise<string> {
  if (input.previewImageFallback) {
    if (
      input.previewImageFallback.startsWith('http') ||
      input.previewImageFallback.startsWith('/')
    ) {
      return input.previewImageFallback
    }

    return new URL(input.previewImageFallback, input.url).toString()
  }

  const fromMeta = await fetchOpenGraphImageUrl(input.url)
  if (fromMeta) return fromMeta

  return getPortfolioOgPreviewUrl(input.url)
}
