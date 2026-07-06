import { NextResponse } from 'next/server'
import { fetchPricingData } from '@/lib/pricing-data'
import { discoveryPriceNetFromConfig } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { buildLlmsTxt } from '@/lib/llms-txt'

/** ISR — te same minima co meta /cennik i konfigurator (Magazyn → Cennik). */
export const revalidate = 300

export async function GET() {
  const data = await fetchPricingData()
  const mins = getConfiguratorMinimumPricesNet(data)
  const discoveryNet = discoveryPriceNetFromConfig(data.config)
  const body = buildLlmsTxt({ ...mins, discoveryNet })

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
