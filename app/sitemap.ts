import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://syntance.com";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/studio`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ];
}

