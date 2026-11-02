import { z } from 'zod'
import { adminRoute } from '@/lib/studio/admin-api'
import { LicenseListParams, listLicenses } from '@/lib/studio/admin-queries'
import { EntitlementList, ManualLicenseInput } from '@/lib/studio/license-service'
import { getLicenseService } from '@/lib/studio/runtime'

export const runtime = 'nodejs'

const Trial = z.object({
  trial: z.literal(true),
  email: z.email(),
  days: z.number().int().min(1).max(365).default(14),
  entitlements: EntitlementList,
})

export function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams)
  return adminRoute(async () => listLicenses('studio', LicenseListParams.parse(params)))
}

/** Ręczne wystawienie licencji (wieczysta / subskrypcja) albo licencji próbnej. */
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
