import { getSeoSettings, listSeoPages } from '@/lib/db/queries/seo'
import { hasDb } from '@/lib/db'
import { SeoClient } from '@/components/magazyn/seo-client'

export const dynamic = 'force-dynamic'

export default async function SeoPage() {
  const [globalSeo, pages] = await Promise.all([getSeoSettings(), listSeoPages()])
  return <SeoClient globalSeo={globalSeo} pages={pages} dbConnected={hasDb()} />
}
