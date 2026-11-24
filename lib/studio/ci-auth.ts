import { createHash, timingSafeEqual } from 'node:crypto'
import { StudioHttpError } from './license-service'

/** Najkrótszy akceptowany token CI (32 znaki ≈ 190 bitów przy base64url). */
const MIN_TOKEN_LENGTH = 32

const digest = (s: string): Buffer => createHash('sha256').update(s, 'utf8').digest()

/**
 * Autoryzacja kroku CI wydań Syntance Studio (`Authorization: Bearer <STUDIO_RELEASE_CI_TOKEN>`).
 * Porównanie skrótów w stałym czasie; brak/za krótki sekret w ENV = endpoint wyłączony (503), nie otwarty.
 */
export function requireCiToken(req: Request, env: Readonly<Record<string, string | undefined>> = process.env): void {
  const secret = env['STUDIO_RELEASE_CI_TOKEN']
  if (!secret || secret.length < MIN_TOKEN_LENGTH) throw new StudioHttpError(503, 'CI_NOT_CONFIGURED')
  const header = req.headers.get('authorization') ?? ''
  const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!given || !timingSafeEqual(digest(given), digest(secret))) throw new StudioHttpError(401, 'UNAUTHORIZED')
}
