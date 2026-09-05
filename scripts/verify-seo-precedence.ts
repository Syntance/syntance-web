/**
 * Kontrakt priorytetów SEO: CMS (Magazyn → SEO → Podstrony) → wartość z kodu → globalne SEO.
 *
 * Nie wymaga bazy — testuje czystą `resolveSeoFields`. Uruchom: `pnpm verify:seo`.
 * Ten plik pilnuje zachowań, które łatwo zepsuć przy kolejnych zmianach metadanych:
 * pustego pola w panelu, braku wiersza CMS i tego, że twitter odbija podstronę,
 * a nie stronę główną.
 */
import { resolveSeoFields, defaultSeo, type PageMetadataInput } from '@/lib/seo'
import { interpolateText } from '@/lib/interpolate-pricing-faq'
import { SEO_PAGE_CATALOG } from '@/lib/data/seo-page-catalog'
import type { PageSeo } from '@/lib/data/seo-types'

let failures = 0

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) {
    failures += 1
    console.error(`  FAIL  ${name}`)
    console.error(`        oczekiwano: ${JSON.stringify(expected)}`)
    console.error(`        otrzymano:  ${JSON.stringify(actual)}`)
  } else {
    console.log(`  ok    ${name}`)
  }
}

const CODE: PageMetadataInput = {
  path: '/cennik',
  title: 'Tytuł z kodu',
  description: 'Opis z kodu',
  ogTitle: 'OG z kodu',
  ogDescription: 'OG opis z kodu',
  keywords: ['kod'],
}

function page(overrides: Partial<PageSeo>): PageSeo {
  return { pageName: 'Cennik', slug: '/cennik', isActive: true, ...overrides }
}

console.log('\n1. CMS wygrywa z kodem')
{
  const r = resolveSeoFields(
    CODE,
    defaultSeo,
    page({
      metaTitle: 'Tytuł z CMS',
      metaDescription: 'Opis z CMS',
      ogTitle: 'OG z CMS',
      canonicalUrl: 'https://syntance.com/inny',
      ogImageUrl: 'https://syntance.com/og/inny.png',
      keywords: ['cms'],
    }),
  )
  check('metaTitle', r.title, 'Tytuł z CMS')
  check('metaDescription', r.description, 'Opis z CMS')
  check('ogTitle', r.ogTitle, 'OG z CMS')
  check('canonicalUrl', r.canonical, 'https://syntance.com/inny')
  check('ogImageUrl', r.imageUrl, 'https://syntance.com/og/inny.png')
  check('keywords', r.keywords, ['cms'])
}

console.log('\n2. Puste pole w panelu schodzi na kod (nie kasuje metadanej)')
{
  const r = resolveSeoFields(
    CODE,
    defaultSeo,
    page({ metaTitle: '   ', metaDescription: '', canonicalUrl: '', ogImageUrl: '  ' }),
  )
  check('tytuł wraca z kodu', r.title, 'Tytuł z kodu')
  check('opis wraca z kodu', r.description, 'Opis z kodu')
  check('canonical wraca na trasę', r.canonical, 'https://syntance.com/cennik')
  check('obrazek wraca na globalny', r.imageUrl, defaultSeo.ogImageUrl)
}

console.log('\n3. Brak wiersza CMS → wartości z kodu')
{
  const r = resolveSeoFields(CODE, defaultSeo, null)
  check('tytuł', r.title, 'Tytuł z kodu')
  check('canonical', r.canonical, 'https://syntance.com/cennik')
  check('keywords', r.keywords, ['kod'])
}

console.log('\n4. Brak CMS i brak kodu → globalne SEO')
{
  const r = resolveSeoFields({ path: '/' }, defaultSeo, null)
  check('tytuł globalny', r.title, defaultSeo.metaTitle)
  check('opis globalny', r.description, defaultSeo.metaDescription)
  check('canonical strony głównej', r.canonical, defaultSeo.canonicalUrl)
}

console.log('\n5. Twitter odbija podstronę, nie stronę główną')
{
  const r = resolveSeoFields(CODE, defaultSeo, null)
  check('brak twitterTitle z CMS', r.twitterTitle, undefined)
  check(
    'kompozycja schodzi na ogTitle, nie na globalne',
    r.twitterTitle ?? r.ogTitle,
    'OG z kodu',
  )
  const withCms = resolveSeoFields(CODE, defaultSeo, page({ twitterTitle: 'TW z CMS' }))
  check('twitterTitle z CMS wygrywa', withCms.twitterTitle, 'TW z CMS')
}

console.log('\n6. Trasa bez slasha końcowego i strona główna')
{
  check(
    'trailing slash normalizowany',
    resolveSeoFields({ ...CODE, path: '/cennik/' }, defaultSeo, null).canonical,
    'https://syntance.com/cennik',
  )
}

console.log('\n7. Tokeny cenowe w treści z katalogu podstawiają się na kwoty')
{
  const mins = { websiteNet: 10000, ecommerceNet: 20000, webappNet: 50000 }
  const discoveryNet = 4500
  const withTokens = SEO_PAGE_CATALOG.filter((e) =>
    /\{\{[A-Z_]+\}\}/.test(`${e.metaTitle ?? ''}${e.metaDescription ?? ''}${e.ogDescription ?? ''}`),
  )
  // Katalog nie musi używać tokenów — treść może mieć kwoty wpisane wprost,
  // jeśli tak zdecydował redaktor. Pilnujemy tylko tego, że token, jeśli już
  // jest, faktycznie się podstawia i nie trafi na stronę jako `{{...}}`.
  console.log(`  (wpisów z tokenami: ${withTokens.length})`)
  for (const entry of withTokens) {
    const out = interpolateText(entry.metaDescription ?? '', mins, discoveryNet)
    check(`${entry.slug}: brak surowego tokenu po podstawieniu`, /\{\{[A-Z_]+\}\}/.test(out), false)
    check(`${entry.slug}: kwota faktycznie wstawiona`, /\d/.test(out), true)
  }
}

if (failures > 0) {
  console.error(`\n${failures} nieudanych asercji\n`)
  process.exit(1)
}
console.log('\nKontrakt priorytetów SEO: wszystkie asercje przeszły\n')
