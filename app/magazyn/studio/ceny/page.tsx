import { Prices } from '@/components/magazyn/studio/lists'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function PricesPage() {
  return (
    <StudioFrame title="Ceny (Paddle)">
      <Prices />
    </StudioFrame>
  )
}
