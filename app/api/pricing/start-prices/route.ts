import { NextResponse } from 'next/server'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

export const dynamic = 'force-dynamic'

/**
 * Publiczne kwoty „od …” (netto) — spójne z meta, FAQ i konfiguratorem.
 * Używane m.in. przez karty ofert na stronie głównej (klient).
 */
export async function GET() {
  try {
    const data = await fetchPricingData()
    const body = getConfiguratorMinimumPricesNet(data)
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (e) {
    console.error('[pricing/start-prices]', e)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
