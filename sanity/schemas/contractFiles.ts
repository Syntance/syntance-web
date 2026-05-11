import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contractFiles',
  title: '📄 Szablony umów',
  type: 'document',
  fields: [
    defineField({
      name: 'files',
      title: 'Pliki umów (PDF)',
      description:
        'Wgraj szablony umów. Będą automatycznie dołączone do emaila wysyłanego po zaakceptowaniu zlecenia.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Nazwa pliku (widoczna w emailu)',
              type: 'string',
              placeholder: 'Umowa o dzieło',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'file',
              title: 'Plik PDF',
              type: 'file',
              options: { accept: '.pdf,application/pdf' },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label' },
            prepare({ label }) {
              return { title: label || 'Bez nazwy', media: undefined }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'introText',
      title: 'Wstęp w emailu z umowami (opcjonalnie)',
      description:
        'Tekst powyżej listy plików w emailu do klienta. Możesz zostawić puste — użyta zostanie domyślna treść.',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { files: 'files' },
    prepare({ files }) {
      const count = Array.isArray(files) ? files.length : 0
      return {
        title: '📄 Szablony umów',
        subtitle: count > 0 ? `${count} plik${count === 1 ? '' : 'i/ów'}` : 'Brak plików',
      }
    },
  },
})
