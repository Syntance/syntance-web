import { ENTITLEMENTS, type Entitlement } from './license-contract'

/**
 * Katalog funkcji (modułów) aplikacji. Klucze odpowiadają `id` modułów w `folio-pdf/src/shared/module-registry.ts`.
 * `entitlement` = uprawnienie, które aplikacja dziś wymaga dla funkcji (null = darmowa). Katalog żyje w bazie
 * (tabela `studio_features`, edytowalna w panelu) — ta lista to ziarno migracji i wartość domyślna w testach.
 */
export interface FeatureDef {
  key: string
  label: string
  entitlement: Entitlement | null
}

export const DEFAULT_FEATURES: readonly FeatureDef[] = [
  { key: 'viewer', label: 'Przeglądanie, wyszukiwanie i druk', entitlement: null },
  { key: 'comments', label: 'Komentarze i adnotacje', entitlement: null },
  { key: 'organize', label: 'Organizacja stron', entitlement: 'pro' },
  { key: 'board', label: 'Scalanie i dzielenie', entitlement: 'pro' },
  { key: 'images', label: 'Obrazy w PDF', entitlement: 'pro' },
  { key: 'edit', label: 'Edycja treści', entitlement: 'pro' },
  { key: 'design', label: 'Projektowanie (tryb Projekt)', entitlement: 'pro' },
  { key: 'forms', label: 'Formularze', entitlement: 'pro' },
  { key: 'redact', label: 'Redakcja (zaczernianie)', entitlement: 'pro' },
  { key: 'protect', label: 'Zabezpieczanie', entitlement: 'pro' },
  { key: 'ocr', label: 'OCR', entitlement: 'pro' },
  { key: 'signatures', label: 'Podpisy', entitlement: 'pro' },
  { key: 'convert', label: 'Konwersja', entitlement: 'pro' },
  { key: 'batch', label: 'Przetwarzanie wsadowe', entitlement: 'pro' },
  { key: 'compare', label: 'Porównywanie dokumentów', entitlement: 'pro' },
  { key: 'readaloud', label: 'Czytanie na głos', entitlement: 'pro' },
  { key: 'prepress', label: 'Moduł Print (prepress)', entitlement: 'print' },
  { key: 'vector', label: 'Moduł Wektor', entitlement: 'vector' },
  { key: 'image', label: 'Moduł Obraz', entitlement: 'image' },
]

export const ENTITLEMENT_GROUP_LABEL: Record<Entitlement | 'free', string> = {
  free: 'Darmowe',
  pro: 'Pro',
  print: 'Print',
  vector: 'Wektor',
  image: 'Obraz',
}

/** Uprawnienia (zgodne ze starszymi wersjami aplikacji), które niesie zestaw funkcji. Funkcje darmowe nic nie dodają. */
export function deriveEntitlements(keys: readonly string[], catalog: readonly FeatureDef[]): Entitlement[] {
  const wanted = new Set<Entitlement>()
  for (const f of catalog) {
    if (f.entitlement && keys.includes(f.key)) wanted.add(f.entitlement)
  }
  return ENTITLEMENTS.filter((e) => wanted.has(e))
}

/** Wszystkie funkcje, które daje komplet uprawnień (dla licencji sprzed wprowadzenia funkcji). */
export function featuresForEntitlements(entitlements: readonly Entitlement[], catalog: readonly FeatureDef[]): string[] {
  return catalog.filter((f) => f.entitlement !== null && entitlements.includes(f.entitlement)).map((f) => f.key)
}

export function unknownFeatures(keys: readonly string[], catalog: readonly FeatureDef[]): string[] {
  const known = new Set(catalog.map((f) => f.key))
  return keys.filter((k) => !known.has(k))
}
