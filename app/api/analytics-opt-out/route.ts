import { NextResponse } from 'next/server'
import { INTERNAL_DEVICE_COOKIE_NAME } from '@/lib/posthog-internal'

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/**
 * Wejście na ten URL wyłącza GA4 + PostHog na TYM urządzeniu (cookie, 1 rok),
 * niezależnie od IP/sieci. Dodaj ?undo=1, żeby przywrócić tracking.
 */
export function GET(request: Request): Response {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  const undo = new URL(request.url).searchParams.has('undo')

  const res = NextResponse.json({
    ok: true,
    message: undo
      ? 'Tracking na tym urządzeniu został przywrócony.'
      : 'To urządzenie nie będzie już śledzone przez GA4 i PostHog.',
  })

  res.headers.append(
    'Set-Cookie',
    undo
      ? `${INTERNAL_DEVICE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; ${secure}`
      : `${INTERNAL_DEVICE_COOKIE_NAME}=1; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax; ${secure}`,
  )

  return res
}
