import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, isSessionActiveEdge, verifySession } from '@/lib/admin-auth'

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

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Ochrona CSRF dla API panelu: mutacje muszą pochodzić z tej samej witryny (Origin/Sec-Fetch-Site).
 * Cookie sesji ma SameSite=Strict, to jest druga warstwa.
 */
function isCrossSiteMutation(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return false
  const site = request.headers.get('sec-fetch-site')
  if (site) return site !== 'same-origin' && site !== 'none'
  const origin = request.headers.get('origin')
  return origin === null || origin !== request.nextUrl.origin
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if ((pathname.startsWith('/api/magazyn') || pathname.startsWith('/api/admin')) && isCrossSiteMutation(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (pathname.startsWith('/api/')) return NextResponse.next()

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
    const claims = await verifySession(token)
    // Podpis i termin z cookie + niecofnięta sesja w bazie (fail-closed).
    const session = claims !== null && (await isSessionActiveEdge(claims.sid))
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
    '/api/magazyn/:path*',
    '/api/admin/:path*',
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
