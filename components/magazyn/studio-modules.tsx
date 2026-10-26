'use client'

import { useCallback, useEffect, useState } from 'react'
import { magazynInputClass } from '@/components/magazyn/ui'

interface VersionRow {
  moduleId: string
  version: string
  channel: 'stable' | 'beta'
  status: 'staged' | 'live' | 'withdrawn'
  size: number
  sha256: string
  name: string
  createdAt: string
}
interface Draft {
  text: string
  issuedAt: string
  current: { issuedAt: string; publishedBy: string } | null
}
interface Presigned {
  uploadUrl: string
  headers: Record<string, string>
}

const TH = 'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500'
const TD = 'px-3 py-2 text-sm text-neutral-200'
const BTN = 'rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:opacity-50'
const STATUS_LABEL = { staged: 'zarejestrowana', live: 'w katalogu', withdrawn: 'wycofana' } as const

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string }
  if (!res.ok) throw new Error([data.error, data.message].filter(Boolean).join(': ') || `Błąd ${res.status}`)
  return data
}

const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(1)} MB`

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** PUT z postępem (fetch nie raportuje postępu wysyłania). */
function putWithProgress(url: string, headers: Record<string, string>, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Wgrywanie nieudane (HTTP ${xhr.status})`)))
    xhr.onerror = () => reject(new Error('Wgrywanie nieudane (sieć lub CORS).'))
    xhr.send(file)
  })
}

