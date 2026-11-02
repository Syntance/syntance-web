import { PromoList } from '@/components/magazyn/studio/promo'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function PromoPage() {
  return (
    <StudioFrame title="Kody promocyjne" description="Rabat procentowy lub kwotowy, darmowa licencja albo dłuższy trial — z limitem użyć i datą ważności.">
      <PromoList />
    </StudioFrame>
  )
}
