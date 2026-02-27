"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TiltCard from "@/components/tilt-card";
import { useIsMobile } from "@/hooks/useIsMobile";

function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL');
}

const defaultBasePrices = { website: 10000, ecommerce: 20000 };

export default function OfferCards() {
  const [isVisible, setIsVisible] = useState(false);
  const [basePrices, setBasePrices] = useState(defaultBasePrices);
  const isMobile = useIsMobile();

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    if (!projectId) return;

    const query = encodeURIComponent(
      `*[_type == "projectType" && !disabled]{ "id": id.current, basePrice }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`)
      .then(res => res.json())
      .then(data => {
        const types = data.result as { id: string; basePrice?: number }[];
        if (!types?.length) return;
        const website = types.find(t => t.id === 'website');
        const ecommerce = types.find(t => t.id === 'ecommerce');
        setBasePrices({
          website: website?.basePrice ?? defaultBasePrices.website,
          ecommerce: ecommerce?.basePrice ?? defaultBasePrices.ecommerce,
        });
      })
      .catch(() => {});
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
      className="relative z-10 py-32 px-6 lg:px-12"
    >
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 id="offer-heading" className="text-4xl md:text-5xl font-light tracking-wider mb-16 text-center glow-text">
            Co możemy dla Ciebie zbudować?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Karta 1: Strony WWW */}
            <TiltCard className="h-full">
              <Link 
                href="/strony-www"
                className="group h-full product-card rounded-3xl p-8 cursor-pointer transition-all duration-300 block"
              >
                <div className="text-5xl mb-6">🌐</div>
                
                <h3 className={`text-2xl font-medium mb-4 transition-all ${
                  isMobile 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' 
                    : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400'
                }`}>
                  Strony WWW
                </h3>
                
                <p className="text-gray-400 font-light mb-4 leading-relaxed">
                  Strony wizytówkowe, landing page, strony firmowe
                </p>
                
                <p className="text-sm text-gray-400 font-light mb-6">
                  Dla: lekarzy, prawników, firm usługowych, deweloperów
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od&nbsp; {formatPrice(basePrices.website)} PLN</div>
                    <div className="text-sm text-gray-400 font-light mt-1">2-4 tygodnie</div>
                  </div>
                </div>
                
                <div className={`flex items-center text-blue-400 font-medium tracking-wide transition-transform ${
                  isMobile ? 'translate-x-2' : 'group-hover:translate-x-2'
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
                className="group h-full product-card rounded-3xl p-8 cursor-pointer transition-all duration-300 block"
              >
                <div className="text-5xl mb-6">🛒</div>
                
                <h3 className={`text-2xl font-medium mb-4 transition-all ${
                  isMobile 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' 
                    : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400'
                }`}>
                  Sklepy e-commerce
                </h3>
                
                <p className="text-gray-400 font-light mb-4 leading-relaxed">
                  Headless e-commerce na MedusaJS
                </p>
                
                <p className="text-sm text-gray-400 font-light mb-6">
                  Dla: butików, marek D2C, niszowych sprzedawców
                </p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-2xl font-light text-white">Od&nbsp; {formatPrice(basePrices.ecommerce)} PLN</div>
                    <div className="text-sm text-gray-400 font-light mt-1">4-6 tygodni</div>
                  </div>
                </div>
                
                <div className={`flex items-center text-purple-400 font-medium tracking-wide transition-transform ${
                  isMobile ? 'translate-x-2' : 'group-hover:translate-x-2'
                }`}>
                  Dowiedz się więcej 
                  <span className="ml-2">→</span>
                </div>
              </Link>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
