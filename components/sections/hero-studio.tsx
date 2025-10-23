"use client";

import { useEffect, useState } from "react";
import GradientText from "../GradientText";

export default function HeroStudio() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
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

  const scrollToContact = () => {
    const element = document.getElementById('contact');
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
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
      <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text">
          Syntance Studio —{" "}
          <GradientText
            colors={["#a855f7", "#c4b5fd", "#3b82f6", "#c4b5fd", "#a855f7"]}
            animationSpeed={4}
            className="font-medium"
          >
            Strony i sklepy,
          </GradientText>
          <br />
          które działają.
        </h1>
        <p className="text-lg md:text-xl font-light tracking-wider text-gray-300 mb-12 max-w-3xl mx-auto">
          Projektujemy i wdrażamy nowoczesne, lekkie i dopracowane strony oraz sklepy dla marek, które cenią piękno i spokój działania.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={scrollToPortfolio}
            className="px-8 py-3 bg-white bg-opacity-10 border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-opacity-20 transition-all glow-box cursor-pointer"
          >
            Zobacz realizacje
          </button>
          <button 
            onClick={scrollToContact}
            className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box cursor-pointer"
          >
            Porozmawiajmy
          </button>
        </div>

        {/* Decorative gradient orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-10 blur-3xl -z-10 animate-pulse"></div>
      </div>
    </section>
  );
}

