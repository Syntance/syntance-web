import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";
import { updateProjectStatus, addProjectNote } from "@/lib/attio";

let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return resend;
}

// Konwersja typu projektu na formę dopełniacza
function getProjectTypeGenitive(type: string) {
  const genitiveMap: Record<string, string> = {
    'Strona internetowa': 'Strony WWW',
    'Strona WWW': 'Strony WWW',
    'Sklep e-commerce': 'Sklepu e-commerce',
    'Aplikacja webowa': 'Aplikacji webowej',
  };
  return genitiveMap[type] || type;
}

// Block calendar after acceptance
async function blockGoogleCalendar(data: ClientData): Promise<string | null> {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !data.startDate) {
    return null;
  }

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
        description: `Zlecenie: ${data.bookingId}\nKlient: ${data.name} (${data.email})\nCena: ${data.priceNetto.toLocaleString('pl-PL')} PLN\nZaliczka: ${data.deposit.toLocaleString('pl-PL')} PLN`,
        start: {
          date: data.startDate,
        },
        end: {
          date: data.endDate || data.startDate,
        },
        colorId: "10", // Zielony - potwierdzone
        transparency: "opaque",
      },
    });

    return event.data.id || null;
  } catch (error) {
    console.error("Failed to block Google Calendar:", error);
    return null;
  }
}

interface ClientData {
  name: string;
  email: string;
  bookingId: string;
  projectType: string;
  priceNetto: number;
  deposit: number;
  days: number;
  startDate?: string;
  endDate?: string;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bookingId = searchParams.get('id');
  const action = searchParams.get('action');
  const encodedData = searchParams.get('data');

