import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Logowanie — Syntance Shop',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function MagazynLoginPage() {
  const session = await getAdminSession()
  if (session) redirect('/magazyn')

  return (
    <div className="flex min-h-[calc(100dvh-100px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-1 text-2xl font-medium">Syntance Shop</h1>
        <p className="mb-6 text-sm text-neutral-400">Zaloguj się, żeby zarządzać treściami i rezerwacjami.</p>
        <LoginForm />
      </div>
    </div>
  )
}
