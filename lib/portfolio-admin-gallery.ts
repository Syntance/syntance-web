export type AdminPanelScreenshot = {
  src?: string
  alt: string
  caption?: string
  placeholder?: boolean
}

export type AdminPanelGalleryGroup = {
  id: string
  label: string
  description: string
  screenshots: readonly AdminPanelScreenshot[]
}

export type PortfolioAdminGallery = {
  intro: string
  highlights?: readonly string[]
  groups: readonly AdminPanelGalleryGroup[]
}
