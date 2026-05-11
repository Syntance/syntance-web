import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";
import { updateProjectStatus, addProjectNote } from "@/lib/attio";
import { getPaymentSettings, resolveTransferTitle, type PaymentSettings } from "@/sanity/queries/paymentSettings";
import { getContractFiles } from "@/sanity/queries/contractFiles";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY || "");
  return resend;
}

function getProjectTypeGenitive(type: string) {
  const map: Record<string, string> = {
    'Strona internetowa': 'strony WWW',
    'Strona WWW': 'strony WWW',
    'Sklep e-commerce': 'sklepu e-commerce',
    'Aplikacja webowa': 'aplikacji webowej',
  };
  return map[type] || type.toLowerCase();
}

async function blockGoogleCalendar(data: ClientData): Promise<string | null> {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !data.startDate) return null;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      requestBody: {
        summary: `✅ ${data.projectType} - ${data.name}`,
        description: `Zlecenie: ${data.bookingId}\nKlient: ${data.name} (${data.email})`,
        start: { date: data.startDate },
        end: { date: data.endDate || data.startDate },
        colorId: "10",
        transparency: "opaque",
      },
    });
    return event.data.id || null;
  } catch (err) {
    console.error("Failed to block Google Calendar:", err);
    return null;
  }
}

interface ClientData {
  name: string;
  email: string;
  bookingId: string;
  projectType: string;
  priceNetto: number;
  priceBrutto: number;
  deposit: number;
  days: number;
  startDate?: string;
  endDate?: string;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const bookingId = params.get('id');
  const action = params.get('action');
  const encodedData = params.get('data');

  if (!bookingId || !action) {
    return new NextResponse(renderPage('error', 'Brak wymaganych parametrów', null), {
      status: 400, headers: { 'Content-Type': 'text/html' },
    });
  }

  let clientData: ClientData | null = null;
  if (encodedData) {
    try {
      clientData = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8'));
    } catch (e) {
      console.error('Failed to decode client data:', e);
    }
  }

  try {
    // ── AKCEPTACJA → wysyłka umów ──────────────────────────────────────────
    if (action === 'accept') {
      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `✅ Zaakceptowano zlecenie ${bookingId}`,
        text: `Zlecenie ${bookingId} zaakceptowane ${new Date().toLocaleString('pl-PL')}. Umowy wysyłane do klienta.`,
      });

