import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createProject, getNextOrderNumberFromAttio } from "@/lib/attio";
import { getEmailTemplates } from "@/lib/db/queries/settings";
import {
  renderQuoteRequestClientEmail,
  renderQuoteRequestOwnerEmail,
  renderQuoteRequestOwnerPlainText,
} from "@/lib/emails/templates";

const bookingSchema = z.object({
  projectType: z.string(),
  priceNetto: z.number(),
  priceBrutto: z.number(),
  deposit: z.number(),
  days: z.number(),
  hours: z.number(),
  itemsCount: z.number(),
  items: z.array(z.string()),
});

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  companyName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  hasExistingSite: z.boolean().optional().default(false),
  existingSiteUrl: z.string().max(500).optional(),
  booking: bookingSchema,
});

// Lazy initialization. Returns null gdy klucz pusty — graceful degradation
// (rules 60-quality: 3rd party pada → feature się wyłącza, nie cały flow).
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    resend = new Resend(key);
  }
  return resend;
}

type ResendSendArgs = Parameters<Resend["emails"]["send"]>[0];

/**
 * Bezpieczna wysyłka maila — gdy brak klucza lub błąd, loguje i kontynuuje.
 * Dzięki temu awaria Resend nie blokuje stworzenia leada w Attio.
 */
async function safeSendEmail(payload: ResendSendArgs): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.warn("[booking] RESEND_API_KEY missing — skipping email send");
    return false;
  }
  try {
    await client.emails.send(payload);
    return true;
  } catch (err) {
    console.error("[booking] Failed to send email:", err);
    return false;
  }
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

    const { name, email, companyName, phone, description, hasExistingSite, existingSiteUrl, booking } = parsed.data;

    // Numer zlecenia z istniejących deali w Attio (nie z CMS)
    const bookingId = await getNextOrderNumberFromAttio();

    // Prepare acceptance URLs with encoded client data for email confirmation
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syntance.com';
    const clientData = Buffer.from(JSON.stringify({
      name,
      email,
      bookingId,
      projectType: booking.projectType,
      priceNetto: booking.priceNetto,
      priceBrutto: booking.priceBrutto,
      deposit: booking.deposit,
      days: booking.days,
    })).toString('base64url');

    const acceptUrl = `${baseUrl}/api/booking/accept?id=${bookingId}&action=accept&data=${clientData}`;
    const rejectUrl = `${baseUrl}/api/booking/accept?id=${bookingId}&action=reject&data=${clientData}`;

    const titleDate = new Date().toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const getProjectTypeGenitive = (type: string) => {
      const genitiveMap: Record<string, string> = {
        'Strona internetowa': 'strony WWW',
        'Strona WWW': 'strony WWW',
        'Sklep e-commerce': 'sklepu e-commerce',
        'Aplikacja webowa': 'aplikacji webowej',
      };
      return genitiveMap[type] || type.toLowerCase();
    };
    const projectTypeGenitive = getProjectTypeGenitive(booking.projectType);

    const emailTemplates = await getEmailTemplates();

    const quoteMeta = { titleDate, projectTypeGenitive };

    const quoteClientData = {
      bookingId,
      name,
      email,
      projectType: booking.projectType,
      priceNetto: booking.priceNetto,
      priceBrutto: booking.priceBrutto,
      deposit: booking.deposit,
      days: booking.days,
      items: booking.items,
      itemsCount: booking.itemsCount,
    };

    const ownerPayload = {
      bookingId,
      titleDate,
      projectTypeGenitive,
      acceptUrl,
      rejectUrl,
      name,
      email,
      phone,
      companyName,
      description,
      hasExistingSite,
      existingSiteUrl,
      booking: {
        projectType: booking.projectType,
        priceNetto: booking.priceNetto,
        priceBrutto: booking.priceBrutto,
        deposit: booking.deposit,
        days: booking.days,
        items: booking.items,
        itemsCount: booking.itemsCount,
      },
    };

    const { subject: ownerSubject, html: ownerEmailHtml } = renderQuoteRequestOwnerEmail(
      ownerPayload,
      emailTemplates,
    );
    const ownerEmailText = renderQuoteRequestOwnerPlainText(ownerPayload);

    await safeSendEmail({
      from: 'Syntance Konfigurator <konfigurator@syntance.com>',
      to: ['kontakt@syntance.com'],
      replyTo: email,
      subject: ownerSubject,
      text: ownerEmailText,
      html: ownerEmailHtml,
    });

    const { subject: clientSubject, html: clientEmailHtml } = renderQuoteRequestClientEmail(
      quoteClientData,
      emailTemplates,
      quoteMeta,
    );

    await safeSendEmail({
      from: 'Syntance <kontakt@syntance.com>',
      to: [email],
      subject: clientSubject,
      html: clientEmailHtml,
    });

    // Create project in Attio CRM
    try {
      await createProject({
        name: booking.projectType,
        contact: {
          name,
          email,
          phone,
          companyName,
        },
        value: booking.priceNetto,
        status: 'pending',
        days: booking.days,
        deposit: booking.deposit,
        bookingId,
        items: booking.items,
        description,
        hasExistingSite,
        existingSiteUrl,
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
