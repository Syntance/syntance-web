"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+48123456789";
  const message = encodeURIComponent("Cześć Syntance, chcę wycenić stronę");
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl md:px-5 md:py-4"
      aria-label="Skontaktuj się przez WhatsApp"
    >
      <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}

