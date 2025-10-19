import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import WhatsAppButton from "@/components/whatsapp-button";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://syntance.com"),
  title: {
    default: "Syntance — Inteligentne tworzenie",
    template: "%s | Syntance",
  },
  description:
    "Syntance to studio technologiczne. Inteligentne tworzenie stron, sklepów i systemów.",
  openGraph: {
    title: "Syntance — Inteligentne tworzenie",
    description: "Intelligent Creation for the Web.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: ["/og-image.png"],
    locale: "pl_PL",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-black text-[#F5F3FF]`}>
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}

