"use client";

import { useEffect, useState } from "react";
import TiltCard from "@/components/tilt-card";

export default function OfferCards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('offer-cards');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const scrollToPricing = (filter: string) => {
    const element = document.getElementById('pricing-studio');
    if (element) {
      const navbarHeight = 100;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      const scrollToPosition = elementTop - navbarHeight;
      
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
      
      // Tutaj możesz dodać logikę do ustawienia filtra w konfigurator cennika
      // np. sessionStorage.setItem('pricingFilter', filter);
    }
  };

  return (
    <section 
      id="offer-cards" 
      className="relative z-10 py-32 px-6 lg:px-12"
    >
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-16 text-center glow-text">
            Co możemy dla Ciebie zbudować?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Karta 1: Strony WWW */}
            <TiltCard className="h-full">
              <div 
                onClick={() => scrollToPricing('Strona')}
                className="group h-full product-card rounded-3xl p-8 cursor-pointer transition-all duration-300"
              >
                <div className="text-5xl mb-6">🌐</div>
                
                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all">
                  Strony WWW
                </h3>
                
                <p className="text-gray-400 font-light mb-4 leading-relaxed">
                  Strony wizytówkowe, landing page, strony firmowe
                </p>
                
                <p className="text-sm text-gray-500 font-light mb-6">
                  Dla: lekarzy, prawników, firm usługowych, deweloperów
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od 5 000 PLN</div>
                    <div className="text-sm text-gray-500 font-light mt-1">2-4 tygodnie</div>
                  </div>
                </div>
                
                <div className="flex items-center text-blue-400 font-medium tracking-wide group-hover:translate-x-2 transition-transform">
                  Dowiedz się więcej 
                  <span className="ml-2">→</span>
                </div>
              </div>
            </TiltCard>

            {/* Karta 2: Sklepy e-commerce */}
            <TiltCard className="h-full">
              <div 
                onClick={() => scrollToPricing('Sklep')}
                className="group h-full product-card rounded-3xl p-8 cursor-pointer transition-all duration-300"
              >
                <div className="text-5xl mb-6">🛒</div>
                
                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                  Sklepy e-commerce
                </h3>
                
                <p className="text-gray-400 font-light mb-4 leading-relaxed">
                  Headless e-commerce na MedusaJS
                </p>
                
                <p className="text-sm text-gray-500 font-light mb-6">
                  Dla: butików, marek D2C, niszowych sprzedawców
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od 20 000 PLN</div>
                    <div className="text-sm text-gray-500 font-light mt-1">4-6 tygodni</div>
                  </div>
                </div>
                
                <div className="flex items-center text-purple-400 font-medium tracking-wide group-hover:translate-x-2 transition-transform">
                  Dowiedz się więcej 
                  <span className="ml-2">→</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
