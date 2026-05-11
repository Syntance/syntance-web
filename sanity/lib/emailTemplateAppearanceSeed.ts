import type { SanityClient } from '@sanity/client'
import { DEFAULT_EMAIL_TEMPLATES, type EmailTemplates } from '../queries/emailTemplates'

export const EMAIL_TEMPLATES_DOC_ID = 'emailTemplates'

type SectionKey = keyof EmailTemplates

function isAppearanceFieldKey(key: string): boolean {
  if (key === 'headerEmoji') return true
  if (key.endsWith('Color')) return true
  if (key.includes('Gradient')) return true
  return false
}

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

/** Kolory, tła, emotki z DEFAULT_EMAIL_TEMPLATES; teksty z CMS bez zmian. */
export async function seedEmailTemplateAppearance(client: SanityClient): Promise<void> {
  const sections: SectionKey[] = [
    'contracts',
    'payment',
    'projectKickoff',
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
    { id: EMAIL_TEMPLATES_DOC_ID },
  )

  if (!existing) {
    await client.createOrReplace({
      _id: EMAIL_TEMPLATES_DOC_ID,
      _type: EMAIL_TEMPLATES_DOC_ID,
      ...DEFAULT_EMAIL_TEMPLATES,
    })
    console.log(`✅ Utworzono dokument ${EMAIL_TEMPLATES_DOC_ID} z pełnymi domyślnymi szablonami.`)
    return
  }

  const patch: Record<string, Record<string, unknown>> = {}
  for (const key of sections) {
    const def = DEFAULT_EMAIL_TEMPLATES[key] as unknown as Record<string, unknown>
    const prev = existing[key] as Record<string, unknown> | undefined
    patch[key] = mergeSection(prev, def)
  }

  await client.patch(EMAIL_TEMPLATES_DOC_ID).set(patch).commit()

  console.log(
    `✅ Zaktualizowano kolory, tła i emotki w „${EMAIL_TEMPLATES_DOC_ID}” (teksty z CMS zachowane).`,
  )
}
