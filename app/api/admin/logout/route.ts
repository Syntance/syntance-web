import { NextResponse } from 'next/server'
import { buildClearCookie } from '@/lib/admin-auth'
import { getAdminSession } from '@/lib/admin-session'
import { revokeSession } from '@/lib/admin/accounts'
import { writeAudit } from '@/lib/studio/audit'

export const runtime = 'nodejs'

export async function POST() {
  const session = await getAdminSession()
  if (session) {
    await revokeSession(session.sid)
    await writeAudit({ actor: session.email, action: 'admin.logout', target: session.userId })
  }
  const res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', buildClearCookie())
  return res
}
