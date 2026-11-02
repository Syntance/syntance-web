import { PlansPage } from '@/components/magazyn/studio/plans'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function PlansRoute() {
  return (
    <StudioFrame title="Plany" description="Skład planu: moduły i funkcje, liczba urządzeń i okres. Z planu wystawiasz licencje; zmiana planu nie rusza już wystawionych.">
      <PlansPage />
    </StudioFrame>
  )
}
