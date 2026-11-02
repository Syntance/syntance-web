import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { CustomerListParams, eraseSubject, exportSubject, getCustomerDetail, listCustomers } from '@/lib/studio/admin-queries'
import { writeAudit } from '@/lib/studio/audit'
import { StudioHttpError, customerId } from '@/lib/studio/license-service'
import { getLicenseService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

const Email = z.email().max(254)
const Block = z.object({ email: Email, blocked: z.boolean(), reason: z.string().max(300).default('') })

/** Lista klientów (e-maile z licencji), szczegóły (?id=sha256) oraz RODO: eksport (?export=) i wymazanie (DELETE ?email=). */
export function GET(req: Request) {
  const raw = Object.fromEntries(new URL(req.url).searchParams)
  return adminRoute(async (session) => {
    if (raw.export) {
      const data = await exportSubject(Email.parse(raw.export))
      await writeAudit({ actor: session.email, action: 'subject.exported', target: customerId(data.email) })
      return data
    }
    if (raw.id) {
      const detail = await getCustomerDetail('studio', raw.id)
      if (!detail) throw new StudioHttpError(404, 'UNKNOWN_CUSTOMER')
      return detail
    }
    return listCustomers('studio', CustomerListParams.parse(raw))
  })
}

/** Blokada / odblokowanie klienta (jego licencje przestają działać przy następnej walidacji online). */
export async function PATCH(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const input = Block.parse(body)
    await getLicenseService().setCustomerBlocked(session.email, input.email, input.blocked, input.reason)
    return { ok: true }
  })
}

export function DELETE(req: Request) {
  const email = new URL(req.url).searchParams.get('email')
  return adminRoute(async (session) => eraseSubject(session.email, Email.parse(email)))
}
