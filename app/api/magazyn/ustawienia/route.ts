import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  getPaymentSettings,
  savePaymentSettings,
  getContractFiles,
  saveContractFiles,
  type PaymentSettings,
  type ContractSettings,
} from '@/lib/db/queries/settings'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const [payment, contracts] = await Promise.all([getPaymentSettings(), getContractFiles()])
  return NextResponse.json({ payment, contracts })
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as {
    payment: PaymentSettings
    contracts: ContractSettings
  }
  await Promise.all([savePaymentSettings(body.payment), saveContractFiles(body.contracts)])
  return NextResponse.json({ ok: true })
}
