"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

const navItems = [
  { label: "O nas", href: "#hero-studio" },
  { label: "Technologia", href: "#tech-comparison" },
  { label: "Proces", href: "#process-studio" },
  { label: "Wartości", href: "#values-studio" },
  { label: "Portfolio", href: "#portfolio-studio" },
  { label: "Cennik", href: "#pricing-studio" },
  { label: "Kontakt", href: "#contact" },
];

const sectionIds = ['hero-studio', 'tech-comparison', 'process-studio', 'values-studio', 'portfolio-studio', 'pricing-studio', 'contact'];

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sectionsReady, setSectionsReady] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sprawdź czy jesteśmy na podstronie cennika
  const isInCennik = pathname === '/studio/cennik';

  // Poczekaj aż wszystkie sekcje pojawią się w DOM, żeby nie podświetlać "Kontakt" zanim załaduje się reszta.
  useEffect(() => {
    const checkReady = () => sectionIds.every((id) => document.getElementById(id));

    if (checkReady()) {
      setSectionsReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (checkReady()) {
        setSectionsReady(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionsReady) return;
      if (isScrolling) return;
      
      const scrollPosition = window.scrollY + window.innerHeight * 0.3;
      let currentSectionIndex = 0;
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i]);
        if (element) {
          const sectionTop = element.offsetTop;
          
          if (scrollPosition >= sectionTop) {
            currentSectionIndex = i;
            
            if (i < sectionIds.length - 1) {
              const nextElement = document.getElementById(sectionIds[i + 1]);
              if (nextElement && scrollPosition >= nextElement.offsetTop) {
                currentSectionIndex = i + 1;
              }
            }
            break;
          }
        }
      }
      
      setActiveSection(currentSectionIndex);
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
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isScrolling, sectionsReady]);

  // Gdy użytkownik zaczyna ręcznie scrollować (wheel/touch), natychmiast odblokuj
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Przycisk powrotu tylko na podstronach (np. /studio/cennik) */}
          {isInCennik && (
            <Link href="/studio" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light tracking-wider">Powrót</span>
            </Link>
          )}
          
          {pathname === '/studio' ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance <span className="text-teal-300">Studio</span>
            </button>
          ) : (
            <Link 
              href="/studio"
              className="text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance <span className="text-teal-300">Studio</span>
            </Link>
          )}
        </div>
        
        {/* Nawigacja tylko na stronie /studio, nie na podstronach jak /studio/cennik */}
        {!isInCennik && (
          <div className="hidden md:flex">
            <GooeyNav 
              items={navItems}
              particleCount={8}
              particleDistances={[90, 10]}
              particleR={80}
              initialActiveIndex={0}
              externalActiveIndex={activeSection}
              isExternalScrolling={isScrolling}
              animationTime={450}
              timeVariance={200}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              onNavigate={(index) => {
                setActiveSection(index);
                setIsScrolling(true);
                // Anuluj poprzedni timeout żeby szybkie kliknięcia nie resetowały isScrolling przedwcześnie
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
              }}
            />
          </div>
        )}
        
        {/* Przycisk menu mobilnego tylko na stronie /studio */}
        {!isInCennik && (
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Mobile Menu - tylko na stronie /studio */}
      {!isInCennik && mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setActiveSection(index);
                setIsScrolling(true);
                const element = document.querySelector(item.href) as HTMLElement;
                if (element) {
                  const navbarHeight = 100;
                  const viewportHeight = window.innerHeight;
                  const elementHeight = element.offsetHeight;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const centerOffset = (viewportHeight - elementHeight) / 2;
                  const offsetPosition = elementPosition - Math.max(navbarHeight, centerOffset);
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  setTimeout(() => setIsScrolling(false), 1000);
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
