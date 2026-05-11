import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'orderCounter',
  title: '🔢 Licznik zleceń',
  type: 'document',
  fields: [
    defineField({
      name: 'count',
      title: 'Aktualny numer zlecenia',
      type: 'number',
      initialValue: 0,
      description: 'Automatycznie inkrementowany przy każdym nowym zapytaniu. Nie edytuj ręcznie.',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
  ],
  preview: {
    select: { count: 'count' },
    prepare({ count }) {
      return {
        title: '🔢 Licznik zleceń',
        subtitle: `Ostatnie zlecenie: SYN-${String(count ?? 0).padStart(4, '0')}`,
      }
    },
  },
})
