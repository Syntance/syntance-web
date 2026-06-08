/** Strony marketingowe z danymi z Sanity — bez statycznego cache build-time. */
export const dynamic = 'force-dynamic'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
