import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'

// Przekierowania dla starych URL-i (SEO - 301 permanent redirects)
const redirects: Record<string, string> = {
  '/studio': '/',
  '/studio/cennik': '/cennik',
  '/studio/kontakt': '/#kontakt',
  '/en': '/',
  '/de': '/',
  '/pl': '/',
  '/uslugi': '/cennik',
  '/oferta': '/cennik',
  '/wycena': '/cennik',
  '/pricing': '/cennik',
  '/contact': '/#kontakt',
  '/about': '/',
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1) Ochrona /admin/**
  if (pathname.startsWith('/admin')) {
    // Login page jest publiczna
    if (pathname === '/admin/login') return NextResponse.next()

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifySession(token)
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // 2) Stare redirecty
  const redirectTo = redirects[pathname]
  if (redirectTo) {
    const url = request.nextUrl.clone()
    url.pathname = redirectTo.split('#')[0]
    if (redirectTo.includes('#')) url.hash = redirectTo.split('#')[1]
    return NextResponse.redirect(url, { status: 301 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/studio/:path*',
    '/en',
    '/de',
    '/pl',
    '/uslugi',
    '/oferta',
    '/wycena',
    '/pricing',
    '/contact',
    '/about',
  ],
}
