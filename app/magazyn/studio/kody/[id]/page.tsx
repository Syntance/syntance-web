import { PromoDetail } from '@/components/magazyn/studio/promo'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default async function PromoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <StudioFrame title="Kod promocyjny">
      <PromoDetail id={id} />
    </StudioFrame>
  )
}
