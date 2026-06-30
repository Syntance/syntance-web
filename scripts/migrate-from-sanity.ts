/**
 * Jednorazowa migracja danych z Sanity → Neon Postgres.
 *
 * Wymaga: DATABASE_URL (+ opcjonalnie NEXT_PUBLIC_SANITY_PROJECT_ID dla źródła)
 * Uruchom: pnpm db:push && pnpm migrate:sanity
 */

import { getDb, getDatabaseUrl } from '@/lib/db'
import { saveSeoSettings, upsertSeoPage } from '@/lib/db/queries/seo'
import { replaceFaqSettings } from '@/lib/db/queries/faq'
import { replaceAllPortfolioItems } from '@/lib/db/queries/portfolio'
import { slugifyPortfolioName } from '@/lib/magazyn/portfolio-cms'
import { importPricingCatalog } from '@/lib/db/queries/pricing'
import { saveEmailTemplates, savePaymentSettings, saveContractFiles } from '@/lib/db/queries/settings'
import { saveBookingRules } from '@/lib/db/queries/booking'
import {
  bookingTimeBlocks,
  meetingBookings,
} from '@/lib/db/schema'
import { mergeEmailTemplatesWithDefaults } from '@/lib/data/email-templates'
import type { FaqSettingsDocument } from '@/lib/data/faq'
import type { PageSeo, SeoSettings } from '@/lib/data/seo-types'
import type { PricingItem } from '@/lib/data/pricing'
import type { EmailTemplates } from '@/lib/data/email-templates'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'sqgw0wlq'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

async function sanityFetch<T>(query: string): Promise<T> {
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
  const json = (await res.json()) as { result: T }
  return json.result
}

