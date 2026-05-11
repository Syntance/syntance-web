import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getEmailTemplates } from "@/sanity/queries/emailTemplates";
import {
  renderContactFormClientEmail,
  renderContactFormOwnerPlain,
} from "@/lib/emails/templates";

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
    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

    const emailTemplates = await getEmailTemplates();
    const firstName = name.split(' ')[0] ?? name;
    const ownerContent = renderContactFormOwnerPlain(
      {
        name,
        email,
        phone: formattedPhone,
        message,
        source,
      },
      emailTemplates,
    );
    const clientContent = renderContactFormClientEmail({ firstName }, emailTemplates);

    // 1. Email do zespołu Syntance
    await resendClient.emails.send({
      from: "Syntance <hello@syntance.com>",
      to: [process.env.CONTACT_TO_EMAIL!],
      replyTo: email,
      subject: ownerContent.subject,
      text: ownerContent.text,
    });

    // 2. Email potwierdzający do klienta
    await resendClient.emails.send({
      from: "Syntance <hello@syntance.com>",
      to: [email],
      subject: clientContent.subject,
      html: clientContent.html,
      text: clientContent.text,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

