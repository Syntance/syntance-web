import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, hasDb, schema } from '@/lib/db'
import { writeAudit } from './audit'
import { StudioHttpError } from './license-service'
import { buildObjectKey, deleteObject, headObject, publicUrlFor, r2ConfigFromEnv, StorageInputError } from './storage'

/** Rozszerzenia instalatora, które mogą trafić na publiczną stronę (bez .blockmap/.yml). */
const INSTALLER_EXTENSIONS = ['.exe', '.msi', '.msix'] as const

export const ReleaseInput = z.object({
  version: z.string().regex(/^\d{1,6}\.\d{1,6}\.\d{1,6}(?:-[0-9A-Za-z][0-9A-Za-z.-]{0,30})?$/, 'Wersja w formacie semver, np. 0.1.12-beta'),
  channel: z.enum(['stable', 'beta']),
  filename: z
    .string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/)
    .refine((f) => INSTALLER_EXTENSIONS.some((e) => f.toLowerCase().endsWith(e)), 'Dozwolone: .exe, .msi, .msix'),
  size: z.number().int().positive().max(1024 * 1024 * 1024),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  notesPl: z.string().max(1000).default(''),
})
export type ReleaseInput = z.input<typeof ReleaseInput>

export interface ReleaseRow {
  id: string
  version: string
  channel: 'stable' | 'beta'
  platform: 'win'
  filename: string
  url: string
  size: number
  sha256: string
  notesPl: string
  published: boolean
  publishedAt: string | null
  createdAt: string
}

type Row = typeof schema.studioReleases.$inferSelect

const toRow = (r: Row): ReleaseRow => ({
  id: r.id,
  version: r.version,
  channel: r.channel,
  platform: r.platform,
  filename: r.filename,
  url: r.url,
  size: r.size,
  sha256: r.sha256,
  notesPl: r.notesPl,
  published: r.published,
  publishedAt: r.publishedAt?.toISOString() ?? null,
  createdAt: r.createdAt.toISOString(),
})

const isUniqueViolation = (error: unknown): boolean => {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

function storage() {
  const cfg = r2ConfigFromEnv()
  if (!cfg) throw new StudioHttpError(503, 'STORAGE_NOT_CONFIGURED')
  return cfg
}

export async function listReleases(): Promise<ReleaseRow[]> {
  const rows = await getDb().select().from(schema.studioReleases).orderBy(desc(schema.studioReleases.createdAt)).limit(200)
  return rows.map(toRow)
}

/** Rejestruje plik już wgrany do R2 (presigned PUT). Sprawdza, że obiekt istnieje i ma deklarowany rozmiar. */
export async function registerRelease(actor: string, input: ReleaseInput): Promise<ReleaseRow> {
  const parsed = ReleaseInput.parse(input)
  const cfg = storage()
  let key: string
  try {
    key = buildObjectKey({ kind: 'installer', id: 'app', version: parsed.version, filename: parsed.filename })
  } catch (error) {
    if (error instanceof StorageInputError) throw new StudioHttpError(400, 'INVALID_INPUT', { message: error.message })
    throw error
  }
  const head = await headObject(key, cfg)
  if (!head) throw new StudioHttpError(400, 'OBJECT_MISSING')
  if (head.size !== parsed.size) throw new StudioHttpError(400, 'SIZE_MISMATCH')
  try {
    const [row] = await getDb()
      .insert(schema.studioReleases)
      .values({
        version: parsed.version,
        channel: parsed.channel,
        filename: parsed.filename,
        objectKey: key,
        url: publicUrlFor(key, cfg),
        size: parsed.size,
        sha256: parsed.sha256,
        notesPl: parsed.notesPl,
      })
      .returning()
    if (!row) throw new Error('insert returned no row')
    await writeAudit({ actor, action: 'release.registered', target: row.id, meta: { version: parsed.version, channel: parsed.channel } })
    return toRow(row)
  } catch (error) {
    if (isUniqueViolation(error)) throw new StudioHttpError(409, 'RELEASE_EXISTS')
    throw error
  }
}

export async function setReleasePublished(actor: string, id: string, published: boolean): Promise<void> {
  const rows = await getDb()
    .update(schema.studioReleases)
    .set({ published, publishedAt: published ? new Date() : null })
    .where(eq(schema.studioReleases.id, id))
    .returning({ version: schema.studioReleases.version })
  if (rows.length === 0) throw new StudioHttpError(404, 'UNKNOWN_RELEASE')
  await writeAudit({ actor, action: published ? 'release.published' : 'release.unpublished', target: id, meta: { version: rows[0]?.version } })
}

/** Usuwa wydanie (rekord i plik w R2) — tylko nieopublikowane. */
export async function deleteRelease(actor: string, id: string): Promise<void> {
  const [row] = await getDb().select().from(schema.studioReleases).where(eq(schema.studioReleases.id, id)).limit(1)
  if (!row) throw new StudioHttpError(404, 'UNKNOWN_RELEASE')
  if (row.published) throw new StudioHttpError(409, 'RELEASE_PUBLISHED')
  const cfg = r2ConfigFromEnv()
  if (cfg) await deleteObject(row.objectKey, cfg)
  await getDb().delete(schema.studioReleases).where(eq(schema.studioReleases.id, id))
  await writeAudit({ actor, action: 'release.deleted', target: id, meta: { version: row.version } })
}

/** Najnowsze opublikowane wydanie kanału (dla publicznej strony). Null przy braku bazy lub wydania. */
export async function getLatestRelease(channel: 'stable' | 'beta' = 'stable'): Promise<ReleaseRow | null> {
  if (!hasDb()) return null
  const [row] = await getDb()
    .select()
    .from(schema.studioReleases)
    .where(and(eq(schema.studioReleases.published, true), eq(schema.studioReleases.channel, channel), eq(schema.studioReleases.platform, 'win')))
    .orderBy(desc(schema.studioReleases.publishedAt))
    .limit(1)
  return row ? toRow(row) : null
}

/** Najnowsze zarejestrowane wydanie dowolnego kanału, także nieopublikowane — dla ukrytej strony testowej (/pobieranie/test). */
export async function getLatestAnyRelease(): Promise<ReleaseRow | null> {
  if (!hasDb()) return null
  const [row] = await getDb()
    .select()
    .from(schema.studioReleases)
    .where(eq(schema.studioReleases.platform, 'win'))
    .orderBy(desc(schema.studioReleases.createdAt))
    .limit(1)
  return row ? toRow(row) : null
}
