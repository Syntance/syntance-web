'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  clearScrollRestore,
  consumeHistoryTraversal,
  consumeScrollRestore,
  peekScrollRestore,
  restoreScrollPosition,
} from '@/lib/navigation/scroll-restore'

export function NavigationScrollRestore() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash) return

    const isBack = consumeHistoryTraversal()
    const savedY = peekScrollRestore(pathname)

    if (isBack && savedY !== null) {
      consumeScrollRestore(pathname)
      restoreScrollPosition(savedY)
      return
    }

    if (!isBack) {
      clearScrollRestore(pathname)
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
