import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createProject } from "@/lib/attio";

const bookingSchema = z.object({
  projectType: z.string(),
  priceNetto: z.number(),
  priceBrutto: z.number(),
  deposit: z.number(),
  days: z.number(),
  hours: z.number(),
  complexity: z.enum(['low', 'medium', 'high', 'very-high']),
  itemsCount: z.number(),
  items: z.array(z.string()),
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(), // YYYY-MM-DD
});

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  booking: bookingSchema,
  status: z.enum(['pending', 'confirmed']).optional().default('confirmed'),
});

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return resend;
}

// Rate limiting
const hits = new Map<string, number>();
function limited(ip: string) {
  const now = Date.now();
  const last = hits.get(ip) ?? 0;
  if (now - last < 60_000) return true; // 1 minute cooldown
  hits.set(ip, now);
  return false;
}

const getComplexityLabel = (complexity: string) => {
  switch (complexity) {
    case 'very-high': return 'Bardzo wysoka';
    case 'high': return 'Wysoka';
    case 'medium': return 'Średnia';
    default: return 'Niska';
  }
};

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "0.0.0.0";
    if (limited(ip)) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const json = await req.json();
    const parsed = schema.safeParse(json);
    
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return NextResponse.json({ ok: false, error: 'Invalid data' }, { status: 400 });
    }

    const { name, email, phone, booking, status } = parsed.data;

    // Generate unique booking ID
    const bookingId = `SYN-${Date.now().toString(36).toUpperCase()}`;
    
    // Prepare acceptance URLs with encoded client data for email confirmation
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntance.com';
    const clientData = Buffer.from(JSON.stringify({
      name,
      email,
      bookingId,
      projectType: booking.projectType,
      priceNetto: booking.priceNetto,
      deposit: booking.deposit,
      days: booking.days,
      startDate: booking.startDate,
      endDate: booking.endDate,
    })).toString('base64url');
    
    const acceptUrl = `${baseUrl}/api/booking/accept?id=${bookingId}&action=accept&data=${clientData}`;
    const rejectUrl = `${baseUrl}/api/booking/accept?id=${bookingId}&action=reject&data=${clientData}`;

    // Format items list for email
    const itemsList = booking.items.map(item => `• ${item}`).join('\n');

    // Email to owner with accept/reject buttons
    const ownerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nowe zlecenie</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111; border-radius: 16px; border: 1px solid #222;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; border-bottom: 1px solid #222;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 600;">
                      ${status === 'pending' ? '🔔 Nowe zapytanie o zlecenie' : '✅ Rezerwacja potwierdzona'}
                    </h1>
                    <p style="margin: 8px 0 0; color: #888; font-size: 14px;">
                      ID: ${bookingId} • ${new Date().toLocaleDateString('pl-PL', { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Client Info -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; color: #fff; font-size: 16px; font-weight: 600;">👤 Dane klienta</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #888; font-size: 13px;">Imię i nazwisko</p>
                    <p style="margin: 4px 0 0; color: #fff; font-size: 16px; font-weight: 500;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #888; font-size: 13px;">Email</p>
                    <p style="margin: 4px 0 0; color: #a78bfa; font-size: 16px;">
                      <a href="mailto:${email}" style="color: #a78bfa; text-decoration: none;">${email}</a>
                    </p>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #888; font-size: 13px;">Telefon</p>
                    <p style="margin: 4px 0 0; color: #fff; font-size: 16px;">
                      <a href="tel:${phone}" style="color: #fff; text-decoration: none;">${phone}</a>
                    </p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          ${booking.startDate ? `
          <!-- Terminy realizacji -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #fff; font-size: 16px; font-weight: 600;">📅 Terminy realizacji</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #22c55e20; border-radius: 12px; border: 1px solid #22c55e40;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #22c55e30;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">🚀 Start projektu</td>
                        <td align="right" style="color: #22c55e; font-size: 16px; font-weight: 700;">${new Date(booking.startDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">🏁 Szacowany koniec</td>
                        <td align="right" style="color: #4ade80; font-size: 16px; font-weight: 600;">${booking.endDate ? new Date(booking.endDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Do ustalenia'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Pricing Summary -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #fff; font-size: 16px; font-weight: 600;">💰 Wycena</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #333;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Typ projektu</td>
                        <td align="right" style="color: #fff; font-size: 14px; font-weight: 500;">${booking.projectType}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #333;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Cena netto</td>
                        <td align="right" style="color: #fff; font-size: 20px; font-weight: 700;">${booking.priceNetto.toLocaleString('pl-PL')} PLN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #333;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Cena brutto</td>
                        <td align="right" style="color: #aaa; font-size: 14px;">${booking.priceBrutto.toLocaleString('pl-PL')} PLN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #333;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Zaliczka</td>
                        <td align="right" style="color: #a78bfa; font-size: 16px; font-weight: 600;">${booking.deposit.toLocaleString('pl-PL')} PLN</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #333;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Czas realizacji</td>
                        <td align="right" style="color: #fff; font-size: 16px; font-weight: 600;">${booking.days} dni roboczych</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 14px;">Złożoność</td>
                        <td align="right" style="color: ${
                          booking.complexity === 'very-high' ? '#c084fc' :
                          booking.complexity === 'high' ? '#f87171' :
                          booking.complexity === 'medium' ? '#fbbf24' : '#4ade80'
                        }; font-size: 14px; font-weight: 500;">${getComplexityLabel(booking.complexity)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Selected Items -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #fff; font-size: 16px; font-weight: 600;">📦 Wybrane elementy (${booking.itemsCount})</h2>
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 16px;">
                ${booking.items.map(item => `
                  <div style="display: flex; align-items: center; margin: 8px 0; color: #ccc; font-size: 14px;">
                    <span style="display: inline-block; width: 6px; height: 6px; background-color: #a78bfa; border-radius: 50%; margin-right: 12px;"></span>
                    ${item}
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          
          <!-- Action Buttons -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d0d0d; border-top: 1px solid #222;">
              <p style="margin: 0 0 16px; color: #888; font-size: 14px; text-align: center;">
                Kliknij aby zaakceptować lub odrzucić zlecenie:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <a href="${acceptUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      ✓ Akceptuj zlecenie
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="${rejectUrl}" style="display: inline-block; padding: 16px 32px; background-color: #333; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      ✗ Odrzuć
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="margin: 0; color: #555; font-size: 12px;">
                Ten email został wygenerowany automatycznie przez konfigurator Syntance.
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

    // Plain text version for owner
    const startDateFormatted = booking.startDate 
      ? new Date(booking.startDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : null;
    const endDateFormatted = booking.endDate 
      ? new Date(booking.endDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : null;

    const ownerEmailText = `
NOWE ZLECENIE - ${bookingId}
============================

Status: ${status === 'pending' ? 'Oczekuje na rezerwację terminu' : 'Termin zarezerwowany'}

DANE KLIENTA:
- Imię i nazwisko: ${name}
- Email: ${email}
${phone ? `- Telefon: ${phone}` : ''}
${startDateFormatted ? `
TERMINY REALIZACJI:
- 🚀 Start projektu: ${startDateFormatted}
- 🏁 Szacowany koniec: ${endDateFormatted || 'Do ustalenia'}
` : ''}
WYCENA:
- Typ projektu: ${booking.projectType}
- Cena netto: ${booking.priceNetto.toLocaleString('pl-PL')} PLN
- Cena brutto: ${booking.priceBrutto.toLocaleString('pl-PL')} PLN
- Zaliczka: ${booking.deposit.toLocaleString('pl-PL')} PLN
- Czas realizacji: ${booking.days} dni roboczych
- Złożoność: ${getComplexityLabel(booking.complexity)}

WYBRANE ELEMENTY (${booking.itemsCount}):
${itemsList}

AKCJE:
- Akceptuj: ${acceptUrl}
- Odrzuć: ${rejectUrl}
`;

    // Format daty dla tytułu
    const titleDate = booking.startDate 
      ? new Date(booking.startDate).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Konwersja typu projektu na formę dopełniacza
    const getProjectTypeGenitive = (type: string) => {
      const genitiveMap: Record<string, string> = {
        'Strona internetowa': 'Strony internetowej',
        'Strona WWW': 'Strony WWW',
        'Sklep e-commerce': 'Sklepu e-commerce',
        'Aplikacja webowa': 'Aplikacji webowej',
      };
      return genitiveMap[type] || type;
    };
    const projectTypeGenitive = getProjectTypeGenitive(booking.projectType);

    // Send email to owner
    await getResend().emails.send({
      from: "Syntance Konfigurator <konfigurator@syntance.com>",
      to: ["kontakt@syntance.com"],
      replyTo: email,
      subject: `Rezerwacja realizacji ${projectTypeGenitive} - ${name} ${titleDate}`,
      text: ownerEmailText,
      html: ownerEmailHtml,
    });

    // Send confirmation to client - waiting for approval
    const clientEmailHtml = `
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
              <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
              <h1 style="margin: 0; color: #fff; font-size: 24px;">Oczekujemy na potwierdzenie</h1>
              <p style="margin: 8px 0 0; color: #888;">Numer referencyjny: ${bookingId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Cześć <strong style="color: #fff;">${name}</strong>,
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Dziękujemy za zainteresowanie współpracą z Syntance! Otrzymaliśmy Twoją rezerwację i <strong style="color: #fbbf24;">czekamy na potwierdzenie dostępności terminu</strong>.
              </p>
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Sprawdzimy nasz kalendarz i odpowiemy najszybciej jak to możliwe - zazwyczaj w ciągu 24 godzin.
              </p>
              
              ${booking.startDate ? `
              <div style="background: linear-gradient(135deg, #fbbf2420, #f59e0b20); border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #fbbf2440;">
                <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">📅 Wybrany termin</h3>
                <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">
                  ${new Date(booking.startDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                ${booking.endDate ? `
                <p style="margin: 8px 0 0; color: #888; font-size: 14px;">
                  Szacowany koniec: ${new Date(booking.endDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                ` : ''}
              </div>
              ` : ''}
              
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #fff; font-size: 16px;">📋 Podsumowanie wyceny:</h3>
                <table width="100%" style="color: #ccc; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;">Typ projektu:</td>
                    <td align="right" style="color: #fff; font-weight: 500;">${booking.projectType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Cena netto:</td>
                    <td align="right" style="color: #fff; font-weight: 600;">${booking.priceNetto.toLocaleString('pl-PL')} PLN</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Czas realizacji:</td>
                    <td align="right" style="color: #fff; font-weight: 600;">${booking.days} dni roboczych</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Zaliczka:</td>
                    <td align="right" style="color: #a78bfa; font-weight: 600;">${booking.deposit.toLocaleString('pl-PL')} PLN</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #fff; font-size: 16px;">📦 Wybrane elementy (${booking.itemsCount}):</h3>
                ${booking.items.map(item => `
                  <div style="display: flex; align-items: center; margin: 8px 0; color: #ccc; font-size: 14px;">
                    <span style="display: inline-block; width: 6px; height: 6px; background-color: #a78bfa; border-radius: 50%; margin-right: 12px;"></span>
                    ${item}
                  </div>
                `).join('')}
              </div>
              
              <div style="background-color: #22c55e15; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #22c55e30;">
                <p style="margin: 0; color: #22c55e; font-size: 14px; line-height: 1.6;">
                  💡 <strong>Co dalej?</strong> Po potwierdzeniu terminu otrzymasz email z instrukcjami dotyczącymi płatności zaliczki i rozpoczęcia projektu.
                </p>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6;">
                Jeśli masz pytania, odpowiedz na ten email lub napisz na 
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

    await getResend().emails.send({
      from: "Syntance <kontakt@syntance.com>",
      to: [email],
      subject: `Potwierdzenie wyceny - ${bookingId}`,
      html: clientEmailHtml,
    });

    // Create project in Attio CRM
    try {
      const complexityLabel =
        booking.complexity === 'very-high' ? 'Bardzo wysoka' :
        booking.complexity === 'high' ? 'Wysoka' :
        booking.complexity === 'medium' ? 'Średnia' : 'Niska';

      await createProject({
        name: booking.projectType,
        contact: {
          name,
          email,
          phone,
        },
        value: booking.priceNetto,
        status: 'pending',
        startDate: booking.startDate,
        endDate: booking.endDate,
        days: booking.days,
        deposit: booking.deposit,
        bookingId,
        items: booking.items,
        complexity: complexityLabel,
      });
    } catch (attioError) {
      console.error('Failed to create project in Attio:', attioError);
      // Don't block the booking if Attio fails
    }

    return NextResponse.json({ ok: true, bookingId });
  } catch (e) {
    console.error('Booking API error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
