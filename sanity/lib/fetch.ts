import { unstable_noStore as noStore } from 'next/cache'

import { clientWithoutToken } from '@/sanity/lib/client'

interface SanityFetchOptions {
  query: string
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<T>({
  query,
  tags = [],
}: SanityFetchOptions): Promise<T> {
  noStore()

  return clientWithoutToken.fetch<T>(
    query,
    {},
    {
      cache: 'no-store',
      next: {
        revalidate: 0,
        ...(tags.length > 0 ? { tags } : {}),
      },
    }
  )
}
