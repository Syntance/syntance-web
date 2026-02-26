"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import GradientText from "../GradientText";

export default function HeroStudio() {
  const [isVisible, setIsVisible] = useState(false);
  const [entryDone, setEntryDone] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [hiddenByPricing, setHiddenByPricing] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [inlinePos, setInlinePos] = useState<{ x: number; y: number } | null>(null);

  const capturePosition = useCallback(() => {
    if (placeholderRef.current) {
      const rect = placeholderRef.current.getBoundingClientRect();
      setInlinePos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      capturePosition();
      setEntryDone(true);
    }, 1050);
    return () => clearTimeout(timer);
  }, [capturePosition]);

  useEffect(() => {
    const hero = document.getElementById("hero-studio");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.7) {
          setIsFloating(true);
        } else {
          capturePosition();
          setIsFloating(false);
        }
      },
      { threshold: [0, 0.3, 0.5, 0.7, 1] }
    );

    observer.observe(hero);

    const pricing = document.getElementById("pricing-studio");
    let pricingObserver: IntersectionObserver | null = null;
    if (pricing) {
      pricingObserver = new IntersectionObserver(
        ([entry]) => setHiddenByPricing(entry.isIntersecting),
        { threshold: 0.15 }
      );
      pricingObserver.observe(pricing);
    }

    const handleScroll = () => {
      if (!isFloating) capturePosition();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      pricingObserver?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [capturePosition, isFloating]);

  const scrollToNext = () => {
    const element = document.getElementById("anatomy-studio");
    if (element) {
      const navbarHeight = 100;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      window.scrollTo({ top: elementTop - navbarHeight, behavior: "smooth" });
    }
  };

  const startX = inlinePos?.x ?? 0;
  const startY = inlinePos?.y ?? 0;
  const targetX = typeof window !== "undefined" ? window.innerWidth - 140 : 0;
  const targetY = typeof window !== "undefined" ? window.innerHeight - 80 : 0;
  const tx = targetX - startX;
  const ty = targetY - startY;

  return (
    <>
      <section
        id="hero-studio"
        aria-labelledby="hero-heading"
        className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20"
      >
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            id="hero-heading"
            className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text"
          >
            Strony i sklepy{" "}
            <GradientText
              colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
              animationSpeed={4}
              className="font-medium"
            >
              Next.js
            </GradientText>
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider text-gray-400 mb-12 max-w-3xl mx-auto">
            Mamy jeden cel — Twój wynik biznesowy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative group">
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
                className="relative z-10 px-8 py-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-gray-800/80 transition-all cursor-pointer"
              >
                Dowiedz się więcej
              </button>
            </div>
            <div ref={placeholderRef} className="inline-flex justify-center">
              {/* Visible during entry animation, hidden after (fixed button takes over) */}
              <a
                href="/cennik"
                className={`px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-opacity duration-300 glow-box cursor-pointer inline-block text-center ${
                  entryDone ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                Sprawdź cenę
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
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

      {/* Fixed button — appears after entry, flies to corner on scroll */}
      <a
        href="/cennik"
        className={`fixed z-50 rounded-full font-medium tracking-wider shadow-lg cursor-pointer whitespace-nowrap transition-none ${
          isFloating
            ? "px-6 py-2.5 text-sm bg-white text-gray-900 shadow-white/5 hover:shadow-white/20 hover:scale-105"
            : "px-8 py-3 text-base bg-white text-gray-900 shadow-white/10 glow-box"
        }`}
        style={{
          left: `${startX}px`,
          top: `${startY}px`,
          transform: isFloating
            ? `translate(${tx}px, ${ty}px) translate(-50%, -50%)`
            : "translate(-50%, -50%)",
          opacity: entryDone && !hiddenByPricing ? 1 : 0,
          transition: isFloating
            ? "transform 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out, background-color 0.6s ease, color 0.6s ease, padding 0.6s ease, font-size 0.6s ease"
            : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out, background-color 0.4s ease, color 0.4s ease, padding 0.4s ease, font-size 0.4s ease",
          pointerEvents: isFloating && !hiddenByPricing ? "auto" : undefined,
        }}
      >
        Sprawdź cenę
      </a>
    </>
  );
}
