'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Layout, FileText, Layers, Zap, Plug, CreditCard, Truck, 
  Globe, ShoppingCart, Smartphone, Check, Sparkles, Clock,
  Calendar, Download, ChevronRight, Link2, Gift, Star, Target, Lightbulb
} from 'lucide-react'
import { PricingData, PricingItem } from '@/sanity/queries/pricing'
import { ConfirmDialog } from './ConfirmDialog'

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

export function PricingConfigurator({ data }: Props) {
  const { categories, projectTypes, items, config } = data

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
    const initialProjectType = projectTypes[0]?.id || 'website'
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
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    items: [],
    confirmText: 'Usuń',
    onConfirm: () => {},
  })

  // Filtruj elementy dla wybranego typu projektu
  const availableItems = useMemo(() => {
    return items.filter(item => 
      item.projectTypes?.includes(state.projectType)
    )
  }, [items, state.projectType])

  // Elementy wymagane (zawsze zaznaczone)
  const requiredItems = useMemo(() => {
    return availableItems.filter(item => item.required)
  }, [availableItems])

  // Elementy opcjonalne pogrupowane według kategorii
  const optionalItemsByCategory = useMemo(() => {
    const optional = availableItems.filter(item => !item.required)
    return categories.map(cat => ({
      ...cat,
      items: optional.filter(item => item.category === cat.id)
    })).filter(cat => cat.items.length > 0)
  }, [availableItems, categories])

  // Kalkulacja ceny
  const calculation = useMemo(() => {
    const allSelected = [
      ...requiredItems.map(i => i.id),
      ...state.selectedItems
    ]

    let totalPrice = 0
    let totalHours = 0
    let percentageAdd = 0
    let totalItemsCount = 0

    allSelected.forEach(id => {
      const item = items.find(i => i.id === id)
      if (!item) return

      const qty = state.quantities[id] || 1
      
      // Licz ilość elementów (każdą podstronę osobno)
      totalItemsCount += qty

      if (item.percentageAdd) {
        percentageAdd += item.percentageAdd
      } else {
        // Nie licz ceny dla elementów wliczonych w bazę (gratis)
        if (!item.includedInBase) {
          totalPrice += item.price * qty
        }
        totalHours += item.hours * qty
      }
    })

    // Dodaj procentowe dodatki
    if (percentageAdd > 0) {
      totalPrice *= (1 + percentageAdd / 100)
      totalHours *= (1 + percentageAdd / 100)
    }

    const priceNetto = Math.round(totalPrice)
    const priceBrutto = Math.round(totalPrice * (1 + (config?.vatRate || 23) / 100))
    const deposit = Math.max(
      config?.depositFixed || 500,
      Math.round(priceNetto * (config?.depositPercent || 20) / 100)
    )
    const days = Math.ceil(totalHours / (config?.workHoursPerDay || 6))

    return {
      priceNetto,
      priceBrutto,
      deposit,
      hours: Math.round(totalHours),
      days,
      percentageAdd,
      itemsCount: totalItemsCount,
    }
  }, [requiredItems, state.selectedItems, state.quantities, items, config])

  // Znajdź wszystkie produkty, które mają ten element w bundledWith
  const getParentBundles = useCallback((itemId: string) => {
    return items.filter(item => item.bundledWith?.includes(itemId))
  }, [items])

  // Toggle elementu z obsługą bundledWith
  const toggleItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    setState(prev => {
      const isCurrentlySelected = prev.selectedItems.includes(id)
      
      if (isCurrentlySelected) {
        // USUWANIE elementu
        
        // Sprawdź czy to jest Warsztat Discovery - pokaż ostrzeżenie
        if (item.defaultSelected && item.name.toLowerCase().includes('discovery')) {
          setConfirmDialog({
            isOpen: true,
            title: '⚠️ Czy na pewno chcesz usunąć Warsztat Discovery?',
            message: `Warsztat Discovery to kluczowy etap projektu, który:\n\n• Definiuje strategię i cele biznesowe\n• Identyfikuje Twoich idealnych klientów\n• Ustala unikalne wartości i komunikację\n• Projektuje architekturę informacji\n\nUsunięcie tej opcji wymaga dostarczenia kompletnej strategii, persony i UVP z Twojej strony.\n\nJeśli nie masz gotowej strategii, zalecamy pozostawić ten element - zaoszczędzisz czas i unikniesz kosztownych poprawek później.`,
            confirmText: 'Rozumiem, usuń',
            onConfirm: () => {
              // Usuń element
              const itemsToRemove = [id]
              if (item.bundledWith?.length) {
                itemsToRemove.push(...item.bundledWith)
              }
              
              setState(prev => ({
                ...prev,
                selectedItems: prev.selectedItems.filter(i => !itemsToRemove.includes(i))
              }))
              
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }
          })
          return prev
        }
        
        let itemsToRemove = [id]
        
        // Jeśli element ma bundledWith, usuń też te elementy
        if (item.bundledWith?.length) {
          itemsToRemove = [...itemsToRemove, ...item.bundledWith]
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
              // Usuń element i jego parenty
              const itemsToRemove = [id]
              if (item.bundledWith?.length) {
                itemsToRemove.push(...item.bundledWith)
              }
              
              parentBundles.forEach(parent => {
                itemsToRemove.push(parent.id)
                if (parent.bundledWith?.length) {
                  itemsToRemove.push(...parent.bundledWith)
                }
              })
              
              setState(prev => ({
                ...prev,
                selectedItems: prev.selectedItems.filter(i => !itemsToRemove.includes(i))
              }))
              
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }
          })
          return prev
        }
        
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(i => !itemsToRemove.includes(i))
        }
      } else {
        // DODAWANIE elementu
        let itemsToAdd = [id]
        
        // Jeśli element ma bundledWith, dodaj automatycznie te elementy
        if (item.bundledWith?.length) {
          itemsToAdd = [...itemsToAdd, ...item.bundledWith]
        }
        
        // Dodaj tylko te, które jeszcze nie są wybrane
        const newItems = itemsToAdd.filter(i => !prev.selectedItems.includes(i))
        
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, ...newItems]
        }
      }
    })
  }, [items, getParentBundles])

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

  // Calendly URL z parametrami
  const getCalendlyUrl = useCallback(() => {
    if (!config?.calendlyUrl) return '#contact'
    
    const params = new URLSearchParams({
      name: 'Rezerwacja projektu',
      a1: `${calculation.priceNetto.toLocaleString('pl-PL')} PLN netto`,
      a2: `${calculation.days} dni roboczych`,
    })
    return `${config.calendlyUrl}?${params.toString()}`
  }, [config?.calendlyUrl, calculation])

  // Pobierz ikonę
  const getIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent size={20} className="text-purple-400" /> : null
  }

  // Aktualny typ projektu
  const currentProjectType = projectTypes.find(pt => pt.id === state.projectType)

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* LEWA KOLUMNA: Selektor */}
      <div className="lg:col-span-2 space-y-8">
        {/* Typ projektu */}
        <div>
          <h3 className="text-lg font-medium tracking-wide mb-4 text-gray-200">
            Wybierz typ projektu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {projectTypes.map(type => {
              const isSelected = state.projectType === type.id
              const isDisabledType = type.disabled
              return (
                <button
                  key={type.id}
                  disabled={isDisabledType}
                  onClick={() => !isDisabledType && setState(prev => ({ 
                    ...prev, 
                    projectType: type.id,
                    selectedItems: getDefaultSelectedItems(type.id),
                    quantities: {}
                  }))}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isDisabledType
                      ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/2'
                      : isSelected 
                        ? 'border-purple-500/60 bg-purple-500/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
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
                        ? 'text-gray-600' 
                        : isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                      {type.name}
                    </span>
                  </div>
                  
                  {type.basePrice && (
                    <span className={`text-sm ${isDisabledType ? 'text-gray-700' : 'text-gray-500'}`}>
                      od {type.basePrice.toLocaleString('pl-PL')} PLN
                    </span>
                  )}
                  
                  {isDisabledType && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">
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
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="w-5 h-5 rounded bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    {item.description && (
                      <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0">
                    {item.price.toLocaleString('pl-PL')} PLN
                  </span>
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

                return (
                  <div 
                    key={item.id} 
                    onClick={() => !disabled && toggleItem(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      disabled 
                        ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/2' 
                        : selected 
                          ? 'border-purple-500/50 bg-purple-500/10 cursor-pointer'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 cursor-pointer'
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
                        <span className={`font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>
                          {item.name}
                        </span>
                        {item.includedInBase && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium flex items-center gap-1">
                            <Gift size={10} /> W cenie
                          </span>
                        )}
                        {item.defaultSelected && !item.includedInBase && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium flex items-center gap-1">
                            <Star size={10} /> Rekomendowane
                          </span>
                        )}
                        {item.popular && !item.defaultSelected && !item.includedInBase && (
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
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-500 font-medium">
                            Niedostępny
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
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
                        className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      >
                        {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n} className="bg-gray-900">{n}x</option>
                        ))}
                      </select>
                    )}

                    {/* Price */}
                    <span className={`text-sm flex-shrink-0 ${
                      item.includedInBase 
                        ? 'text-emerald-400 font-medium' 
                        : selected ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      {item.includedInBase 
                        ? 'Gratis'
                        : item.percentageAdd 
                          ? `+${item.percentageAdd}%`
                          : `${(item.price * qty).toLocaleString('pl-PL')} PLN`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PRAWA KOLUMNA: Podsumowanie (sticky) */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          {/* Main summary card */}
          <div className="relative group">
            {/* Gradient border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
            
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium tracking-wide text-white">Podsumowanie</h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                  {calculation.itemsCount} elementów
                </span>
              </div>

              {/* Selected project type */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Typ projektu</div>
                <div className="text-white font-medium flex items-center gap-2">
                  {getIcon(currentProjectType?.icon)}
                  {currentProjectType?.name}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400">Cena netto</span>
                  <span className="text-2xl font-semibold text-white">
                    {calculation.priceNetto.toLocaleString('pl-PL')} <span className="text-sm font-normal text-gray-500">PLN</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cena brutto (+{config?.vatRate || 23}% VAT)</span>
                  <span className="text-gray-400">{calculation.priceBrutto.toLocaleString('pl-PL')} PLN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Zaliczka ({config?.depositPercent || 20}%)</span>
                  <span className="text-purple-400 font-medium">{calculation.deposit.toLocaleString('pl-PL')} PLN</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Time estimates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Clock size={18} className="mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-semibold text-white">{calculation.days}</div>
                  <div className="text-xs text-gray-500">dni roboczych</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Layers size={18} className="mx-auto mb-1 text-purple-400" />
                  <div className="text-lg font-semibold text-white">{calculation.itemsCount}</div>
                  <div className="text-xs text-gray-500">wybranych funkcji</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href={getCalendlyUrl()}
                  target={config?.calendlyUrl ? '_blank' : undefined}
                  rel={config?.calendlyUrl ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  <Calendar size={18} />
                  {config?.ctaTexts?.reserve || 'Zarezerwuj termin'}
                  <ChevronRight size={16} />
                </a>

                <button
                  onClick={() => {
                    // TODO: Generuj PDF z wyceny
                    console.log('Generate PDF', { state, calculation })
                    alert('Funkcja generowania PDF zostanie dodana wkrótce!')
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 text-gray-400 hover:text-white font-medium rounded-xl transition-all hover:bg-white/5"
                >
                  <Download size={16} />
                  {config?.ctaTexts?.pdf || 'Pobierz wycenę PDF'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                * Ceny netto. Finalna wycena po rozmowie.
                <br />
                Płatność etapami • Opieka posprzedażowa
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
        cancelText="Anuluj"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default PricingConfigurator
