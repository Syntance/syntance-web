import { client } from '../lib/client'

/**
 * Atomically increments the order counter and returns the new sequential number.
 * Format: SYN-0001, SYN-0002, …
 *
 * Falls back to a timestamp-based ID when Sanity write token lacks permissions.
 */
export async function getNextOrderNumber(): Promise<string> {
  try {
    const result = await client
      .patch('orderCounter')
      .setIfMissing({ _type: 'orderCounter', count: 0 })
      .inc({ count: 1 })
      .commit()

    const count = (result as { count?: number }).count ?? 1
    return `SYN-${String(count).padStart(4, '0')}`
  } catch (err) {
    console.error('[orderCounter] Sanity write failed, using timestamp fallback:', err)
    const now = new Date()
    const yy = now.getFullYear().toString().slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const ms = String(Date.now()).slice(-4)
    return `SYN-${yy}${mm}-${ms}`
  }
}
