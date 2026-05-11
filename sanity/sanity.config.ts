import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'
import EmailPreviewPanel from './components/EmailPreviewPanel'

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
      // === ZLECENIA ===
      S.listItem()
        .title('📄 Szablony umów')
        .id('contractFiles')
        .child(
          S.document()
            .schemaType('contractFiles')
            .documentId('contractFiles')
            .title('Szablony umów')
        ),
      S.listItem()
        .title('🏦 Dane do przelewu')
        .id('paymentSettings')
        .child(
          S.document()
            .schemaType('paymentSettings')
            .documentId('paymentSettings')
            .title('Dane do przelewu')
        ),
      S.listItem()
        .title('📧 Treści emaili')
        .id('emailTemplates')
        .child(
          S.document()
            .schemaType('emailTemplates')
            .documentId('emailTemplates')
            .title('Treści emaili')
            .views([
              S.view.form().title('Edytuj'),
              S.view.component(EmailPreviewPanel).title('Podgląd'),
            ])
        ),
      S.listItem()
        .title('🖼️ Podgląd emaili')
        .id('emailPreview')
        .child(
          S.component(EmailPreviewPanel).title('Podgląd emaili')
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
      // === PORTFOLIO ===
      S.listItem()
        .title('🖼️ Realizacje (portfolio)')
        .id('portfolioItem')
        .child(
          S.documentTypeList('portfolioItem').title('Realizacje (portfolio)')
        ),
      S.divider(),
      // === REZERWACJE ===
      S.listItem()
        .title('📅 Reguły rezerwacji')
        .id('bookingRules')
        .child(
          S.document()
            .schemaType('bookingRules')
            .documentId('bookingRules')
            .title('Reguły rezerwacji')
        ),
      S.listItem()
        .title('⛔ Blokady czasu')
        .id('bookingTimeBlock')
        .child(
          S.documentTypeList('bookingTimeBlock').title('Blokady czasu')
        ),
      S.listItem()
        .title('📆 Rezerwacje spotkań')
        .id('meetingBooking')
        .child(
          S.documentTypeList('meetingBooking').title('Rezerwacje spotkań')
        ),
      S.divider(),
      // Pozostałe dokumenty
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          !['pricingConfig', 'seoSettings', 'pageSeo', 'pricingFaq', 'bookingRules', 'bookingTimeBlock', 'meetingBooking', 'portfolioItem', 'paymentSettings', 'contractFiles', 'emailTemplates'].includes(
            listItem.getId()
          )
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
