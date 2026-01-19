import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seoSettings',
  title: 'Ustawienia SEO',
  type: 'document',
  groups: [
    { name: 'meta', title: 'Meta tagi' },
    { name: 'openGraph', title: 'Open Graph (Social)' },
    { name: 'twitter', title: 'Twitter Card' },
    { name: 'keywords', title: 'Słowa kluczowe' },
    { name: 'schema', title: 'Schema.org' },
  ],
  fields: [
    // === META TAGI ===
    defineField({
      name: 'metaTitle',
      title: 'Tytuł strony (meta title)',
      type: 'string',
      group: 'meta',
      description: 'Główny tytuł strony wyświetlany w Google (max 60 znaków)',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'metaTitleTemplate',
      title: 'Szablon tytułu podstron',
      type: 'string',
      group: 'meta',
      description: 'Np. "%s | Syntance" - %s zostanie zamienione na tytuł podstrony',
      initialValue: '%s | Syntance',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Opis strony (meta description)',
      type: 'text',
      group: 'meta',
      rows: 3,
      description: 'Opis wyświetlany w wynikach Google (max 160 znaków)',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'meta',
      description: 'Główny adres strony (np. https://syntance.com)',
      initialValue: 'https://syntance.com',
    }),

    // === SŁOWA KLUCZOWE ===
    defineField({
      name: 'keywords',
      title: 'Słowa kluczowe',
      type: 'array',
      group: 'keywords',
      of: [{ type: 'string' }],
      description: 'Lista słów kluczowych dla strony',
      options: {
        layout: 'tags',
      },
    }),

    // === OPEN GRAPH ===
    defineField({
      name: 'ogTitle',
      title: 'OG Title',
      type: 'string',
      group: 'openGraph',
      description: 'Tytuł wyświetlany przy udostępnianiu na Facebook/LinkedIn',
    }),
    defineField({
      name: 'ogDescription',
      title: 'OG Description',
      type: 'text',
      group: 'openGraph',
      rows: 2,
      description: 'Opis przy udostępnianiu na social media',
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      group: 'openGraph',
      description: 'Obrazek 1200x630px dla social media',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Opis obrazka dla dostępności',
        },
      ],
    }),
    defineField({
      name: 'ogImageUrl',
      title: 'OG Image URL (alternatywnie)',
      type: 'url',
      group: 'openGraph',
      description: 'Jeśli nie używasz obrazka z Sanity, podaj URL',
    }),

    // === TWITTER ===
    defineField({
      name: 'twitterTitle',
      title: 'Twitter Title',
      type: 'string',
      group: 'twitter',
    }),
    defineField({
      name: 'twitterDescription',
      title: 'Twitter Description',
      type: 'text',
      group: 'twitter',
      rows: 2,
    }),
    defineField({
      name: 'twitterImageAlt',
      title: 'Twitter Image Alt',
      type: 'string',
      group: 'twitter',
      description: 'Alt text dla obrazka na Twitterze',
    }),

    // === SCHEMA.ORG ===
    defineField({
      name: 'organizationName',
      title: 'Nazwa firmy',
      type: 'string',
      group: 'schema',
      initialValue: 'Syntance',
    }),
    defineField({
      name: 'organizationDescription',
      title: 'Opis firmy',
      type: 'text',
      group: 'schema',
      rows: 2,
    }),
    defineField({
      name: 'foundingDate',
      title: 'Rok założenia',
      type: 'string',
      group: 'schema',
      initialValue: '2024',
    }),
    defineField({
      name: 'founderName',
      title: 'Imię i nazwisko założyciela',
      type: 'string',
      group: 'schema',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email kontaktowy',
      type: 'email',
      group: 'schema',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Telefon kontaktowy',
      type: 'string',
      group: 'schema',
      description: 'Format: +48XXXXXXXXX',
    }),
    defineField({
      name: 'address',
      title: 'Adres firmy',
      type: 'object',
      group: 'schema',
      fields: [
        { name: 'street', title: 'Ulica i numer', type: 'string' },
        { name: 'city', title: 'Miejscowość', type: 'string' },
        { name: 'postalCode', title: 'Kod pocztowy', type: 'string' },
        { name: 'region', title: 'Województwo', type: 'string' },
        { name: 'country', title: 'Kraj (kod)', type: 'string', initialValue: 'PL' },
      ],
    }),
    defineField({
      name: 'geo',
      title: 'Współrzędne GPS',
      type: 'object',
      group: 'schema',
      fields: [
        { name: 'latitude', title: 'Latitude', type: 'number' },
        { name: 'longitude', title: 'Longitude', type: 'number' },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Linki do social media',
      type: 'array',
      group: 'schema',
      of: [{ type: 'url' }],
      description: 'GitHub, LinkedIn, Twitter, itp.',
    }),
    defineField({
      name: 'openingHours',
      title: 'Godziny otwarcia',
      type: 'object',
      group: 'schema',
      fields: [
        { name: 'opens', title: 'Otwarcie', type: 'string', initialValue: '09:00' },
        { name: 'closes', title: 'Zamknięcie', type: 'string', initialValue: '17:00' },
        {
          name: 'days',
          title: 'Dni robocze',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Poniedziałek', value: 'Monday' },
              { title: 'Wtorek', value: 'Tuesday' },
              { title: 'Środa', value: 'Wednesday' },
              { title: 'Czwartek', value: 'Thursday' },
              { title: 'Piątek', value: 'Friday' },
              { title: 'Sobota', value: 'Saturday' },
              { title: 'Niedziela', value: 'Sunday' },
            ],
          },
        },
      ],
    }),

    // === USŁUGI (dla Schema.org) ===
    defineField({
      name: 'services',
      title: 'Usługi',
      type: 'array',
      group: 'schema',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nazwa usługi', type: 'string' },
            { name: 'description', title: 'Opis usługi', type: 'text', rows: 2 },
            { name: 'serviceType', title: 'Typ usługi', type: 'string' },
            { name: 'priceRange', title: 'Zakres cen', type: 'string', description: 'Np. "5000-15000 PLN" lub "od 20000 PLN"' },
            { name: 'price', title: 'Cena (jeśli stała)', type: 'number' },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'priceRange',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Ustawienia SEO',
        subtitle: 'Meta tagi, słowa kluczowe, Schema.org',
      }
    },
  },
})
