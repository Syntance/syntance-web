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
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Lewo: Ilość elementów */}
        <div className="flex items-center gap-2 text-gray-300">
          <ShoppingCart size={16} className="text-purple-400" />
          <span className="text-sm">
            {itemsCount} {itemsCount === 1 ? 'element' : 'elementów'}
          </span>
        </div>

        {/* Prawo: Cena */}
        <div className="text-right">
          <div className="text-lg font-semibold text-white">
            {price.toLocaleString('pl-PL')} <span className="text-xs font-normal text-gray-300">PLN</span>
          </div>
          <div className="text-xs text-gray-300">netto</div>
        </div>
      </div>
    </div>
  )
}
