/**
 * Kontrakt hubu modułów — kopia z aplikacji desktopowej (folio-pdf/src/shared/hub.ts, ADR 026), bez części UI.
 * Zmiana formatu pakietu/katalogu wymaga równoległej zmiany w aplikacji; test hub-contract.test.ts pilnuje zgodności.
 */
import { z } from 'zod'

/**
 * Hub of modules (ADR 026): package manifest, signed catalog, versions and compatibility.
 * Pure data and helpers shared by main, the renderer and the packaging scripts — no Node, no DOM.
 */

/** Version of the SDK contract between the Hub and modules. A module declares the range it was built for. */
export const HUB_API_VERSION = 1

export const MODULE_CHANNELS = ['stable', 'beta'] as const
export type ModuleChannel = (typeof MODULE_CHANNELS)[number]

const Sha256 = z.string().regex(/^[0-9a-f]{64}$/)
const Semver = z.string().regex(/^\d{1,6}\.\d{1,6}\.\d{1,6}(?:-[0-9A-Za-z][0-9A-Za-z.-]{0,30})?$/)
export const ModuleIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,30}$/)

/** Package-relative file path: forward slashes, no `..`, no absolute or drive paths, no hidden control chars. */
export function isSafeRelativePath(path: string): boolean {
  if (path.length === 0 || path.length > 240) return false
  if (path.startsWith('/') || path.includes('\\') || /^[A-Za-z]:/.test(path) || path.includes('\0')) return false
  return path.split('/').every((part) => part !== '' && part !== '.' && part !== '..' && !/[<>:"|?*]/.test(part) && ![...part].some((c) => c.charCodeAt(0) < 32))
}

const RelPath = z.string().refine(isSafeRelativePath, 'unsafe path')

export const PackageFileSchema = z.object({ path: RelPath, size: z.number().int().nonnegative(), sha256: Sha256 })

export const PackageManifestSchema = z.object({
  schema: z.literal(1),
  id: ModuleIdSchema,
  version: Semver,
  /** `app` = code that registers with the Hub; `data` = files used by other modules (LibreOffice, ONNX models). */
  kind: z.enum(['app', 'data']),
  /** Hub API range this build supports (inclusive). */
  hubApi: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }),
  /** Licence entitlement needed to use the module (`null` = free), see module-registry. */
  entitlement: z.enum(['pro', 'print', 'vector', 'image']).nullable(),
  name: z.object({ pl: z.string().max(80), en: z.string().max(80) }),
  description: z.object({ pl: z.string().max(400), en: z.string().max(400) }),
  /** Renderer entry (ES module) and optional stylesheet, relative to the package root. */
  ui: z.object({ entry: RelPath, css: RelPath.optional() }).nullable(),
  /** Script of this module's utility process (native work), relative to the package root. */
  jobs: z.object({ entry: RelPath, types: z.array(z.string().regex(/^[a-z]+\.[A-Za-z]+$/)).min(1).max(100) }).nullable(),
  /** IPC channels this module owns; main restricts the module to them and applies its entitlement. */
  ipc: z.array(z.string().regex(/^[a-z][A-Za-z0-9]*:[A-Za-z0-9]+$/)).max(200),
  files: z.array(PackageFileSchema).min(1).max(20_000),
  installedSize: z.number().int().positive(),
})
export type PackageManifest = z.infer<typeof PackageManifestSchema>

/** Name of the manifest and its detached signature inside a package. */
export const MANIFEST_FILE = 'module.json'
export const SIGNATURE_FILE = 'module.sig'

