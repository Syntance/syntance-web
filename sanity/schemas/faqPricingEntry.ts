import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'faqPricingEntry',
  title: 'Pytanie i odpowiedź (FAQ cennika)',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Pytanie',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description:
        'Tokeny cenowe jak w pozostałych FAQ: {{WEBSITE_NET}}, {{ECOMMERCE_NET}}, {{WEBAPP_NET}}, {{DISCOVERY_NET}}.',
    }),
    defineField({
      name: 'answer',
      title: 'Odpowiedź',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
      description:
        'Kwoty z konfiguratora / pakietów — patrz pola w „Cennik — pakiety i zasady” (pakiet bazowy WWW, sklep, strategia).',
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      options: {
        list: [
          { title: '💰 Pytania cenowe', value: 'pricing' },
          { title: '⏱️ Czas i proces', value: 'time' },
          { title: '🔒 Ryzyko i zaufanie', value: 'trust' },
          { title: '⚖️ Porównania', value: 'comparison' },
        ],
        layout: 'radio',
      },
      initialValue: 'pricing',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Kolejność',
      type: 'number',
      initialValue: 0,
      description: 'Mniejsza liczba = wyżej na liście',
    }),
    defineField({
      name: 'isActive',
      title: 'Aktywne',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'question', category: 'category', order: 'order' },
    prepare({ title, category, order }) {
      const catLabels: Record<string, string> = {
        pricing: 'Cena',
        time: 'Czas',
        trust: 'Zaufanie',
        comparison: 'Porównanie',
      }
      const c = category ? catLabels[category] ?? category : ''
      return {
        title: title ?? '—',
        subtitle: [c, order != null ? `#${order}` : ''].filter(Boolean).join(' · '),
      }
    },
  },
})
