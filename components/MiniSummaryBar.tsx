import { ShoppingCart } from 'lucide-react'

interface Props {
  price: number
  itemsCount: number
  isVisible: boolean
}

export function MiniSummaryBar({ price, itemsCount, isVisible }: Props) {
  return (
    <div
      className={`
        lg:hidden fixed bottom-0 left-0 right-0 z-50
        bg-gray-900/95 backdrop-blur-md border-t border-white/10
        transition-transform duration-300 ease-out
        safe-pl safe-pr
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{
        // Fallback gdy safe-pb utility się nie załaduje + iOS home indicator clearance
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
      }}
      role="status"
      aria-label="Podsumowanie wyceny"
    >
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Lewo: Ilość elementów */}
        <div className="flex items-center gap-2 text-gray-400">
          <ShoppingCart size={16} className="text-purple-400" />
          <span className="text-sm">
            {itemsCount} {itemsCount === 1 ? 'element' : 'elementów'}
          </span>
        </div>

        {/* Prawo: Cena */}
        <div className="text-right">
          <div className="text-lg font-semibold text-white">
            {price.toLocaleString('pl-PL')} <span className="text-xs font-normal text-gray-400">PLN</span>
          </div>
          <div className="text-xs text-gray-400">netto</div>
        </div>
      </div>
    </div>
  )
}
