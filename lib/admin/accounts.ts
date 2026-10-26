import { createHmac } from 'node:crypto'
import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { SESSION_TTL_SECONDS } from '@/lib/admin-auth'
import { parseEncryptionKey } from './crypto'

/** Operacje bazodanowe konta właściciela panelu: użytkownik, TOTP, kody zapasowe, sesje. */

export const encryptionKey = (): Buffer => parseEncryptionKey(process.env.ADMIN_ENC_KEY)

/** Pseudonimizacja IP do przeglądu sesji i audytu — nie przechowujemy surowych adresów. */
export function hashIp(ip: string): string {
  const secret = process.env.ADMIN_COOKIE_SECRET ?? ''
  return createHmac('sha256', secret).update(`ip:${ip}`).digest('hex').slice(0, 32)
}

export type AdminUser = typeof schema.adminUsers.$inferSelect

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const [row] = await getDb().select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email.trim().toLowerCase())).limit(1)
  return row ?? null
}

export async function hasEnabledAdmin(): Promise<boolean> {
  const rows = await getDb()
    .select({ id: schema.adminUsers.id })
    .from(schema.adminUsers)
    .where(sql`${schema.adminUsers.totpEnabledAt} is not null`)
    .limit(1)
  return rows.length > 0
}

/** Zakłada konto w stanie „TOTP jeszcze niepotwierdzony”; wcześniejsze niedokończone konfiguracje są zastępowane. */
export async function createPendingAdmin(input: { email: string; passwordHash: string; totpSecretEnc: string }): Promise<void> {
  const db = getDb()
  await db.delete(schema.adminUsers).where(isNull(schema.adminUsers.totpEnabledAt))
  await db.insert(schema.adminUsers).values({
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    totpSecretEnc: input.totpSecretEnc,
  })
}

export async function enableTotp(userId: string, step: number, backupCodeHashes: string[]): Promise<void> {
  await getDb()
    .update(schema.adminUsers)
    .set({ totpEnabledAt: new Date(), totpLastStep: step, backupCodeHashes })
    .where(eq(schema.adminUsers.id, userId))
}

/** Atomowo zapisuje użyty krok TOTP; false = kod z tego kroku (lub starszego) był już wykorzystany. */
export async function consumeTotpStep(userId: string, step: number): Promise<boolean> {
  const rows = await getDb()
    .update(schema.adminUsers)
    .set({ totpLastStep: step })
    .where(and(eq(schema.adminUsers.id, userId), sql`(${schema.adminUsers.totpLastStep} is null or ${schema.adminUsers.totpLastStep} < ${step})`))
    .returning({ id: schema.adminUsers.id })
  return rows.length > 0
}

/** Atomowo zużywa kod zapasowy; false = nie ma takiego (albo był już użyty). */
export async function consumeBackupCode(userId: string, codeHash: string): Promise<boolean> {
  const res = await getDb().execute(sql`
    update admin_users
    set backup_code_hashes = coalesce(
      (select jsonb_agg(x) from jsonb_array_elements_text(backup_code_hashes) as x where x <> ${codeHash}), '[]'::jsonb)
    where id = ${userId}::uuid and backup_code_hashes ? ${codeHash}
    returning id
  `)
  return res.rows.length > 0
}

export async function createSession(userId: string, ipHash: string, userAgent: string): Promise<string> {
  const [row] = await getDb()
    .insert(schema.adminSessions)
    .values({
      userId,
      ipHash,
      userAgent: userAgent.slice(0, 200),
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    })
    .returning({ id: schema.adminSessions.id })
  if (!row) throw new Error('Session insert failed')
  return row.id
}

export async function findActiveSession(sid: string): Promise<{ userId: string; email: string } | null> {
  const [row] = await getDb()
    .select({ userId: schema.adminUsers.id, email: schema.adminUsers.email })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(and(eq(schema.adminSessions.id, sid), isNull(schema.adminSessions.revokedAt), gt(schema.adminSessions.expiresAt, new Date())))
    .limit(1)
  return row ?? null
}

export async function revokeSession(sid: string): Promise<void> {
  await getDb().update(schema.adminSessions).set({ revokedAt: new Date() }).where(eq(schema.adminSessions.id, sid))
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await getDb()
    .update(schema.adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.adminSessions.userId, userId), isNull(schema.adminSessions.revokedAt)))
}
