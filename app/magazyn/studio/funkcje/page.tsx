import { FeaturesPage } from '@/components/magazyn/studio/plans'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function FeaturesRoute() {
  return (
    <StudioFrame title="Funkcje i moduły">
      <FeaturesPage />
    </StudioFrame>
  )
}
