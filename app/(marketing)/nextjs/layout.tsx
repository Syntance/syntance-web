import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/nextjs',
    title: 'Dlaczego Next.js? Framework, który zmienia zasady gry | Syntance',
    description: 'Next.js to nie tylko szybkość. To bezpieczeństwo, skalowalność i realna przewaga nad konkurencją. Sprawdź, dlaczego WordPress to przeszłość.',
    ogTitle: 'Dlaczego Next.js? | Syntance',
    ogDescription: 'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
    keywords: 'Next.js, WordPress vs Next.js, szybka strona internetowa, bezpieczna strona, PageSpeed, React framework',
  })
}

export default function NextjsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
