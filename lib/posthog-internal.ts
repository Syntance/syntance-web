import { getClientIpFromHeaders } from '@/lib/client-ip'

/** Cookie ustawiany przez /api/analytics-opt-out — wyłącza tracking na danym urządzeniu bez względu na IP. */
export const INTERNAL_DEVICE_COOKIE_NAME = 'sy_internal'

function hasInternalDeviceCookie(headers: Headers): boolean {
  const cookie = headers.get('cookie')
  if (!cookie) return false
  return cookie
    .split(';')
    .some((pair) => pair.trim().startsWith(`${INTERNAL_DEVICE_COOKIE_NAME}=`))
}

/** IP-y (publiczne), które nie wysyłają eventów do PostHog — tylko server env. */
export function parsePostHogInternalIps(
  raw = process.env.POSTHOG_INTERNAL_IPS,
): ReadonlySet<string> {
  if (!raw?.trim()) return new Set()

  return new Set(
    raw
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean),
  )
}

export function isPostHogInternalIp(
  ip: string,
  internalIps = parsePostHogInternalIps(),
): boolean {
  if (!ip || ip === '0.0.0.0' || internalIps.size === 0) return false
  return internalIps.has(ip)
}

export function isPostHogInternalRequest(headers: Headers): boolean {
  return isPostHogInternalIp(getClientIpFromHeaders(headers)) || hasInternalDeviceCookie(headers)
}
