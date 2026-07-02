'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { 
  Layout, FileText, Layers, Zap, Plug, CreditCard, Truck, 
  Globe, ShoppingCart, Smartphone, Check, Sparkles, Clock,
  Send, Download, ChevronRight, Link2, Gift, Star, Target, Lightbulb, Timer
} from 'lucide-react'
import { PricingData, PricingItem } from '@/lib/data/pricing'
import { ConfirmDialog } from './ConfirmDialog'
import { MiniSummaryBar } from './MiniSummaryBar'
import { BookingModal } from './BookingModal'
import { AnalyticsEvent, trackAnalyticsEvent } from '@/lib/analytics'
import { useHideStickyOnVisible } from '@/hooks/useHideStickyOnVisible'
import { generatePricingPDF, PDFData, PDFItem } from '@/lib/generatePDF'
import {
  computeConfiguratorPricing,
  getBaseBundlePriceNet,
  getBaseProjectCategoryId,
  isCatalogLineIncludedInBasePrice,
} from '@/lib/pricing-calculator'
import { getProjectStartPriceNet } from '@/lib/pricing-configurator-minimum'
import {
  isConfiguratorProjectTypeId,
  projectTypesForConfigurator,
} from '@/lib/configurator-project-types'
import { comparePricingItemsForConfigurator } from '@/lib/pricing-item-order'
import { sortCategoriesForConfigurator } from '@/lib/pricing-category-order'

// Mapa ikon - używamy typu LucideIcon
const iconMap: Record<string, typeof Layout> = {
  Layout, FileText, Layers, Zap, Plug, CreditCard, Truck,
  Globe, ShoppingCart, Smartphone, Target, Lightbulb,
}

interface ConfiguratorState {
  projectType: string
  selectedItems: string[]
  quantities: Record<string, number>
}

interface Props {
  data: PricingData
}

/** Opis z Sanity (`text`) — zachowuje entery / puste linie między akapitami */
function ItemDescriptionText({ className, children }: { className?: string; children: string }) {
  return <p className={`whitespace-pre-line ${className ?? ''}`}>{children}</p>
}