/** Structural checks beyond the schema: entries point at listed files, no duplicates, API range is sane. */
export function manifestProblems(m: PackageManifest): string[] {
  const problems: string[] = []
  const paths = new Set<string>()
  for (const f of m.files) {
    const key = f.path.toLowerCase()
    if (paths.has(key)) problems.push(`duplicate file ${f.path}`)
    paths.add(key)
    if (f.path === MANIFEST_FILE || f.path === SIGNATURE_FILE) problems.push(`${f.path} must not be listed`)
  }
  const listed = (p: string | undefined): boolean => p === undefined || m.files.some((f) => f.path === p)
  if (m.ui && (!listed(m.ui.entry) || !listed(m.ui.css))) problems.push('ui entry is not a listed file')
  if (m.jobs && !listed(m.jobs.entry)) problems.push('jobs entry is not a listed file')
  if (m.hubApi.min > m.hubApi.max) problems.push('hubApi.min > hubApi.max')
  if (m.kind === 'data' && (m.ui || m.jobs)) problems.push('data module cannot have ui or jobs')
  return problems
}

/* ───────────── Catalog ───────────── */

export const ReleaseSchema = z.object({
  version: Semver,
  url: z.url({ protocol: /^https?$/ }),
  size: z.number().int().positive(),
  sha256: Sha256,
  hubApi: z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }),
  notes: z.object({ pl: z.string().max(600), en: z.string().max(600) }).optional(),
})
export type Release = z.infer<typeof ReleaseSchema>

export const CatalogSchema = z.object({
  schema: z.literal(1),
  /** Monotonic issue time: a catalog older than the last accepted one is rejected (rollback protection). */
  issuedAt: z.iso.datetime(),
  modules: z.record(ModuleIdSchema, z.object({ channels: z.object({ stable: z.array(ReleaseSchema).max(50), beta: z.array(ReleaseSchema).max(50).default([]) }) })),
})
export type Catalog = z.infer<typeof CatalogSchema>

/** Signed catalog as published: `catalog` is the exact JSON text that was signed. */
export const CatalogEnvelopeSchema = z.object({ catalog: z.string().max(2_000_000), signature: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/) })
export type CatalogEnvelope = z.infer<typeof CatalogEnvelopeSchema>

/* ───────────── Versions ───────────── */

function parts(v: string): { nums: number[]; pre: string | null } {
  const [core = '', pre] = v.split('-', 2)
  return { nums: core.split('.').map(Number), pre: pre ?? null }
}

/** Semver ordering (pre-release < release; pre-release identifiers compared numerically when both are numeric). */
export function compareVersions(a: string, b: string): number {
  const pa = parts(a)
  const pb = parts(b)
  for (let i = 0; i < 3; i++) {
    const d = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0)
    if (d !== 0) return d < 0 ? -1 : 1
  }
  if (pa.pre === pb.pre) return 0
  if (pa.pre === null) return 1
  if (pb.pre === null) return -1
  const ia = pa.pre.split('.')
  const ib = pb.pre.split('.')
  for (let i = 0; i < Math.max(ia.length, ib.length); i++) {
    const x = ia[i]
    const y = ib[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = /^\d+$/.test(x)
    const ny = /^\d+$/.test(y)
    if (nx && ny) {
      if (Number(x) !== Number(y)) return Number(x) < Number(y) ? -1 : 1
    } else if (nx !== ny) return nx ? -1 : 1
    else if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

export const supportsHubApi = (range: { min: number; max: number }, api = HUB_API_VERSION): boolean => api >= range.min && api <= range.max

/** The newest release for a channel that this Hub can run (beta users also see stable releases). */
export function pickRelease(catalog: Catalog, id: string, channel: ModuleChannel, api = HUB_API_VERSION): Release | null {
  const entry = catalog.modules[id]
  if (!entry) return null
  const pool = channel === 'beta' ? [...entry.channels.stable, ...entry.channels.beta] : entry.channels.stable
  const usable = pool.filter((r) => supportsHubApi(r.hubApi, api))
  return usable.sort((a, b) => compareVersions(b.version, a.version))[0] ?? null
}

/** Only strictly newer versions are installed over an existing one (rollback is a separate, explicit action). */
export const isUpgrade = (installed: string | null, candidate: string): boolean => installed === null || compareVersions(candidate, installed) > 0
