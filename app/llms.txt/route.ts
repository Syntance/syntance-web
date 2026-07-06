import { NextResponse } from 'next/server'
import { fetchPricingData } from '@/lib/pricing-data'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { buildLlmsTxt } from '@/lib/llms-txt'

/** Świeże ceny z Postgres — jak /cennik (force-dynamic). */
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await fetchPricingData()
  const mins = getConfiguratorMinimumPricesNet(data)
  const discoveryNet = strategiaWorkshopPriceNet(data)
  const body = buildLlmsTxt({ ...mins, discoveryNet })

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
