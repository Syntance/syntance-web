'use client'

import { openCookieSettings } from '@/lib/consent'

type CookieSettingsTriggerProps = {
  className?: string
}

export function CookieSettingsTrigger({ className }: CookieSettingsTriggerProps) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      Ustawienia cookies
    </button>
  )
}
