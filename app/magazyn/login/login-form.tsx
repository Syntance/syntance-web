'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const INPUT =
  'w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-neutral-600 focus:border-purple-500 focus:outline-none'
const BUTTON =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-60'

type Mode = 'login' | 'setup' | 'confirm' | 'backup'

async function post<T>(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = (await res.json().catch(() => ({}))) as T
  return { ok: res.ok, status: res.status, data }
}

interface Reply {
  ok?: boolean
  error?: string
  needsCode?: boolean
  setupRequired?: boolean
  secret?: string
  otpauthUri?: string
  backupCodes?: string[]
}

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsCode, setNeedsCode] = useState(false)
  const [bootstrapToken, setBootstrapToken] = useState('')
  const [secret, setSecret] = useState<{ secret: string; uri: string } | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function enter() {
    router.replace('/magazyn')
    router.refresh()
  }

  async function run(action: () => Promise<void>) {
    setError(null)
    setPending(true)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd.')
    } finally {
      setPending(false)
    }
  }

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault()
    void run(async () => {
      const { ok, data } = await post<Reply>('/api/admin/login', { email, password, ...(needsCode ? { code } : {}) })
      if (data.needsCode) {
        setNeedsCode(true)
        return
      }
      if (data.setupRequired) {
        setMode('setup')
        throw new Error('Konto czeka na dokończenie konfiguracji (TOTP).')
      }
      if (!ok) throw new Error(data.error ?? 'Nie udało się zalogować.')
      enter()
    })
  }

  const onSetup = (e: React.FormEvent) => {
    e.preventDefault()
    void run(async () => {
      const { ok, data } = await post<Reply>('/api/admin/setup', { bootstrapToken, email, password })
      if (!ok || !data.secret || !data.otpauthUri) throw new Error(data.error ?? 'Konfiguracja niedostępna.')
      setSecret({ secret: data.secret, uri: data.otpauthUri })
      setCode('')
      setMode('confirm')
    })
  }

  const onConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    void run(async () => {
      const { ok, data } = await post<Reply>('/api/admin/setup/confirm', { email, password, code })
      if (!ok || !data.backupCodes) throw new Error(data.error ?? 'Niepoprawny kod.')
      setBackupCodes(data.backupCodes)
      setMode('backup')
    })
  }

  if (mode === 'backup') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-300">
          Zapisz kody zapasowe w menedżerze haseł. Każdy działa raz i pozwala zalogować się bez telefonu. Nie zobaczysz ich ponownie.
        </p>
        <ul className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm">
          {backupCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button type="button" onClick={enter} className={BUTTON}>
          Zapisałem — przejdź do panelu
        </button>
      </div>
    )
  }

  if (mode === 'confirm' && secret) {
    return (
      <form onSubmit={onConfirm} className="space-y-4">
        <p className="text-sm text-neutral-300">
          Dodaj konto w aplikacji uwierzytelniającej (np. 1Password, Authy, Google Authenticator) i wpisz kod ręcznie:
        </p>
        <code className="block break-all rounded-lg border border-white/10 bg-black/40 p-3 text-sm tracking-wider">{secret.secret}</code>
        <a href={secret.uri} className="block text-sm text-purple-300 underline">
          Otwórz w aplikacji uwierzytelniającej
        </a>
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-400">Kod z aplikacji (6 cyfr)</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={INPUT}
          />
        </label>
        {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}
        <button type="submit" disabled={pending} className={BUTTON}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Potwierdź i włącz MFA'}
        </button>
      </form>
    )
  }

  const isSetup = mode === 'setup'
  return (
    <form onSubmit={isSetup ? onSetup : onLogin} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-400">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={needsCode}
          className={INPUT}
          placeholder="kamil@syntance.com"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-400">{isSetup ? 'Nowe hasło (min. 6 znaków)' : 'Hasło'}</span>
        <input
          type="password"
          required
          minLength={isSetup ? 6 : undefined}
          autoComplete={isSetup ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={needsCode}
          className={INPUT}
          placeholder="••••••••"
        />
      </label>
      {isSetup && (
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-400">Token konfiguracji (ADMIN_BOOTSTRAP_TOKEN)</span>
          <input type="password" required autoComplete="off" value={bootstrapToken} onChange={(e) => setBootstrapToken(e.target.value)} className={INPUT} />
        </label>
      )}
      {needsCode && (
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-400">Kod z aplikacji lub kod zapasowy</span>
          <input
            required
            autoFocus
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={INPUT}
          />
        </label>
      )}
      {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}
      <button type="submit" disabled={pending} className={BUTTON}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Chwila…
          </>
        ) : isSetup ? (
          'Utwórz konto i pokaż sekret TOTP'
        ) : needsCode ? (
          'Zweryfikuj'
        ) : (
          'Zaloguj'
        )}
      </button>
      {!needsCode && (
        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode(isSetup ? 'login' : 'setup')
          }}
          className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
        >
          {isSetup ? 'Wróć do logowania' : 'Pierwsza konfiguracja konta'}
        </button>
      )}
    </form>
  )
}
