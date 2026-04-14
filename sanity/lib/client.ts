import { createClient } from '@sanity/client'

/** Zgodnie z sanity/sanity.config.ts — spójny fallback gdy brak .env lokalnie */
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq'

export const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  // Token tylko dla operacji zapisu (server-side)
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Klient tylko do odczytu (bez tokenu, bez CDN dla świeższych danych)
export const clientWithoutToken = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Wyłączone dla świeższych danych
})
