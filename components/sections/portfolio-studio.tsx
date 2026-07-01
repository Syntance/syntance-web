"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { PORTFOLIO_CASE_STUDIES, toPortfolioGridItems, getPortfolioSeedFlags } from "@/lib/portfolio-content";
import { PortfolioItem } from "@/lib/data/portfolio-types";

const staticGridItems = toPortfolioGridItems(PORTFOLIO_CASE_STUDIES).map((item) => ({
  ...item,
  caseStudyEnabled: getPortfolioSeedFlags(item.id).caseStudyEnabled,
}));

const caseStudyByUrl = new Map(
  PORTFOLIO_CASE_STUDIES.filter((item) => getPortfolioSeedFlags(item.id).caseStudyEnabled).map((item) => [
    item.url.replace(/\/$/, "").toLowerCase(),
    `/portfolio/${item.id}`,
  ]),
);

export default function PortfolioStudio() {
  const [items, setItems] = useState<PortfolioItem[]>(staticGridItems);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch("/api/portfolio", { signal: controller.signal })
      .then((res) => res.json())
      .then((cmsItems: PortfolioItem[]) => {
        if (!cmsItems?.length) return;

        const merged = new Map(
          staticGridItems.map((item) => [item.url.replace(/\/$/, "").toLowerCase(), item])
        );

        for (const cmsItem of cmsItems) {
          const key = cmsItem.url.replace(/\/$/, "").toLowerCase();
          const existing = merged.get(key);
          merged.set(key, {
            ...existing,
            ...cmsItem,
            logoAlt: cmsItem.logoAlt || existing?.logoAlt || cmsItem.name,
            caseStudyEnabled: cmsItem.caseStudyEnabled ?? existing?.caseStudyEnabled ?? true,
          });
        }

        setItems(
          [...merged.values()].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        );
      })
      .catch(() => {
        // Zostaw statyczne fallbacki.
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="portfolio-studio"
      aria-labelledby="portfolio-heading"
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
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
              Strony i sklepy, nad którymi pracowaliśmy.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
            {items.map((item) => {
              const caseStudyHref = item.caseStudyEnabled !== false
                ? caseStudyByUrl.get(item.url.replace(/\/$/, "").toLowerCase())
                : undefined;
              const CardTag = caseStudyHref ? Link : "a";
              const cardProps = caseStudyHref
                ? { href: caseStudyHref }
                : {
                    href: item.url,
                    target: "_blank" as const,
                    rel: "noopener noreferrer",
                  };

              return (
              <li key={item.id}>
                <CardTag
                  {...cardProps}
                  className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] active:bg-white/[0.06]"
                  aria-label={caseStudyHref ? `Case study: ${item.name}` : `Otwórz realizację: ${item.name}`}
                >
                  <div>
                    {item.logoUrl ? (
                      <div className="relative mb-4 flex h-12 items-center">
                        <Image
                          src={item.logoUrl}
                          alt={item.logoAlt}
                          width={120}
                          height={48}
                          className="max-h-12 w-auto object-contain opacity-80 transition-opacity group-hover:opacity-100"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-purple-300/70">
                        Realizacja
                      </p>
                    )}
                    <p className="text-lg font-light tracking-wide text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new URL(item.url).hostname.replace(/^www\./, "")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors group-hover:text-white">
                    {caseStudyHref ? "Case study" : "Zobacz live"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </CardTag>
              </li>
              );
            })}
          </ul>

          <div className="text-center">
            <Link
              href="/portfolio"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-8 py-3 text-sm font-medium tracking-wide text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Pełne portfolio
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
