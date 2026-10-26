import { createHash, generateKeyPairSync, sign } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { CatalogError, buildCatalogText, toEnvelope, validatePublish, verifyManifest, verifySignature, type VersionRow } from './catalog'
import { CatalogSchema, HUB_API_VERSION, pickRelease, type PackageManifest } from './hub-contract'

const pair = generateKeyPairSync('ed25519')
const publicKey = pair.publicKey.export({ type: 'spki', format: 'der' }).toString('base64')
const signText = (text: string, key = pair.privateKey): string => sign(null, Buffer.from(text), key).toString('base64')
const sha = (s: string): string => createHash('sha256').update(s).digest('hex')

const row = (over: Partial<VersionRow> = {}): VersionRow => ({
  moduleId: 'vector',
  version: '1.0.0',
  channel: 'stable',
  status: 'live',
  url: 'https://dl.syntance.com/studio/module/vector/1.0.0/vector-1.0.0.fmod',
  size: 2_000_000,
  sha256: sha('vector-1.0.0'),
  hubApi: { min: 1, max: 1 },
  notes: { pl: 'Pierwsze wydanie', en: 'First release' },
  ...over,
})

describe('szkic katalogu', () => {
  it('zawiera tylko wersje live, deterministycznie, zgodnie ze schematem aplikacji', () => {
    const rows = [
      row(),
      row({ version: '1.1.0', url: 'https://dl.syntance.com/studio/module/vector/1.1.0/vector-1.1.0.fmod' }),
      row({ version: '1.2.0-beta.1', channel: 'beta' }),
      row({ version: '0.9.0', status: 'withdrawn' }),
      row({ version: '2.0.0', status: 'staged' }),
      row({ moduleId: 'image', version: '1.0.0', notes: null }),
    ]
    const text = buildCatalogText(rows, new Date('2026-10-26T12:00:00.000Z'))
    expect(buildCatalogText([...rows].reverse(), new Date('2026-10-26T12:00:00.000Z'))).toBe(text)
    const catalog = CatalogSchema.parse(JSON.parse(text))
    expect(Object.keys(catalog.modules)).toEqual(['image', 'vector'])
    expect(catalog.modules['vector']!.channels.stable.map((r) => r.version)).toEqual(['1.1.0', '1.0.0'])
    expect(catalog.modules['vector']!.channels.beta.map((r) => r.version)).toEqual(['1.2.0-beta.1'])
    expect(JSON.stringify(catalog)).not.toContain('0.9.0')
    expect(JSON.stringify(catalog)).not.toContain('2.0.0')
    // Aplikacja wybiera najnowszą zgodną wersję z tego katalogu.
    expect(pickRelease(catalog, 'vector', 'stable', HUB_API_VERSION)?.version).toBe('1.1.0')
    expect(pickRelease(catalog, 'vector', 'beta', HUB_API_VERSION)?.version).toBe('1.2.0-beta.1')
  })

  it('odrzuca dane niezgodne ze schematem (np. zły sha256)', () => {
    expect(() => buildCatalogText([row({ sha256: 'xyz' })], new Date())).toThrow(CatalogError)
  })
})

describe('publikacja katalogu', () => {
  const text = buildCatalogText([row()], new Date('2026-10-26T12:00:00.000Z'))

  it('przyjmuje poprawny podpis i buduje kopertę zgodną z aplikacją', () => {
    expect(validatePublish(text, signText(text), publicKey, null).issuedAt).toBe('2026-10-26T12:00:00.000Z')
    const envelope = toEnvelope(text, signText(text))
    expect(envelope.catalog).toBe(text)
    expect(verifySignature(envelope.catalog, envelope.signature, publicKey)).toBe(true)
  })

  it('odrzuca zły podpis, podpis cudzym kluczem i zmieniony tekst (fail-closed)', () => {
    const other = generateKeyPairSync('ed25519').privateKey
    expect(() => validatePublish(text, signText(text, other), publicKey, null)).toThrow(/SIGNATURE/)
    expect(() => validatePublish(text + ' ', signText(text), publicKey, null)).toThrow(/SIGNATURE/)
    expect(() => validatePublish(text, 'not-base64!', publicKey, null)).toThrow(/SIGNATURE/)
    expect(() => validatePublish(text, signText(text), 'bad-key', null)).toThrow(/SIGNATURE/)
  })

  it('chroni przed cofnięciem: issuedAt musi być nowszy niż ostatni opublikowany', () => {
    const sig = signText(text)
    expect(() => validatePublish(text, sig, publicKey, '2026-10-26T12:00:00.000Z')).toThrow(/ROLLBACK/)
    expect(() => validatePublish(text, sig, publicKey, '2026-10-27T00:00:00.000Z')).toThrow(/ROLLBACK/)
    expect(validatePublish(text, sig, publicKey, '2026-10-26T11:59:59.000Z')).toBeTruthy()
  })

  it('odrzuca podpisany, ale niezgodny ze schematem tekst', () => {
    const bad = JSON.stringify({ schema: 2 })
    expect(() => validatePublish(bad, signText(bad), publicKey, null)).toThrow(/SCHEMA/)
    expect(() => validatePublish('{nie json', signText('{nie json'), publicKey, null)).toThrow(/SCHEMA/)
  })
})

describe('manifest pakietu', () => {
  const manifest: PackageManifest = {
    schema: 1,
    id: 'vector',
    version: '1.0.0',
    kind: 'app',
    hubApi: { min: 1, max: 1 },
    entitlement: 'vector',
    name: { pl: 'Wektor', en: 'Vector' },
    description: { pl: 'Wektoryzacja', en: 'Vectorising' },
    ui: { entry: 'ui.js' },
    jobs: { entry: 'jobs.js', types: ['vector.trace'] },
    ipc: ['vector:trace'],
    files: [
      { path: 'ui.js', size: 10, sha256: sha('ui') },
      { path: 'jobs.js', size: 20, sha256: sha('jobs') },
    ],
    installedSize: 30,
  }
  const json = JSON.stringify(manifest)

  it('weryfikuje podpis wydawcy i schemat', () => {
    expect(verifyManifest(json, signText(json), publicKey).id).toBe('vector')
  })
  it('odrzuca zły podpis i niespójny manifest (entry spoza files)', () => {
    expect(() => verifyManifest(json, signText(json, generateKeyPairSync('ed25519').privateKey), publicKey)).toThrow(/SIGNATURE/)
    const broken = JSON.stringify({ ...manifest, ui: { entry: 'missing.js' } })
    expect(() => verifyManifest(broken, signText(broken), publicKey)).toThrow(/MANIFEST/)
    const traversal = JSON.stringify({ ...manifest, files: [{ path: '../evil.js', size: 1, sha256: sha('x') }] })
    expect(() => verifyManifest(traversal, signText(traversal), publicKey)).toThrow(/MANIFEST/)
  })
})
