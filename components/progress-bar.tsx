'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Konfiguracja NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: 'ease',
  speed: 300,
})

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      const href = target.href
      const currentUrl = window.location.href
      
      // Uruchom progress bar tylko dla linków prowadzących do innych stron
      if (href !== currentUrl && target.target !== '_blank') {
        NProgress.start()
      }
    }

    const handleMutation = () => {
      const anchors = document.querySelectorAll('a[href^="/"]')
      anchors.forEach(anchor => {
        anchor.addEventListener('click', handleAnchorClick as EventListener)
      })
    }

    handleMutation()

    // Observer dla dynamicznie dodawanych linków
    const observer = new MutationObserver(handleMutation)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      const anchors = document.querySelectorAll('a[href^="/"]')
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener)
      })
    }
  }, [])

  return null
}
