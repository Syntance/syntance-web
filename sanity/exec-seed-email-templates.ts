/**
 * Ten plik jest uruchamiany przez CLI z tokenem zalogowanego użytkownika.
 *
 * pnpm seed:email-templates:cli
 */

import { getCliClient } from 'sanity/cli'
import { seedEmailTemplateAppearance } from './lib/emailTemplateAppearanceSeed'

const client = getCliClient({ apiVersion: '2024-01-01' })

seedEmailTemplateAppearance(client).catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