export function Modules({ notify }: { notify: (m: string, error?: boolean) => void }) {
  const [rows, setRows] = useState<VersionRow[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [signature, setSignature] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [channel, setChannel] = useState<'stable' | 'beta'>('stable')
  const [notesPl, setNotesPl] = useState('')
  const [notesEn, setNotesEn] = useState('')
  const [progress, setProgress] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setRows((await api<{ versions: VersionRow[] }>('/api/magazyn/studio/modules')).versions)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Błąd', true)
    }
  }, [notify])
  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const upload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    try {
      setProgress('Czytam pakiet…')
      const { unzipSync } = await import('fflate')
      const buffer = await file.arrayBuffer()
      // Rozpakowujemy TYLKO manifest i podpis; reszta pakietu (np. 236 MB) nie jest dekompresowana.
      const entries = unzipSync(new Uint8Array(buffer), { filter: (f) => f.name === 'module.json' || f.name === 'module.sig' })
      const manifestBytes = entries['module.json']
      const sigBytes = entries['module.sig']
      if (!manifestBytes || !sigBytes) throw new Error('Pakiet nie zawiera module.json i module.sig.')
      const manifestJson = new TextDecoder().decode(manifestBytes)
      const manifestSig = new TextDecoder().decode(sigBytes).trim()
      const manifest = JSON.parse(manifestJson) as { id: string; version: string }

      setProgress('Liczę SHA-256…')
      const sha256 = await sha256Hex(buffer)

      const presigned = await api<Presigned>('/api/magazyn/studio/uploads', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'module',
          id: manifest.id,
          version: manifest.version,
          filename: `${manifest.id}-${manifest.version}.fmod`,
          size: file.size,
        }),
      })
      await putWithProgress(presigned.uploadUrl, presigned.headers, file, (p) => setProgress(`Wgrywam do R2… ${(p * 100).toFixed(0)}%`))

      setProgress('Rejestruję wersję…')
      await api('/api/magazyn/studio/modules', {
        method: 'POST',
        body: JSON.stringify({ manifestJson, manifestSig, channel, size: file.size, sha256, notesPl, notesEn }),
      })
      notify(`Zarejestrowano ${manifest.id} ${manifest.version} (${mb(file.size)}). Aby trafiła do katalogu: „Dodaj do katalogu”, potem podpisz szkic.`)
      setFile(null)
      setNotesPl('')
      setNotesEn('')
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    } finally {
      setProgress(null)
    }
  }

  const setStatus = async (r: VersionRow, status: VersionRow['status']) => {
    if (status === 'withdrawn' && !confirm(`Wycofać ${r.moduleId} ${r.version}? Zniknie z następnego katalogu; zainstalowane kopie zostają.`)) return
    try {
      await api('/api/magazyn/studio/modules', { method: 'PATCH', body: JSON.stringify({ moduleId: r.moduleId, version: r.version, status }) })
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }

  const loadDraft = async () => {
    try {
      setDraft(await api<Draft>('/api/magazyn/studio/catalog'))
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }
  const downloadDraft = () => {
    if (!draft) return
    const url = URL.createObjectURL(new Blob([draft.text], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'catalog-draft.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const publish = async () => {
    if (!draft) return
    try {
      await api('/api/magazyn/studio/catalog', { method: 'POST', body: JSON.stringify({ text: draft.text, signature }) })
      notify('Katalog opublikowany: /api/studio/catalog zwraca nową, podpisaną wersję.')
      setDraft(null)
      setSignature('')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Błąd', true)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={upload} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-4">
        <input className={`${magazynInputClass} md:col-span-2`} type="file" accept=".fmod" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <select className={magazynInputClass} value={channel} onChange={(e) => setChannel(e.target.value as 'stable' | 'beta')}>
          <option value="stable">Kanał stable</option>
          <option value="beta">Kanał beta</option>
        </select>
        <button type="submit" disabled={!file || progress !== null} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">
          {progress ?? 'Wgraj pakiet .fmod'}
        </button>
        <input className={`${magazynInputClass} md:col-span-2`} placeholder="Notatki wydania (PL)" value={notesPl} onChange={(e) => setNotesPl(e.target.value)} />
        <input className={`${magazynInputClass} md:col-span-2`} placeholder="Release notes (EN)" value={notesEn} onChange={(e) => setNotesEn(e.target.value)} />
        <p className="text-xs text-neutral-500 md:col-span-4">
          Panel sprawdza podpis wydawcy manifestu (module.sig) kluczem publicznym, wgrywa plik prosto do R2 i rejestruje wersję. Wersje są niezmienne.
        </p>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr>{['Moduł', 'Wersja', 'Kanał', 'Rozmiar', 'Status', ''].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={`${r.moduleId}@${r.version}`}>
                <td className={TD}>{r.name} <span className="font-mono text-xs text-neutral-500">{r.moduleId}</span></td>
                <td className={TD}>{r.version}</td>
                <td className={TD}>{r.channel}</td>
                <td className={TD}>{mb(r.size)}</td>
                <td className={TD}>{STATUS_LABEL[r.status]}</td>
                <td className={`${TD} flex gap-2`}>
                  {r.status !== 'live' && <button className={BTN} onClick={() => void setStatus(r, 'live')}>Dodaj do katalogu</button>}
                  {r.status === 'live' && <button className={BTN} onClick={() => void setStatus(r, 'staged')}>Zdejmij z katalogu</button>}
                  {r.status !== 'withdrawn' && <button className={BTN} onClick={() => void setStatus(r, 'withdrawn')}>Wycofaj</button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className={TD} colSpan={6}>Brak zarejestrowanych wersji.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-sm font-medium">Publikacja katalogu (podpis lokalny kluczem wydawcy)</div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-400">
          <li>Ustaw wersje „w katalogu” powyżej i wygeneruj szkic.</li>
          <li>Pobierz szkic i podpisz go lokalnie: <code className="text-neutral-200">pnpm hub:tool sign catalog-draft.json</code> (klucz prywatny zostaje u Ciebie).</li>
          <li>Wklej podpis (base64) i opublikuj — panel zweryfikuje go kluczem publicznym i odrzuci cofnięcie wersji katalogu.</li>
        </ol>
        <div className="flex gap-2">
          <button className={BTN} onClick={() => void loadDraft()}>Generuj szkic</button>
          {draft && <button className={BTN} onClick={downloadDraft}>Pobierz szkic</button>}
        </div>
        {draft && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500">
              Szkic z {new Date(draft.issuedAt).toLocaleString('pl-PL')}; bieżący katalog: {draft.current ? `${new Date(draft.current.issuedAt).toLocaleString('pl-PL')} (${draft.current.publishedBy})` : 'brak'}
            </div>
            <textarea className={`${magazynInputClass} h-28 font-mono text-xs`} readOnly value={draft.text} />
            <input className={magazynInputClass} placeholder="Podpis Ed25519 (base64)" value={signature} onChange={(e) => setSignature(e.target.value)} />
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50" disabled={signature.trim().length < 10} onClick={() => void publish()}>
              Opublikuj katalog
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