async function main() {
  if (!getDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set')
  }

  console.log('Migracja Sanity → Neon…')
  const db = getDb()

  // SEO global
  const seoGlobal = await sanityFetch<SeoSettings | null>(
    `*[_type == "seoSettings" && _id == "seoSettings"][0]{
      metaTitle, metaTitleTemplate, metaDescription, canonicalUrl, keywords,
      ogTitle, ogDescription, ogImageUrl, twitterTitle, twitterDescription, twitterImageAlt,
      organizationName, organizationDescription, foundingDate, founderName,
      contactEmail, contactPhone,
      address { street, city, postalCode, region, country },
      geo { latitude, longitude },
      socialLinks,
      openingHours { opens, closes, days },
      services[] { name, description, serviceType, priceRange, price }
    }`,
  )
  if (seoGlobal) {
    await saveSeoSettings(seoGlobal)
    console.log('✓ seo_global')
  }

  // SEO pages
  const seoPages = await sanityFetch<Array<PageSeo & { _id: string }>>(
    `*[_type == "pageSeo"] | order(pageName asc) {
      "pageName": pageName,
      "slug": slug.current,
      isActive, metaTitle, metaDescription, canonicalUrl,
      focusKeyword, keywords, keywordDensity,
      ogTitle, ogDescription, ogImageUrl, twitterTitle, twitterDescription,
      seoNotes, lastUpdated
    }`,
  )
  for (const page of seoPages ?? []) {
    await upsertSeoPage(page)
  }
  console.log(`✓ seo_pages (${seoPages?.length ?? 0})`)

  // FAQ
  const faq = await sanityFetch<FaqSettingsDocument>(
    `*[_type == "faqSettings" && _id == "faqSettings"][0]{
      faqCennik[]{ _key, question, answer, category, order, isActive },
      faqStronyWww[]{ _key, question, answer, order, isActive },
      faqSklepy[]{ _key, question, answer, order, isActive },
      faqStrategia[]{ _key, question, answer, order, isActive },
      faqONas[]{ _key, question, answer, order, isActive },
      faqKontakt[]{ _key, question, answer, order, isActive },
      faqAgencje[]{ _key, question, answer, order, isActive }
    }`,
  )
  if (faq) {
    await replaceFaqSettings(faq)
    console.log('✓ faq_entries')
  }

  // Portfolio
  const portfolio = await sanityFetch<
    Array<{ id: string; name: string; url: string; logoUrl?: string; logoAlt?: string; order?: number; disabled?: boolean }>
  >(
    `*[_type == "portfolioItem"] | order(order asc) {
      "id": _id, name, url,
      "logoUrl": logo.asset->url,
      "logoAlt": coalesce(logo.alt, name),
      order, disabled
    }`,
  )
  if (portfolio?.length) {
    await replaceAllPortfolioItems(
      portfolio.map((p) => ({
        sanityId: p.id,
        slug: slugifyPortfolioName(p.name),
        name: p.name,
        url: p.url,
        logoUrl: p.logoUrl,
        logoAlt: p.logoAlt,
        sortOrder: p.order,
        disabled: p.disabled ?? false,
      })),
    )
    console.log(`✓ portfolio_items (${portfolio.length})`)
  }

  // Pricing
  const pricingRaw = await sanityFetch<{
    categories: Array<{ id: string; name: string; description?: string; icon?: string; order?: number; showInConfigurator?: boolean; disabled?: boolean }>
    projectTypes: Array<{ id: string; name: string; description?: string; basePrice?: number; icon?: string; order?: number; disabled?: boolean }>
    items: PricingItem[]
    config: import('@/lib/data/pricing').PricingData['config']
  }>(`{
    "categories": *[_type == "pricingCategory"] | order(order asc) {
      "id": id.current, name, description, icon, "sortOrder": order, showInConfigurator, disabled
    },
    "projectTypes": *[_type == "projectType"] | order(order asc) {
      "id": id.current, name, description, basePrice, icon, "sortOrder": order, disabled
    },
    "items": *[_type == "pricingItem"] | order(orderRank asc) {
      "id": id.current, name, description, price, hours, rateType,
      "category": category->id.current,
      "projectTypes": projectTypes[]->id.current,
      required, defaultSelected, includedInBase, maxQuantity, percentageAdd,
      orderRank, configuratorOrderRanks,
      "dependencies": dependencies[]->id.current,
      "bundledWith": bundledWith[]->id.current,
      popular, new, disabled, hidePrice,
      notificationOnAdd, notificationAddTitle, notificationAddText,
      notificationAddConfirmText, notificationAddCancelText,
      notificationOnRemove, notificationRemoveTitle, notificationRemoveText,
      notificationRemoveConfirmText, notificationRemoveCancelText
    },
    "config": *[_type == "pricingConfig"][0] {
      vatRate, depositPercent, depositFixed, calendlyUrl, ctaTexts,
      baseProjectCategoryId, projectTypeBundles[] {
        "projectTypeId": projectType->id.current, baseCategorySlug, bundlePriceNet, bundleBaseHours
      },
      baseProjectBundlePriceWebsite, baseProjectBundlePriceEcommerce, baseProjectBundlePriceWebapp,
      baseProjectCategoryIdWebsite, baseProjectCategoryIdEcommerce, baseProjectCategoryIdWebapp,
      discoveryWorkshopPrice, websiteStartPrice, websiteAdvancedStartPrice,
      ecommerceStandardStartPrice, ecommerceProStartPrice, webappStartPrice,
      hourlyRateDev, hourlyRateConsulting, workHoursPerDay
    }
  }`)

  if (pricingRaw?.categories?.length) {
    await importPricingCatalog({
      categories: pricingRaw.categories,
      projectTypes: pricingRaw.projectTypes ?? [],
      items: pricingRaw.items ?? [],
      config: pricingRaw.config,
    })
    console.log(`✓ pricing (${pricingRaw.items?.length ?? 0} items)`)
  }

  // Email templates
  const emailRaw = await sanityFetch<Partial<EmailTemplates> | null>(
    `*[_type == "emailTemplates" && _id == "emailTemplates"][0]`,
  )
  if (emailRaw) {
    await saveEmailTemplates(mergeEmailTemplatesWithDefaults(emailRaw))
    console.log('✓ email_templates')
  }

  // Payment settings
  const payment = await sanityFetch<import('@/lib/db/queries/settings').PaymentSettings | null>(
    `*[_type == "paymentSettings" && _id == "paymentSettings"][0]{
      accountHolder, bankName, accountNumber, swiftBic, transferTitleTemplate, additionalInfo
    }`,
  )
  if (payment) {
    await savePaymentSettings(payment)
    console.log('✓ payment_settings')
  }

  // Contract files
  const contracts = await sanityFetch<{ files: Array<{ label: string; url: string }>; introText?: string } | null>(
    `*[_type == "contractFiles" && _id == "contractFiles"][0]{
      "files": files[]{ label, "url": file.asset->url },
      introText
    }`,
  )
  if (contracts) {
    await saveContractFiles(contracts)
    console.log('✓ contract_files')
  }

  // Booking rules
  const rules = await sanityFetch<import('@/lib/db/queries/booking').BookingRules | null>(
    `*[_type == "bookingRules" && _id == "bookingRules"][0]{
      slotMinutes, workingDays, workingHoursStart, workingHoursEnd, slotPresets,
      bufferBeforeMinutes, bufferAfterMinutes, minNoticeHours, maxAdvanceDays, timezone
    }`,
  )
  if (rules) {
    await saveBookingRules(rules)
    console.log('✓ booking_rules')
  }

  // Booking blocks
  await db.delete(bookingTimeBlocks)
  const blocks = await sanityFetch<
    Array<{ _id: string; title: string; allDay: boolean; startAt: string; endAt: string; createdBy?: string }>
  >(
    `*[_type == "bookingTimeBlock"] | order(startAt desc) {
      _id, title, allDay, startAt, endAt, createdBy
    }`,
  )
  if (blocks?.length) {
    await db.insert(bookingTimeBlocks).values(
      blocks.map((b) => ({
        sanityId: b._id,
        title: b.title,
        allDay: b.allDay,
        startAt: new Date(b.startAt),
        endAt: new Date(b.endAt),
        createdBy: b.createdBy,
      })),
    )
    console.log(`✓ booking_time_blocks (${blocks.length})`)
  }

  // Meeting bookings
  await db.delete(meetingBookings)
  const bookings = await sanityFetch<
    Array<{
      _id: string
      status: string
      startAt: string
      endAt: string
      name: string
      email: string
      company?: string
      topic?: string
      source?: string
      meetLink?: string
      googleEventId?: string
      googleCalendarId?: string
      _createdAt?: string
    }>
  >(
    `*[_type == "meetingBooking"] | order(startAt desc) {
      _id, status, startAt, endAt, name, email, company, topic, source,
      meetLink, googleEventId, googleCalendarId, _createdAt
    }`,
  )
  if (bookings?.length) {
    await db.insert(meetingBookings).values(
      bookings.map((b) => ({
        sanityId: b._id,
        status: b.status,
        startAt: new Date(b.startAt),
        endAt: new Date(b.endAt),
        name: b.name,
        email: b.email,
        company: b.company,
        topic: b.topic,
        source: b.source,
        meetLink: b.meetLink,
        googleEventId: b.googleEventId,
        googleCalendarId: b.googleCalendarId,
        createdAt: b._createdAt ? new Date(b._createdAt) : new Date(),
      })),
    )
    console.log(`✓ meeting_bookings (${bookings.length})`)
  }

  console.log('\nMigracja zakończona.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
