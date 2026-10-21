import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { getLicenseDetail } from '@/lib/studio/admin-queries'
import { ENTITLEMENTS } from '@/lib/studio/license-contract'
import { StudioHttpError } from '@/lib/studio/license-service'
import { getLicenseService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('revoke') }),
  z.object({ action: z.literal('reinstate') }),
  z.object({ action: z.literal('limit'), maxDevices: z.number().int() }),
  z.object({ action: z.literal('entitlements'), entitlements: z.array(z.enum(ENTITLEMENTS)) }),
  z.object({ action: z.literal('extend'), until: z.iso.datetime() }),
  z.object({ action: z.literal('remove_device'), deviceId: z.string().regex(/^[0-9a-f]{64}$/) }),
  z.object({ action: z.literal('resend_key') }),
])

type Ctx = { params: Promise<{ id: string }> }
const uuid = z.uuid()

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  return adminRoute(async () => {
    const detail = uuid.safeParse(id).success ? await getLicenseDetail(id) : null
    if (!detail) throw new StudioHttpError(404, 'UNKNOWN_LICENSE')
    return detail
  })
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const input = Action.parse(body)
    const svc = getLicenseService()
    const actor = session.email
    switch (input.action) {
      case 'revoke':
        await svc.setStatus(actor, uuid.parse(id), 'revoked')
        break
      case 'reinstate':
        await svc.setStatus(actor, uuid.parse(id), 'active')
        break
      case 'limit':
        await svc.setDeviceLimit(actor, uuid.parse(id), input.maxDevices)
        break
      case 'entitlements':
        await svc.setEntitlements(actor, uuid.parse(id), input.entitlements)
        break
      case 'extend':
        await svc.extend(actor, uuid.parse(id), input.until)
        break
      case 'remove_device':
        await svc.removeDevice(actor, uuid.parse(id), input.deviceId)
        break
      case 'resend_key':
        return { ok: await svc.resendKey(actor, uuid.parse(id)) }
    }
    return { ok: true }
  })
}
