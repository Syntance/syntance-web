import { hasDb } from '@/lib/db'
import { fetchPartnerSettings } from '@/lib/db/queries/partner'
import { PartnerClient } from '@/components/magazyn/partner-client'

export const dynamic = 'force-dynamic'

export default async function ModelPartnerskiPage() {
  const settings = await fetchPartnerSettings()
  return <PartnerClient initialSettings={settings} dbConnected={hasDb()} />
}
