import PortfolioPageClient from '@/app/(marketing)/portfolio/portfolio-client'
import { fetchPortfolioItems } from '@/lib/portfolio-data'

const canonical = 'https://syntance.com/portfolio'

export const revalidate = 300

export default async function PortfolioPage() {
  const projects = await fetchPortfolioItems()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Strona główna',
            item: 'https://syntance.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio',
            item: canonical,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': canonical,
        name: 'Portfolio Syntance',
        description:
          'Wybrane realizacje stron internetowych i sklepów e-commerce zbudowanych w Next.js.',
        url: canonical,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'WebSite',
              name: project.name,
              url: project.url,
              description: project.description,
            },
          })),
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioPageClient projects={projects} />
    </>
  )
}