      if (clientData?.email) {
        await blockGoogleCalendar(clientData);

        const contracts = await getContractFiles();
        const attachments: { filename: string; content: Buffer }[] = [];

        for (const f of contracts.files) {
          try {
            const res = await fetch(f.url, { signal: AbortSignal.timeout(10_000) });
            if (res.ok) {
              const buf = Buffer.from(await res.arrayBuffer());
              attachments.push({ filename: `${f.label}.pdf`, content: buf });
            }
          } catch (err) {
            console.error(`Failed to download contract file "${f.label}":`, err);
          }
        }

        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientData.email],
          subject: `Syntance - Umowy do zlecenia ${bookingId}`,
          html: getContractsEmailHtml(clientData, contracts.introText),
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        try {
          await updateProjectStatus(bookingId, 'confirmed');
          await addProjectNote(bookingId, 'Zaakceptowano — umowy wysłane', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://syntance.com'}/api/booking/accept?id=${bookingId}&action=pay&data=${encodedData}`;
      return new NextResponse(renderPage('accepted', bookingId, clientData, null, payUrl), {
        status: 200, headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── PŁATNOŚĆ → wysyłka danych do przelewu ─────────────────────────────
    if (action === 'pay') {
      const payment = await getPaymentSettings();

      if (clientData?.email) {
        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientData.email],
          subject: `Syntance - Dane do płatności - ${bookingId}`,
          html: getPaymentEmailHtml(clientData, payment),
        });

        try {
          await addProjectNote(bookingId, 'Dane do przelewu wysłane', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `💳 Dane do przelewu wysłane — ${bookingId}`,
        text: `Dane do przelewu zostały wysłane do ${clientData?.email ?? 'klienta'} o ${new Date().toLocaleString('pl-PL')}.`,
      });

      return new NextResponse(renderPage('paid', bookingId, clientData), {
        status: 200, headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── ODRZUCENIE ─────────────────────────────────────────────────────────
    if (action === 'reject') {
      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `❌ Odrzucono zlecenie ${bookingId}`,
        text: `Zlecenie ${bookingId} odrzucone ${new Date().toLocaleString('pl-PL')}.`,
      });

      if (clientData?.email) {
        const projectTypeGenitive = getProjectTypeGenitive(clientData.projectType);
        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientData.email],
          subject: `Syntance - Informacja o zleceniu ${projectTypeGenitive}`,
          html: getRejectedEmailHtml(clientData),
        });

        try {
          await updateProjectStatus(bookingId, 'rejected');
          await addProjectNote(bookingId, 'Odrzucono', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      return new NextResponse(renderPage('rejected', bookingId, clientData), {
        status: 200, headers: { 'Content-Type': 'text/html' },
      });
    }

    return new NextResponse(renderPage('error', 'Nieznana akcja', null), {
      status: 400, headers: { 'Content-Type': 'text/html' },
    });
  } catch (e) {
    console.error('Accept API error:', e);
    return new NextResponse(renderPage('error', 'Wystąpił błąd serwera', null), {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }
}

// ─── EMAIL: Umowy ──────────────────────────────────────────────────────────────

function getContractsEmailHtml(data: ClientData, introText?: string): string {
  const intro = introText
    ? escapeHtml(introText).replace(/\n/g, '<br>')
    : `W załączeniu przesyłamy umowy dotyczące realizacji Twojego zlecenia (<strong>${escapeHtml(data.bookingId)}</strong>).<br><br>Prosimy o zapoznanie się z dokumentami, podpisanie ich i odesłanie skanów na <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a>. Po otrzymaniu podpisanych umów wyślemy dane do płatności zaliczki.`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <div style="font-size:56px;margin-bottom:16px;">📄</div>
            <h1 style="margin:0;color:#fff;font-size:26px;">Umowy do Twojego zlecenia</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: <strong style="color:#a78bfa;">${escapeHtml(data.bookingId)}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">
              Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,
            </p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">
              ${intro}
            </p>

            <div style="background-color:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="margin:0 0 16px;color:#fff;font-size:15px;">📋 Szczegóły zlecenia</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;width:160px;">Typ projektu:</td>
                  <td style="padding:5px 0;color:#fff;font-size:14px;">${escapeHtml(data.projectType)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;">Wartość:</td>
                  <td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN netto / ${data.priceBrutto.toLocaleString('pl-PL')} PLN brutto</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;">Zaliczka:</td>
                  <td style="padding:5px 0;color:#a78bfa;font-size:14px;font-weight:600;">${data.deposit.toLocaleString('pl-PL')} PLN</td>
                </tr>
              </table>
            </div>

            <p style="color:#888;font-size:13px;line-height:1.6;margin-top:24px;">
              Masz pytania? Odpowiedz na ten email lub napisz na <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;">
            <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── EMAIL: Dane do przelewu ───────────────────────────────────────────────────

function getPaymentEmailHtml(data: ClientData, payment: PaymentSettings | null): string {
  const transferTitle = payment
    ? resolveTransferTitle(payment.transferTitleTemplate, data.bookingId)
    : `Zaliczka ${data.bookingId} — Syntance`

  const paymentBlock = payment
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;border-radius:12px;border:1px solid #333;margin:24px 0;">
        <tr><td style="padding:20px;">
          <h4 style="margin:0 0 16px;color:#fff;font-size:14px;">🏦 Dane do przelewu</h4>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:14px;width:160px;vertical-align:top;">Właściciel konta:</td>
              <td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${escapeHtml(payment.accountHolder)}</td>
            </tr>
            ${payment.bankName ? `<tr>
              <td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Bank:</td>
              <td style="padding:6px 0;color:#fff;font-size:14px;">${escapeHtml(payment.bankName)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Numer konta:</td>
              <td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;font-family:monospace,monospace;letter-spacing:0.5px;">${escapeHtml(payment.accountNumber)}</td>
            </tr>
            ${payment.swiftBic ? `<tr>
              <td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">SWIFT / BIC:</td>
              <td style="padding:6px 0;color:#fff;font-size:14px;font-family:monospace,monospace;">${escapeHtml(payment.swiftBic)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Tytuł przelewu:</td>
              <td style="padding:6px 0;color:#a78bfa;font-size:14px;font-weight:600;">${escapeHtml(transferTitle)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:14px;vertical-align:top;">Kwota zaliczki:</td>
              <td style="padding:6px 0;color:#22c55e;font-size:16px;font-weight:700;">${data.deposit.toLocaleString('pl-PL')} PLN</td>
            </tr>
          </table>
          ${payment.additionalInfo ? `<p style="margin:16px 0 0;color:#888;font-size:13px;line-height:1.6;border-top:1px solid #222;padding-top:12px;">${escapeHtml(payment.additionalInfo).replace(/\n/g, '<br>')}</p>` : ''}
        </td></tr>
      </table>`
    : `<div style="background-color:#0d0d0d;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #333;">
        <h4 style="margin:0 0 12px;color:#fff;font-size:14px;">🏦 Dane do przelewu</h4>
        <p style="margin:0;color:#ccc;font-size:14px;line-height:1.8;">
          <strong>Tytuł:</strong> ${escapeHtml(transferTitle)}<br>
          <strong>Kwota:</strong> ${data.deposit.toLocaleString('pl-PL')} PLN
        </p>
        <p style="margin:12px 0 0;color:#888;font-size:12px;">Szczegółowe dane do przelewu zostaną wysłane w osobnej wiadomości.</p>
      </div>`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <div style="font-size:56px;margin-bottom:16px;">🎉</div>
            <h1 style="margin:0;color:#22c55e;font-size:26px;">Zlecenie potwierdzone!</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: <strong style="color:#a78bfa;">${escapeHtml(data.bookingId)}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">
              Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,
            </p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">
              Dziękujemy za podpisanie umów! Poniżej znajdziesz dane do wpłaty zaliczki, po której <strong style="color:#fff;">rozpoczynamy realizację projektu</strong>.
            </p>

            <div style="background-color:#1a1a1a;border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="margin:0 0 16px;color:#fff;font-size:15px;">💰 Podsumowanie zlecenia</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;width:160px;">Typ projektu:</td>
                  <td style="padding:5px 0;color:#fff;font-size:14px;">${escapeHtml(data.projectType)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;">Wartość netto:</td>
                  <td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceNetto.toLocaleString('pl-PL')} PLN</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;">Wartość brutto:</td>
                  <td style="padding:5px 0;color:#fff;font-size:14px;">${data.priceBrutto.toLocaleString('pl-PL')} PLN</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#888;font-size:14px;">Zaliczka:</td>
                  <td style="padding:5px 0;color:#22c55e;font-size:15px;font-weight:700;">${data.deposit.toLocaleString('pl-PL')} PLN</td>
                </tr>
              </table>
            </div>

            ${paymentBlock}

            <p style="color:#888;font-size:13px;line-height:1.6;">
              Po zaksięgowaniu wpłaty skontaktujemy się w sprawie startu projektu.
              Pytania? <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;">
            <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── EMAIL: Odrzucenie ─────────────────────────────────────────────────────────

function getRejectedEmailHtml(data: ClientData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111;border-radius:16px;border:1px solid #222;">
        <tr>
          <td style="padding:32px;text-align:center;border-bottom:1px solid #222;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Informacja o zapytaniu</h1>
            <p style="margin:8px 0 0;color:#888;">Nr referencyjny: ${escapeHtml(data.bookingId)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#ccc;font-size:16px;line-height:1.6;">
              Cześć <strong style="color:#fff;">${escapeHtml(data.name)}</strong>,
            </p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">
              Dziękujemy za zainteresowanie współpracą z Syntance. Niestety, <strong style="color:#f87171;">w tym momencie nie możemy przyjąć Twojego zlecenia</strong>.
            </p>
            <p style="color:#ccc;font-size:15px;line-height:1.7;">
              Skontaktujemy się z Tobą wkrótce, aby omówić możliwe alternatywy.
            </p>
            <p style="color:#888;font-size:13px;margin-top:24px;">
              Pytania? <a href="mailto:kontakt@syntance.com" style="color:#a78bfa;">kontakt@syntance.com</a> · <a href="tel:+48537110170" style="color:#a78bfa;">+48 537 110 170</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;background-color:#0d0d0d;border-top:1px solid #222;">
            <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Strona potwierdzenia dla admina ──────────────────────────────────────────

type PageStatus = 'accepted' | 'paid' | 'rejected' | 'error'

function renderPage(
  status: PageStatus,
  id: string,
  clientData: ClientData | null,
  _calendarEventId?: string | null,
  payUrl?: string,
): string {
  const configs: Record<PageStatus, { icon: string; title: string; color: string; bg: string }> = {
    accepted: { icon: '📄', title: 'Umowy wysłane!', color: '#a78bfa', bg: '#a78bfa20' },
    paid:     { icon: '💳', title: 'Dane do przelewu wysłane!', color: '#22c55e', bg: '#22c55e20' },
    rejected: { icon: '❌', title: 'Zlecenie odrzucone', color: '#ef4444', bg: '#ef444420' },
    error:    { icon: '⚠️', title: 'Błąd', color: '#f59e0b', bg: '#f59e0b20' },
  }
  const c = configs[status]

  const clientBlock = clientData && status === 'accepted'
    ? `<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:24px 0;text-align:left;">
        <p style="margin:0 0 6px;color:#888;font-size:13px;">📧 Email wysłany do:</p>
        <p style="margin:0;color:#fff;font-size:14px;font-weight:600;">${escapeHtml(clientData.email)}</p>
        <p style="margin:4px 0 0;color:#888;font-size:12px;">Temat: Umowy do zlecenia ${escapeHtml(id)}</p>
      </div>`
    : ''

  const payButton = payUrl && clientData
    ? `<div style="margin:24px 0;padding:20px;background:#0d2a1a;border:1px solid #22c55e40;border-radius:12px;text-align:center;">
        <p style="margin:0 0 12px;color:#ccc;font-size:14px;">Gdy klient odeśle podpisane umowy, wyślij mu dane do przelewu:</p>
        <a href="${payUrl}" style="display:inline-block;padding:14px 32px;background:#22c55e;color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;">
          💳 Wyślij dane do przelewu
        </a>
      </div>`
    : ''

  const clientPaidBlock = clientData && status === 'paid'
    ? `<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:24px 0;text-align:left;">
        <p style="margin:0 0 6px;color:#888;font-size:13px;">📧 Email wysłany do:</p>
        <p style="margin:0;color:#fff;font-size:14px;font-weight:600;">${escapeHtml(clientData.email)}</p>
        <p style="margin:4px 0 0;color:#888;font-size:12px;">Zawiera: dane do przelewu + podsumowanie zlecenia</p>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.title} - Syntance</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{background:rgba(17,17,17,.9);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:48px;max-width:520px;width:100%;text-align:center;backdrop-filter:blur(10px);box-shadow:0 25px 50px -12px rgba(0,0,0,.5)}
    .icon{font-size:56px;margin-bottom:24px;display:inline-block;padding:20px;background:${c.bg};border-radius:50%}
    h1{color:#fff;font-size:26px;margin-bottom:12px;font-weight:600}
    .badge{display:inline-block;padding:8px 20px;background:${c.bg};color:${c.color};border-radius:9999px;font-weight:600;font-size:13px;border:1px solid ${c.color}40;margin-top:16px}
    .close{margin-top:32px;display:inline-block;padding:12px 32px;background:rgba(255,255,255,.1);color:#fff;text-decoration:none;border-radius:12px;font-weight:500}
    .close:hover{background:rgba(255,255,255,.15)}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${c.icon}</div>
    <h1>${c.title}</h1>
    <p style="color:#888;font-size:15px;line-height:1.6;margin-top:8px;">Zlecenie: <strong style="color:#fff;">${escapeHtml(id)}</strong></p>
    ${clientBlock}
    ${clientPaidBlock}
    ${payButton}
    <div class="badge">${status === 'accepted' ? 'UMOWY WYSŁANE' : status === 'paid' ? 'PRZELEW WYSŁANY' : status === 'rejected' ? 'ODRZUCONE' : 'BŁĄD'}</div>
    <br>
    <a href="javascript:window.close()" class="close" onclick="window.close();return false;">Zamknij okno</a>
  </div>
</body>
</html>`
}
