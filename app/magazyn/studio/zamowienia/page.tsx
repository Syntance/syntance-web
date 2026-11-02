import { OrdersList } from '@/components/magazyn/studio/lists'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  return (
    <StudioFrame title="Zamówienia" description="Zakupy, odnowienia i zwroty zapisane przez webhook płatności.">
      <OrdersList />
    </StudioFrame>
  )
}
