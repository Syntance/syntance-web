import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { writeAudit } from './audit'
import { privateKeyFromPem } from './certificate'
import { DrizzleStudioStore } from './drizzle-store'
import { LicenseService, StudioHttpError } from './license-service'
import { ResendMailer } from './mailer'
import { PaddleProvider, WebhookSignatureError, type PaymentProvider } from './payments'

let service: LicenseService | null = null

/** Serwis licencji z produkcyjnymi zależnościami. Klucz prywatny pochodzi wyłącznie z env (sekrety Vercel). */
export function getLicenseService(): LicenseService {
  if (service) return service
  const pem = process.env.LICENSE_PRIVATE_KEY
  if (!pem) throw new Error('LICENSE_PRIVATE_KEY is not configured')
  service = new LicenseService({
    store: new DrizzleStudioStore(),
    privateKey: privateKeyFromPem(pem),
    mailer: new ResendMailer(),
    audit: writeAudit,
  })
  return service
}

export function getPaymentProviders(): PaymentProvider[] {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  return secret ? [new PaddleProvider(secret)] : []
}

const MAX_BODY_BYTES = 256 * 1024

const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } as const

export const jsonResponse = (status: number, body: unknown, extra: Record<string, string> = {}): NextResponse =>
  NextResponse.json(body, { status, headers: { ...HEADERS, ...extra } })

/** Odczyt ciała z twardym limitem rozmiaru (nagłówek Content-Length bywa fałszowany — liczymy bajty). */
export async function readBody(req: Request): Promise<Buffer> {
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY_BYTES) throw new StudioHttpError(413, 'TOO_LARGE')
  const buf = Buffer.from(await req.arrayBuffer())
  if (buf.length > MAX_BODY_BYTES) throw new StudioHttpError(413, 'TOO_LARGE')
  return buf
}

/** Jednolite mapowanie błędów na odpowiedzi API ({ error, code, ... } jak w dotychczasowym serwerze licencji). */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof StudioHttpError) {
    return jsonResponse(error.status, { error: error.code, code: error.code, ...error.extra })
  }
  if (error instanceof WebhookSignatureError) return jsonResponse(401, { error: 'INVALID_SIGNATURE', code: 'INVALID_SIGNATURE' })
  if (error instanceof z.ZodError || error instanceof SyntaxError) return jsonResponse(400, { error: 'INVALID_INPUT', code: 'INVALID_INPUT' })
  console.error('[studio-api] błąd wewnętrzny', error)
  return jsonResponse(500, { error: 'INTERNAL', code: 'INTERNAL' })
}

/**
 * Wspólna obsługa POST aplikacji desktopowej: limit 30 żądań/min na IP (Upstash, fail-open z głośnym logiem),
 * ciało JSON do 256 KB, mapowanie błędów.
 */
export async function appPost(req: Request, handler: (body: unknown) => Promise<unknown>): Promise<NextResponse> {
  try {
    const ip = getClientIpFromHeaders(req.headers)
    const limit = await rateLimit({ key: `studio:ip:${ip}`, limit: 30, windowSec: 60, failOpen: true })
    if (!limit.ok) return jsonResponse(429, { error: 'RATE_LIMITED', code: 'RATE_LIMITED' }, { 'Retry-After': String(limit.retryAfter) })
    const raw = await readBody(req)
    const body: unknown = raw.length > 0 ? JSON.parse(raw.toString('utf8')) : {}
    return jsonResponse(200, await handler(body))
  } catch (error) {
    return errorResponse(error)
  }
}
