import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'

// Konfiguracja struktury dla singletonów
const structure = (S: any) =>
  S.list()
    .title('Zawartość')
    .items([
      // === SEO ===
      S.listItem()
        .title('🔍 SEO Globalne (domyślne)')
        .id('seoSettings')
        .child(
          S.document()
            .schemaType('seoSettings')
            .documentId('seoSettings')
            .title('SEO Globalne')
        ),
      S.listItem()
        .title('📄 SEO Podstron')
        .id('pageSeo')
        .child(
          S.documentTypeList('pageSeo')
            .title('SEO Podstron')
        ),
      S.divider(),
      // === CENNIK ===
      S.listItem()
        .title('💰 Ustawienia cennika')
        .id('pricingConfig')
        .child(
          S.document()
            .schemaType('pricingConfig')
            .documentId('pricingConfig')
            .title('Ustawienia cennika')
        ),
      S.listItem()
        .title('❓ FAQ Cennika')
        .id('pricingFaq')
        .child(
          S.documentTypeList('pricingFaq')
            .title('FAQ Cennika')
        ),
      S.divider(),
      // Pozostałe dokumenty
      ...S.documentTypeListItems().filter(
        (listItem: any) => !['pricingConfig', 'seoSettings', 'pageSeo', 'pricingFaq'].includes(listItem.getId())
      ),
    ])

export default defineConfig({
  name: 'syntance-studio',
  title: 'Syntance Studio CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [deskTool({ structure })],

  schema: {
    types: schemaTypes,
  },
})
