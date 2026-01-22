'use client'

import { useState, useLayoutEffect, ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isPageReady, setIsPageReady] = useState(false)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    setIsPageReady(true)
  }, [])

  return (
    <div className={`transition-opacity duration-300 ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}
