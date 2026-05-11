/**
 * Uzupełnia w dokumencie emailTemplates kolory, tła i emotki z DEFAULT_EMAIL_TEMPLATES,
 * nie zmieniając treści tekstowych już zapisanych w CMS.
 *
 * Uruchom: pnpm seed:email-templates
 * Wymaga: SANITY_API_WRITE_TOKEN w środowisku (np. doppler run / .env.local)
 */

import { createClient } from '@sanity/client'
import { DEFAULT_EMAIL_TEMPLATES, type EmailTemplates } from './queries/emailTemplates'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const DOC_ID = 'emailTemplates'

type SectionKey = keyof EmailTemplates

function isAppearanceFieldKey(key: string): boolean {
  if (key === 'headerEmoji') return true
  if (key.endsWith('Color')) return true
  if (key.includes('Gradient')) return true
  return false
}

/** Z defaultów bierze tylko pola „wyglądu” (kolory, tła w *Color / *Background* są już pokryte przez endsWith Color). */
function pickAppearanceDefaults(section: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(section)) {
    if (isAppearanceFieldKey(key)) {
      out[key] = section[key]
    }
  }
  return out
}

function mergeSection(
  existing: Record<string, unknown> | undefined,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const appearance = pickAppearanceDefaults(defaults)
  return { ...(existing ?? {}), ...appearance }
}

async function seedEmailTemplateAppearance(): Promise<void> {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Brak SANITY_API_WRITE_TOKEN — dodaj token z sanity.io/manage (Editor).')
    process.exit(1)
  }

  const sections: SectionKey[] = [
    'contracts',
    'payment',
    'rejection',
    'quoteRequestClient',
    'quoteRequestOwner',
    'contactFormClient',
    'contactFormOwner',
    'meetingBookingClient',
    'meetingBookingOwner',
  ]

  const existing = await client.fetch<Record<string, unknown> | null>(
    `*[_id == $id][0]`,
    { id: DOC_ID },
  )

  if (!existing) {
    await client.createOrReplace({
      _id: DOC_ID,
      _type: DOC_ID,
      ...DEFAULT_EMAIL_TEMPLATES,
    })
    console.log(`✅ Utworzono dokument ${DOC_ID} z pełnymi domyślnymi szablonami.`)
    return
  }

  const patch: Record<string, Record<string, unknown>> = {}
  for (const key of sections) {
    const def = DEFAULT_EMAIL_TEMPLATES[key] as unknown as Record<string, unknown>
    const prev = existing[key] as Record<string, unknown> | undefined
    patch[key] = mergeSection(prev, def)
  }

  await client.patch(DOC_ID).set(patch).commit()

  console.log(`✅ Zaktualizowano kolory, tła i emotki w „${DOC_ID}” (teksty z CMS zachowane).`)
}

seedEmailTemplateAppearance().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
