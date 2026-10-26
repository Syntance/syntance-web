import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-session'
import type { VerifiedSession } from '@/lib/admin-session'
import { errorResponse } from './runtime'

/** Opakowanie tras panelu: sesja z bazy (401 bez niej), spójne błędy, brak cache. */
export async function adminRoute(handler: (session: VerifiedSession) => Promise<unknown>): Promise<NextResponse> {
  let session: VerifiedSession
  try {
    session = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
  try {
    return NextResponse.json(await handler(session), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
