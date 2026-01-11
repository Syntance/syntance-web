import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Webhook endpoint dla Sanity do rewalidacji cache
export async function POST(request: NextRequest) {
  try {
    // Sprawdź secret (opcjonalne ale zalecane)
    const secret = request.nextUrl.searchParams.get('secret')
    
    if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Pobierz tag z query params lub body
    const tag = request.nextUrl.searchParams.get('tag')
    
    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, tag, now: Date.now() })
    }

    // Jeśli brak tagu, spróbuj pobrać z body (dla webhooków Sanity)
    const body = await request.json().catch(() => ({}))
    
    // Sanity wysyła typ dokumentu w _type
    const documentType = body._type
    
    // Mapowanie typów dokumentów na tagi
    const tagMap: Record<string, string> = {
      pricingCategory: 'pricing',
      projectType: 'pricing',
      pricingItem: 'pricing',
      pricingConfig: 'pricing',
    }

    const tagToRevalidate = tagMap[documentType] || 'pricing'
    revalidateTag(tagToRevalidate)

    return NextResponse.json({ 
      revalidated: true, 
      tag: tagToRevalidate, 
      documentType,
      now: Date.now() 
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

// Obsługa GET dla prostszego testowania
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')
  
  if (!tag) {
    return NextResponse.json({ 
      message: 'Provide ?tag=pricing to revalidate',
      availableTags: ['pricing']
    })
  }

  try {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag, now: Date.now() })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
