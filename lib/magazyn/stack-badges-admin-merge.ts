import { DEFAULT_STACK_BADGES, type StackBadgeRecord } from '@/lib/data/stack-badges'

export function mergeStackBadgesForAdmin(dbRows: StackBadgeRecord[]): StackBadgeRecord[] {
  if (dbRows.length) {
    return [...dbRows].sort((a, b) => a.sortOrder - b.sortOrder)
  }
  return DEFAULT_STACK_BADGES.map((badge) => ({ ...badge }))
}

export function stackBadgesNeedInitialSave(dbRows: StackBadgeRecord[]): boolean {
  return dbRows.length === 0
}
