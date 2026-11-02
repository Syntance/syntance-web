import { z } from 'zod'
import { appPost, getPromoService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

const Body = z.object({ code: z.string().min(1).max(40), email: z.email().max(254) })

/**
 * Wykorzystanie kodu z darmową licencją / próbą (np. ze strony lub z aplikacji). Klucz idzie WYŁĄCZNIE e-mailem.
 * Limit 30 żądań/min na IP (appPost) + jednorazowość kodu na e-mail + limit użyć kodu.
 */
export function POST(req: Request) {
  return appPost(req, async (body) => {
    const { code, email } = Body.parse(body)
    await getPromoService().redeem('redeem', code, email, 'redeem')
    return { ok: true }
  })
}
