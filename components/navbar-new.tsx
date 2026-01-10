"use client";

import { Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

const navItems = [
  { label: "Wizja", href: "#hero" },
  { label: "Filozofia", href: "#manifest" },
  { label: "Produkty", href: "#products" },
  { label: "Dlaczego my", href: "#why-syntance" },
  { label: "Kontakt", href: "#contact" },
];

const sectionIds = ['hero', 'manifest', 'products', 'why-syntance', 'contact'];

export default function NavbarNew() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Nie aktualizuj podczas programowego scrollowania
      if (isScrolling) return;
      
      // Punkt odniesienia - trochę powyżej środka ekranu (30% od góry)
      const scrollPosition = window.scrollY + window.innerHeight * 0.3;
      
      // Znajdź najbliższą sekcję z navbar POWYŻEJ aktualnej pozycji
      let currentSectionIndex = 0;
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i]);
        if (element) {
          const sectionTop = element.offsetTop;
          
          // Jeśli scrollPosition jest poniżej początku tej sekcji, to ta sekcja (lub wcześniejsza) jest aktywna
          if (scrollPosition >= sectionTop) {
            currentSectionIndex = i;
            
            // Sprawdź czy nie jesteśmy już w następnej sekcji z navbar
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

    // Wywołaj na start
    handleScroll();
    
    // Dodaj listener na scroll z throttle dla lepszej wydajności
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
  }, [isScrolling, activeSection]);

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
        <button 
          onClick={() => {
            const element = document.getElementById('hero');
            if (element) {
              const navbarHeight = 100;
              const elementRect = element.getBoundingClientRect();
              const elementTop = elementRect.top + window.scrollY;
              const viewportHeight = window.innerHeight;
              const elementHeight = elementRect.height;
              const offset = (viewportHeight - elementHeight) / 2;
              const scrollToPosition = elementTop - Math.max(offset, navbarHeight);
              
              window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
              });
            }
          }}
          className="text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
        >
          Syntance
        </button>
        
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
        
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          <a 
            href="#hero" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setActiveSection(0);
              setIsScrolling(true);
              const element = document.querySelector('#hero') as HTMLElement;
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
            Wizja
          </a>
          <a 
            href="#manifest" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setActiveSection(1);
              setIsScrolling(true);
              const element = document.querySelector('#manifest') as HTMLElement;
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
            Filozofia
          </a>
          <a 
            href="#products" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setActiveSection(2);
              setIsScrolling(true);
              const element = document.querySelector('#products') as HTMLElement;
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
            Produkty
          </a>
          <a 
            href="#why-syntance" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setActiveSection(3);
              setIsScrolling(true);
              const element = document.querySelector('#why-syntance') as HTMLElement;
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
            Dlaczego my
          </a>
          <a
            href="#contact"
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setIsScrolling(true);
              setActiveSection(4);
              
              const element = document.getElementById('contact');
              if (element) {
                const navbarHeight = 100;
                const elementRect = element.getBoundingClientRect();
                const elementTop = elementRect.top + window.scrollY;
                const viewportHeight = window.innerHeight;
                const elementHeight = elementRect.height;
                const offset = (viewportHeight - elementHeight) / 2;
                const scrollToPosition = elementTop - Math.max(offset, navbarHeight);
                
                window.scrollTo({
                  top: scrollToPosition,
                  behavior: 'smooth'
                });
              }
              
              setTimeout(() => setIsScrolling(false), 1000);
            }}
          >
            Kontakt
          </a>
        </div>
      )}
    </nav>
  );
}

