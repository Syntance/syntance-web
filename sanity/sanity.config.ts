import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'

// Konfiguracja struktury dla singletonów
const structure = (S: any) =>
  S.list()
    .title('Zawartość')
    .items([
      // Singleton: Ustawienia SEO
      S.listItem()
        .title('🔍 Ustawienia SEO')
        .id('seoSettings')
        .child(
          S.document()
            .schemaType('seoSettings')
            .documentId('seoSettings')
            .title('Ustawienia SEO')
        ),
      // Singleton: Ustawienia cennika
      S.listItem()
        .title('💰 Ustawienia cennika')
        .id('pricingConfig')
        .child(
          S.document()
            .schemaType('pricingConfig')
            .documentId('pricingConfig')
            .title('Ustawienia cennika')
        ),
      S.divider(),
      // Pozostałe dokumenty
      ...S.documentTypeListItems().filter(
        (listItem: any) => !['pricingConfig', 'seoSettings'].includes(listItem.getId())
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
