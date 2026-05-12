import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'faqSettings',
  title: 'FAQ — wszystkie podstrony',
  type: 'document',
  groups: [
    { name: 'cennik', title: '/cennik' },
    { name: 'stronyWww', title: 'Strony WWW' },
    { name: 'sklepy', title: 'Sklepy internetowe' },
    { name: 'strategia', title: 'Strategia marketingu' },
    { name: 'oNas', title: 'O nas' },
    { name: 'kontakt', title: 'Kontakt' },
    { name: 'agencje', title: 'Agencje (white-label)' },
  ],
  fields: [
    defineField({
      name: 'faqCennik',
      title: 'FAQ na stronie cennika',
      type: 'array',
      group: 'cennik',
      description: 'Accordion z filtrem po kategoriach.',
      of: [defineArrayMember({ type: 'faqPricingEntry' })],
    }),
    defineField({
      name: 'faqStronyWww',
      title: '/strony-www — FAQ',
      type: 'array',
      group: 'stronyWww',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
    }),
    defineField({
      name: 'faqSklepy',
      title: '/sklepy-internetowe — FAQ',
      type: 'array',
      group: 'sklepy',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
    }),
    defineField({
      name: 'faqStrategia',
      title: '/strategia-marketingu-i-sprzedazy — FAQ',
      type: 'array',
      group: 'strategia',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
      description:
        'Cena warsztatu: {{DISCOVERY_NET}}; cena bazy strony w konfiguratorze: {{WEBSITE_NET}} (opcjonalnie w treści).',
    }),
    defineField({
      name: 'faqONas',
      title: '/o-nas — FAQ',
      type: 'array',
      group: 'oNas',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
    }),
    defineField({
      name: 'faqKontakt',
      title: '/kontakt — FAQ',
      type: 'array',
      group: 'kontakt',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
    }),
    defineField({
      name: 'faqAgencje',
      title: '/agencje-marketingowe — FAQ',
      type: 'array',
      group: 'agencje',
      of: [defineArrayMember({ type: 'faqSimpleEntry' })],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'FAQ — podstrony (zakładki powyżej)' }
    },
  },
})
