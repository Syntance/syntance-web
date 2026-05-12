/**
 * Seed z tokenem zalogowanej osoby (`sanity login`).
 *
 * pnpm seed:faq:cli
 * Nadpisanie: SEED_FAQ_FORCE=1 pnpm seed:faq:cli
 */

import { getCliClient } from 'sanity/cli'
import { seedFaqSettingsDocument } from './lib/seedFaqSettingsDocument'

const client = getCliClient({ apiVersion: '2024-01-01' })

seedFaqSettingsDocument(client).catch((err: unknown) => {
  console.error('❌', err)
  process.exit(1)
})
