import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'paymentSettings',
  title: '🏦 Dane do przelewu',
  type: 'document',
  fields: [
    defineField({
      name: 'accountHolder',
      title: 'Właściciel konta (nazwa firmy)',
      type: 'string',
      validation: (Rule) => Rule.required(),
      placeholder: 'Syntance P.S.A.',
    }),
    defineField({
      name: 'bankName',
      title: 'Nazwa banku',
      type: 'string',
      placeholder: 'mBank, PKO BP…',
    }),
    defineField({
      name: 'accountNumber',
      title: 'Numer konta (IBAN)',
      description: 'Format PL + 26 cyfr, np. PL12 3456 7890 1234 5678 9012 3456',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'swiftBic',
      title: 'SWIFT / BIC (opcjonalnie)',
      description: 'Potrzebny dla przelewów zagranicznych.',
      type: 'string',
    }),
    defineField({
      name: 'transferTitleTemplate',
      title: 'Szablon tytułu przelewu',
      description:
        'Użyj {bookingId} — zostanie zastąpione numerem zlecenia. Np. „Zaliczka {bookingId} — Syntance".',
      type: 'string',
      initialValue: 'Zaliczka {bookingId} — Syntance',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Dodatkowe informacje (opcjonalnie)',
      description: 'Np. godziny pracy, termin płatności, uwagi.',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'accountHolder',
      subtitle: 'accountNumber',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Dane do przelewu',
        subtitle: subtitle || 'Brak numeru konta',
      }
    },
  },
})
