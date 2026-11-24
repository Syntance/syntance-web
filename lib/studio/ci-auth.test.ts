import { describe, expect, it } from 'vitest'
import { requireCiToken } from './ci-auth'
import { StudioHttpError } from './license-service'

const TOKEN = 'x'.repeat(40)
const req = (auth?: string) => new Request('https://syntance.com/api/studio/ci/releases', { method: 'POST', headers: auth ? { authorization: auth } : {} })
const code = (fn: () => void): string | null => {
  try {
    fn()
    return null
  } catch (error) {
    return error instanceof StudioHttpError ? `${error.status}:${error.code}` : 'other'
  }
}

describe('requireCiToken', () => {
  it('accepts the configured bearer token', () => {
    expect(code(() => requireCiToken(req(`Bearer ${TOKEN}`), { STUDIO_RELEASE_CI_TOKEN: TOKEN }))).toBeNull()
  })
  it('rejects a missing or wrong token', () => {
    expect(code(() => requireCiToken(req(), { STUDIO_RELEASE_CI_TOKEN: TOKEN }))).toBe('401:UNAUTHORIZED')
    expect(code(() => requireCiToken(req(`Bearer ${'y'.repeat(40)}`), { STUDIO_RELEASE_CI_TOKEN: TOKEN }))).toBe('401:UNAUTHORIZED')
    expect(code(() => requireCiToken(req(TOKEN), { STUDIO_RELEASE_CI_TOKEN: TOKEN }))).toBe('401:UNAUTHORIZED')
  })
  it('stays closed when the secret is missing or too short', () => {
    expect(code(() => requireCiToken(req(`Bearer ${TOKEN}`), {}))).toBe('503:CI_NOT_CONFIGURED')
    expect(code(() => requireCiToken(req('Bearer short'), { STUDIO_RELEASE_CI_TOKEN: 'short' }))).toBe('503:CI_NOT_CONFIGURED')
  })
})
