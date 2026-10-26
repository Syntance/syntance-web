import { describe, expect, it } from 'vitest'
import { RETENTION_DAYS, cutoff } from './retention'

describe('retencja', () => {
  it('liczy daty graniczne od podanego "teraz"', () => {
    const now = Date.parse('2026-10-26T00:00:00.000Z')
    expect(cutoff(now, RETENTION_DAYS.audit).toISOString()).toBe('2025-10-26T00:00:00.000Z')
    expect(cutoff(now, 30).toISOString()).toBe('2026-09-26T00:00:00.000Z')
  })
  it('trzyma okresy ustalone w ADR 001', () => {
    expect(RETENTION_DAYS).toEqual({ audit: 365, licenseAfterExpiry: 365, webhookEvents: 90, adminSessions: 30 })
  })
})
