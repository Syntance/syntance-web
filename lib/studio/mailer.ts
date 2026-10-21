import { Resend } from 'resend'
import { legalContactEmail, legalTradeName } from '@/lib/data/legal-entity'
import type { Mailer } from './license-service'

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

/** Wysyłka klucza licencji przez Resend (e-mail transakcyjny — bez treści marketingowych). Limit czasu 10 s. */
export class ResendMailer implements Mailer {
  async sendLicenseKey(email: string, key: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
    const from = process.env.LICENSE_FROM_EMAIL ?? `licencje@syntance.com`
    const resend = new Resend(apiKey)
    const text = [
      'Dziękujemy za zakup Syntance Studio.',
      '',
      `Twój klucz licencji: ${key}`,
      '',
      'Jak aktywować: otwórz aplikację → Ustawienia → Licencja → wklej klucz.',
      'Licencję możesz aktywować na maksymalnie 2 urządzeniach.',
      '',
      `Pomoc: ${legalContactEmail}`,
      '',
      'Thank you for purchasing Syntance Studio. Your licence key is above; activate it in Settings → Licence.',
      '',
      legalTradeName,
    ].join('\n')
    const html = `<p>Dziękujemy za zakup Syntance Studio.</p><p>Twój klucz licencji:</p><p style="font:600 18px monospace">${escapeHtml(key)}</p><p>Jak aktywować: otwórz aplikację → Ustawienia → Licencja → wklej klucz. Licencję możesz aktywować na maksymalnie 2 urządzeniach.</p><p>Pomoc: ${escapeHtml(legalContactEmail)}</p><p style="color:#666">Thank you for purchasing Syntance Studio. Activate the key in Settings → Licence.</p><p>${escapeHtml(legalTradeName)}</p>`
    const send = resend.emails.send({ from, to: email, subject: 'Twój klucz licencji Syntance Studio', text, html })
    const timeout = new Promise<never>((_, reject) => {
      const id = setTimeout(() => reject(new Error('Resend timeout')), 10_000)
      void send.finally(() => clearTimeout(id))
    })
    const { error } = await Promise.race([send, timeout])
    if (error) throw new Error(`Resend: ${error.message}`)
  }
}
