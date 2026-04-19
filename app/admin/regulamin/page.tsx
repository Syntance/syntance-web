import { getBookingRules } from '@/lib/sanity/booking'
import { RulesClient } from './rules-client'

export const dynamic = 'force-dynamic'

export default async function RulesPage() {
  const rules = await getBookingRules()
  return <RulesClient initial={rules} />
}
