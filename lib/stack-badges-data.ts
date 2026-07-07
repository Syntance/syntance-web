import { listStackBadges } from '@/lib/db/queries/stack-badges'
import { DEFAULT_STACK_BADGES, type StackBadgeRecord } from '@/lib/data/stack-badges'

export async function fetchStackBadges(): Promise<StackBadgeRecord[]> {
  const rows = await listStackBadges()
  if (rows.length) return rows
  return DEFAULT_STACK_BADGES
}
