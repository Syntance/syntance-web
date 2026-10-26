import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Magazyn plików Studio na Cloudflare R2 (API zgodne z S3). Duże pliki (instalator, moduły, modele) trafiają
 * tu, a użytkownicy pobierają je z `https://dl.syntance.com` (domena R2 za CDN Cloudflare, brak opłat za egress).
 * Wgrywanie: przeglądarka właściciela → presigned PUT prosto do R2 (omija limit body funkcji Vercel ~4,5 MB).
 * Sekrety R2 tylko w env (Vercel, Sensitive); token ograniczony do jednego bucketu (Object Read & Write).
 */

export interface R2Config {
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /** Publiczna baza URL pobierania, np. https://dl.syntance.com (bez końcowego "/"). */
  publicBaseUrl: string
}

export function r2ConfigFromEnv(env: NodeJS.ProcessEnv = process.env): R2Config | null {
  const endpoint = env.STUDIO_R2_ENDPOINT?.trim()
  const bucket = env.STUDIO_R2_BUCKET?.trim()
  const accessKeyId = env.STUDIO_R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = env.STUDIO_R2_SECRET_ACCESS_KEY?.trim()
  const publicBaseUrl = env.STUDIO_DL_BASE_URL?.trim()
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) return null
  if (!/^https:\/\//.test(endpoint) || !/^https:\/\//.test(publicBaseUrl)) return null
  return { endpoint, bucket, accessKeyId, secretAccessKey, publicBaseUrl: publicBaseUrl.replace(/\/+$/, '') }
}

/** Rodzaje artefaktów i dozwolone rozszerzenia (nic wykonywalnego poza instalatorem aplikacji). */
export const ARTIFACT_KINDS = {
  /** Pakiet modułu .fmod (podpisany manifest). */
  module: ['.fmod'],
  /** Instalator Hub (electron-builder) i pliki aktualizacji. */
  installer: ['.exe', '.msi', '.msix', '.blockmap', '.yml'],
  /** Dane dużych modułów (modele ONNX, LibreOffice) – też jako .fmod, ale dopuszczamy surowy model. */
  model: ['.fmod', '.onnx'],
} as const
export type ArtifactKind = keyof typeof ARTIFACT_KINDS

export const MAX_ARTIFACT_BYTES = 1024 * 1024 * 1024 // 1 GiB (pojedynczy PUT w R2 ≤ 5 GiB)
export const PRESIGN_TTL_SECONDS = 900

const ID = /^[a-z][a-z0-9-]{1,30}$/
const SEMVER = /^\d{1,6}\.\d{1,6}\.\d{1,6}(?:-[0-9A-Za-z][0-9A-Za-z.-]{0,30})?$/
const FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/

export class StorageInputError extends Error {}

export interface ObjectRef {
  kind: ArtifactKind
  /** Id modułu albo "hub"/"app" dla instalatora. */
  id: string
  version: string
  filename: string
}

/** Klucz obiektu: `studio/<kind>/<id>/<version>/<plik>` — wersjonowany, więc cache może być `immutable`. */
export function buildObjectKey(ref: ObjectRef): string {
  if (!(ref.kind in ARTIFACT_KINDS)) throw new StorageInputError('Nieznany rodzaj pliku.')
  if (!ID.test(ref.id)) throw new StorageInputError('Niepoprawny identyfikator.')
  if (!SEMVER.test(ref.version)) throw new StorageInputError('Niepoprawna wersja (semver).')
  if (!FILENAME.test(ref.filename) || ref.filename.includes('..')) throw new StorageInputError('Niepoprawna nazwa pliku.')
  const ext = ref.filename.slice(ref.filename.lastIndexOf('.')).toLowerCase()
  if (!(ARTIFACT_KINDS[ref.kind] as readonly string[]).includes(ext)) {
    throw new StorageInputError(`Niedozwolone rozszerzenie ${ext} dla rodzaju ${ref.kind}.`)
  }
  return `studio/${ref.kind}/${ref.id}/${ref.version}/${ref.filename}`
}

export const publicUrlFor = (key: string, cfg: Pick<R2Config, 'publicBaseUrl'>): string =>
  `${cfg.publicBaseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`

/** Pliki wersjonowane są niezmienne — przeglądarki i CDN trzymają je rok. */
export const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

const clients = new Map<string, S3Client>()
function client(cfg: R2Config): S3Client {
  const cacheKey = `${cfg.endpoint}|${cfg.accessKeyId}`
  let c = clients.get(cacheKey)
  if (!c) {
    c = new S3Client({
      region: 'auto',
      endpoint: cfg.endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
      requestChecksumCalculation: 'WHEN_REQUIRED',
    })
    clients.set(cacheKey, c)
  }
  return c
}

export interface PresignedUpload {
  key: string
  uploadUrl: string
  publicUrl: string
  /** Nagłówki, które przeglądarka MUSI wysłać z PUT (są częścią podpisu). */
  headers: Record<string, string>
  expiresInSeconds: number
}

export async function presignUpload(
  ref: ObjectRef,
  meta: { size: number; contentType?: string },
  cfg: R2Config,
): Promise<PresignedUpload> {
  if (!Number.isInteger(meta.size) || meta.size <= 0 || meta.size > MAX_ARTIFACT_BYTES) {
    throw new StorageInputError(`Rozmiar pliku: 1 B – ${MAX_ARTIFACT_BYTES / 1024 / 1024} MB.`)
  }
  const key = buildObjectKey(ref)
  const contentType = meta.contentType ?? 'application/octet-stream'
  const uploadUrl = await getSignedUrl(
    client(cfg),
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: meta.size,
      CacheControl: IMMUTABLE_CACHE_CONTROL,
    }),
    { expiresIn: PRESIGN_TTL_SECONDS, signableHeaders: new Set(['content-type', 'content-length', 'cache-control']) },
  )
  return {
    key,
    uploadUrl,
    publicUrl: publicUrlFor(key, cfg),
    headers: { 'Content-Type': contentType, 'Cache-Control': IMMUTABLE_CACHE_CONTROL },
    expiresInSeconds: PRESIGN_TTL_SECONDS,
  }
}

/** Sprawdza, że obiekt istnieje i ma oczekiwany rozmiar (po wgraniu z przeglądarki). */
export async function headObject(key: string, cfg: R2Config): Promise<{ size: number } | null> {
  try {
    const res = await client(cfg).send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }), { abortSignal: AbortSignal.timeout(10_000) })
    return { size: res.ContentLength ?? 0 }
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
    if (status === 404) return null
    throw error
  }
}

export async function deleteObject(key: string, cfg: R2Config): Promise<void> {
  await client(cfg).send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }), { abortSignal: AbortSignal.timeout(10_000) })
}
