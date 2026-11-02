'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BTN,
  BTN_DANGER,
  BTN_PRIMARY,
  Badge,
  Card,
  CopyButton,
  EmptyState,
  TD,
  TH,
  TableWrap,
  api,
  errMsg,
  fmtDateTime,
  useConfirm,
  useNotify,
} from '@/components/magazyn/kit'
import { Field, magazynInputClass } from '@/components/magazyn/ui'

interface Release {
  id: string
  version: string
  channel: 'stable' | 'beta'
  filename: string
  url: string
  size: number
  sha256: string
  notesPl: string
  published: boolean
  publishedAt: string | null
  createdAt: string
}

interface Presigned {
  uploadUrl: string
  headers: Record<string, string>
}

const mb = (n: number): string => `${(n / 1024 / 1024).toFixed(1)} MB`

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
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

/** Wersja z nazwy pliku w stylu „Syntance-Studio-Setup-0.1.12-beta.exe” (podpowiedź, można poprawić). */
const guessVersion = (name: string): string => /(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)/.exec(name)?.[1] ?? ''

export function ReleasesPage() {
  const { notify, node } = useNotify()
  const { confirm, dialog } = useConfirm()
  const [rows, setRows] = useState<Release[] | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [version, setVersion] = useState('')
  const [channel, setChannel] = useState<'stable' | 'beta'>('stable')
  const [notes, setNotes] = useState('')
  const [progress, setProgress] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setRows((await api<{ releases: Release[] }>('/api/magazyn/studio/releases')).releases)
    } catch (e) {
      notify(errMsg(e), true)
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
      setProgress('Liczę SHA-256…')
      const sha256 = await sha256Hex(file)
      const presigned = await api<Presigned>('/api/magazyn/studio/uploads', {
        method: 'POST',
        body: JSON.stringify({ kind: 'installer', id: 'app', version, filename: file.name, size: file.size }),
      })
      await putWithProgress(presigned.uploadUrl, presigned.headers, file, (p) => setProgress(`Wgrywam do R2… ${(p * 100).toFixed(0)}%`))
      setProgress('Rejestruję wydanie…')
      await api('/api/magazyn/studio/releases', {
        method: 'POST',
        body: JSON.stringify({ version, channel, filename: file.name, size: file.size, sha256, notesPl: notes }),
      })
      notify(`Wgrano ${file.name} (${mb(file.size)}). Wydanie jest nieopublikowane — opublikuj je poniżej, żeby pojawiło się na stronie.`)
      setFile(null)
      setNotes('')
      setVersion('')
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    } finally {
      setProgress(null)
    }
  }

  const setPublished = async (r: Release, published: boolean) => {
    if (published) {
      const ok = await confirm({
        title: `Opublikować wersję ${r.version}?`,
        body: r.channel === 'stable' ? 'Przycisk „Pobierz” na stronie zacznie wskazywać ten plik.' : 'To wydanie beta — przycisk na stronie używa tylko kanału stable, więc strona się nie zmieni.',
        confirmLabel: 'Opublikuj',
      })
      if (!ok) return
    }
    try {
      await api(`/api/magazyn/studio/releases/${r.id}`, { method: 'PATCH', body: JSON.stringify({ published }) })
      notify(published ? 'Opublikowano.' : 'Wycofano ze strony.')
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  const remove = async (r: Release) => {
    if (!(await confirm({ title: `Usunąć wydanie ${r.version}?`, body: 'Usuwa rekord i plik z R2. Tego nie da się cofnąć.', confirmLabel: 'Usuń', danger: true }))) return
    try {
      await api(`/api/magazyn/studio/releases/${r.id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      notify(errMsg(err), true)
    }
  }

  return (
    <div className="space-y-5">
      {dialog}
      {node}
      <Card title="Wgraj instalator">
        <form onSubmit={(e) => void upload(e)} className="space-y-4">
          <Field label="Plik instalatora (.exe, .msi, .msix)" hint="Do 1 GB. Plik trafia prosto do R2 (dl.syntance.com); SHA-256 liczy przeglądarka przed wgraniem.">
            <input
              className={magazynInputClass}
              type="file"
              accept=".exe,.msi,.msix"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                if (f && !version) setVersion(guessVersion(f.name))
              }}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Wersja (semver)" hint="np. 0.1.12-beta lub 1.0.0">
              <input className={`${magazynInputClass} font-mono`} required pattern="\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?" value={version} onChange={(e) => setVersion(e.target.value)} />
            </Field>
            <Field label="Kanał">
              <select className={magazynInputClass} value={channel} onChange={(e) => setChannel(e.target.value as 'stable' | 'beta')}>
                <option value="stable">stable (pokazywany na stronie)</option>
                <option value="beta">beta</option>
              </select>
            </Field>
          </div>
          <Field label="Co nowego (PL, opcjonalnie)">
            <input className={magazynInputClass} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <button type="submit" className={BTN_PRIMARY} disabled={!file || !version || progress !== null}>
            {progress ?? 'Wgraj i zarejestruj'}
          </button>
        </form>
      </Card>

      {rows && rows.length === 0 ? (
        <EmptyState title="Brak wydań" hint="Wgraj instalator, a potem go opublikuj — dopiero wtedy na stronie pojawi się przycisk pobierania." />
      ) : (
        <TableWrap caption="Wydania aplikacji">
          <thead>
            <tr>{['Wersja', 'Kanał', 'Plik', 'Status', ''].map((h) => <th key={h} scope="col" className={TH}>{h || <span className="sr-only">Akcje</span>}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows?.map((r) => (
              <tr key={r.id}>
                <td className={TD}>
                  <span className="font-mono">{r.version}</span>
                  <div className="text-xs text-neutral-500">{fmtDateTime(r.createdAt)}</div>
                </td>
                <td className={TD}><Badge>{r.channel}</Badge></td>
                <td className={TD}>
                  {r.filename} · {mb(r.size)}
                  <div className="font-mono text-xs text-neutral-500">SHA-256 {r.sha256.slice(0, 16)}…</div>
                </td>
                <td className={TD}>{r.published ? <Badge tone="good">Opublikowane</Badge> : <Badge tone="neutral">Szkic</Badge>}</td>
                <td className={`${TD} space-x-2 text-right`}>
                  <CopyButton value={r.url} label="Kopiuj link" />
                  {r.published ? (
                    <button type="button" className={BTN} onClick={() => void setPublished(r, false)}>Wycofaj</button>
                  ) : (
                    <>
                      <button type="button" className={BTN} onClick={() => void setPublished(r, true)}>Opublikuj</button>
                      <button type="button" className={BTN_DANGER} onClick={() => void remove(r)}>Usuń</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
