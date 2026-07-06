"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TiltCard from "@/components/tilt-card";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { ConfiguratorMinimumPricesNet } from "@/lib/pricing-configurator-minimum";

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL');
}

const defaultBasePrices = { website: 10000, ecommerce: 20000 };

export default function OfferCards() {
  const [isVisible, setIsVisible] = useState(false);
  const [basePrices, setBasePrices] = useState(defaultBasePrices);
  const isMobile = useIsMobile();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch("/api/pricing/start-prices", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("start-prices failed");
        return res.json() as Promise<ConfiguratorMinimumPricesNet>;
      })
      .then((mins) => {
        setBasePrices({
          website:
            typeof mins.websiteNet === "number" && mins.websiteNet > 0
              ? mins.websiteNet
              : defaultBasePrices.website,
          ecommerce:
            typeof mins.ecommerceNet === "number" && mins.ecommerceNet > 0
              ? mins.ecommerceNet
              : defaultBasePrices.ecommerce,
        });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          // Cicho zostaw defaultBasePrices (zgodne z regułą degradacji).
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '-30% 0px -30% 0px' }
    );

    const element = document.getElementById('offer-cards');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="offer-cards"
      aria-labelledby="offer-heading"
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12"
    >
      {/* ─────────────────────  MOBILE  ─────────────────────
          Pełnoszerokie karty, jasna hierarchia: emoji → tytuł
          z gradientem → krótki opis → cena/czas → CTA przycisk.
          Cała karta jest tappable, ale CTA jest wyraźny.
      */}
      <div className={`md:hidden max-w-md mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <header className="text-center mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Oferta
          </p>
          <h2 id="offer-heading" className="text-3xl font-light tracking-tight leading-[1.15] text-white">
            Co dla Ciebie <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">zbudujemy?</span>
          </h2>
        </header>

        <div className="space-y-4">
          {/* Strony WWW */}
          <Link
            href="/strony-www"
            className="block relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900 active:bg-gray-900/90 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 blur-2xl rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-3xl mb-2">🌐</div>
                  <h3 className="text-xl font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    Strony WWW
                  </h3>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-blue-300/70 bg-blue-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                  miesiąc
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-2">
                Strony wizytówkowe, landing page, strony firmowe.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Dla lekarzy, prawników, firm usługowych, deweloperów.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Od</div>
                  <div className="text-xl font-medium text-white tabular-nums">
                    {formatPrice(basePrices.website)} <span className="text-xs text-gray-400 font-light">PLN</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-sm font-medium">
                  Zobacz
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Sklepy e-commerce */}
          <Link
            href="/sklepy-internetowe"
            className="block relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900 active:bg-gray-900/90 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-2xl rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-3xl mb-2">🛒</div>
                  <h3 className="text-xl font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                    Sklepy e-commerce
                  </h3>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-purple-300/70 bg-purple-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                  4-8 tygodni
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-2">
                Headless e-commerce na Medusa.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Dla butików, marek D2C, niszowych sprzedawców.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Od</div>
                  <div className="text-xl font-medium text-white tabular-nums">
                    {formatPrice(basePrices.ecommerce)} <span className="text-xs text-gray-400 font-light">PLN</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-sm font-medium">
                  Zobacz
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile CTA "Sprawdź cenę" — wzmocnienie konwersji */}
        <Link
          href="/cennik"
          className="mt-6 flex items-center justify-center gap-2 w-full px-6 py-3.5 min-h-[48px] rounded-full bg-white text-gray-900 text-sm font-semibold tracking-wide active:bg-white/90 transition-colors"
        >
          Sprawdź cenę swojej strony
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-16 text-center glow-text">
            Co możemy dla Ciebie zbudować?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Karta 1: Strony WWW */}
            <TiltCard className="h-full">
              <Link 
                href="/strony-www"
                className="group h-full block cursor-pointer rounded-3xl border border-white/10 bg-gray-900 p-8 transition-colors duration-300 hover:border-white/15"
              >
                <div className="text-5xl mb-6">🌐</div>
                
                <h3 className={`text-2xl font-medium mb-4 transition-all ${
                  isMobile 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' 
                    : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400'
                }`}>
                  Strony WWW
                </h3>
                
                <p className="mb-4 leading-relaxed text-gray-200">
                  Strony wizytówkowe, landing page, strony firmowe
                </p>
                
                <p className="mb-6 text-sm text-gray-300">
                  Dla: lekarzy, prawników, firm usługowych, deweloperów
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od&nbsp; {formatPrice(basePrices.website)} PLN</div>
                    <div className="text-sm text-gray-300 mt-1">miesiąc</div>
                  </div>
                </div>
                
                <div className={`flex items-center text-blue-400 font-medium tracking-wide transition-transform ${
                  isMobile ? '' : 'group-hover:translate-x-2'
                }`}>
                  Dowiedz się więcej 
                  <span className="ml-2">→</span>
                </div>
              </Link>
            </TiltCard>

            {/* Karta 2: Sklepy e-commerce */}
            <TiltCard className="h-full">
              <Link 
                href="/sklepy-internetowe"
                className="group h-full block cursor-pointer rounded-3xl border border-white/10 bg-gray-900 p-8 transition-colors duration-300 hover:border-white/15"
              >
                <div className="text-5xl mb-6">🛒</div>
                
                <h3 className={`text-2xl font-medium mb-4 transition-all ${
                  isMobile 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' 
                    : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400'
                }`}>
                  Sklepy e-commerce
                </h3>
                
                <p className="mb-4 leading-relaxed text-gray-200">
                  Headless e-commerce na Medusa
                </p>
                
                <p className="mb-6 text-sm text-gray-300">
                  Dla: butików, marek D2C, niszowych sprzedawców
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od&nbsp; {formatPrice(basePrices.ecommerce)} PLN</div>
                    <div className="text-sm text-gray-300 mt-1">4-8 tygodni</div>
                  </div>
                </div>
                
                <div className={`flex items-center text-purple-400 font-medium tracking-wide transition-transform ${
                  isMobile ? '' : 'group-hover:translate-x-2'
                }`}>
                  Dowiedz się więcej 
                  <span className="ml-2">→</span>
                </div>
              </Link>
            </TiltCard>
          </div>
        </div>
      </div>
      {/* /Desktop */}
    </section>
  );
}
