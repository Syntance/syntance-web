"use client";

import { useEffect, useState } from "react";
import GradientText from "../GradientText";

export default function HeroStudio() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToNext = () => {
    const element = document.getElementById('anatomy-studio');
    if (element) {
      const navbarHeight = 100;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      const scrollToPosition = elementTop - navbarHeight;
      
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="hero-studio" aria-labelledby="hero-heading" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
      <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 id="hero-heading" className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text">
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
          Ultra-szybkie, bezpieczne i gotowe na przyszłość. Strategia przed kodem.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="relative group">
            <div 
              className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
              style={{
                backgroundImage: 'linear-gradient(to right, #2563eb, #7c3aed, #06b6d4, #7c3aed, #2563eb)',
                backgroundSize: '300% 100%'
              }}
            />
            <button 
              onClick={scrollToNext}
              className="relative z-10 px-8 py-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-gray-800/80 transition-all cursor-pointer"
            >
              Dowiedz się więcej
            </button>
          </div>
          <a 
            href="/cennik"
            className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box cursor-pointer inline-block text-center"
          >
            Sprawdź cenę
          </a>
        </div>
      </div>
    </section>
  );
}

