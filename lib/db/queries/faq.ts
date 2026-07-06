import { asc, eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { faqEntries } from '@/lib/db/schema'
import type {
  FaqPricingEntrySanity,
  FaqSettingsDocument,
  FaqSimpleEntrySanity,
} from '@/lib/data/faq'

const SECTION_MAP: Record<string, keyof FaqSettingsDocument> = {
  home: 'faqHome',
  cennik: 'faqCennik',
  stronyWww: 'faqStronyWww',
  sklepy: 'faqSklepy',
  strategia: 'faqStrategia',
  oNas: 'faqONas',
  kontakt: 'faqKontakt',
  agencje: 'faqAgencje',
}

export async function fetchFaqSettings(): Promise<FaqSettingsDocument | null> {
  if (!hasDb()) return null
  try {
    const db = getDb()
    const rows = await db.select().from(faqEntries).orderBy(asc(faqEntries.sortOrder))
    if (!rows.length) return null

    const doc: FaqSettingsDocument = {}
    for (const row of rows) {
      const key = SECTION_MAP[row.section]
      if (!key) continue
      const list = (doc[key] ??= [])
      if (row.section === 'cennik') {
        list.push({
          _key: row.id,
          question: row.question,
          answer: row.answer,
          category: row.category as FaqPricingEntrySanity['category'],
          order: row.sortOrder,
          isActive: row.isActive,
        } satisfies FaqPricingEntrySanity)
      } else {
        list.push({
          _key: row.id,
          question: row.question,
          answer: row.answer,
          order: row.sortOrder,
          isActive: row.isActive,
        } satisfies FaqSimpleEntrySanity)
      }
    }
    return doc
  } catch (error) {
    console.error('Error fetching FAQ settings from DB:', error)
    return null
  }
}

export async function replaceFaqSection(
  section: string,
  entries: Array<{
    id?: string
    question: string
    answer: string
    category?: string
    sortOrder: number
    isActive: boolean
  }>,
): Promise<void> {
  const db = getDb()
  await db.delete(faqEntries).where(eq(faqEntries.section, section))
  if (!entries.length) return
  await db.insert(faqEntries).values(
    entries.map((entry, index) => ({
      id: entry.id ?? `${section}-${index}`,
      section,
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      sortOrder: entry.sortOrder,
      isActive: entry.isActive,
    })),
  )
}

export async function listFaqEntriesBySection(section: string) {
  if (!hasDb()) return []
  const db = getDb()
  return db
    .select()
    .from(faqEntries)
    .where(eq(faqEntries.section, section))
    .orderBy(asc(faqEntries.sortOrder))
}

const DOC_SECTION_MAP: Array<{ key: keyof FaqSettingsDocument; section: string }> = [
  { key: 'faqHome', section: 'home' },
  { key: 'faqCennik', section: 'cennik' },
  { key: 'faqStronyWww', section: 'stronyWww' },
  { key: 'faqSklepy', section: 'sklepy' },
  { key: 'faqStrategia', section: 'strategia' },
  { key: 'faqONas', section: 'oNas' },
  { key: 'faqKontakt', section: 'kontakt' },
  { key: 'faqAgencje', section: 'agencje' },
]

export async function replaceFaqSettings(doc: FaqSettingsDocument): Promise<void> {
  const db = getDb()
  await db.delete(faqEntries)
  const rows: Array<typeof faqEntries.$inferInsert> = []

  for (const { key, section } of DOC_SECTION_MAP) {
    const entries = doc[key]
    if (!entries?.length) continue
    entries.forEach((entry, index) => {
      const pricing = section === 'cennik'
      rows.push({
        id: entry._key ?? `${section}-${index}`,
        section,
        question: entry.question,
        answer: entry.answer,
        category:
          pricing && 'category' in entry
            ? (entry as FaqPricingEntrySanity).category
            : undefined,
        sortOrder: entry.order ?? index,
        isActive: entry.isActive !== false,
      })
    })
  }

  if (rows.length) await db.insert(faqEntries).values(rows)
}
