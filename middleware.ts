import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Przekierowania dla starych URL-i (SEO - 301 permanent redirects)
const redirects: Record<string, string> = {
  // Stara struktura studio
  '/studio': '/',
  '/studio/cennik': '/cennik',
  '/studio/kontakt': '/#kontakt',
  
  // Stare anchor linki (bez hash - Next.js nie obsługuje hash w middleware)
  '/o-nas': '/',
  
  // Nieistniejące wersje językowe
  '/en': '/',
  '/de': '/',
  '/pl': '/',
  
  // Inne potencjalne stare URL-e
  '/kontakt': '/#kontakt',
  '/uslugi': '/cennik',
  '/oferta': '/cennik',
  '/wycena': '/cennik',
  '/pricing': '/cennik',
  '/contact': '/#kontakt',
  '/about': '/',
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Sprawdź czy ścieżka wymaga przekierowania
  const redirectTo = redirects[pathname]
  
  if (redirectTo) {
    const url = request.nextUrl.clone()
    url.pathname = redirectTo.split('#')[0] // Usuń hash dla pathname
    
    // Jeśli jest hash, dodaj go jako query param żeby JavaScript mógł obsłużyć
    if (redirectTo.includes('#')) {
      url.hash = redirectTo.split('#')[1]
    }
    
    // 301 - Permanent redirect (dobre dla SEO)
    return NextResponse.redirect(url, { status: 301 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Dopasuj tylko konkretne ścieżki do przekierowań
    '/studio/:path*',
    '/o-nas',
    '/en',
    '/de',
    '/pl',
    '/kontakt',
    '/uslugi',
    '/oferta',
    '/wycena',
    '/pricing',
    '/contact',
    '/about',
  ],
}
