import { unstable_noStore as noStore } from 'next/cache'

interface SanityFetchOptions {
  query: string
  tags?: string[]
  revalidate?: number | false
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

export async function sanityFetch<T>({
  query,
}: SanityFetchOptions): Promise<T> {
  // Wyłącz cache - zawsze pobieraj świeże dane
  noStore()
  
  // Użyj natywnego fetch() Next.js zamiast @sanity/client
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Wymuś brak cache
  })
  
  if (!response.ok) {
    throw new Error(`Sanity fetch failed: ${response.status}`)
  }
  
  const data = await response.json()
  return data.result as T
}
