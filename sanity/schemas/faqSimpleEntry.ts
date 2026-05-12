import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'faqSimpleEntry',
  title: 'Pytanie i odpowiedź',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Pytanie',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Odpowiedź',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
      description:
        'Kwoty „od …”: {{WEBSITE_NET}}, {{ECOMMERCE_NET}}, {{WEBAPP_NET}}, {{DISCOVERY_NET}} — te same wartości co przy konfiguratorze (pakiet bazowy z „Cennik — pakiety i zasady”).',
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
    select: { title: 'question', subtitle: 'order' },
    prepare({ title, subtitle }) {
      return { title: title ?? '—', subtitle: subtitle != null ? `#${subtitle}` : undefined }
    },
  },
})
