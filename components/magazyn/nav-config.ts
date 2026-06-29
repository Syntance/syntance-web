export const MAGAZYN_NAV = [
  { href: '/magazyn', label: 'Przegląd', icon: 'overview' },
  { href: '/magazyn/rezerwacje', label: 'Rezerwacje', icon: 'calendar' },
  { href: '/magazyn/blokady', label: 'Blokady', icon: 'clock' },
  { href: '/magazyn/regulamin', label: 'Reguły bookingu', icon: 'rules' },
  { href: '/magazyn/seo', label: 'SEO', icon: 'seo' },
  { href: '/magazyn/cms', label: 'CMS', icon: 'cms' },
  { href: '/magazyn/emaile', label: 'E-maile', icon: 'mail' },
  { href: '/magazyn/cennik', label: 'Cennik', icon: 'pricing' },
  { href: '/magazyn/ustawienia', label: 'Ustawienia', icon: 'settings' },
] as const

export type MagazynNavItem = (typeof MAGAZYN_NAV)[number]