export function PricingConfigurator({ data }: Props) {
  const { categories, projectTypes, items, config } = data

  const configuratorProjectTypes = useMemo(
    () => projectTypesForConfigurator(projectTypes),
    [projectTypes],
  )
  
  // Ref do głównego podsumowania
  const summaryRef = useRef<HTMLDivElement>(null)
  const shouldShowMiniBar = useHideStickyOnVisible(summaryRef)
  
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const highlight = params.get('highlight')
    if (!highlight) return

    const findAndHighlight = () => {
      let el = document.querySelector(`[data-item-id="${highlight}"]`)
      if (!el) {
        el = document.querySelector(`[data-item-id*="${highlight}"]`)
      }
      if (!el) return false

      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const itemId = el.getAttribute('data-item-id')
      setHighlightedItem(itemId)
      setTimeout(() => setHighlightedItem(null), 1800)
      return true
    }

    const t1 = setTimeout(() => {
      if (!findAndHighlight()) {
        const t2 = setTimeout(findAndHighlight, 1000)
        return () => clearTimeout(t2)
      }
    }, 500)

    return () => clearTimeout(t1)
  }, [])

  // Pobierz domyślnie zaznaczone elementy dla typu projektu
  const getDefaultSelectedItems = useCallback((projectTypeId: string) => {
    return items
      .filter(item => 
        item.projectTypes?.includes(projectTypeId) && 
        item.defaultSelected && 
        !item.required
      )
      .map(item => item.id)
  }, [items])

  const [state, setState] = useState<ConfiguratorState>(() => {
    const initialProjectType =
      projectTypesForConfigurator(projectTypes)[0]?.id || 'website'
    return {
      projectType: initialProjectType,
      selectedItems: getDefaultSelectedItems(initialProjectType),
      quantities: {},
    }
  })

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    items?: string[]
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    items: [],
    confirmText: 'Usuń',
    cancelText: 'Anuluj',
    onConfirm: () => {},
  })

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)

  useEffect(() => {
    if (isConfiguratorProjectTypeId(state.projectType)) return
    const next = configuratorProjectTypes[0]?.id ?? 'website'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guard fallback when external data changes
    setState((prev) => ({
      ...prev,
      projectType: next,
      selectedItems: getDefaultSelectedItems(next),
      quantities: {},
    }))
  }, [state.projectType, configuratorProjectTypes, getDefaultSelectedItems])
  const availableItems = useMemo(() => {
    return items.filter(item => 
      item.projectTypes?.includes(state.projectType)
    )
  }, [items, state.projectType])

  // Elementy wymagane (zawsze zaznaczone) — kolejność z `configuratorOrderRanks` (Studio)
  const requiredItems = useMemo(() => {
    const list = availableItems.filter((item) => item.required)
    return [...list].sort((a, b) =>
      comparePricingItemsForConfigurator(a, b, state.projectType),
    )
  }, [availableItems, state.projectType])

  const sortedCategories = useMemo(
    () => sortCategoriesForConfigurator(categories),
    [categories],
  )

  // Elementy opcjonalne pogrupowane według kategorii (kolejność sekcji z Magazynu)
  const optionalItemsByCategory = useMemo(() => {
    const optional = availableItems.filter((item) => !item.required)
    return sortedCategories
      .map((cat) => ({
        ...cat,
        items: optional
          .filter((item) => item.category === cat.id)
          .sort((a, b) => comparePricingItemsForConfigurator(a, b, state.projectType)),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [availableItems, sortedCategories, state.projectType])

  // Kalkulacja ceny (wspólna z minimumami / FAQ — uwzględnia pakiet bazy z CMS)
  const calculation = useMemo(() => {
    const selectedIds = [...requiredItems.map((i) => i.id), ...state.selectedItems]
    const typeBasePrice =
      configuratorProjectTypes.find((pt) => pt.id === state.projectType)?.basePrice ?? 0
    return computeConfiguratorPricing(
      selectedIds,
      state.quantities,
      items,
      state.projectType,
      config,
      typeBasePrice,
    )
  }, [
    requiredItems,
    state.selectedItems,
    state.quantities,
    items,
    config,
    state.projectType,
    configuratorProjectTypes,
  ])

  const baseCategoryId = getBaseProjectCategoryId(config, state.projectType)
  const baseBundleNet = getBaseBundlePriceNet(state.projectType, config)

  // Znajdź wszystkie produkty, które mają ten element w bundledWith
  const getParentBundles = useCallback((itemId: string) => {
    return items.filter(item => item.bundledWith?.includes(itemId))
  }, [items])

  // Sprawdź czy bundled item jest nadal potrzebny przez inne wybrane produkty
  const isStillNeededByOthers = useCallback((bundledItemId: string, excludingParentId: string, selectedItems: string[]) => {
    // Znajdź wszystkie wybrane produkty (poza excludingParentId), które mają bundledItemId w bundledWith
    return items.some(item => 
      item.id !== excludingParentId && 
      selectedItems.includes(item.id) && 
      item.bundledWith?.includes(bundledItemId)
    )
  }, [items])

  // Helper do usuwania elementu (z bundledWith)
  const performRemoveItem = useCallback((id: string, currentSelectedItems: string[]) => {
    const item = items.find(i => i.id === id)
    if (!item) return currentSelectedItems
    
    const itemsToRemove: string[] = [id]
    
    if (item.bundledWith?.length) {
      const remainingSelected = currentSelectedItems.filter(i => i !== id)
      item.bundledWith.forEach(bid => {
        if (!isStillNeededByOthers(bid, id, remainingSelected)) {
          itemsToRemove.push(bid)
        }
      })
    }
    
    return currentSelectedItems.filter(i => !itemsToRemove.includes(i))
  }, [items, isStillNeededByOthers])

  // Helper do dodawania elementu (z bundledWith)
  const performAddItem = useCallback((id: string, currentSelectedItems: string[]) => {
    const item = items.find(i => i.id === id)
    if (!item) return currentSelectedItems
    
    let itemsToAdd = [id]
    
    if (item.bundledWith?.length) {
      itemsToAdd = [...itemsToAdd, ...item.bundledWith]
    }
    
    const newItems = itemsToAdd.filter(i => !currentSelectedItems.includes(i))
    return [...currentSelectedItems, ...newItems]
  }, [items])

  // Toggle elementu z obsługą bundledWith i notyfikacji
  const toggleItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    setState(prev => {
      const isCurrentlySelected = prev.selectedItems.includes(id)

      trackAnalyticsEvent(AnalyticsEvent.PricingItemToggle, {
        item_id: id,
        item_name: item.name,
        action: isCurrentlySelected ? 'remove' : 'add',
        project_type: prev.projectType,
      })
      
      if (isCurrentlySelected) {
        // USUWANIE elementu
        
        // Sprawdź czy element ma własną notyfikację przy usunięciu (z Sanity)
        if (item.notificationOnRemove && item.notificationRemoveText) {
          setConfirmDialog({
            isOpen: true,
            title: item.notificationRemoveTitle || '⚠️ Uwaga',
            message: item.notificationRemoveText.replace(/\\n/g, '\n'),
            confirmText: item.notificationRemoveConfirmText || 'Akceptuję',
            cancelText: item.notificationRemoveCancelText || 'Anuluj',
            onConfirm: () => {
              setState(currentPrev => ({
                ...currentPrev,
                selectedItems: performRemoveItem(id, currentPrev.selectedItems)
              }))
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }
          })
          return prev
        }
        
        // Sprawdź czy ten element jest w bundledWith innego wybranego produktu
        const parentBundles = getParentBundles(id).filter(parent => 
          prev.selectedItems.includes(parent.id)
        )
        
        if (parentBundles.length > 0) {
          // Pokaż modal z potwierdzeniem
          setConfirmDialog({
            isOpen: true,
            title: `"${item.name}" jest wymagany`,
            message: `"${item.name}" jest wymagany przez inne elementy.\n\nUsunięcie tego elementu spowoduje również usunięcie:`,
            items: parentBundles.map(p => p.name),
            confirmText: 'Usuń wszystkie',
            onConfirm: () => {
              setState(currentPrev => {
                // Usuń element i jego parenty
                let newSelected = performRemoveItem(id, currentPrev.selectedItems)
                
                // Usuń też wszystkie parent bundles
                parentBundles.forEach(parent => {
                  newSelected = performRemoveItem(parent.id, newSelected)
                })
                
                return {
                  ...currentPrev,
                  selectedItems: newSelected
                }
              })
              
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }
          })
          return prev
        }
        
        // Usuń element używając helpera
        return {
          ...prev,
          selectedItems: performRemoveItem(id, prev.selectedItems)
        }
      } else {
        // DODAWANIE elementu
        
        // Sprawdź czy element ma notyfikację przy dodaniu (z Sanity)
        if (item.notificationOnAdd && item.notificationAddText) {
          setConfirmDialog({
            isOpen: true,
            title: item.notificationAddTitle || '⚠️ Uwaga',
            message: item.notificationAddText.replace(/\\n/g, '\n'),
            confirmText: item.notificationAddConfirmText || 'Akceptuję',
            cancelText: item.notificationAddCancelText || 'Anuluj',
            onConfirm: () => {
              setState(currentPrev => ({
                ...currentPrev,
                selectedItems: performAddItem(id, currentPrev.selectedItems)
              }))
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }
          })
          return prev
        }
        
        // Dodaj element używając helpera
        return {
          ...prev,
          selectedItems: performAddItem(id, prev.selectedItems)
        }
      }
    })
  }, [items, getParentBundles, performRemoveItem, performAddItem])

  // Zmiana ilości
  const setQuantity = useCallback((id: string, qty: number) => {
    setState(prev => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: qty }
    }))
  }, [])

  // Sprawdź czy element jest wyłączony
  const isDisabled = useCallback((item: PricingItem) => {
    // Element jest jawnie wyłączony
    if (item.disabled) return true
    
    // Kategoria elementu jest wyłączona
    const category = categories.find(cat => cat.id === item.category)
    if (category?.disabled) return true
    
    // Element nie spełnia dependencies
    if (item.dependencies?.length) {
      return !item.dependencies.every(dep => 
        state.selectedItems.includes(dep) || requiredItems.some(r => r.id === dep)
      )
    }
    
    return false
  }, [state.selectedItems, requiredItems, categories])

  // Aktualny typ projektu
  const currentProjectType = configuratorProjectTypes.find((pt) => pt.id === state.projectType)

  // Pobierz nazwy wszystkich wybranych elementów
  const getSelectedItemNames = useCallback(() => {
    const allSelectedIds = [
      ...requiredItems.map(i => i.id),
      ...state.selectedItems
    ]
    return allSelectedIds.map(id => {
      const item = items.find(i => i.id === id)
      if (!item) return null
      const qty = state.quantities[id] || 1
      return qty > 1 ? `${item.name} (${qty}x)` : item.name
    }).filter(Boolean) as string[]
  }, [requiredItems, state.selectedItems, state.quantities, items])

  // Dane przekazywane do modalu zapytania o wycenę
  const getBookingDetails = useCallback(() => {
    return {
      projectType: currentProjectType?.name || 'Strona WWW',
      priceNetto: calculation.priceNetto,
      priceBrutto: calculation.priceBrutto,
      deposit: calculation.deposit,
      days: calculation.days,
      hours: calculation.hours,
      itemsCount: calculation.itemsCount,
      selectedItems: [...requiredItems.map(i => i.id), ...state.selectedItems],
      itemNames: getSelectedItemNames(),
    }
  }, [calculation, currentProjectType, requiredItems, state.selectedItems, getSelectedItemNames])

  // Generuj PDF z wyceny
  const handleDownloadPDF = useCallback(async () => {
    const allSelectedIds = [
      ...requiredItems.map(i => i.id),
      ...state.selectedItems
    ]

    const bundlePdfNet = getBaseBundlePriceNet(state.projectType, config)
    const typeFloorPdf = currentProjectType?.basePrice ?? 0

    // Przygotuj listę itemów dla PDF
    const pdfItems: PDFItem[] = allSelectedIds.map(id => {
      const item = items.find(i => i.id === id)
      if (!item) return null
      
      const quantity = state.quantities[id] || 1
      const price = item.price
      const inBasePackage = isCatalogLineIncludedInBasePrice(
        item,
        state.projectType,
        config,
        typeFloorPdf,
      )
      const total = inBasePackage ? 0 : price * quantity

      return {
        name: item.name,
        quantity,
        price,
        total,
        includedInBase: inBasePackage,
        required: item.required,
        hidePrice: item.hidePrice,
      }
    }).filter(Boolean) as PDFItem[]

    // Dane do PDF
    const pdfData: PDFData = {
      projectType: currentProjectType?.name || 'Strona WWW',
      projectTypeDescription: currentProjectType?.description,
      items: pdfItems,
      priceNetto: calculation.priceNetto,
      priceBrutto: calculation.priceBrutto,
      deposit: calculation.deposit,
      vatRate: config?.vatRate || 23,
      days: calculation.days,
      hours: calculation.hours,
      baseProjectBundlePriceNet: bundlePdfNet > 0 ? bundlePdfNet : undefined,
      date: new Date().toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    }

    // Generuj i pobierz PDF
    await generatePricingPDF(pdfData)
  }, [requiredItems, state.selectedItems, state.quantities, items, calculation, currentProjectType, config, state.projectType])

  // Pobierz ikonę
  const getIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent size={20} className="text-purple-400" /> : null
  }

  return (
    <>
      {/* Mini Summary Bar - tylko mobile */}
      <MiniSummaryBar 
        price={calculation.priceNetto}
        itemsCount={calculation.itemsCount}
        isVisible={shouldShowMiniBar}
      />

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-full box-border overflow-x-hidden lg:overflow-x-visible">
      {/* LEWA KOLUMNA: Selektor */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8 w-full max-w-full min-w-0">
        {/* Typ projektu */}
        <div>
          <h3 className="text-lg font-medium tracking-wide mb-4 text-gray-200">
            Wybierz typ projektu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {configuratorProjectTypes.map(type => {
              const isSelected = state.projectType === type.id
              const isDisabledType = type.disabled
              return (
                <button
                  key={type.id}
                  disabled={isDisabledType}
                  onClick={() => {
                    if (isDisabledType) return
                    setState(prev => ({
                      ...prev,
                      projectType: type.id,
                      selectedItems: getDefaultSelectedItems(type.id),
                      quantities: {},
                    }))
                    trackAnalyticsEvent(AnalyticsEvent.PricingTypeSelect, {
                      project_type: type.id,
                    })
                  }}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isDisabledType
                      ? 'opacity-30 cursor-not-allowed border-white/5 bg-gray-900/30'
                      : isSelected 
                        ? 'border-purple-500 bg-purple-500/20' 
                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/70'
                  }`}
                >
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-xl -z-10" />
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    {getIcon(type.icon)}
                    <span className={`font-medium tracking-wide ${
                      isDisabledType 
                        ? 'text-gray-400' 
                        : isSelected ? 'text-white' : 'text-gray-400'
                    }`}>
                      {type.name}
                    </span>
                  </div>
                  
                  {(() => {
                    const displayOd = getProjectStartPriceNet(type.id, data)
                    return displayOd > 0 ? (
                    <span className={`text-sm ${isDisabledType ? 'text-gray-700' : 'text-gray-400'}`}>
                      od {displayOd.toLocaleString('pl-PL')} PLN netto
                    </span>
                    ) : null
                  })()}
                  
                  {isDisabledType && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        Niedostępny
                      </span>
                    </div>
                  )}

                  {/* Check indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Elementy wymagane */}
        {requiredItems.length > 0 && (
          <div>
            <h3 className="text-lg font-medium tracking-wide mb-4 text-gray-200 flex items-center gap-2">
              <Layout size={18} className="text-purple-400" />
              W cenie bazowej
            </h3>
            <div className="space-y-2">
              {requiredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/30 rounded-xl border border-gray-800"
                  >
                  <div className="w-5 h-5 rounded bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400 font-medium">{item.name}</span>
                    {item.description && (
                      <ItemDescriptionText className="text-sm text-gray-400">
                        {item.description}
                      </ItemDescriptionText>
                    )}
                  </div>
                  {!item.hidePrice && (
                    <span className="text-gray-400 text-sm flex-shrink-0">
                      {isCatalogLineIncludedInBasePrice(
                        item,
                        state.projectType,
                        config,
                        currentProjectType?.basePrice ?? 0,
                      )
                        ? baseBundleNet > 0
                          ? 'w pakiecie'
                          : 'w cenie pakietu'
                        : `${item.price.toLocaleString('pl-PL')} PLN netto`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Elementy opcjonalne */}
        {optionalItemsByCategory.map(category => (
          <div key={category.id}>
            <h3 className="text-lg font-medium tracking-wide mb-4 text-gray-200 flex items-center gap-2">
              {getIcon(category.icon)}
              {category.name}
            </h3>
            <div className="space-y-2">
              {category.items.map(item => {
                const disabled = isDisabled(item)
                const selected = state.selectedItems.includes(item.id)
                const qty = state.quantities[item.id] || 1

                const isHighlighted = highlightedItem === item.id

                return (
                  <div 
                    key={item.id}
                    data-item-id={item.id}
                    onClick={() => !disabled && toggleItem(item.id)}
                    className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${
                      isHighlighted ? '' : 'transition-all duration-200'
                    } ${
                      isHighlighted
                        ? 'border-purple-500 bg-purple-500/20 cursor-pointer animate-highlight-pulse'
                        : disabled 
                          ? 'opacity-40 cursor-not-allowed border-gray-800 bg-gray-900/30' 
                          : selected 
                            ? 'border-purple-500/50 bg-purple-500/15 cursor-pointer'
                            : 'border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60 cursor-pointer'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected 
                        ? 'bg-purple-500 border-purple-500' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      {selected && <Check size={12} className="text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
                          {item.name}
                        </span>
                        {isCatalogLineIncludedInBasePrice(
                          item,
                          state.projectType,
                          config,
                          currentProjectType?.basePrice ?? 0,
                        ) && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium flex items-center gap-1">
                            <Gift size={10} /> W cenie
                          </span>
                        )}
                        {item.defaultSelected &&
                          !isCatalogLineIncludedInBasePrice(
                            item,
                            state.projectType,
                            config,
                            currentProjectType?.basePrice ?? 0,
                          ) && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium flex items-center gap-1">
                            <Star size={10} /> Rekomendowane
                          </span>
                        )}
                        {item.popular &&
                          !item.defaultSelected &&
                          !isCatalogLineIncludedInBasePrice(
                            item,
                            state.projectType,
                            config,
                            currentProjectType?.basePrice ?? 0,
                          ) && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
                            Popularne
                          </span>
                        )}
                        {item.new && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium flex items-center gap-1">
                            <Sparkles size={10} /> Nowość
                          </span>
                        )}
                        {getParentBundles(item.id).length > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-400 font-medium flex items-center gap-1" title={`Część pakietu: ${getParentBundles(item.id).map(p => p.name).join(', ')}`}>
                            <Link2 size={10} /> W pakiecie
                          </span>
                        )}
                        {disabled && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400 font-medium">
                            Niedostępny
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <ItemDescriptionText className="text-sm text-gray-400 mt-1">
                          {item.description}
                        </ItemDescriptionText>
                      )}
                      {/* Info dla elementów z ilością */}
                      {item.maxQuantity && item.maxQuantity > 1 && selected && (
                        <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-amber-400/60" />
                          Cena {item.price.toLocaleString('pl-PL')} PLN dotyczy każdej {item.name.toLowerCase().includes('podstron') ? 'podstrony' : 'sztuki'} osobno
                        </p>
                      )}
                      {/* Pokaż wymagane elementy */}
                      {item.bundledWith && item.bundledWith.length > 0 && (
                        <p className="text-xs text-amber-500/80 mt-1 flex items-center gap-1">
                          <Link2 size={10} />
                          Wymaga: {item.bundledWith.map(bid => items.find(i => i.id === bid)?.name).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Quantity selector */}
                    {item.maxQuantity && item.maxQuantity > 1 && selected && (
                      <select
                        value={qty}
                        onChange={(e) => {
                          e.stopPropagation()
                          setQuantity(item.id, parseInt(e.target.value))
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-gray-900/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      >
                        {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n} className="bg-gray-950">{n}x</option>
                        ))}
                      </select>
                    )}

                    {/* Price */}
                    {!item.hidePrice && (
                      <span className={`text-sm flex-shrink-0 text-right ${
                        isCatalogLineIncludedInBasePrice(
                          item,
                          state.projectType,
                          config,
                          currentProjectType?.basePrice ?? 0,
                        )
                          ? 'text-emerald-400 font-medium'
                          : selected ? 'text-purple-400' : 'text-gray-400'
                      }`}>
                        {isCatalogLineIncludedInBasePrice(
                          item,
                          state.projectType,
                          config,
                          currentProjectType?.basePrice ?? 0,
                        )
                          ? 'Gratis'
                          : item.percentageAdd 
                            ? `+${item.percentageAdd}%`
                            : `${(item.price * qty).toLocaleString('pl-PL')} PLN netto`
                        }
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PRAWA KOLUMNA: Podsumowanie */}
      <div className="lg:col-span-1 w-full max-w-full min-w-0">
        <div className="lg:sticky lg:top-32 max-w-[calc(100vw-2rem)]" ref={summaryRef}>
          {/* Main summary card */}
          <div className="relative group">
            {/* Gradient border glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-6 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium tracking-wide text-white">Podsumowanie</h3>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                  {calculation.itemsCount} elementów
                </span>
              </div>

              {/* Selected project type */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Typ projektu</div>
                <div className="text-white font-medium flex items-center gap-2">
                  {getIcon(currentProjectType?.icon)}
                  {currentProjectType?.name}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-baseline gap-1 sm:gap-2 min-w-0">
                  <span className="text-gray-400 text-xs sm:text-base shrink-0">Cena netto</span>
                  <span className="text-lg sm:text-2xl font-semibold text-white whitespace-nowrap">
                    {calculation.priceNetto.toLocaleString('pl-PL')} <span className="text-xs sm:text-sm font-normal text-gray-400">PLN</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm gap-1 sm:gap-2 min-w-0">
                  <span className="text-gray-400 truncate">Brutto (+{config?.vatRate || 23}% VAT)</span>
                  <span className="text-gray-400 whitespace-nowrap">{calculation.priceBrutto.toLocaleString('pl-PL')} PLN</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm gap-1 sm:gap-2 min-w-0">
                  <span className="text-gray-400 truncate">Zadatek ({config?.depositPercent || 20}%)</span>
                  <span className="text-purple-400 font-medium whitespace-nowrap">{calculation.deposit.toLocaleString('pl-PL')} PLN</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    
              {/* Time estimates */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5">
                  <Clock size={16} className="mx-auto mb-1 text-blue-400" aria-hidden />
                  <div className="text-base sm:text-lg font-semibold text-white">{calculation.days}</div>
                  <div className="text-xs text-gray-400">dni roboczych</div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5">
                  <Timer size={16} className="mx-auto mb-1 text-emerald-400/90" aria-hidden />
                  <div className="text-base sm:text-lg font-semibold text-white">{calculation.hours}</div>
                  <div className="text-xs text-gray-400">roboczogodzin (szac.)</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 sm:space-y-3 pt-2">
                <button
                  onClick={() => {
                    setIsInquiryModalOpen(true)
                    trackAnalyticsEvent(AnalyticsEvent.PricingInquiryOpen, {
                      project_type: state.projectType,
                      items_count: state.selectedItems.length,
                    })
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm sm:text-base font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  <Send size={16} className="flex-shrink-0" />
                  <span className="truncate">{config?.ctaTexts?.reserve || 'Wyślij formularz'}</span>
                  <ChevronRight size={14} className="flex-shrink-0" />
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 w-full py-2 sm:py-3 px-4 sm:px-6 text-gray-400 hover:text-white text-sm sm:text-base font-medium rounded-xl transition-all hover:bg-white/5"
                >
                  <Download size={14} className="flex-shrink-0" />
                  <span className="truncate">{config?.ctaTexts?.pdf || 'Pobierz wycenę PDF'}</span>
                </button>
              </div>

              <p className="text-[10px] sm:text-xs text-gray-400 text-center leading-relaxed">
                Gwarancja 30 dni • Po tym czasie opieka w ramach abonamentu
                <br />
                Termin realizacji ustalimy indywidualnie po kontakcie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        items={confirmDialog.items}
        confirmText={confirmDialog.confirmText || 'Usuń wszystkie'}
        cancelText={confirmDialog.cancelText || 'Anuluj'}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Inquiry Modal (poprzednio rezerwacja terminu) */}
      <BookingModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        booking={getBookingDetails()}
      />
      </div>
    </>
  )
}

export default PricingConfigurator
