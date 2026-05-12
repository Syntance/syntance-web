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
        .title('💰 Cennik — pakiety i zasady')
        .id('pricingConfig')
        .child(
          S.document()
            .schemaType('pricingConfig')
            .documentId('pricingConfig')
            .title('Cennik — pakiety i zasady')
        ),
      S.listItem()
        .title('📦 Pakiety gotowe (konfigurator)')
        .id('pricingConfigurator')
        .child(
          S.list()
            .title('Pakiety gotowe — edycja')
            .items([
              S.listItem()
                .title('🏷️ Typ pakietu (WWW / sklep / app)')
                .id('projectType')
                .child(
                  S.documentTypeList('projectType').title('Typ pakietu (gotowe pakiety)')
                ),
              S.listItem()
                .title('📂 Kategorie w pakietach')
                .id('pricingCategory')
                .child(
                  S.documentTypeList('pricingCategory').title('Kategorie w pakietach')
                ),
              S.listItem()
                .title('🧩 Pozycje cennika i dodatki')
                .id('pricingItem')
                .child(
                  S.documentTypeList('pricingItem').title('Pozycje cennika i dodatki')
                ),
            ])
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
      /* Te trzy typy są w sekcji „Pakiety gotowe (konfigurator)” — nie duplikuj na dole listy. */
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            'pricingConfig',
            'seoSettings',
            'pageSeo',
            'pricingFaq',
            'bookingRules',
            'bookingTimeBlock',
            'meetingBooking',
            'portfolioItem',
            'paymentSettings',
            'contractFiles',
            'emailTemplates',
            'pricingCategory',
            'projectType',
            'pricingItem',
          ].includes(listItem.getId())
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
