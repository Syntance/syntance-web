import { NextResponse } from 'next/server'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export async function GET() {
  const query = `{
    "projectTypes": *[_type == "projectType"] | order(order asc) {
      "id": id.current,
      name,
      basePrice
    }
  }`
  
  const envInfo = {
    projectId: projectId || 'NOT SET',
    dataset,
    hasProjectId: !!projectId,
  }
  
  if (!projectId) {
    return NextResponse.json({
      error: 'NEXT_PUBLIC_SANITY_PROJECT_ID not set',
      envInfo,
    })
  }
  
  try {
    const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`
    
    const response = await fetch(url, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      return NextResponse.json({
        error: `Sanity API error: ${response.status}`,
        envInfo,
      })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      envInfo,
      sanityData: data.result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      envInfo,
    })
  }
}
