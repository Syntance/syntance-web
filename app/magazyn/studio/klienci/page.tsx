import { CustomersList } from '@/components/magazyn/studio/customers'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function CustomersPage() {
  return (
    <StudioFrame title="Klienci" description="Użytkownicy = adresy e-mail z licencji (aplikacja nie ma kont). Szczegóły, blokada i dane RODO w profilu klienta.">
      <CustomersList />
    </StudioFrame>
  )
}
