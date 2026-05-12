import { NextResponse } from 'next/server'
import { fetchPricingData } from '@/lib/pricing-data'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

export const revalidate = 120

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
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (e) {
    console.error('[pricing/start-prices]', e)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
