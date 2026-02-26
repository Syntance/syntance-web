"use client";

import { useState, useEffect, useRef } from "react";

const sections = [
  { id: "hero-studio", label: "Oferta" },
  { id: "tech-comparison", label: "Technologia" },
  { id: "process-studio", label: "Proces" },
  { id: "values-studio", label: "Dlaczego my" },
  { id: "portfolio-studio", label: "Portfolio" },
  { id: "pricing-studio", label: "Cennik" },
  { id: "contact", label: "Kontakt" },
];

export default function SectionScrollbar() {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pokaż scrollbar po małym opóźnieniu
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Śledź aktywną sekcję na podstawie scrolla
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;
      
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;
      let currentIndex = 0;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element) {
          const sectionTop = element.offsetTop;
          if (scrollPosition >= sectionTop) {
            currentIndex = i;
            break;
          }
        }
      }
      
      setActiveSection(currentIndex);
    };

    handleScroll();
    
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [isScrolling]);

  // Gdy użytkownik zaczyna ręcznie scrollować, odblokuj tracking
  useEffect(() => {
    const handleUserScroll = () => {
      if (isScrolling) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        setIsScrolling(false);
      }
    };
    
    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [isScrolling]);

  const scrollToSection = (index: number) => {
    const section = sections[index];
    const element = document.getElementById(section.id);
    
    if (element) {
      setActiveSection(index);
      setIsScrolling(true);
      
      const navbarHeight = 100;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      const scrollToPosition = elementTop - navbarHeight;
      
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  // Oblicz rozmiar i widoczność kropki na podstawie odległości od aktywnej
  const getDotStyle = (index: number) => {
    const distance = Math.abs(index - activeSection);
    const maxVisibleDistance = 3;
    
    if (distance > maxVisibleDistance) {
      return { scale: 0, opacity: 0, blur: 4 };
    }
    
    // Aktywna = 1, dalsze = mniejsze i bardziej rozmyte
    const scale = distance === 0 ? 1 : Math.max(0.35, 1 - (distance * 0.22));
    const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - (distance * 0.22));
    const blur = distance * 0.5;
    
    return { scale, opacity, blur };
  };

  return (
    <div 
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      {/* Sekcje */}
      {sections.map((section, index) => {
        const { scale, opacity, blur } = getDotStyle(index);
        const isActive = activeSection === index;
        const distance = Math.abs(index - activeSection);
        
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className="group flex items-center gap-3 py-[6px]"
            style={{ 
              opacity,
              filter: `blur(${blur}px)`,
              pointerEvents: distance > 3 ? 'none' : 'auto',
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: `${distance * 30}ms`,
            }}
          >
            {/* Label - pojawia się na hover lub gdy aktywna */}
            <span 
              className={`text-xs font-light tracking-wider whitespace-nowrap ${
                isActive 
                  ? 'opacity-100 translate-x-0 text-white' 
                  : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
              }`}
              style={{
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {section.label}
            </span>
            
            {/* Kropka */}
            <div 
              className={`rounded-full flex-shrink-0 ${
                isActive 
                  ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)]' 
                  : 'bg-white/50 group-hover:bg-white/80'
              }`}
              style={{
                width: isActive ? '12px' : '8px',
                height: isActive ? '12px' : '8px',
                transform: `scale(${scale})`,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${distance * 20}ms`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
