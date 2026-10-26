import { appPost, getLicenseService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

/** Kontrakt aplikacji desktopowej (ADR 019 w folio-pdf): POST /api/studio/v1/refresh. */
export function POST(req: Request) {
  return appPost(req, (body) => getLicenseService().refresh(body))
}
