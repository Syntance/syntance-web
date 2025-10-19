import { Metadata } from "next";

export function generateMetadata({
  title,
  description,
  image = "/og-image.png",
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: url || "https://syntance.com",
      siteName: "Syntance",
      images: [image],
      locale: "pl_PL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

