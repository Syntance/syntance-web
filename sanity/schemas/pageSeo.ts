import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pageSeo',
  title: 'SEO Podstrony',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Podstawowe' },
    { name: 'meta', title: 'Meta tagi' },
    { name: 'keywords', title: 'Słowa kluczowe' },
    { name: 'social', title: 'Social Media' },
  ],
  fields: [
    // === PODSTAWOWE ===
    defineField({
      name: 'pageName',
      title: 'Nazwa strony (wewnętrzna)',
      type: 'string',
      group: 'basic',
      description: 'Np. "Strona główna", "Cennik", "O nas"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL strony (slug)',
      type: 'slug',
      group: 'basic',
      description: 'Np. "/" dla strony głównej, "/cennik" dla cennika',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'pageName',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Aktywna',
      type: 'boolean',
      group: 'basic',
      description: 'Czy SEO tej strony jest aktywne?',
      initialValue: true,
    }),

    // === META TAGI ===
    defineField({
      name: 'metaTitle',
      title: 'Tytuł strony (meta title)',
      type: 'string',
      group: 'meta',
      description: 'Tytuł wyświetlany w Google (max 60 znaków). Zostaw puste dla domyślnego.',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Opis strony (meta description)',
      type: 'text',
      group: 'meta',
      rows: 3,
      description: 'Opis w wynikach Google (max 160 znaków). Zostaw puste dla domyślnego.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL (opcjonalnie)',
      type: 'url',
      group: 'meta',
      description: 'Jeśli różny od domyślnego URL',
    }),

    // === SŁOWA KLUCZOWE ===
    defineField({
      name: 'focusKeyword',
      title: 'Główne słowo kluczowe',
      type: 'string',
      group: 'keywords',
      description: 'Jedno główne słowo/fraza kluczowa dla tej strony (np. "cennik stron Next.js")',
    }),
    defineField({
      name: 'keywords',
      title: 'Dodatkowe słowa kluczowe',
      type: 'array',
      group: 'keywords',
      of: [{ type: 'string' }],
      description: 'Lista dodatkowych słów kluczowych',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'keywordDensity',
      title: 'Notatka o gęstości słów kluczowych',
      type: 'text',
      group: 'keywords',
      rows: 2,
      description: 'Notatka gdzie i jak często używać focus keyword na stronie',
    }),

    // === SOCIAL MEDIA ===
    defineField({
      name: 'ogTitle',
      title: 'OG Title (Facebook/LinkedIn)',
      type: 'string',
      group: 'social',
      description: 'Tytuł przy udostępnianiu. Zostaw puste dla domyślnego.',
    }),
    defineField({
      name: 'ogDescription',
      title: 'OG Description',
      type: 'text',
      group: 'social',
      rows: 2,
      description: 'Opis przy udostępnianiu. Zostaw puste dla domyślnego.',
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image (1200x630px)',
      type: 'image',
      group: 'social',
      description: 'Obrazek dla social media. Zostaw puste dla domyślnego.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        },
      ],
    }),
    defineField({
      name: 'ogImageUrl',
      title: 'OG Image URL (alternatywnie)',
      type: 'url',
      group: 'social',
      description: 'Jeśli nie używasz obrazka z Sanity',
    }),
    defineField({
      name: 'twitterTitle',
      title: 'Twitter Title',
      type: 'string',
      group: 'social',
      description: 'Zostaw puste dla domyślnego',
    }),
    defineField({
      name: 'twitterDescription',
      title: 'Twitter Description',
      type: 'text',
      group: 'social',
      rows: 2,
      description: 'Zostaw puste dla domyślnego',
    }),

    // === ANALITYKA SEO ===
    defineField({
      name: 'seoNotes',
      title: 'Notatki SEO',
      type: 'text',
      group: 'basic',
      rows: 4,
      description: 'Notatki o strategii SEO dla tej strony, konkurencji, itp.',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Ostatnia aktualizacja SEO',
      type: 'datetime',
      group: 'basic',
      description: 'Automatycznie ustawiane',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'pageName',
      subtitle: 'slug.current',
      focusKeyword: 'focusKeyword',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, focusKeyword, isActive }) {
      return {
        title: `${isActive ? '✅' : '⚠️'} ${title}`,
        subtitle: `${subtitle}${focusKeyword ? ` • Focus: ${focusKeyword}` : ''}`,
      }
    },
  },
})
