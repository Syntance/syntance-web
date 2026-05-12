import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingFaq',
  title: 'FAQ Cennika',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Pytanie',
      type: 'string',
      description:
        'Opcjonalnie w treści: {{WEBSITE_NET}}, {{ECOMMERCE_NET}}, {{DISCOVERY_NET}} (podmiana na stronie /cennik).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Odpowiedź',
      type: 'text',
      rows: 4,
      description:
        'Opcjonalnie: {{WEBSITE_NET}}, {{ECOMMERCE_NET}}, {{WEBAPP_NET}}, {{DISCOVERY_NET}} — podmieniane na ceny z konfiguratora / cennika.',
      validation: (Rule) => Rule.required(),
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
      description: 'Czy pytanie ma być widoczne na stronie?',
    }),
  ],
  preview: {
    select: {
      title: 'question',
      category: 'category',
      isActive: 'isActive',
    },
    prepare(selection: { title?: string; category?: string; isActive?: boolean }) {
      const { title = '', category = '', isActive = true } = selection
      
      const categoryEmoji: Record<string, string> = {
        pricing: '💰',
        time: '⏱️',
        trust: '🔒',
        comparison: '⚖️',
      }
      
      return {
        title: `${isActive ? '✅' : '⚠️'} ${title}`,
        subtitle: `${categoryEmoji[category] || '❓'} ${category}`,
      }
    },
  },
  orderings: [
    {
      title: 'Kolejność',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Kategoria',
      name: 'categoryAsc',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
})
