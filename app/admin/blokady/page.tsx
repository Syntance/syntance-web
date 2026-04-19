import { listBlocks } from '@/lib/sanity/booking'
import { BlocksClient } from './blocks-client'

export const dynamic = 'force-dynamic'

export default async function BlocksPage() {
  const blocks = await listBlocks(200)
  return <BlocksClient initial={blocks} />
}
