import { LexoRank } from 'lexorank'

export const ORDER_FIELD_NAME = 'orderRank' as const

type OrderableEntity = {
  _id: string
  orderRank?: string
  hasPublished?: boolean
}

export type ReorderPatch = {
  id: string
  set: Record<string, unknown>
}

function parseOrderRank(value: unknown, fallback: LexoRank): LexoRank {
  if (typeof value !== 'string') return fallback
  try {
    return LexoRank.parse(value)
  } catch {
    return fallback
  }
}

function lexicographicalSort(a: OrderableEntity, b: OrderableEntity): number {
  if (!a.orderRank || !b.orderRank) return 0
  if (a.orderRank < b.orderRank) return -1
  if (a.orderRank > b.orderRank) return 1
  return 0
}

function publishedId(documentId: string): string {
  return documentId.replace(/^drafts\./, '')
}

export function reorderDocuments({
  entities,
  selectedIds,
  source,
  destination,
  buildPatchSet,
}: {
  entities: OrderableEntity[]
  selectedIds: string[]
  source: { index: number }
  destination: { index: number }
  buildPatchSet?: (doc: OrderableEntity, orderRank: string) => Record<string, unknown>
}) {
  const startIndex = source.index
  const endIndex = destination.index
  const isMovingUp = startIndex > endIndex
  const selectedItems = entities.filter((item) => selectedIds.includes(item._id))
  const message = [
    'Moved',
    selectedItems.length === 1 ? '1 document' : `${selectedItems.length} documents`,
    isMovingUp ? 'up' : 'down',
    'from position',
    `${startIndex + 1} to ${endIndex + 1}`,
  ].join(' ')

  const { all, selected } = entities.reduce<{
    all: OrderableEntity[]
    selected: OrderableEntity[]
  }>(
    (acc, cur, curIndex) => {
      if (selectedIds.includes(cur._id)) {
        return acc
      }

      if (curIndex === endIndex) {
        const prevIndex = curIndex - 1
        const prevRank = parseOrderRank(
          entities[prevIndex]?.orderRank,
          LexoRank.min()
        )
        const curRank = parseOrderRank(cur.orderRank, LexoRank.min())
        const nextIndex = curIndex + 1
        const nextRank = parseOrderRank(
          entities[nextIndex]?.orderRank,
          LexoRank.max()
        )

        let betweenRank = isMovingUp
          ? prevRank.between(curRank)
          : curRank.between(nextRank)

        for (const selectedItem of selectedItems) {
          selectedItem.orderRank = betweenRank.toString()
          betweenRank = isMovingUp
            ? betweenRank.between(curRank)
            : betweenRank.between(nextRank)
        }

        return {
          all: isMovingUp
            ? [...acc.all, ...selectedItems, cur]
            : [...acc.all, cur, ...selectedItems],
          selected: selectedItems,
        }
      }

      return {
        all: [...acc.all, cur],
        selected: acc.selected,
      }
    },
    { all: [], selected: [] }
  )

  const patches: ReorderPatch[] = selected.flatMap((doc) => {
    const rank = doc.orderRank ?? ''
    const patchSet =
      buildPatchSet?.(doc, rank) ?? { [ORDER_FIELD_NAME]: rank }
    const published = publishedId(doc._id)
    const docPatches: ReorderPatch[] = [{ id: published, set: patchSet }]

    if (doc._id.startsWith('drafts.')) {
      docPatches.push({ id: doc._id, set: patchSet })
    }

    return docPatches
  })

  return {
    newOrder: all.sort(lexicographicalSort),
    patches,
    message,
  }
}
