'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Layout, FileText, Layers, Zap, Plug, CreditCard, Truck, 
  Globe, ShoppingCart, Smartphone, Check, Sparkles, Clock,
  Calendar, Download, ChevronRight
} from 'lucide-react'
import { PricingData, PricingItem } from '@/sanity/queries/pricing'

// Mapa ikon - używamy typu LucideIcon
const iconMap: Record<string, typeof Layout> = {
  Layout, FileText, Layers, Zap, Plug, CreditCard, Truck,
  Globe, ShoppingCart, Smartphone,
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

  const [state, setState] = useState<ConfiguratorState>({
    projectType: projectTypes[0]?.id || 'website',
    selectedItems: [],
    quantities: {},
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

    allSelected.forEach(id => {
      const item = items.find(i => i.id === id)
      if (!item) return

      if (item.percentageAdd) {
        percentageAdd += item.percentageAdd
      } else {
        const qty = state.quantities[id] || 1
        totalPrice += item.price * qty
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
      itemsCount: allSelected.length,
    }
  }, [requiredItems, state.selectedItems, state.quantities, items, config])

  // Toggle elementu
  const toggleItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(i => i !== id)
        : [...prev.selectedItems, id]
    }))
  }, [])

  // Zmiana ilości
  const setQuantity = useCallback((id: string, qty: number) => {
    setState(prev => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: qty }
    }))
  }, [])

  // Sprawdź dependencies
  const isDisabled = useCallback((item: PricingItem) => {
    if (!item.dependencies?.length) return false
    return !item.dependencies.every(dep => 
      state.selectedItems.includes(dep) || requiredItems.some(r => r.id === dep)
    )
  }, [state.selectedItems, requiredItems])

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
    return IconComponent ? <IconComponent size={20} className="text-gray-400" /> : null
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
              return (
                <button
                  key={type.id}
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    projectType: type.id,
                    selectedItems: [],
                    quantities: {}
                  }))}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isSelected 
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
                    <span className={`font-medium tracking-wide ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {type.name}
                    </span>
                  </div>
                  
                  {type.basePrice && (
                    <span className="text-sm text-gray-500">
                      od {type.basePrice.toLocaleString('pl-PL')} PLN
                    </span>
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
                        {item.popular && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
                            Popularne
                          </span>
                        )}
                        {item.new && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium flex items-center gap-1">
                            <Sparkles size={10} /> Nowość
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
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
                    <span className={`text-sm flex-shrink-0 ${selected ? 'text-purple-400' : 'text-gray-400'}`}>
                      {item.percentageAdd 
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
                  <Zap size={18} className="mx-auto mb-1 text-amber-400" />
                  <div className="text-lg font-semibold text-white">~{calculation.hours}h</div>
                  <div className="text-xs text-gray-500">godzin pracy</div>
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

                <a
                  href={config?.calendlyUrl ? `${config.calendlyUrl}?a1=Warsztat%20Discovery` : '#contact'}
                  target={config?.calendlyUrl ? '_blank' : undefined}
                  rel={config?.calendlyUrl ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-white/20"
                >
                  <Sparkles size={16} />
                  {config?.ctaTexts?.workshop || 'Warsztat Discovery'}
                  <span className="text-sm text-gray-400">
                    ({(config?.discoveryWorkshopPrice || 4500).toLocaleString('pl-PL')} PLN)
                  </span>
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
    </div>
  )
}

export default PricingConfigurator
