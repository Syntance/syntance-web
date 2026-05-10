import { groq } from 'next-sanity'

export const portfolioItemsQuery = groq`*[_type == "portfolioItem" && !disabled] | order(order asc, name asc) {
  "id": _id,
  name,
  url,
  "logoUrl": logo.asset->url,
  "logoAlt": coalesce(logo.alt, name),
  order
}`

export interface PortfolioItem {
  id: string
  name: string
  url: string
  logoUrl: string
  logoAlt: string
  order?: number
}
