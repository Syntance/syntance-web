import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifySession } from '@/lib/admin-auth'

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
  '/audyt': '/porozmawiajmy',
  '/spotkanie': '/porozmawiajmy',
  '/rozmowa': '/porozmawiajmy',
}

const ADMIN_TO_MAGAZYN: Record<string, string> = {
  '/admin': '/magazyn',
  '/admin/login': '/magazyn/login',
  '/admin/rezerwacje': '/magazyn/rezerwacje',
  '/admin/blokady': '/magazyn/blokady',
  '/admin/regulamin': '/magazyn/regulamin',
  '/admin/linki': '/magazyn',
}

function redirect301(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url, { status: 301 })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Stary /admin → /magazyn (301)
  if (pathname.startsWith('/admin')) {
    const mapped = ADMIN_TO_MAGAZYN[pathname]
    if (mapped) return redirect301(request, mapped)
    if (pathname.startsWith('/admin/')) {
      return redirect301(request, `/magazyn${pathname.slice('/admin'.length)}`)
    }
  }

  // Ochrona /magazyn/**
  if (pathname.startsWith('/magazyn')) {
    if (pathname === '/magazyn/login') return NextResponse.next()

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifySession(token)
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/magazyn/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

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
    '/magazyn/:path*',
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
    '/audyt',
    '/spotkanie',
    '/rozmowa',
  ],
}
