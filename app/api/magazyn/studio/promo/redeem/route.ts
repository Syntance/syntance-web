import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { getPromoService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

const Body = z.object({ code: z.string().min(1).max(40), email: z.email().max(254) })

/** Właściciel nadaje klientowi kod z darmową licencją / próbą (klucz idzie e-mailem na podany adres). */
export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const input = Body.parse(body)
    return getPromoService().redeem(session.email, input.code, input.email, 'manual')
  })
}
