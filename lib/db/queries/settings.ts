import { eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { emailTemplates, paymentSettings, contractFiles } from '@/lib/db/schema'
import {
  mergeEmailTemplatesWithDefaults,
  type EmailTemplates,
} from '@/lib/data/email-templates'

export type PaymentSettings = {
  accountHolder: string
  bankName?: string
  accountNumber: string
  swiftBic?: string
  transferTitleTemplate: string
  additionalInfo?: string
}

export type ContractFile = { label: string; url: string }
export type ContractSettings = { files: ContractFile[]; introText?: string }

export async function getEmailTemplates(): Promise<EmailTemplates> {
  if (!hasDb()) return mergeEmailTemplatesWithDefaults(null)
  try {
    const db = getDb()
    const row = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, 'default'),
    })
    return mergeEmailTemplatesWithDefaults(
      (row?.data as Partial<EmailTemplates>) ?? null,
    )
  } catch (err) {
    console.error('[emailTemplates] DB fetch failed, using defaults:', err)
    return mergeEmailTemplatesWithDefaults(null)
  }
}

export async function saveEmailTemplates(data: EmailTemplates): Promise<void> {
  const db = getDb()
  const payload = data as unknown as Record<string, unknown>
  await db
    .insert(emailTemplates)
    .values({ id: 'default', data: payload, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: emailTemplates.id,
      set: { data: payload, updatedAt: new Date() },
    })
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  if (!hasDb()) return null
  try {
    const db = getDb()
    const row = await db.query.paymentSettings.findFirst({
      where: eq(paymentSettings.id, 'default'),
    })
    return (row?.data as PaymentSettings) ?? null
  } catch (error) {
    console.error('Failed to fetch paymentSettings from DB:', error)
    return null
  }
}

export async function savePaymentSettings(data: PaymentSettings): Promise<void> {
  const db = getDb()
  await db
    .insert(paymentSettings)
    .values({ id: 'default', data })
    .onConflictDoUpdate({ target: paymentSettings.id, set: { data } })
}

export function resolveTransferTitle(template: string, bookingId: string): string {
  return template.replace(/\{bookingId\}/g, bookingId)
}

export async function getContractFiles(): Promise<ContractSettings> {
  if (!hasDb()) return { files: [] }
  try {
    const db = getDb()
    const rows = await db.select().from(contractFiles).orderBy(contractFiles.sortOrder)
    return {
      files: rows
        .filter((r) => r.fileUrl)
        .map((r) => ({ label: r.label, url: r.fileUrl! })),
      introText: undefined,
    }
  } catch (err) {
    console.error('[contractFiles] DB fetch failed:', err)
    return { files: [] }
  }
}

export async function saveContractFiles(files: ContractSettings): Promise<void> {
  const db = getDb()
  await db.delete(contractFiles)
  if (!files.files.length) return
  await db.insert(contractFiles).values(
    files.files.map((file, index) => ({
      label: file.label,
      fileUrl: file.url,
      sortOrder: index,
    })),
  )
}

export {
  mergeEmailTemplatesWithDefaults,
  applyEmailTokens,
  DEFAULT_EMAIL_TEMPLATES,
} from '@/lib/data/email-templates'

export type { EmailTemplates } from '@/lib/data/email-templates'
