"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Container from "@/components/container";
import Footer from "@/components/sections/footer";

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
      hp: String(formData.get("hp") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Dziękujemy! Odezwiemy się w ciągu 24h." });
        form.reset();
      } else if (res.status === 429) {
        setMessage({ type: "error", text: "Za dużo prób. Spróbuj ponownie za chwilę." });
      } else if (res.status === 400) {
        setMessage({ type: "error", text: "Proszę wypełnić formularz poprawnie." });
      } else {
        setMessage({ type: "error", text: "Coś poszło nie tak. Napisz na hello@syntance.com" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Błąd połączenia. Spróbuj ponownie." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <section className="py-20">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Kontakt</h1>
            <p className="mt-4 text-lg text-zinc-600">
              Masz pytanie? Chcesz rozpocząć projekt? Napisz do nas — odpowiemy
              w ciągu 24 godzin.
            </p>

            {message && (
              <div
                className={`mt-6 rounded-lg p-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form className="mt-10 space-y-6" onSubmit={onSubmit}>
              {/* Honeypot field */}
              <input
                type="text"
                name="hp"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Jan Kowalski"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Wiadomość
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  minLength={10}
                  maxLength={2000}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Opisz swój projekt..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-brand px-6 py-3 text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
              </button>
            </form>

            <div className="mt-12 border-t pt-8">
              <h2 className="text-xl font-semibold">Inne sposoby kontaktu</h2>
              <div className="mt-4 space-y-2 text-zinc-600">
                <p>Email: hello@syntance.com</p>
                <p>Tel: +48 123 456 789</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}

