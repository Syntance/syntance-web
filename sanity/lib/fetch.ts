import { clientWithoutToken } from './client'

interface SanityFetchOptions {
  query: string
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<T>({
  query,
  tags = [],
  revalidate = 60, // domyślnie 60 sekund (1 minuta)
}: SanityFetchOptions): Promise<T> {
  return clientWithoutToken.fetch<T>(query, {}, {
    next: {
      revalidate,
      tags,
    },
  } as any)
}
