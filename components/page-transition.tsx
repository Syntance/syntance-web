'use client'

import { useState, useLayoutEffect, ReactNode } from 'react'

interface HeroTransitionProps {
  children: ReactNode
}

export function HeroTransition({ children }: HeroTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    
    // Opóźnienie 550ms - czeka aż animacja ładowania się zakończy (500ms) + 50ms bufora
    const timer = setTimeout(() => setIsVisible(true), 550)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {children}
    </div>
  )
}
