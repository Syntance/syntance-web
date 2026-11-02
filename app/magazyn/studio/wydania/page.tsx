import { ReleasesPage } from '@/components/magazyn/studio/releases'
import { StudioFrame } from '@/components/magazyn/studio/page-frame'

export const dynamic = 'force-dynamic'

export default function ReleasesRoute() {
  return (
    <StudioFrame title="Wydania (pobieranie)" description="Instalatory aplikacji. Przycisk „Pobierz” na stronie syntance.com/syntance-studio wskazuje najnowsze opublikowane wydanie kanału stable.">
      <ReleasesPage />
    </StudioFrame>
  )
}
