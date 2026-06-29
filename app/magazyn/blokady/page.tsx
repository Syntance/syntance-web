import { listBlocks } from '@/lib/db/queries/booking'
import { BlocksClient } from './blocks-client'

export const dynamic = 'force-dynamic'

export default async function BlocksPage() {
  const blocks = await listBlocks(200)
  return <BlocksClient initial={blocks} />
}
