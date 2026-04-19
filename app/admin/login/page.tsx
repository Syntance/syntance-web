import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Logowanie — Panel Syntance',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const jar = await cookies()
  const session = await verifySession(jar.get(ADMIN_COOKIE_NAME)?.value)
  if (session) redirect('/admin')

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-1 text-2xl font-medium">Panel Syntance</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Zaloguj się, żeby zarządzać rezerwacjami i stroną.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