  if (!bookingId || !action) {
    return new NextResponse(getHtmlResponse('error', 'Brak wymaganych parametrów', null), {
      status: 400,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const isAccepted = action === 'accept';
  
  // Decode client data
  let clientData: ClientData | null = null;
  if (encodedData) {
    try {
      clientData = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8'));
    } catch (e) {
      console.error('Failed to decode client data:', e);
    }
  }

  try {
    // Notify owner about the action
    await getResend().emails.send({
      from: "Syntance System <system@syntance.com>",
      to: [process.env.CONTACT_TO_EMAIL!],
      subject: `${isAccepted ? '✅ Zaakceptowano' : '❌ Odrzucono'} zlecenie ${bookingId}`,
      text: `Zlecenie ${bookingId} zostało ${isAccepted ? 'ZAAKCEPTOWANE' : 'ODRZUCONE'} o ${new Date().toLocaleString('pl-PL')}.`,
    });

    // Send email to client if we have their data
    let calendarEventId: string | null = null;
    
    if (clientData?.email) {
      if (isAccepted) {
        // Block Google Calendar with confirmed event
        calendarEventId = await blockGoogleCalendar(clientData);
        
        // Format daty dla tytułu
        const titleDate = clientData.startDate 
          ? new Date(clientData.startDate).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const projectTypeGenitive = getProjectTypeGenitive(clientData.projectType);
        
        // Send confirmation email to client
        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientData.email],
          subject: `✅ Rezerwacja realizacji ${projectTypeGenitive} - ${titleDate} potwierdzona!`,
          html: getClientAcceptedEmailHtml(clientData),
        });

        // Update Attio CRM status to confirmed
        try {
          await updateProjectStatus(bookingId, 'confirmed');
          await addProjectNote(
            bookingId,
            'Zlecenie zaakceptowane',
            `Zlecenie zostało zaakceptowane ${new Date().toLocaleString('pl-PL')}.\n\nTermin realizacji: ${clientData.startDate ? new Date(clientData.startDate).toLocaleDateString('pl-PL') : 'Do ustalenia'}`
          );
        } catch (attioError) {
          console.error('Failed to update Attio:', attioError);
        }
      } else {
        // Format daty dla tytułu
        const titleDate = clientData.startDate 
          ? new Date(clientData.startDate).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const projectTypeGenitive = getProjectTypeGenitive(clientData.projectType);
        
        // Send rejection email to client
        await getResend().emails.send({
          from: "Syntance <kontakt@syntance.com>",
          to: [clientData.email],
          subject: `Rezerwacja realizacji ${projectTypeGenitive} - ${titleDate} - informacja`,
          html: getClientRejectedEmailHtml(clientData),
        });

        // Update Attio CRM status to rejected
        try {
          await updateProjectStatus(bookingId, 'rejected');
          await addProjectNote(
            bookingId,
            'Zlecenie odrzucone',
            `Zlecenie zostało odrzucone ${new Date().toLocaleString('pl-PL')}.\n\nPowód: Termin niedostępny`
          );
        } catch (attioError) {
          console.error('Failed to update Attio:', attioError);
        }
      }
    }

    return new NextResponse(
      getHtmlResponse(isAccepted ? 'accepted' : 'rejected', bookingId, clientData, calendarEventId),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  } catch (e) {
    console.error('Accept API error:', e);
    return new NextResponse(getHtmlResponse('error', 'Wystąpił błąd', null), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function getClientAcceptedEmailHtml(data: ClientData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 16px; border: 1px solid #222;">
          <tr>
            <td style="padding: 32px; text-align: center; border-bottom: 1px solid #222;">
              <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
              <h1 style="margin: 0; color: #22c55e; font-size: 28px;">Zlecenie potwierdzone!</h1>
              <p style="margin: 8px 0 0; color: #888;">Numer referencyjny: ${data.bookingId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Cześć <strong style="color: #fff;">${data.name}</strong>,
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Świetna wiadomość! <strong style="color: #22c55e;">Twoje zlecenie zostało potwierdzone</strong> i jesteśmy gotowi do rozpoczęcia pracy nad Twoim projektem.
              </p>
              
              ${data.startDate ? `
              <div style="background: linear-gradient(135deg, #22c55e20, #16a34a20); border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #22c55e40;">
                <h3 style="margin: 0 0 12px; color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">📅 Potwierdzony termin</h3>
                <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">
                  Start: ${new Date(data.startDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                ${data.endDate ? `
                <p style="margin: 8px 0 0; color: #888; font-size: 14px;">
                  Szacowany koniec: ${new Date(data.endDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                ` : ''}
              </div>
              ` : ''}
              
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #fff; font-size: 16px;">💰 Następny krok: Zaliczka</h3>
                <p style="margin: 0 0 16px; color: #ccc; font-size: 14px; line-height: 1.6;">
                  Aby rozpocząć projekt, prosimy o wpłatę zaliczki:
                </p>
                <div style="background-color: #a78bfa20; border-radius: 8px; padding: 16px; text-align: center;">
                  <p style="margin: 0; color: #a78bfa; font-size: 32px; font-weight: 700;">
                    ${data.deposit.toLocaleString('pl-PL')} PLN
                  </p>
                  <p style="margin: 8px 0 0; color: #888; font-size: 12px;">
                    Cena: ${data.priceNetto.toLocaleString('pl-PL')} PLN netto / ${data.priceBrutto.toLocaleString('pl-PL')} PLN brutto
                  </p>
                </div>
              </div>
              
              <div style="background-color: #0d0d0d; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #333;">
                <h4 style="margin: 0 0 12px; color: #fff; font-size: 14px;">🏦 Dane do przelewu:</h4>
                <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.8;">
                  <strong>Nazwa:</strong> Syntance<br>
                  <strong>Tytuł:</strong> Zaliczka ${data.bookingId}<br>
                  <strong>Kwota:</strong> ${data.deposit.toLocaleString('pl-PL')} PLN
                </p>
                <p style="margin: 12px 0 0; color: #888; font-size: 12px;">
                  Szczegółowe dane do przelewu wyślemy w odpowiedzi na ten email.
                </p>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6;">
                Po zaksięgowaniu wpłaty otrzymasz potwierdzenie i skontaktujemy się w sprawie szczegółów projektu.
              </p>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 16px;">
                Masz pytania? Odpowiedz na ten email lub napisz na 
                <a href="mailto:kontakt@syntance.com" style="color: #a78bfa;">kontakt@syntance.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; text-align: center; background-color: #0d0d0d; border-top: 1px solid #222;">
              <p style="margin: 0; color: #555; font-size: 12px;">
                © ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function getClientRejectedEmailHtml(data: ClientData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 16px; border: 1px solid #222;">
          <tr>
            <td style="padding: 32px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; color: #fff; font-size: 24px;">Informacja o zleceniu</h1>
              <p style="margin: 8px 0 0; color: #888;">Numer referencyjny: ${data.bookingId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Cześć <strong style="color: #fff;">${data.name}</strong>,
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Dziękujemy za zainteresowanie współpracą z Syntance. Niestety, <strong style="color: #f87171;">wybrany termin nie jest dostępny</strong>.
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Skontaktujemy się z Tobą wkrótce, aby zaproponować alternatywny termin realizacji projektu.
              </p>
              
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">
                  Możesz też wybrać nowy termin samodzielnie na naszej stronie lub skontaktować się z nami bezpośrednio.
                </p>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6;">
                Przepraszamy za niedogodności. Jeśli masz pytania, odpowiedz na ten email lub napisz na 
                <a href="mailto:kontakt@syntance.com" style="color: #a78bfa;">kontakt@syntance.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; text-align: center; background-color: #0d0d0d; border-top: 1px solid #222;">
              <p style="margin: 0; color: #555; font-size: 12px;">
                © ${new Date().getFullYear()} Syntance. Wszystkie prawa zastrzeżone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function getHtmlResponse(status: 'accepted' | 'rejected' | 'error', id: string, clientData: ClientData | null, calendarEventId?: string | null): string {
  const configs = {
    accepted: {
      icon: '✅',
      title: 'Zlecenie zaakceptowane!',
      message: clientData 
        ? `Zlecenie ${id} zostało zaakceptowane. Email z potwierdzeniem został wysłany do ${clientData.email}.`
        : `Zlecenie ${id} zostało pomyślnie zaakceptowane.`,
      color: '#22c55e',
      bgColor: '#22c55e20',
    },
    rejected: {
      icon: '❌',
      title: 'Zlecenie odrzucone',
      message: clientData 
        ? `Zlecenie ${id} zostało odrzucone. Klient (${clientData.email}) został poinformowany.`
        : `Zlecenie ${id} zostało odrzucone.`,
      color: '#ef4444',
      bgColor: '#ef444420',
    },
    error: {
      icon: '⚠️',
      title: 'Błąd',
      message: id,
      color: '#f59e0b',
      bgColor: '#f59e0b20',
    },
  };

  const config = configs[status];
  const calendarInfo = calendarEventId 
    ? `<div class="calendar-info"><p>📅 <strong>Kalendarz zaktualizowany</strong> - termin został zablokowany w Google Calendar</p></div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - Syntance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: rgba(17, 17, 17, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 48px;
      max-width: 520px;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon {
      font-size: 64px;
      margin-bottom: 24px;
      display: inline-block;
      padding: 24px;
      background: ${config.bgColor};
      border-radius: 50%;
    }
    h1 {
      color: #fff;
      font-size: 28px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    p {
      color: #888;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      background: ${config.bgColor};
      color: ${config.color};
      border-radius: 9999px;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid ${config.color}40;
    }
    ${clientData && status === 'accepted' ? `
    .client-info {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      text-align: left;
    }
    .client-info h3 {
      color: #fff;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .client-info p {
      margin: 0;
      font-size: 14px;
      color: #aaa;
    }
    .client-info strong {
      color: #fff;
    }
    .calendar-info {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
    }
    .calendar-info p {
      margin: 0;
      font-size: 14px;
      color: #22c55e;
    }
    ` : ''}
    .close-btn {
      margin-top: 32px;
      display: inline-block;
      padding: 12px 32px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${config.icon}</div>
    <h1>${config.title}</h1>
    <p>${config.message}</p>
    ${clientData && status === 'accepted' ? `
    <div class="client-info">
      <h3>📧 Wysłano email do klienta:</h3>
      <p><strong>Do:</strong> ${clientData.email}</p>
      <p><strong>Temat:</strong> Zlecenie potwierdzone + instrukcje płatności</p>
    </div>
    ${calendarInfo}
    ` : ''}
    <div class="status-badge">
      ${status === 'accepted' ? 'ZAAKCEPTOWANE' : status === 'rejected' ? 'ODRZUCONE' : 'BŁĄD'}
    </div>
    <br>
    <a href="javascript:window.close()" class="close-btn" onclick="window.close(); return false;">
      Zamknij okno
    </a>
  </div>
</body>
</html>
`;
}
