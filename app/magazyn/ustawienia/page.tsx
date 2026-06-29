import { getPaymentSettings, getContractFiles } from '@/lib/db/queries/settings'
import { UstawieniaClient } from '@/components/magazyn/ustawienia-client'

export const dynamic = 'force-dynamic'

export default async function UstawieniaPage() {
  const [payment, contracts] = await Promise.all([getPaymentSettings(), getContractFiles()])
  return <UstawieniaClient payment={payment} contracts={contracts} />
}
