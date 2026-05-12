/**
 * Skrypt inicjalizuje singleton `faqSettings` (zakładki po podstronach w Studio).
 * Uruchom: pnpm seed:faq
 * Nadpisanie: SEED_FAQ_FORCE=1 pnpm seed:faq
 */

import { createClient } from '@sanity/client'
import {
  defaultFaqItems,
  defaultFaqStronyWww,
  defaultFaqSklepy,
  defaultFaqStrategia,
  defaultFaqONas,
  defaultFaqKontakt,
  defaultFaqAgencje,
  type PricingFaqItem,
  type SimpleFaqQA,
} from './queries/faq'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const FAQ_SETTINGS_ID = 'faqSettings'

function mapPricing(entries: PricingFaqItem[]) {
  return entries.map((e, index) => ({
    _type: 'faqPricingEntry' as const,
    _key: e._id ?? `cennik-${index}`,
    question: e.question,
    answer: e.answer,
    category: e.category,
    order: e.order ?? index + 1,
    isActive: true,
  }))
}

function mapSimple(entries: SimpleFaqQA[], keyPrefix: string) {
  return entries.map((e, index) => ({
    _type: 'faqSimpleEntry' as const,
    _key: `${keyPrefix}-${index}`,
    question: e.question,
    answer: e.answer,
    order: index + 1,
    isActive: true,
  }))
}

async function seedFaqSettings() {
  const force = process.env.SEED_FAQ_FORCE === '1'
  console.log('\n❓ Singleton FAQ (`faqSettings`)…\n')

  const existing = await client.fetch(`*[_id == $id][0]._id`, { id: FAQ_SETTINGS_ID })
  if (existing && !force) {
    console.log(`⚠️  Dokument ${FAQ_SETTINGS_ID} już istnieje — pomijam.`)
    console.log('   Aby nadpisać domyślne treściami z kodu: SEED_FAQ_FORCE=1 pnpm seed:faq\n')
    return
  }

  const doc = {
    _id: FAQ_SETTINGS_ID,
    _type: 'faqSettings' as const,
    faqCennik: mapPricing(defaultFaqItems),
    faqStronyWww: mapSimple(defaultFaqStronyWww, 'www'),
    faqSklepy: mapSimple(defaultFaqSklepy, 'sklep'),
    faqStrategia: mapSimple(defaultFaqStrategia, 'strategia'),
    faqONas: mapSimple(defaultFaqONas, 'onas'),
    faqKontakt: mapSimple(defaultFaqKontakt, 'kontakt'),
    faqAgencje: mapSimple(defaultFaqAgencje, 'agencje'),
  }

  await client.createOrReplace(doc)
  console.log(`✅ Zapisano ${FAQ_SETTINGS_ID} — zakładki: cennik, strony WWW, sklepy, strategia, o nas, kontakt, agencje.`)
  console.log('\n📝 Sanity Studio → „FAQ — wszystkie podstrony"\n')

  console.log('\n📌 Dokument `pricingFaq` nie jest już używany. Usuń ręcznie stare wpisy, jeśli zostały.')
}

seedFaqSettings().catch((err) => {
  console.error(err)
  process.exit(1)
})
