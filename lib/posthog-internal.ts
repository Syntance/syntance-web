import { getClientIpFromHeaders } from '@/lib/client-ip'

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
  return isPostHogInternalIp(getClientIpFromHeaders(headers))
}
