'use client'

import { useCallback, useMemo, useState, type ComponentProps } from 'react'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { DragHandleIcon } from '@sanity/icons'
import { Box, Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui'
import { useListeningQuery, Feedback } from 'sanity-plugin-utils'
import {
  Preview,
  PreviewCard,
  useClient,
  usePerspective,
  useSchema,
} from 'sanity'
import { usePaneRouter } from 'sanity/structure'
import { ORDER_FIELD_NAME, reorderDocuments } from '../lib/reorderDocuments'

const API_VERSION = 'v2025-06-27'

type PricingItemDoc = {
  _id: string
  _type: string
  orderRank?: string
  name?: string
  price?: number
  id?: string
  category?: string
  hasPublished?: boolean
}

type Props = {
  options: {
    filter?: string
    params?: Record<string, unknown>
  }
}

function dedupeDocuments(documents: PricingItemDoc[]): PricingItemDoc[] {
  const byBaseId = new Map<string, PricingItemDoc>()

  for (const doc of documents) {
    const baseId = doc._id.replace(/^drafts\./, '')
    const existing = byBaseId.get(baseId)

    if (!existing) {
      byBaseId.set(baseId, { ...doc })
      continue
    }

    if (doc._id.startsWith('drafts.')) {
      byBaseId.set(baseId, {
        ...doc,
        hasPublished: !existing._id.startsWith('drafts.'),
      })
    } else if (existing._id.startsWith('drafts.')) {
      byBaseId.set(baseId, { ...existing, hasPublished: true })
    }
  }

  return Array.from(byBaseId.values())
}

function buildQuery(filter?: string) {
  const perspectiveFilter =
    '(_id in path("drafts.**") || (!(_id in path("drafts.**")) && !(_id in path("versions.**"))))'
  const combinedFilter = [`_type == $type`, perspectiveFilter, filter]
    .filter(Boolean)
    .join(' && ')

  return `*[${combinedFilter}] | order(orderRank asc) {
    _id,
    _type,
    orderRank,
    name,
    price,
    "id": id.current,
    "category": category->name
  }`
}

export default function PricingItemOrderList({ options }: Props) {
  const schema = useSchema()
  const toast = useToast()
  const router = usePaneRouter()
  const { ChildLink } = router
  const { perspectiveStack } = usePerspective()
  const client = useClient({ apiVersion: API_VERSION }).withConfig({
    perspective: perspectiveStack,
  })

  const schemaType = schema.get('pricingItem')
  const [listIsUpdating, setListIsUpdating] = useState(false)

  const query = useMemo(() => buildQuery(options.filter), [options.filter])
  const queryParams = useMemo(
    () => ({
      type: 'pricingItem',
      ...options.params,
    }),
    [options.params]
  )

  const { data, loading, error } = useListeningQuery<PricingItemDoc[]>(query, {
    params: queryParams,
    options: { apiVersion: API_VERSION },
  })

  const documents = useMemo(
    () => dedupeDocuments(Array.isArray(data) ? data : []),
    [data]
  )

  const unorderedCount = documents.filter((doc) => !doc[ORDER_FIELD_NAME]).length

  const transactPatches = useCallback(
    async (patches: Array<[string, { set: { orderRank: string } }]>, message: string) => {
      try {
        const transaction = patches.reduce(
          (trx, [id, patch]) => trx.patch(id, patch),
          client.transaction()
        )
        const updated = await transaction.commit({
          visibility: 'sync',
          tag: 'pricing-item-order-list.reorder',
        })

        setListIsUpdating(false)
        toast.push({
          title: `${updated.results.length === 1 ? '1 dokument' : `${updated.results.length} dokumentów`} przesunięto`,
          status: 'success',
          description: message,
        })
      } catch {
        setListIsUpdating(false)
        toast.push({
          title: 'Nie udało się zmienić kolejności',
          status: 'error',
        })
      }
    },
    [client, toast]
  )

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (
        source.index === destination?.index ||
        !destination ||
        !draggableId ||
        documents.length === 0
      ) {
        return
      }

      setListIsUpdating(true)
      const { patches, message } = reorderDocuments({
        entities: documents,
        selectedIds: [draggableId],
        source,
        destination,
      })

      if (patches.length > 0) {
        void transactPatches(patches, message)
      } else {
        setListIsUpdating(false)
      }
    },
    [documents, transactPatches]
  )

  if (!schemaType) {
    return null
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" height="fill">
        <Spinner />
      </Flex>
    )
  }

  if (error) {
    return (
      <Box padding={2}>
        <Feedback
          tone="critical"
          title="Błąd ładowania listy"
          description="Spróbuj odświeżyć widok."
        />
      </Box>
    )
  }

  if (documents.length === 0) {
    return (
      <Flex align="center" direction="column" height="fill" justify="center">
        <Text muted>Brak pozycji w tej kategorii</Text>
      </Flex>
    )
  }

  return (
    <Stack space={2} padding={2} style={{ overflow: 'auto', height: '100%' }}>
      {unorderedCount > 0 && (
        <Feedback
          tone="caution"
          description={`${unorderedCount}/${documents.length} pozycji nie ma kolejności. Uruchom migrację orderRank lub przesuń elementy ręcznie.`}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pricing-item-order-zone">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {documents.map((doc, index) => {
                const pressed =
                  router.routerPanesState[router.groupIndex + 1]?.[0]?.id ===
                    doc._id ||
                  router.routerPanesState[router.groupIndex + 1]?.[0]?.id ===
                    doc._id.replace('drafts.', '')

                function DocumentLink(linkProps: ComponentProps<typeof ChildLink>) {
                  return <ChildLink {...linkProps} childId={doc._id} />
                }

                return (
                  <Draggable key={doc._id} draggableId={doc._id} index={index}>
                    {(innerProvided, snapshot) => (
                      <div
                        ref={innerProvided.innerRef}
                        {...innerProvided.draggableProps}
                        style={{
                          ...innerProvided.draggableProps.style,
                          opacity: listIsUpdating ? 0.5 : 1,
                          userSelect: 'none',
                        }}
                      >
                        <Box paddingBottom={1}>
                          <Card
                            radius={2}
                            shadow={snapshot.isDragging ? 2 : undefined}
                            tone={pressed ? 'primary' : 'default'}
                          >
                            <Flex align="center" padding={2}>
                              <Box
                                paddingX={2}
                                style={{ flexShrink: 0 }}
                                {...innerProvided.dragHandleProps}
                              >
                                <Text size={2}>
                                  <DragHandleIcon style={{ cursor: 'grab' }} />
                                </Text>
                              </Box>

                              <Box flex={1}>
                                <PreviewCard
                                  __unstable_focusRing
                                  as={DocumentLink}
                                  data-as="a"
                                  data-ui="PaneItem"
                                  radius={2}
                                  pressed={pressed}
                                  sizing="border"
                                  tabIndex={-1}
                                  tone="inherit"
                                  width="100%"
                                >
                                  <Preview
                                    layout="default"
                                    schemaType={schemaType}
                                    value={doc}
                                  />
                                </PreviewCard>
                              </Box>
                            </Flex>
                          </Card>
                        </Box>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Stack>
  )
}
