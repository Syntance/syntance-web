import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://syntance.com";

  return [
    // Główne strony
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cennik`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/strategia`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nextjs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Landing pages per persona (przygotowane na przyszłość)
    // Odkomentuj gdy strony będą gotowe:
    // {
    //   url: `${baseUrl}/strony-dla-lekarzy`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${baseUrl}/strony-dla-deweloperow`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/sklepy-ecommerce`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // Legal
    {
      url: `${baseUrl}/polityka-prywatnosci`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/regulamin`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
