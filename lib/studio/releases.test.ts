import { describe, expect, it } from 'vitest'
import { ReleaseInput } from './releases'

const ok = { version: '0.1.12-beta', channel: 'beta' as const, filename: 'Syntance-Studio-Setup-0.1.12-beta.exe', size: 156_131_508, sha256: 'a'.repeat(64) }

describe('wydanie: walidacja wejścia', () => {
  it('przyjmuje poprawne dane i wypełnia notatkę', () => {
    expect(ReleaseInput.parse(ok)).toMatchObject({ version: '0.1.12-beta', notesPl: '' })
    expect(ReleaseInput.parse({ ...ok, filename: 'setup.msi', version: '1.0.0', channel: 'stable' })).toBeTruthy()
  })

  it('odrzuca pliki spoza instalatorów (np. .blockmap, .zip, .html) i ścieżki w nazwie', () => {
    for (const filename of ['setup.blockmap', 'latest.yml', 'archiwum.zip', 'strona.html', '../setup.exe', 'a/b.exe', '.exe']) {
      expect(() => ReleaseInput.parse({ ...ok, filename })).toThrow()
    }
  })

  it('odrzuca zły semver, rozmiar i sumę kontrolną', () => {
    expect(() => ReleaseInput.parse({ ...ok, version: 'latest' })).toThrow()
    expect(() => ReleaseInput.parse({ ...ok, version: '1.0' })).toThrow()
    expect(() => ReleaseInput.parse({ ...ok, size: 0 })).toThrow()
    expect(() => ReleaseInput.parse({ ...ok, size: 2 * 1024 * 1024 * 1024 })).toThrow()
    expect(() => ReleaseInput.parse({ ...ok, sha256: 'xyz' })).toThrow()
    expect(() => ReleaseInput.parse({ ...ok, channel: 'nightly' })).toThrow()
  })
})
