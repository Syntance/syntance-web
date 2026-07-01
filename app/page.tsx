"use client";

import { useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import SectionScrollbar from "@/components/SectionScrollbar";

import AnimatedSection from "@/components/AnimatedSection";
import { ContactForm } from "@/components/contact-form";
// Import sections - bez lazy loadingu dla hero, żeby uniknąć flashowania kontaktu
import HeroStudio from "@/components/sections/hero-studio";
const AnatomyStudio = dynamic(() => import("@/components/sections/anatomy-studio"), { ssr: true });
const ValuesStudio = dynamic(() => import("@/components/sections/values-studio"), { ssr: true });
const TechComparison = dynamic(() => import("@/components/sections/tech-comparison"), { ssr: true });
const PortfolioStudio = dynamic(() => import("@/components/sections/portfolio-studio"), { ssr: true });
const CMSSection = dynamic(() => import("@/components/sections/cms-section"), { ssr: true });
const PricingStudioNew = dynamic(() => import("@/components/sections/pricing-studio-new"), { ssr: true });


export default function HomePage() {
  // Scroll restoration bez ukrywania treści — content musi być widoczny w SSR (LCP).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (!window.location.hash && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <SectionScrollbar />
      
      <main id="main-content">
        <HeroStudio />
        <AnatomyStudio />
        <ValuesStudio />
        <TechComparison />
        <CMSSection />
        <PortfolioStudio />
        <PricingStudioNew />
        
        {/* Contact Section — mobile zwięzła hierarchia: kontakt szybki nad formą */}
        <section id="contact" aria-labelledby="contact-heading" className="relative z-10 px-5 md:px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <p className="md:hidden text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3 text-center">
                Kontakt
              </p>
              <h2 id="contact-heading" className="text-3xl md:text-5xl font-light tracking-tight md:tracking-wider leading-[1.15] md:leading-normal mb-3 md:mb-8 text-center md:glow-text">
                Porozmawiajmy
              </h2>
              <p className="text-sm md:text-xl text-gray-400 font-light tracking-wide text-center mb-8 md:mb-16 max-w-xl mx-auto leading-relaxed">
                Masz pytania? <span className="text-white">Odpowiadamy w 24h</span>.
              </p>
            </AnimatedSection>

            {/* Mobile: szybki kontakt nad formą (najpierw najszybsza akcja) */}
            <AnimatedSection delay={100}>
              <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
                <a
                  href="mailto:kontakt@syntance.com"
                  className="flex flex-col items-center gap-1.5 p-4 min-h-[80px] rounded-2xl bg-white/[0.03] border border-white/10 active:bg-white/[0.06] transition-colors"
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Email</span>
                  <span className="text-sm text-white font-light text-center leading-tight">kontakt@syntance.com</span>
                </a>
                <a
                  href="tel:+48537110170"
                  className="flex flex-col items-center gap-1.5 p-4 min-h-[80px] rounded-2xl bg-white/[0.03] border border-white/10 active:bg-white/[0.06] transition-colors"
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Telefon</span>
                  <span className="text-sm text-white font-light">+48 537 110 170</span>
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="grid md:grid-cols-2 gap-12 mb-8 md:mb-16">
                {/* Contact Info — desktop only (na mobile mamy compact wyżej) */}
                <address className="hidden md:block space-y-8 not-italic">
                  <div>
                    <h3 className="text-xl font-medium tracking-wider mb-4">Email</h3>
                    <a href="mailto:kontakt@syntance.com" className="text-gray-400 hover:text-white transition-colors text-lg">
                      kontakt@syntance.com
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium tracking-wider mb-4">Telefon</h3>
                  <a href="tel:+48537110170" className="text-gray-400 hover:text-white transition-colors text-lg">
                    +48 537 110 170
                  </a>
                  </div>

                </address>

                <ContactForm idPrefix="home" source="homepage" showFullRodo={true} />
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-400">
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
