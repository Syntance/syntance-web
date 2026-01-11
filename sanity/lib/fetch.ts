import { clientWithoutToken } from './client'

interface SanityFetchOptions {
  query: string
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<T>({
  query,
  tags = [],
  revalidate = 3600, // domyślnie 1 godzina
}: SanityFetchOptions): Promise<T> {
  return clientWithoutToken.fetch<T>(query, {}, {
    next: {
      revalidate,
      tags,
    },
  } as any)
}
