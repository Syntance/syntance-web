import { unstable_noStore as noStore } from 'next/cache'

import { clientWithoutToken } from '@/sanity/lib/client'

interface SanityFetchOptions {
  query: string
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<T>({
  query,
}: SanityFetchOptions): Promise<T> {
  // Wyłącz cache Next.js — zawsze świeże dane po stronie serwera
  noStore()

  return clientWithoutToken.fetch<T>(query, {}, { next: { revalidate: 0 } })
}
