import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(9).max(20).transform(val => val.replace(/\D/g, '')).refine(val => val.length >= 9, {
    message: "Numer telefonu musi mieć minimum 9 cyfr"
  }),
  message: z.string().min(10).max(2000),
  hp: z.string().optional().default(""),
  source: z.string().optional().default("website"),
});

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return resend;
}

// very simple rate-limit (memory)
const hits = new Map<string, number>();
function limited(ip: string) {
  const now = Date.now();
  const last = hits.get(ip) ?? 0;
  if (now - last < 30_000) return true;
  hits.set(ip, now);
  return false;
}

// Generuje HTML emaila potwierdzającego dla klienta
function generateConfirmationEmail(name: string): string {
  const firstName = name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Otrzymaliśmy Twoje zapytanie</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #111118; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);">
              <img src="https://syntance.com/icons/Logo%20Sygnet%20+%20Syntance%20V.3%20bia%C5%82e.svg" alt="Syntance" style="height: 32px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 400; letter-spacing: 0.5px;">
                Dziękujemy za wiadomość!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #e5e5e5; font-size: 16px; line-height: 1.6;">
                Cześć ${firstName},
              </p>
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Otrzymaliśmy Twoje zapytanie i już je analizujemy. Odezwiemy się w ciągu <strong style="color: #e5e5e5;">24 godzin</strong> w dni robocze.
              </p>
              <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                W międzyczasie możesz:
              </p>
              
              <!-- Links -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px 20px; background-color: rgba(147, 51, 234, 0.1); border-radius: 12px; margin-bottom: 12px;">
                    <a href="https://syntance.com/cennik" style="color: #a78bfa; text-decoration: none; font-size: 15px;">
                      📋 Sprawdzić nasz cennik i ofertę
                    </a>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: rgba(59, 130, 246, 0.1); border-radius: 12px;">
                    <a href="https://syntance.com/strategia" style="color: #93c5fd; text-decoration: none; font-size: 15px;">
                      🎯 Dowiedzieć się więcej o naszej strategii
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Do usłyszenia!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0 0 10px; color: #71717a; font-size: 14px; text-align: center;">
                <strong style="color: #a1a1aa;">Syntance</strong> — Strony i sklepy, które działają.
              </p>
              <p style="margin: 0; color: #52525b; font-size: 13px; text-align: center;">
                <a href="https://syntance.com" style="color: #71717a; text-decoration: none;">syntance.com</a>
                &nbsp;•&nbsp;
                <a href="mailto:biuro@syntance.com" style="color: #71717a; text-decoration: none;">biuro@syntance.com</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe note -->
        <p style="margin: 20px auto 0; max-width: 600px; color: #52525b; font-size: 12px; text-align: center; line-height: 1.5;">
          Ten email został wysłany automatycznie w odpowiedzi na Twoje zapytanie przez formularz kontaktowy na stronie syntance.com.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Generuje tekstową wersję emaila potwierdzającego
function generateConfirmationText(name: string): string {
  const firstName = name.split(' ')[0];
  
  return `Cześć ${firstName},

Dziękujemy za wiadomość! Otrzymaliśmy Twoje zapytanie i już je analizujemy.

Odezwiemy się w ciągu 24 godzin w dni robocze.

W międzyczasie możesz:
- Sprawdzić nasz cennik: https://syntance.com/cennik
- Dowiedzieć się więcej o strategii: https://syntance.com/strategia

Do usłyszenia!

---
Syntance — Strony i sklepy, które działają.
https://syntance.com | biuro@syntance.com
`;
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "0.0.0.0";
    if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success || (parsed.data.hp && parsed.data.hp.length > 0)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { name, email, phone, message, source } = parsed.data;
    const resendClient = getResend();

    // Formatuj numer telefonu dla czytelności
    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

    // 1. Email do zespołu Syntance
    await resendClient.emails.send({
      from: "Syntance <hello@syntance.com>",
      to: [process.env.CONTACT_TO_EMAIL!],
      replyTo: email,
      subject: `Nowy lead ze strony: ${name}`,
      text: `Imię i nazwisko: ${name}\nEmail: ${email}\nTelefon: ${formattedPhone}\nŹródło: ${source}\n\nWiadomość:\n${message}`,
    });

    // 2. Email potwierdzający do klienta
    await resendClient.emails.send({
      from: "Syntance <hello@syntance.com>",
      to: [email],
      subject: "Otrzymaliśmy Twoje zapytanie — Syntance",
      html: generateConfirmationEmail(name),
      text: generateConfirmationText(name),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

