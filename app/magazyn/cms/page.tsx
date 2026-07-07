import { fetchFaqSettings } from '@/lib/db/queries/faq'
import { listPortfolioItemsAdmin } from '@/lib/db/queries/portfolio'
import { listStackBadges } from '@/lib/db/queries/stack-badges'
import { hasDb } from '@/lib/db'
import { CmsClient } from '@/components/magazyn/cms-client'
import {
  mergePortfolioRowsForAdmin,
  portfolioAdminNeedsInitialSave,
} from '@/lib/magazyn/portfolio-admin-merge'
import { mergeFaqSettingsForAdmin } from '@/lib/magazyn/faq-admin-merge'
import {
  mergeStackBadgesForAdmin,
  stackBadgesNeedInitialSave,
} from '@/lib/magazyn/stack-badges-admin-merge'

export const dynamic = 'force-dynamic'

export default async function CmsPage() {
  const [faqSettings, dbPortfolioRows, dbStackBadges] = await Promise.all([
    fetchFaqSettings(),
    listPortfolioItemsAdmin(),
    listStackBadges(),
  ])
  const portfolioRows = mergePortfolioRowsForAdmin(dbPortfolioRows)
  const stackBadgeRows = mergeStackBadgesForAdmin(dbStackBadges)
  return (
    <CmsClient
      faqSettings={mergeFaqSettingsForAdmin(faqSettings)}
      portfolioRows={portfolioRows}
      stackBadgeRows={stackBadgeRows}
      dbConnected={hasDb()}
      portfolioNeedsInitialSave={portfolioAdminNeedsInitialSave(dbPortfolioRows)}
      stackBadgesNeedsInitialSave={stackBadgesNeedInitialSave(dbStackBadges)}
    />
  )
}
