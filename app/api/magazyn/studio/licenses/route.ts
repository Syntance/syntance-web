import { adminRoute } from '@/lib/studio/admin-api'
import { listLicenses } from '@/lib/studio/admin-queries'
import { getLicenseService } from '@/lib/studio/runtime'
import { z } from 'zod'
import { ManualLicenseInput } from '@/lib/studio/license-service'

export const runtime = 'nodejs'

const Trial = z.object({ trial: z.literal(true), email: z.email(), days: z.number().int().min(1).max(90).default(14), entitlements: ManualLicenseInput.shape.entitlements })

export function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? ''
  return adminRoute(async () => ({ licenses: await listLicenses('studio', q) }))
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null)
  return adminRoute(async (session) => {
    const trial = Trial.safeParse(body)
    const license = trial.success
      ? await getLicenseService().issueTrial(session.email, trial.data.email, trial.data.entitlements, trial.data.days)
      : await getLicenseService().issueManual(session.email, ManualLicenseInput.parse(body))
    return { license }
  })
}
