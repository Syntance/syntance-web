import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";
import { updateProjectStatus, addProjectNote, resolveBookingIdFromAttioLink } from "@/lib/attio";
import { getPaymentSettings } from "@/sanity/queries/paymentSettings";
import { getContractFiles } from "@/sanity/queries/contractFiles";
import { getEmailTemplates } from "@/sanity/queries/emailTemplates";
import {
  renderContractsEmail,
  renderPaymentEmail,
  renderRejectionEmail,
  type EmailRenderData,
} from "@/lib/emails/templates";

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

  const liveBookingId = await resolveBookingIdFromAttioLink(bookingId);
  const clientForMail: ClientData | null = clientData
    ? { ...clientData, bookingId: liveBookingId }
    : null;

  // Mapowanie ClientData → EmailRenderData (wymagane przez wspólny moduł)
  const renderData: EmailRenderData | null = clientForMail
    ? {
        bookingId: liveBookingId,
        name: clientForMail.name,
        email: clientForMail.email,
        projectType: clientForMail.projectType,
        priceNetto: clientForMail.priceNetto,
        priceBrutto: clientForMail.priceBrutto,
        deposit: clientForMail.deposit,
      }
    : null;

  try {
    // ── AKCEPTACJA → wysyłka umów ──────────────────────────────────────────
    if (action === 'accept') {
      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `✅ Zaakceptowano zlecenie ${liveBookingId}`,
        text: `Zlecenie ${liveBookingId} zaakceptowane ${new Date().toLocaleString('pl-PL')}. Umowy wysyłane do klienta.`,
      });

      if (clientForMail?.email && renderData) {
        await blockGoogleCalendar(clientForMail);

        const [contracts, templates] = await Promise.all([
          getContractFiles(),
          getEmailTemplates(),
        ]);
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

        const merged = {
          ...templates,
          contracts: {
            ...templates.contracts,
            intro: contracts.introText?.trim() ? contracts.introText : templates.contracts.intro,
          },
        };

        const { subject, html } = renderContractsEmail(renderData, merged);

        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientForMail.email],
          subject,
          html,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        try {
          await updateProjectStatus(liveBookingId, 'confirmed');
          await addProjectNote(liveBookingId, 'Zaakceptowano — umowy wysłane', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://syntance.com'}/api/booking/accept?id=${encodeURIComponent(liveBookingId)}&action=pay&data=${encodedData}`;
      return new NextResponse(renderPage('accepted', liveBookingId, clientForMail, null, payUrl), {
        status: 200, headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── PŁATNOŚĆ → wysyłka danych do przelewu ─────────────────────────────
    if (action === 'pay') {
      if (clientForMail?.email && renderData) {
        const [payment, templates] = await Promise.all([
          getPaymentSettings(),
          getEmailTemplates(),
        ]);
        const { subject, html } = renderPaymentEmail(renderData, templates, payment);

        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientForMail.email],
          subject,
          html,
        });

        try {
          await addProjectNote(liveBookingId, 'Dane do przelewu wysłane', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `💳 Dane do przelewu wysłane — ${liveBookingId}`,
        text: `Dane do przelewu zostały wysłane do ${clientForMail?.email ?? 'klienta'} o ${new Date().toLocaleString('pl-PL')}.`,
      });

      return new NextResponse(renderPage('paid', liveBookingId, clientForMail), {
        status: 200, headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── ODRZUCENIE ─────────────────────────────────────────────────────────
    if (action === 'reject') {
      await getResend().emails.send({
        from: "Syntance System <system@syntance.com>",
        to: [process.env.CONTACT_TO_EMAIL!],
        subject: `❌ Odrzucono zlecenie ${liveBookingId}`,
        text: `Zlecenie ${liveBookingId} odrzucone ${new Date().toLocaleString('pl-PL')}.`,
      });

      if (clientForMail?.email && renderData) {
        const templates = await getEmailTemplates();
        const { subject, html } = renderRejectionEmail(renderData, templates);

        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientForMail.email],
          subject,
          html,
        });

        try {
          await updateProjectStatus(liveBookingId, 'rejected');
          await addProjectNote(liveBookingId, 'Odrzucono', `${new Date().toLocaleString('pl-PL')}`);
        } catch (err) {
          console.error('Attio error:', err);
        }
      }

      return new NextResponse(renderPage('rejected', liveBookingId, clientForMail), {
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
