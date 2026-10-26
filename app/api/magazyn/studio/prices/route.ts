import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { PriceInput, deletePrice, listPrices, upsertPrice } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

export function GET() {
  return adminRoute(async () => ({ prices: await listPrices('studio') }))
}

export async function PUT(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    await upsertPrice(session.email, PriceInput.parse(body))
    return { ok: true }
  })
}

export async function DELETE(req: Request) {
  const priceId = z.string().min(1).parse(new URL(req.url).searchParams.get('priceId'))
  return adminRoute(async (session) => {
    await deletePrice(session.email, priceId)
    return { ok: true }
  })
}
