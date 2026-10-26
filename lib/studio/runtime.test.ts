import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// runtime.ts importuje moduły zależne od bazy i Next; w teście mapowania błędów podmieniamy je.
vi.mock('@/lib/rate-limit', () => ({ rateLimit: vi.fn(() => Promise.resolve({ ok: true, retryAfter: 0 })) }))
vi.mock('@/lib/studio/audit', () => ({ writeAudit: vi.fn() }))
vi.mock('@/lib/studio/drizzle-store', () => ({ DrizzleStudioStore: class {} }))
vi.mock('@/lib/studio/mailer', () => ({ ResendMailer: class {} }))

import { rateLimit } from '@/lib/rate-limit'
import { StudioHttpError } from './license-service'
import { WebhookSignatureError } from './payments'
import { appPost, errorResponse } from './runtime'

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request('https://syntance.com/api/studio/v1/activate', { method: 'POST', body, headers })

describe('errorResponse', () => {
  it('mapuje błędy domenowe, podpis, walidację i awarie wewnętrzne', async () => {
    const limit = errorResponse(new StudioHttpError(409, 'DEVICE_LIMIT', { maxDevices: 2 }))
    expect(limit.status).toBe(409)
    expect(await limit.json()).toEqual({ error: 'DEVICE_LIMIT', code: 'DEVICE_LIMIT', maxDevices: 2 })
    expect(errorResponse(new WebhookSignatureError('x')).status).toBe(401)
    expect(errorResponse(new SyntaxError('bad json')).status).toBe(400)
    expect(errorResponse(new z.ZodError([])).status).toBe(400)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const internal = errorResponse(new Error('db password leaked in message'))
    expect(internal.status).toBe(500)
    // Szczegóły błędu nie wyciekają do klienta.
    expect(JSON.stringify(await internal.json())).not.toContain('password')
    spy.mockRestore()
  })
})

describe('appPost', () => {
  it('przekazuje sparsowane ciało i zwraca 200 z nagłówkami no-store', async () => {
    const res = await appPost(post('{"a":1}'), (body) => Promise.resolve({ echo: body }))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toEqual({ echo: { a: 1 } })
  })

  it('odrzuca zepsuty JSON (400) i zbyt duże ciało (413)', async () => {
    expect((await appPost(post('{nie json'), () => Promise.resolve({}))).status).toBe(400)
    const big = 'x'.repeat(300 * 1024)
    expect((await appPost(post(big), () => Promise.resolve({}))).status).toBe(413)
  })

  it('zwraca 429 z Retry-After po przekroczeniu limitu', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ ok: false, retryAfter: 42 })
    const res = await appPost(post('{}'), () => Promise.resolve({}))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('42')
  })
})
