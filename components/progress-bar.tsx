'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

// ID elementu loadera w DOM
const LOADER_ID = 'page-transition-loader'
const FADE_IN_DURATION = 120 // ms - szybkie ale płynne

// SVG loadera jako string
const LOADER_SVG = `
  <svg width="64" height="64" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
    <path d="M276.682 61.0002L331.42 61.0002C333.2 61.0002 334.093 63.1527 332.835 64.4131L135.229 262.375C135.229 262.375 127.784 269.833 135.229 277.291C142.674 284.75 150.119 277.291 150.119 277.291L276.682 150.5C276.682 150.5 343.687 83.3751 403.246 143.042C462.805 202.708 396.173 269.833 396.173 269.833L276.682 389.166C246.903 419.604 202.233 418.999 202.233 418.999H147.496C145.715 418.999 144.822 416.847 146.081 415.586L343.687 217.625C343.687 217.625 351.132 210.166 343.687 202.708C336.242 195.25 328.797 202.708 328.797 202.708L202.233 329.499C202.233 329.499 135.229 396.624 75.6696 336.958C16.1102 277.291 83.1145 210.166 83.1145 210.166L202.233 90.8334C231.641 60.6273 276.682 61.0002 276.682 61.0002Z" fill="url(#loading-gradient-inline)"/>
    <defs>
      <linearGradient id="loading-gradient-inline" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
  </svg>
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  </style>
`

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const loadingStartTime = useRef<number>(0)
  const currentPageBgColor = useRef<string>('#05030C')
  const pendingNavigation = useRef<string | null>(null)

  // Funkcja pomocnicza do sprawdzenia czy kolor jest nieprzezroczysty
  const isValidBg = useCallback((color: string) => 
    color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent', [])

  // Pobierz kolor tła aktualnej strony
  const detectPageBgColor = useCallback((): string => {
    // 1. Szukaj elementu z klasą min-h-screen (główny wrapper strony)
    const minHScreenEl = document.querySelector('.min-h-screen')
    if (minHScreenEl) {
      const bg = window.getComputedStyle(minHScreenEl).backgroundColor
      if (isValidBg(bg)) {
        return bg
      }
    }
    
    // 2. Szukaj elementu z bg-[# w klasie (inline Tailwind color)
    const bgElements = document.querySelectorAll('[class*="bg-[#"]')
    for (const el of bgElements) {
      const bg = window.getComputedStyle(el).backgroundColor
      if (isValidBg(bg)) {
        return bg
      }
    }
    
    // 3. Szukaj elementów z bg-gray-950 (cennik)
    const grayBgEl = document.querySelector('.bg-gray-950')
    if (grayBgEl) {
      const bg = window.getComputedStyle(grayBgEl).backgroundColor
      if (isValidBg(bg)) {
        return bg
      }
    }
    
    // 4. Sprawdź body
    const bodyBg = window.getComputedStyle(document.body).backgroundColor
    if (isValidBg(bodyBg)) {
      return bodyBg
    }
    
    // 5. Fallback do domyślnego koloru
    return '#05030C'
  }, [isValidBg])

  // Pokaż loader z płynną animacją, wykonaj nawigację PO zakończeniu fade-in
  const showLoaderAndNavigate = useCallback((bgColor: string, href: string) => {
    // Sprawdź czy loader już istnieje
    if (document.getElementById(LOADER_ID)) return
    
    // Zapisz docelowy URL
    pendingNavigation.current = href
    
    // Utwórz element loadera z animacją fade-in
    const loader = document.createElement('div')
    loader.id = LOADER_ID
    loader.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${bgColor};
      opacity: 0;
      transition: opacity ${FADE_IN_DURATION}ms ease-out;
    `
    loader.innerHTML = LOADER_SVG
    
    // Dodaj do body
    document.body.appendChild(loader)
    
    // Wymuś reflow i rozpocznij animację fade-in
    loader.offsetHeight
    loader.style.opacity = '1'
    
    loadingStartTime.current = Date.now()
    
    // Wykonaj nawigację PO zakończeniu animacji fade-in
    setTimeout(() => {
      if (pendingNavigation.current) {
        router.push(pendingNavigation.current)
        pendingNavigation.current = null
      }
    }, FADE_IN_DURATION)
  }, [router])

  // Ukryj loader
  const hideLoader = useCallback(() => {
    const loader = document.getElementById(LOADER_ID)
    if (!loader) return
    
    loader.style.opacity = '0'
    setTimeout(() => {
      loader.remove()
    }, 150)
  }, [])

  // Zapisz kolor tła strony po jej załadowaniu
  useEffect(() => {
    // Poczekaj aż DOM się ustabilizuje
    const timer = setTimeout(() => {
      currentPageBgColor.current = detectPageBgColor()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [pathname, detectPageBgColor])

  // Ukryj loader gdy strona się załaduje
  useEffect(() => {
    if (loadingStartTime.current > 0) {
      const elapsed = Date.now() - loadingStartTime.current
      const remainingTime = Math.max(0, 500 - elapsed)
      
      const timer = setTimeout(() => {
        hideLoader()
        loadingStartTime.current = 0
      }, remainingTime)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams, hideLoader])

  // Nasłuchuj na kliknięcia w linki
  useEffect(() => {
    // Delegacja eventów - przechwytujemy kliknięcie PRZED Next.js
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      
      const href = target.getAttribute('href')
      if (!href) return
      
      const isInternalLink = href.startsWith('/') || href.startsWith(window.location.origin)
      const isHashLink = href.includes('#')
      const isExternalLink = target.target === '_blank'
      const isSameUrl = target.href === window.location.href
      
      if (isInternalLink && !isHashLink && !isExternalLink && !isSameUrl) {
        // ZATRZYMAJ domyślną nawigację Next.js
        e.preventDefault()
        e.stopPropagation()
        
        // Pokaż loader z animacją, nawiguj PO jej zakończeniu
        const color = currentPageBgColor.current || detectPageBgColor()
        showLoaderAndNavigate(color, href)
      }
    }

    // Listener dla custom eventu z GooeyNav - też zatrzymujemy
    const handleNavigationStart = (e: Event) => {
      const customEvent = e as CustomEvent
      const href = customEvent.detail?.href
      if (href && !href.includes('#')) {
        e.preventDefault()
        e.stopPropagation()
        
        const color = currentPageBgColor.current || detectPageBgColor()
        showLoaderAndNavigate(color, href)
      }
    }

    // Używamy capture phase żeby przechwycić PRZED Next.js
    document.addEventListener('click', handleClick, true)
    window.addEventListener('navigation-start', handleNavigationStart, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('navigation-start', handleNavigationStart, true)
    }
  }, [detectPageBgColor, showLoaderAndNavigate])

  // Ten komponent nie renderuje niczego - loader jest dodawany bezpośrednio do DOM
  return null
}
