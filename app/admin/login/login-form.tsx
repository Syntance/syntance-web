'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Nie udało się zalogować.')
      }
      router.replace('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-400">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-neutral-600 focus:border-purple-500 focus:outline-none"
          placeholder="kamil@syntance.com"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-400">Hasło</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-neutral-600 focus:border-purple-500 focus:outline-none"
          placeholder="••••••••"
        />
      </label>
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Loguję…
          </>
        ) : (
          'Zaloguj'
        )}
      </button>
    </form>
  )
}
