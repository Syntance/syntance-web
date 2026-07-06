import type { FaqSettingsDocument } from '@/lib/data/faq'
import { defaultFaqHome, simpleFaqToCmsEntries } from '@/lib/data/faq'

/** Uzupełnia puste sekcje FAQ domyślnymi treściami w edytorze CMS (do pierwszego zapisu w bazie). */
export function mergeFaqSettingsForAdmin(
  doc: FaqSettingsDocument | null,
): FaqSettingsDocument {
  const base = doc ?? {}

  if (base.faqHome?.length) return base

  return {
    ...base,
    faqHome: simpleFaqToCmsEntries(defaultFaqHome, 'faqHome'),
  }
}
