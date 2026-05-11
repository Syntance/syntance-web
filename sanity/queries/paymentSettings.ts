import { client } from '../lib/client'

export interface PaymentSettings {
  accountHolder: string
  bankName?: string
  accountNumber: string
  swiftBic?: string
  transferTitleTemplate: string
  additionalInfo?: string
}

export const paymentSettingsQuery = `*[_type == "paymentSettings" && _id == "paymentSettings"][0]{
  accountHolder,
  bankName,
  accountNumber,
  swiftBic,
  transferTitleTemplate,
  additionalInfo
}`

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  try {
    return await client.fetch<PaymentSettings | null>(
      paymentSettingsQuery,
      {},
      { cache: 'no-store' }
    )
  } catch (error) {
    console.error('Failed to fetch paymentSettings from Sanity:', error)
    return null
  }
}

export function resolveTransferTitle(template: string, bookingId: string): string {
  return template.replace(/\{bookingId\}/g, bookingId)
}
