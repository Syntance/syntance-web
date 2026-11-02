import { StudioFrame } from '@/components/magazyn/studio/page-frame'
import { LicensesList } from '@/components/magazyn/studio/licenses'

export const dynamic = 'force-dynamic'

export default function LicensesPage() {
  return (
    <StudioFrame title="Licencje" description="Wszystkie licencje Syntance Studio: wystawiaj ręcznie, zmieniaj warunki, odbieraj urządzenia i unieważniaj.">
      <LicensesList />
    </StudioFrame>
  )
}
