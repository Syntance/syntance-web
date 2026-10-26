import { consumeBackupCode, consumeTotpStep, encryptionKey, type AdminUser } from './accounts'
import { decryptSecret, hashBackupCode } from './crypto'
import { verifyTotp } from './totp'

/** Drugi składnik logowania: kod TOTP (6 cyfr) albo jednorazowy kod zapasowy. Każdy kod działa tylko raz. */
export async function verifySecondFactor(user: AdminUser, rawCode: string, nowMs = Date.now()): Promise<boolean> {
  const code = rawCode.trim()
  if (/^\d{6}$/.test(code)) {
    if (!user.totpSecretEnc) return false
    const check = verifyTotp(decryptSecret(user.totpSecretEnc, encryptionKey()), code, nowMs, user.totpLastStep)
    return check.ok && (await consumeTotpStep(user.id, check.step))
  }
  if (code.length >= 8 && code.length <= 16) return consumeBackupCode(user.id, hashBackupCode(code))
  return false
}
