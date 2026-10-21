import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { eraseSubject, exportSubject, listCustomers } from '@/lib/studio/admin-queries'

export const runtime = 'nodejs'

const Email = z.email().max(254)

/** Lista klientów (e-maile z licencji) oraz RODO: eksport (GET ?export=) i wymazanie (DELETE ?email=). */
export function GET(req: Request) {
  const params = new URL(req.url).searchParams
  return adminRoute(async (session) => {
    const exportEmail = params.get('export')
    if (exportEmail) {
      const data = await exportSubject(Email.parse(exportEmail))
      const { writeAudit } = await import('@/lib/studio/audit')
      await writeAudit({ actor: session.email, action: 'subject.exported', target: data.email })
      return data
    }
    return { customers: await listCustomers('studio', params.get('q') ?? '') }
  })
}

export function DELETE(req: Request) {
  const email = new URL(req.url).searchParams.get('email')
  return adminRoute(async (session) => eraseSubject(session.email, Email.parse(email)))
}
