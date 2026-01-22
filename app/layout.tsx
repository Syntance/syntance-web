import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AllSchemasDynamic } from "@/components/schema-org-dynamic";
import { generateSeoMetadata, getSeoSettings } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap", // Pokazuj tekst natychmiast, nie czekaj na font
  preload: true,
});

// Dynamiczne generowanie metadata z Sanity
export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata();
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pobierz ustawienia SEO z Sanity
  const seo = await getSeoSettings();
  
  return (
    <html lang="pl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-black text-[#F5F3FF]`}>
        <AllSchemasDynamic seo={seo} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
