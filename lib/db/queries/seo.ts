import { eq } from 'drizzle-orm'
import { getDb, hasDb } from '@/lib/db'
import { seoGlobal, seoPages } from '@/lib/db/schema'
import { defaultSeo } from '@/lib/data/seo-defaults'
import type { PageSeo, SeoSettings } from '@/lib/data/seo-types'

export type { PageSeo, SeoSettings } from '@/lib/data/seo-types'

function rowToSeoSettings(row: typeof seoGlobal.$inferSelect): SeoSettings {
  return {
    metaTitle: row.metaTitle ?? defaultSeo.metaTitle,
    metaTitleTemplate: row.metaTitleTemplate ?? defaultSeo.metaTitleTemplate,
    metaDescription: row.metaDescription ?? defaultSeo.metaDescription,
    canonicalUrl: row.canonicalUrl ?? defaultSeo.canonicalUrl,
    keywords: row.keywords?.length ? row.keywords : defaultSeo.keywords,
    ogTitle: row.ogTitle ?? defaultSeo.ogTitle,
    ogDescription: row.ogDescription ?? defaultSeo.ogDescription,
    ogImageUrl: row.ogImageUrl ?? defaultSeo.ogImageUrl,
    twitterTitle: row.twitterTitle ?? defaultSeo.twitterTitle,
    twitterDescription: row.twitterDescription ?? defaultSeo.twitterDescription,
    twitterImageAlt: row.twitterImageAlt ?? defaultSeo.twitterImageAlt,
    organizationName: row.organizationName ?? defaultSeo.organizationName,
    organizationDescription: row.organizationDescription ?? defaultSeo.organizationDescription,
    foundingDate: row.foundingDate ?? defaultSeo.foundingDate,
    founderName: row.founderName ?? defaultSeo.founderName,
    contactEmail: row.contactEmail ?? defaultSeo.contactEmail,
    contactPhone: row.contactPhone ?? defaultSeo.contactPhone,
    address: row.address ? { ...defaultSeo.address, ...row.address } : defaultSeo.address,
    geo: row.geo ? { ...defaultSeo.geo, ...row.geo } : defaultSeo.geo,
    socialLinks: row.socialLinks?.length ? row.socialLinks : defaultSeo.socialLinks,
    openingHours: row.openingHours
      ? { ...defaultSeo.openingHours, ...row.openingHours }
      : defaultSeo.openingHours,
    services: row.services?.length ? row.services : defaultSeo.services,
  }
}

function rowToPageSeo(row: typeof seoPages.$inferSelect): PageSeo {
  return {
    id: row.id,
    pageName: row.pageName,
    slug: row.slug,
    isActive: row.isActive,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    focusKeyword: row.focusKeyword ?? undefined,
    keywords: row.keywords ?? undefined,
    keywordDensity: row.keywordDensity ?? undefined,
    ogTitle: row.ogTitle ?? undefined,
    ogDescription: row.ogDescription ?? undefined,
    ogImageUrl: row.ogImageUrl ?? undefined,
    twitterTitle: row.twitterTitle ?? undefined,
    twitterDescription: row.twitterDescription ?? undefined,
    seoNotes: row.seoNotes ?? undefined,
    lastUpdated: row.lastUpdated?.toISOString(),
  }
}

export async function getSeoSettings(): Promise<SeoSettings> {
  if (!hasDb()) return defaultSeo
  try {
    const db = getDb()
    const row = await db.query.seoGlobal.findFirst({ where: eq(seoGlobal.id, 'default') })
    if (!row) return defaultSeo
    return rowToSeoSettings(row)
  } catch (error) {
    console.error('Error fetching SEO settings from DB:', error)
    return defaultSeo
  }
}

export async function saveSeoSettings(data: Partial<SeoSettings>): Promise<void> {
  const db = getDb()
  await db
    .insert(seoGlobal)
    .values({
      id: 'default',
      metaTitle: data.metaTitle,
      metaTitleTemplate: data.metaTitleTemplate,
      metaDescription: data.metaDescription,
      canonicalUrl: data.canonicalUrl,
      keywords: data.keywords,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImageUrl: data.ogImageUrl,
      twitterTitle: data.twitterTitle,
      twitterDescription: data.twitterDescription,
      twitterImageAlt: data.twitterImageAlt,
      organizationName: data.organizationName,
      organizationDescription: data.organizationDescription,
      foundingDate: data.foundingDate,
      founderName: data.founderName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      geo: data.geo,
      socialLinks: data.socialLinks,
      openingHours: data.openingHours,
      services: data.services,
    })
    .onConflictDoUpdate({
      target: seoGlobal.id,
      set: { ...data, updatedAt: new Date() },
    })
}

export async function listSeoPages(): Promise<PageSeo[]> {
  if (!hasDb()) return []
  const db = getDb()
  const rows = await db.select().from(seoPages).orderBy(seoPages.pageName)
  return rows.map(rowToPageSeo)
}

export async function getPageSeo(slug: string): Promise<PageSeo | null> {
  if (!hasDb()) return null
  try {
    const db = getDb()
    const row = await db.query.seoPages.findFirst({
      where: eq(seoPages.slug, slug),
    })
    if (!row || !row.isActive) return null
    return rowToPageSeo(row)
  } catch (error) {
    console.error(`Error fetching page SEO for slug "${slug}":`, error)
    return null
  }
}

export async function upsertSeoPage(page: PageSeo & { id?: string }): Promise<void> {
  const db = getDb()
  if (page.id) {
    await db
      .update(seoPages)
      .set({
        pageName: page.pageName,
        slug: page.slug,
        isActive: page.isActive,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        focusKeyword: page.focusKeyword,
        keywords: page.keywords,
        keywordDensity: page.keywordDensity,
        ogTitle: page.ogTitle,
        ogDescription: page.ogDescription,
        ogImageUrl: page.ogImageUrl,
        twitterTitle: page.twitterTitle,
        twitterDescription: page.twitterDescription,
        seoNotes: page.seoNotes,
        lastUpdated: new Date(),
      })
      .where(eq(seoPages.id, page.id))
    return
  }
  await db.insert(seoPages).values({
    pageName: page.pageName,
    slug: page.slug,
    isActive: page.isActive,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    canonicalUrl: page.canonicalUrl,
    focusKeyword: page.focusKeyword,
    keywords: page.keywords,
    keywordDensity: page.keywordDensity,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImageUrl: page.ogImageUrl,
    twitterTitle: page.twitterTitle,
    twitterDescription: page.twitterDescription,
    seoNotes: page.seoNotes,
    lastUpdated: new Date(),
  })
}

export async function deleteSeoPage(id: string): Promise<void> {
  const db = getDb()
  await db.delete(seoPages).where(eq(seoPages.id, id))
}

export function mergeSeoSettings(
  global: SeoSettings,
  page: PageSeo | null,
): SeoSettings {
  if (!page) return global
  return {
    ...global,
    metaTitle: page.metaTitle ?? global.metaTitle,
    metaDescription: page.metaDescription ?? global.metaDescription,
    canonicalUrl: page.canonicalUrl ?? global.canonicalUrl,
    keywords: page.keywords?.length ? page.keywords : global.keywords,
    ogTitle: page.ogTitle ?? global.ogTitle,
    ogDescription: page.ogDescription ?? global.ogDescription,
    ogImageUrl: page.ogImageUrl ?? global.ogImageUrl,
    twitterTitle: page.twitterTitle ?? global.twitterTitle,
    twitterDescription: page.twitterDescription ?? global.twitterDescription,
  }
}
