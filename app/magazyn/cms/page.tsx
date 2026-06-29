import { fetchFaqSettings } from '@/lib/db/queries/faq'
import { listPortfolioItemsAdmin } from '@/lib/db/queries/portfolio'
import { hasDb } from '@/lib/db'
import { CmsClient } from '@/components/magazyn/cms-client'

export const dynamic = 'force-dynamic'

export default async function CmsPage() {
  const [faqSettings, portfolioRows] = await Promise.all([
    fetchFaqSettings(),
    listPortfolioItemsAdmin(),
  ])
  return (
    <CmsClient
      faqSettings={faqSettings ?? {}}
      portfolioRows={portfolioRows}
      dbConnected={hasDb()}
    />
  )
}
