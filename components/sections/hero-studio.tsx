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
    <section id="hero-studio" className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
      <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text">
          <GradientText
            colors={["#a855f7", "#c4b5fd", "#3b82f6", "#c4b5fd", "#a855f7"]}
            animationSpeed={4}
            className="font-medium"
          >
            Syntance Studio
          </GradientText>
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wider text-gray-300 mb-12 max-w-3xl mx-auto">
          Projektujemy i wdrażamy strony i sklepy, które realizują cele biznesowe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={scrollToNext}
            className="px-8 py-3 bg-white bg-opacity-10 border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-opacity-20 transition-all glow-box cursor-pointer"
          >
            Dowiedz się więcej
          </button>
          <a 
            href="/studio/cennik?from=hero-studio"
            className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box cursor-pointer inline-block text-center"
          >
            Sprawdź cenę
          </a>
        </div>
      </div>
    </section>
  );
}

