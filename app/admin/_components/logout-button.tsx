'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onClick() {
    setPending(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      {pending ? 'Wylogowuję…' : 'Wyloguj'}
    </button>
  )
}
