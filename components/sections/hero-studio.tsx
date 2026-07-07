"use client";

import { ArrowDown } from "lucide-react";
import GradientText from "../GradientText";
import StickyCtaFloat from "../StickyCtaFloat";
import { TechStackBadgeList } from "@/components/sections/tech-stack-badge";
import type { StackBadgeRecord } from "@/lib/data/stack-badges";

type HeroStudioProps = {
  stackBadges: StackBadgeRecord[];
};

export default function HeroStudio({ stackBadges }: HeroStudioProps) {
  const heroBadges = stackBadges
    .filter((badge) => badge.showInHero)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const scrollToNext = () => {
    const element = document.getElementById("anatomy-studio");
    if (element) {
      const navbarHeight = 100;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      window.scrollTo({ top: elementTop - navbarHeight, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero-studio"
      aria-labelledby="hero-heading"
      className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1
          id="hero-heading"
          className="font-heading mb-6 glow-text"
        >
          Strony i sklepy, które{" "}
          <GradientText
            className="font-medium"
            colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
            animationSpeed={4}
          >
            sprzedają
          </GradientText>
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wider text-gray-400 mb-6 max-w-3xl mx-auto">
          Budujemy w oparciu o strategię marketingu i sprzedaży.
        </p>
        <TechStackBadgeList badges={heroBadges} className="mb-12" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="relative group w-fit max-w-full shrink-0">
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffaa40, #9c40ff, #ffaa40)",
                backgroundSize: "300% 100%",
              }}
            />
            <button
              onClick={scrollToNext}
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-gray-800/80 transition-all cursor-pointer"
            >
              Poznaj nas
              <ArrowDown className="h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </button>
          </div>
          <StickyCtaFloat heroId="hero-studio" hideSectionId="pricing-studio" />
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <button
          onClick={scrollToNext}
          className="group flex flex-col items-center gap-2 cursor-pointer"
          aria-label="Przewiń w dół"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center group-hover:border-gray-400 transition-colors">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce group-hover:bg-white transition-colors" />
          </div>
        </button>
      </div>
    </section>
  );
}
