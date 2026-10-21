import { lookupPrice } from '@/lib/studio/drizzle-store'
import { StudioHttpError } from '@/lib/studio/license-service'
import { errorResponse, getLicenseService, getPaymentProviders, jsonResponse, readBody } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

/**
 * Webhook płatności (Paddle). Kolejność: surowe ciało → weryfikacja podpisu (wewnątrz parseWebhook) → dopiero logika.
 * Bez limitu IP — podpis HMAC odrzuca obce żądania tanio, a Paddle ponawia przy 5xx.
 */
export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  try {
    const { provider: id } = await ctx.params
    const provider = getPaymentProviders().find((p) => p.id === id)
    if (!provider) throw new StudioHttpError(404, 'NOT_FOUND')
    const raw = await readBody(req)
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      headers[key] = value
    })
    const event = await provider.parseWebhook(raw, headers, Date.now(), (priceId) => lookupPrice(provider.id, priceId))
    if (event) await getLicenseService().applyPayment(provider.id, event)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
