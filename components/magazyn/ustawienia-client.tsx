'use client'

import { useState } from 'react'
import type { PaymentSettings, ContractSettings } from '@/lib/db/queries/settings'

type Props = {
  payment: PaymentSettings | null
  contracts: ContractSettings
}

export function UstawieniaClient({ payment, contracts }: Props) {
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(
    payment ?? {
      accountHolder: '',
      accountNumber: '',
      transferTitleTemplate: 'Rezerwacja {bookingId}',
    },
  )
  const [contractsForm, setContractsForm] = useState(contracts)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function save() {
    setPending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/magazyn/ustawienia', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment: paymentForm, contracts: contractsForm }),
      })
      if (!res.ok) throw new Error('Zapis nie powiódł się')
      setStatus('Ustawienia zapisane.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Ustawienia</h1>
        <p className="text-sm text-neutral-400">Dane do przelewu i pliki umów.</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-medium">Płatności</h2>
        {(['accountHolder', 'bankName', 'accountNumber', 'swiftBic', 'transferTitleTemplate', 'additionalInfo'] as const).map((key) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">{key}</span>
            <input
              value={paymentForm[key] ?? ''}
              onChange={(e) => setPaymentForm({ ...paymentForm, [key]: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
          </label>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-medium">Umowy ({contractsForm.files.length})</h2>
        <textarea
          value={JSON.stringify(contractsForm, null, 2)}
          onChange={(e) => {
            try {
              setContractsForm(JSON.parse(e.target.value) as ContractSettings)
            } catch {
              /* ignore */
            }
          }}
          rows={12}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs"
        />
      </section>

      <button type="button" onClick={save} disabled={pending} className="rounded-full bg-white px-5 py-2 text-sm text-black disabled:opacity-50">
        {pending ? 'Zapisuję…' : 'Zapisz ustawienia'}
      </button>
      {status && <p className="text-sm text-neutral-400">{status}</p>}
    </div>
  )
}
