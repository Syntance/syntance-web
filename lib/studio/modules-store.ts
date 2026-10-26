import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/lib/db'
import { writeAudit } from './audit'
import { CatalogError, buildCatalogText, validatePublish, verifyManifest, type VersionRow, type VersionStatus } from './catalog'
import { StudioHttpError } from './license-service'
import { buildObjectKey, headObject, publicUrlFor, r2ConfigFromEnv } from './storage'

type VersionDbRow = typeof schema.studioModuleVersions.$inferSelect

export const RegisterInput = z.object({
  /** Dokładny tekst module.json i zawartość module.sig z pakietu .fmod. */
  manifestJson: z.string().min(2).max(2_000_000),
  manifestSig: z.string().min(10).max(200),
  channel: z.enum(['stable', 'beta']),
  /** Rozmiar i SHA-256 całego pliku .fmod wgranego do R2 (liczone w przeglądarce). */
  size: z.number().int().positive(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  notesPl: z.string().max(600).default(''),
  notesEn: z.string().max(600).default(''),
})
export type RegisterInput = z.infer<typeof RegisterInput>

export function modulePublicKey(env: NodeJS.ProcessEnv = process.env): string {
  const key = env.STUDIO_MODULE_PUBLIC_KEY?.trim()
  if (!key) throw new StudioHttpError(503, 'MODULE_PUBLIC_KEY_NOT_CONFIGURED')
  return key
}

/** Nazwa pliku pakietu w R2 — wyprowadzana po stronie serwera z zweryfikowanego manifestu, nie z danych klienta. */
export const packageFilename = (id: string, version: string): string => `${id}-${version}.fmod`

const toRow = (r: VersionDbRow): VersionRow => ({
  moduleId: r.moduleId,
  version: r.version,
  channel: r.channel,
  status: r.status,
  url: r.url,
  size: r.size,
  sha256: r.sha256,
  hubApi: { min: r.hubApiMin, max: r.hubApiMax },
  notes: r.notesPl || r.notesEn ? { pl: r.notesPl, en: r.notesEn } : null,
})

export async function listVersions(appSlug = 'studio') {
  const rows = await getDb()
    .select()
    .from(schema.studioModuleVersions)
    .where(eq(schema.studioModuleVersions.appSlug, appSlug))
    .orderBy(schema.studioModuleVersions.moduleId, desc(schema.studioModuleVersions.createdAt))
  return rows.map((r) => ({ ...toRow(r), name: (r.manifest['name'] as { pl?: string } | undefined)?.pl ?? r.moduleId, createdAt: r.createdAt.toISOString() }))
}

export async function registerVersion(actor: string, input: RegisterInput) {
  let manifest
  try {
    manifest = verifyManifest(input.manifestJson, input.manifestSig, modulePublicKey())
  } catch (error) {
    if (error instanceof CatalogError) throw new StudioHttpError(400, error.code, { message: error.message })
    throw error
  }
  const cfg = r2ConfigFromEnv()
  if (!cfg) throw new StudioHttpError(503, 'STORAGE_NOT_CONFIGURED')
  const objectKey = buildObjectKey({ kind: 'module', id: manifest.id, version: manifest.version, filename: packageFilename(manifest.id, manifest.version) })
  const head = await headObject(objectKey, cfg)
  if (!head) throw new StudioHttpError(409, 'UPLOAD_MISSING')
  if (head.size !== input.size) throw new StudioHttpError(409, 'SIZE_MISMATCH', { expected: input.size, actual: head.size })

  const inserted = await getDb()
    .insert(schema.studioModuleVersions)
    .values({
      moduleId: manifest.id,
      version: manifest.version,
      channel: input.channel,
      objectKey,
      url: publicUrlFor(objectKey, cfg),
      size: input.size,
      sha256: input.sha256,
      hubApiMin: manifest.hubApi.min,
      hubApiMax: manifest.hubApi.max,
      notesPl: input.notesPl,
      notesEn: input.notesEn,
      manifest: JSON.parse(input.manifestJson) as Record<string, unknown>,
    })
    .onConflictDoNothing()
    .returning({ id: schema.studioModuleVersions.moduleId })
  // Wersje są niezmienne: ponowna rejestracja tego samego id+wersji jest odrzucana (nowa zawartość = nowy numer wersji).
  if (inserted.length === 0) throw new StudioHttpError(409, 'VERSION_EXISTS')
  await writeAudit({ actor, action: 'module.registered', target: `${manifest.id}@${manifest.version}`, meta: { channel: input.channel, size: input.size } })
  return { moduleId: manifest.id, version: manifest.version }
}

export async function setVersionStatus(actor: string, moduleId: string, version: string, status: VersionStatus): Promise<void> {
  const rows = await getDb()
    .update(schema.studioModuleVersions)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(schema.studioModuleVersions.moduleId, moduleId), eq(schema.studioModuleVersions.version, version)))
    .returning({ id: schema.studioModuleVersions.moduleId })
  if (rows.length === 0) throw new StudioHttpError(404, 'UNKNOWN_VERSION')
  await writeAudit({ actor, action: `module.${status}`, target: `${moduleId}@${version}` })
}

export async function currentCatalog() {
  const [row] = await getDb().select().from(schema.studioCatalogs).orderBy(desc(schema.studioCatalogs.issuedAt)).limit(1)
  return row ?? null
}

/** Szkic do podpisania: wersje `live`, `issuedAt` = teraz (ale zawsze nowszy od ostatnio opublikowanego). */
export async function catalogDraft(now = Date.now()) {
  const rows = (await getDb().select().from(schema.studioModuleVersions)).map(toRow)
  const last = await currentCatalog()
  const issuedAt = new Date(Math.max(now, last ? last.issuedAt.getTime() + 1000 : 0))
  return { text: buildCatalogText(rows, issuedAt), issuedAt: issuedAt.toISOString(), current: last ? { issuedAt: last.issuedAt.toISOString(), publishedBy: last.publishedBy } : null }
}

export async function publishCatalog(actor: string, text: string, signature: string) {
  const last = await currentCatalog()
  let catalog
  try {
    catalog = validatePublish(text, signature, modulePublicKey(), last ? last.issuedAt.toISOString() : null)
  } catch (error) {
    if (error instanceof CatalogError) throw new StudioHttpError(error.code === 'ROLLBACK' ? 409 : 400, error.code, { message: error.message })
    throw error
  }
  const inserted = await getDb()
    .insert(schema.studioCatalogs)
    .values({ issuedAt: new Date(catalog.issuedAt), catalogText: text, signature, publishedBy: actor })
    .onConflictDoNothing()
    .returning({ id: schema.studioCatalogs.id })
  if (inserted.length === 0) throw new StudioHttpError(409, 'ROLLBACK')
  await writeAudit({ actor, action: 'catalog.published', target: catalog.issuedAt, meta: { modules: Object.keys(catalog.modules).length } })
  return { issuedAt: catalog.issuedAt }
}
