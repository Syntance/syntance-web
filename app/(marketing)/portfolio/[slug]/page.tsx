import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CaseStudyClient from '@/app/(marketing)/portfolio/[slug]/case-study-client'
import { listPortfolioCaseStudyIds } from '@/lib/portfolio-content'
import { fetchPortfolioCaseStudy } from '@/lib/portfolio-data'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return listPortfolioCaseStudyIds().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await fetchPortfolioCaseStudy(slug)
  if (!project) return {}

  const canonical = `https://syntance.com/portfolio/${slug}`
  const perf = project.performance?.after.mobile.metrics.performance
  const title = perf
    ? `${project.name} — case study · PageSpeed ${perf} mobile`
    : `${project.name} — case study`

  return {
    title,
    description: project.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: project.description,
      url: canonical,
      siteName: 'Syntance',
      locale: 'pl_PL',
      images: [{ url: project.previewImage, alt: project.previewImageAlt }],
    },
  }
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { slug } = await params
  const project = await fetchPortfolioCaseStudy(slug)
  if (!project) notFound()

  const canonical = `https://syntance.com/portfolio/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://syntance.com' },
          { '@type': 'ListItem', position: 2, name: 'Portfolio', item: 'https://syntance.com/portfolio' },
          { '@type': 'ListItem', position: 3, name: project.name, item: canonical },
        ],
      },
      {
        '@type': 'WebPage',
        name: `${project.name} — case study`,
        description: project.description,
        url: canonical,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CaseStudyClient project={project} />
    </>
  )
}
