import { ModulesPage } from '@/components/magazyn/studio/lists'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function ModulesRoute() {
  return (
    <StudioFrame title="Moduły i katalog" description="Wersje modułów (.fmod) i podpisany katalog aktualizacji.">
      <ModulesPage />
    </StudioFrame>
  )
}
