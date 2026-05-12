/**
 * Skrypt inicjalizuje singleton `faqSettings` (zakładki po podstronach w Studio).
 *
 * Preferencja: bez API tokenów w pliku → `pnpm seed:faq:cli` (sanity login).
 *
 * Opcja z tokenem: SANITY_API_WRITE_TOKEN w środowisku (patrz env.example).
 * Uruchom: pnpm seed:faq  |  Nadpisanie: SEED_FAQ_FORCE=1 pnpm seed:faq
 */

import { createClient } from '@sanity/client'
import { seedFaqSettingsDocument } from './lib/seedFaqSettingsDocument'

if (!process.env.SANITY_API_WRITE_TOKEN?.trim()) {
  console.error('❌ Brak SANITY_API_WRITE_TOKEN w środowisku.')
  console.error('')
  console.error('   • Zalogowany CLI (zalecane):  pnpm seed:faq:cli')
  console.error('   • Lub token Editor w .env.local: SANITY_API_WRITE_TOKEN=...')
  console.error('')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

seedFaqSettingsDocument(client).catch((err) => {
  console.error(err)
  process.exit(1)
})
