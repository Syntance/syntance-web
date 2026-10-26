import { currentCatalog } from '@/lib/studio/modules-store'
import { toEnvelope } from '@/lib/studio/catalog'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Publiczny, podpisany katalog modułów (CatalogEnvelope z aplikacji). Podpis weryfikuje aplikacja kluczem wydawcy,
 * więc cache na brzegu jest bezpieczny: s-maxage=300 + stale-while-revalidate odciąża funkcję i bazę.
 */
export async function GET() {
  try {
    const row = await currentCatalog()
    if (!row) return Response.json({ error: 'NO_CATALOG', code: 'NO_CATALOG' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    return Response.json(toEnvelope(row.catalogText, row.signature), {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[studio-catalog] błąd', error)
    return Response.json({ error: 'INTERNAL', code: 'INTERNAL' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
