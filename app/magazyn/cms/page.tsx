import { fetchFaqSettings } from '@/lib/db/queries/faq'
import { listPortfolioItemsAdmin } from '@/lib/db/queries/portfolio'
import { hasDb } from '@/lib/db'
import { CmsClient } from '@/components/magazyn/cms-client'
import {
  mergePortfolioRowsForAdmin,
  portfolioAdminNeedsInitialSave,
} from '@/lib/magazyn/portfolio-admin-merge'
import { mergeFaqSettingsForAdmin } from '@/lib/magazyn/faq-admin-merge'

export const dynamic = 'force-dynamic'

export default async function CmsPage() {
  const [faqSettings, dbPortfolioRows] = await Promise.all([
    fetchFaqSettings(),
    listPortfolioItemsAdmin(),
  ])
  const portfolioRows = mergePortfolioRowsForAdmin(dbPortfolioRows)
  return (
    <CmsClient
      faqSettings={mergeFaqSettingsForAdmin(faqSettings)}
      portfolioRows={portfolioRows}
      dbConnected={hasDb()}
      portfolioNeedsInitialSave={portfolioAdminNeedsInitialSave(dbPortfolioRows)}
    />
  )
}
