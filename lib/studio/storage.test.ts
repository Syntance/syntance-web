import { describe, expect, it } from 'vitest'
import {
  IMMUTABLE_CACHE_CONTROL,
  MAX_ARTIFACT_BYTES,
  StorageInputError,
  buildObjectKey,
  presignUpload,
  publicUrlFor,
  r2ConfigFromEnv,
  type R2Config,
} from './storage'

const cfg: R2Config = {
  endpoint: 'https://abc123.r2.cloudflarestorage.com',
  bucket: 'syntance-studio',
  accessKeyId: 'AKIATESTTESTTESTTEST',
  secretAccessKey: 'secret-test-secret-test-secret-test-0000',
  publicBaseUrl: 'https://dl.syntance.com',
}

describe('klucze obiektów', () => {
  it('buduje wersjonowany klucz i publiczny URL', () => {
    const key = buildObjectKey({ kind: 'module', id: 'vector', version: '1.2.0', filename: 'vector-1.2.0.fmod' })
    expect(key).toBe('studio/module/vector/1.2.0/vector-1.2.0.fmod')
    expect(publicUrlFor(key, cfg)).toBe('https://dl.syntance.com/studio/module/vector/1.2.0/vector-1.2.0.fmod')
  })

  it('odrzuca ścieżki, złe rozszerzenia, wersje i identyfikatory', () => {
    const base = { kind: 'module', id: 'vector', version: '1.0.0', filename: 'a.fmod' } as const
    for (const bad of [
      { ...base, filename: '../a.fmod' },
      { ...base, filename: 'a/b.fmod' },
      { ...base, filename: 'a.exe' },
      { ...base, filename: '.fmod' },
      { ...base, filename: 'a..fmod' },
      { ...base, version: '1.0' },
      { ...base, version: '../1.0.0' },
      { ...base, id: 'Vector' },
      { ...base, id: 'a/b' },
    ]) {
      expect(() => buildObjectKey(bad)).toThrow(StorageInputError)
    }
    expect(() => buildObjectKey({ kind: 'installer', id: 'app', version: '1.0.0', filename: 'Setup-1.0.0.exe' })).not.toThrow()
    // .exe tylko jako instalator, nie jako moduł.
    expect(() => buildObjectKey({ kind: 'module', id: 'vector', version: '1.0.0', filename: 'x.exe' })).toThrow()
  })
})

describe('presigned upload', () => {
  it('podpisuje PUT dla jednego klucza, z ograniczonym czasem i wymaganymi nagłówkami', async () => {
    const res = await presignUpload({ kind: 'module', id: 'office', version: '2.0.0', filename: 'office-2.0.0.fmod' }, { size: 236_000_000 }, cfg)
    const url = new URL(res.uploadUrl)
    expect(url.origin).toBe(cfg.endpoint)
    expect(url.pathname).toBe('/syntance-studio/studio/module/office/2.0.0/office-2.0.0.fmod')
    expect(url.searchParams.get('X-Amz-Expires')).toBe('900')
    const signed = url.searchParams.get('X-Amz-SignedHeaders') ?? ''
    expect(signed).toContain('content-type')
    expect(signed).toContain('cache-control')
    expect(res.headers['Cache-Control']).toBe(IMMUTABLE_CACHE_CONTROL)
    expect(res.publicUrl).toBe('https://dl.syntance.com/studio/module/office/2.0.0/office-2.0.0.fmod')
    expect(res.uploadUrl).not.toContain(cfg.secretAccessKey)
  })

  it('odrzuca rozmiar 0, niecałkowity i ponad limit', async () => {
    const ref = { kind: 'model', id: 'u2net', version: '1.0.0', filename: 'u2net.onnx' } as const
    for (const size of [0, -1, 1.5, MAX_ARTIFACT_BYTES + 1]) {
      await expect(presignUpload(ref, { size }, cfg)).rejects.toThrow(StorageInputError)
    }
  })
})

describe('konfiguracja z env', () => {
  const env = {
    STUDIO_R2_ENDPOINT: cfg.endpoint,
    STUDIO_R2_BUCKET: cfg.bucket,
    STUDIO_R2_ACCESS_KEY_ID: cfg.accessKeyId,
    STUDIO_R2_SECRET_ACCESS_KEY: cfg.secretAccessKey,
    STUDIO_DL_BASE_URL: 'https://dl.syntance.com/',
  } as unknown as NodeJS.ProcessEnv
  it('zwraca konfigurację, normalizuje URL i wymaga HTTPS', () => {
    expect(r2ConfigFromEnv(env)?.publicBaseUrl).toBe('https://dl.syntance.com')
    expect(r2ConfigFromEnv({ ...env, STUDIO_DL_BASE_URL: 'http://dl.syntance.com' } as NodeJS.ProcessEnv)).toBeNull()
    expect(r2ConfigFromEnv({ ...env, STUDIO_R2_BUCKET: '' } as NodeJS.ProcessEnv)).toBeNull()
    expect(r2ConfigFromEnv({} as NodeJS.ProcessEnv)).toBeNull()
  })
})
