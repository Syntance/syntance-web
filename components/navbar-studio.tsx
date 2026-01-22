"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

const baseNavItems = [
  { label: "Oferta", href: "#hero-studio" },
  { label: "Technologia", href: "#tech-comparison" },
  { label: "Proces", href: "#process-studio" },
  { label: "Dlaczego my", href: "#values-studio" },
  { label: "Portfolio", href: "#portfolio-studio" },
  { label: "Cennik", href: "#pricing-studio" },
  { label: "O nas", href: "#o-nas" },
  { label: "Kontakt", href: "#contact" },
];

// Sekcje do śledzenia
// Hero i Anatomy są w sekcji "Oferta" - scrollujemy do hero-studio
const sectionIds = ['hero-studio', 'tech-comparison', 'process-studio', 'values-studio', 'portfolio-studio', 'pricing-studio', 'o-nas', 'contact'];

// Mapowanie indeksów navItems na sectionIds
const navToSectionMap: Record<number, number> = {
  0: 0, // Oferta -> hero-studio
  1: 1, // Technologia
  2: 2, // Proces
  3: 3, // Wartości
  4: 4, // Portfolio
  5: 5, // Cennik -> pricing-studio
  6: 6, // O nas
  7: 7, // Kontakt
};

const sectionToNavMap: Record<number, number> = {
  0: 0, // hero-studio -> Oferta
  1: 1, // tech-comparison -> Technologia
  2: 2, // process-studio -> Proces
  3: 3, // values-studio -> Wartości
  4: 4, // portfolio-studio -> Portfolio
  5: 5, // pricing-studio -> Cennik
  6: 6, // o-nas -> O nas
  7: 7, // contact -> Kontakt
};

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sectionsReady, setSectionsReady] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHomePage = pathname === '/';
  const isInCennik = pathname === '/cennik';

  // Przygotuj items z odpowiednimi href-ami (na podstronach dodaj "/" przed #)
  const navItems = useMemo(() => {
    return baseNavItems.map(item => ({
      ...item,
      href: item.href.startsWith('#') && !isHomePage ? `/${item.href}` : item.href
    }));
  }, [isHomePage]);

  // Poczekaj aż wszystkie sekcje pojawią się w DOM (tylko na stronie głównej)
  useEffect(() => {
    if (!isHomePage) {
      setSectionsReady(false);
      return;
    }
    
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
  }, [isHomePage]);

  // Śledzenie aktywnej sekcji podczas scrolla
  useEffect(() => {
    if (!isHomePage) return;
    
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
  }, [isHomePage, isScrolling, sectionsReady]);

  // Konwertuj activeSection (indeks w sectionIds) na indeks w navItems
  const activeNavIndex = isHomePage && sectionsReady ? sectionToNavMap[activeSection] ?? -1 : -1;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Przycisk powrotu tylko na podstronie cennika */}
          {isInCennik && (
            <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light tracking-wider">Powrót</span>
            </Link>
          )}
          
          {pathname === '/' ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance
            </button>
          ) : (
            <Link 
              href="/"
              className="text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance
            </Link>
          )}
        </div>
        
        {/* Nawigacja - ta sama na wszystkich stronach */}
        {!isInCennik && (
          <div className="hidden md:flex items-center gap-4">
            <GooeyNav 
              items={navItems}
              particleCount={8}
              particleDistances={[90, 10]}
              particleR={80}
              initialActiveIndex={0}
              externalActiveIndex={activeNavIndex}
              isExternalScrolling={isScrolling}
              animationTime={450}
              timeVariance={200}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              onNavigate={(navIndex) => {
                // Specjalna obsługa dla "Oferta" - scroll do samej góry
                if (navIndex === 0) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveSection(0);
                  setIsScrolling(true);
                  if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                  scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
                  return;
                }
                
                const sectionIndex = navToSectionMap[navIndex];
                if (sectionIndex !== undefined) {
                  setActiveSection(sectionIndex);
                  setIsScrolling(true);
                  if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                  scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
                }
              }}
            />
          </div>
        )}
        
        {/* Przycisk menu mobilnego */}
        {!isInCennik && (
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {!isInCennik && mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          {navItems.map((item, index) => {
            const isPageLink = item.href.startsWith('/') && !item.href.startsWith('/#');
            const isCurrentPage = isPageLink && pathname === item.href;
            
            if (isCurrentPage) {
              return (
                <span key={index} className="block text-sm font-light tracking-wider text-white">
                  {item.label}
                </span>
              );
            }
            
            return (
              <Link
                key={index}
                href={item.href}
                className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
