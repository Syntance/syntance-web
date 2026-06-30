import { isPostHogInternalRequest } from '@/lib/posthog-internal'

export const runtime = 'edge'

/** Czy bieżące IP może wysyłać eventy analityczne (GA4 + PostHog). */
export function GET(request: Request): Response {
  const eligible = !isPostHogInternalRequest(request.headers)

  return Response.json(
    { eligible },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  )
}
