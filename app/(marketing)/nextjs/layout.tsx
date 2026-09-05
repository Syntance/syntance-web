import { Metadata } from 'next'
import { pageSocialMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dlaczego Next.js? Framework, który zmienia zasady gry | Syntance',
  description: 'Next.js to nie tylko szybkość. To bezpieczeństwo, skalowalność i realna przewaga nad konkurencją. Sprawdź, dlaczego WordPress to przeszłość.',
  keywords: 'Next.js, WordPress vs Next.js, szybka strona internetowa, bezpieczna strona, PageSpeed, React framework',
  ...pageSocialMetadata({
    path: '/nextjs',
    title: 'Dlaczego Next.js? | Syntance',
    description: 'Framework używany przez Netflix, TikTok i Nike. Poznaj technologię, która daje realną przewagę biznesową.',
  }),
}

export default function NextjsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
