/**
 * Uzupełnia emailTemplates kolory/tła/emotki (token API z .env).
 *
 * Uruchom: pnpm seed:email-templates
 * Alternatywa (sesja CLI): pnpm seed:email-templates:cli
 */

import { createClient } from '@sanity/client'
import { seedEmailTemplateAppearance } from './lib/emailTemplateAppearanceSeed'

async function main(): Promise<void> {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('❌ Brak SANITY_API_WRITE_TOKEN — dodaj token z sanity.io/manage (Editor).')
    console.error('   Albo uruchom: pnpm seed:email-templates:cli')
    process.exit(1)
  }

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  })

  await seedEmailTemplateAppearance(client)
}

main().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
