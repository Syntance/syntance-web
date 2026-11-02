import { LicenseDetail } from '@/components/magazyn/studio/licenses'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default async function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <StudioFrame title="Szczegóły licencji">
      <LicenseDetail id={id} />
    </StudioFrame>
  )
}
