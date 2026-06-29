import { fetchFaqSettings as fetchFaqSettingsFromDb } from '@/lib/db/queries/faq'

export * from '@/lib/data/faq'
export {
  resolveCennikFaqItems,
  resolveStronyWwwFaq,
  resolveSklepyFaq,
  resolveStrategiaFaq,
  resolveONasFaq,
  resolveKontaktFaq,
  resolveAgencjeFaq,
} from './faq-resolvers'

export async function fetchFaqSettings() {
  return fetchFaqSettingsFromDb()
}
