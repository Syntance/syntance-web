import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  hp: z.string().optional().default(""),
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

    const { name, email, message } = parsed.data;

    await getResend().emails.send({
      from: "Syntance <hello@syntance.com>",
      to: [process.env.CONTACT_TO_EMAIL!],
      replyTo: email,
      subject: `Nowy lead ze strony: ${name}`,
      text: `Imię i nazwisko: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

