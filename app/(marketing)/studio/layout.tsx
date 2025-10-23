import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syntance Studio — Strony i sklepy, które działają",
  description:
    "Tworzymy nowoczesne, lekkie i piękne strony oraz sklepy, które działają płynnie i bez stresu. Design z serca, technologia w służbie estetyki.",
  keywords: ["strony internetowe", "sklepy online", "web design", "Next.js", "React", "e-commerce", "UX/UI design"],
  authors: [{ name: "Syntance Studio", url: "https://syntance.com/studio" }],
  creator: "Syntance Studio",
  publisher: "Syntance",
  openGraph: {
    title: "Syntance Studio — Strony i sklepy, które działają",
    description: "Tworzymy nowoczesne, lekkie i piękne strony oraz sklepy, które działają płynnie i bez stresu.",
    url: "https://syntance.com/studio",
    siteName: "Syntance Studio",
    images: [
      {
        url: "https://syntance.com/og/studio.jpg",
        width: 1200,
        height: 630,
        alt: "Syntance Studio - Strony i sklepy, które działają",
        type: "image/jpeg",
      }
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance Studio — Strony i sklepy, które działają",
    description: "Tworzymy nowoczesne, lekkie i piękne strony oraz sklepy, które działają płynnie i bez stresu.",
    images: ["https://syntance.com/og/studio.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://syntance.com/studio",
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

