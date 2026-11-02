import { CustomerDetail } from '@/components/magazyn/studio/customers'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <StudioFrame title="Klient">
      <CustomerDetail id={id} />
    </StudioFrame>
  )
}
