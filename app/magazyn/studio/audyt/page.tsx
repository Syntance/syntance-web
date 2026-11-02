import { AuditList } from '@/components/magazyn/studio/lists'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function AuditPage() {
  return (
    <StudioFrame title="Dziennik audytu">
      <AuditList />
    </StudioFrame>
  )
}
