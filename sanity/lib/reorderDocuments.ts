import { LexoRank } from 'lexorank'

export const ORDER_FIELD_NAME = 'orderRank' as const

type OrderableEntity = {
  _id: string
  orderRank?: string
  hasPublished?: boolean
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

export function reorderDocuments({
  entities,
  selectedIds,
  source,
  destination,
}: {
  entities: OrderableEntity[]
  selectedIds: string[]
  source: { index: number }
  destination: { index: number }
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

  const patches = selected.flatMap((doc) => {
    const docPatches: Array<[string, { set: { orderRank: string } }]> = [
      [doc._id, { set: { [ORDER_FIELD_NAME]: doc.orderRank ?? '' } }],
    ]

    if (doc._id.startsWith('drafts.') && doc.hasPublished) {
      docPatches.push([
        doc._id.replace('drafts.', ''),
        { set: { [ORDER_FIELD_NAME]: doc.orderRank ?? '' } },
      ])
    }

    return docPatches
  })

  return {
    newOrder: all.sort(lexicographicalSort),
    patches,
    message,
  }
}
