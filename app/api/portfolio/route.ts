import { NextResponse } from 'next/server'
import { fetchPortfolioItemsFromDb } from '@/lib/db/queries/portfolio'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  const items = await fetchPortfolioItemsFromDb()
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
