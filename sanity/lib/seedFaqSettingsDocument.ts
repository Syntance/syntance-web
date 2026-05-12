/**
 * Tworzy / aktualizuje singleton `faqSettings`.
 * Wywoływane z seed-faq.ts lub sanity exec (--with-user-token).
 */

import type { SanityClient } from '@sanity/client'
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
} from '../queries/faq'

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

export async function seedFaqSettingsDocument(client: SanityClient): Promise<void> {
  const force = process.env.SEED_FAQ_FORCE === '1'
  console.log('\n❓ Singleton FAQ (`faqSettings`)…\n')

  const existing = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: FAQ_SETTINGS_ID })
  if (existing && !force) {
    console.log(`⚠️  Dokument ${FAQ_SETTINGS_ID} już istnieje — pomijam.`)
    console.log('   Nadpisz: SEED_FAQ_FORCE=1 pnpm seed:faq — albo: SEED_FAQ_FORCE=1 pnpm seed:faq:cli\n')
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
  console.log(`✅ Zapisano ${FAQ_SETTINGS_ID} — zakładki: cennik, WWW, sklepy, strategia, o nas, kontakt, agencje.`)
  console.log('\n📝 Studio → „FAQ — wszystkie podstrony”\n')
  console.log('📌 Stare dokumenty `_type == "pricingFaq"` usuń w Vision, jeśli zostały.')
}
