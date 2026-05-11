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

    // AbortController + 5s timeout (rules: 60-quality "Timeouty / Zombie state").
    // Cancel jeśli komponent unmount albo network wisi.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setItems((data.result as PortfolioItem[]) ?? []);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setItems([]);
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Sekcja niewidoczna gdy brak realizacji w Sanity (lub wciąż się ładuje)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="portfolio-studio"
      aria-labelledby="portfolio-heading"
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header — mobile zwarty, desktop oryginalny */}
        <AnimatedSection>
          <header className="text-center mb-8 md:mb-16">
            <p className="md:hidden text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
              Portfolio
            </p>
            <h2
              id="portfolio-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight md:tracking-widest md:glow-text leading-[1.15] md:leading-normal mb-3 md:mb-6"
            >
              Nasze realizacje
            </h2>
            <p className="text-sm md:text-lg font-light tracking-wide text-gray-400">
              Strony, nad którymi pracowaliśmy.
            </p>
          </header>
        </AnimatedSection>

        {/* Kafelki — mobile 2 kol z mniejszym gap */}
        <AnimatedSection delay={100}>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-2 md:gap-3 h-full px-3 md:px-4 py-5 md:py-6 min-h-[110px] rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] active:bg-white/[0.06] transition-all duration-300"
                  aria-label={`Otwórz realizację: ${item.name}`}
                >
                  <div className="relative w-full h-10 md:h-12 flex items-center justify-center">
                    <Image
                      src={item.logoUrl}
                      alt={item.logoAlt}
                      width={120}
                      height={48}
                      className="max-w-full max-h-10 md:max-h-12 w-auto h-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs md:text-sm font-light tracking-wide text-gray-400 group-hover:text-white transition-colors text-center leading-tight">
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
