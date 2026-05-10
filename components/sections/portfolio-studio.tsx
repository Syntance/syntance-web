"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import { PortfolioItem } from "@/sanity/queries/portfolio";

export default function PortfolioStudio() {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
    if (!projectId) {
      setItems([]);
      return;
    }

    const query = encodeURIComponent(
      `*[_type == "portfolioItem" && !disabled] | order(order asc, name asc) {
        "id": _id,
        name,
        url,
        "logoUrl": logo.asset->url,
        "logoAlt": coalesce(logo.alt, name),
        order
      }`
    );

    fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`
    )
      .then((res) => res.json())
      .then((data) => {
        setItems((data.result as PortfolioItem[]) ?? []);
      })
      .catch(() => setItems([]));
  }, []);

  // Sekcja niewidoczna gdy brak realizacji w Sanity (lub wciąż się ładuje)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="portfolio-studio"
      aria-labelledby="portfolio-heading"
      className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AnimatedSection>
          <header className="text-center mb-16">
            <h2
              id="portfolio-heading"
              className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6"
            >
              Nasze realizacje
            </h2>
            <p className="text-lg font-light tracking-wide text-gray-400">
              Strony, nad którymi pracowaliśmy.
            </p>
          </header>
        </AnimatedSection>

        {/* Małe kafelki - logo + nazwa, link do realizacji */}
        <AnimatedSection delay={100}>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 h-full px-4 py-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                  aria-label={`Otwórz realizację: ${item.name}`}
                >
                  <div className="relative w-full h-12 flex items-center justify-center">
                    <Image
                      src={item.logoUrl}
                      alt={item.logoAlt}
                      width={120}
                      height={48}
                      className="max-w-full max-h-12 w-auto h-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-light tracking-wide text-gray-400 group-hover:text-white transition-colors text-center">
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      </div>
    </section>
  );
}
