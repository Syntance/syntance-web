"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

// Główne linki nawigacyjne z dropdownem dla "Wiedza"
const navItems = [
  { label: "Strona główna", href: "/" },
  { 
    label: "Wiedza", 
    href: "#",
    dropdown: [
      { label: "Strategia", href: "/strategia" },
      { label: "Technologia", href: "/nextjs" },
    ]
  },
  { label: "Cennik", href: "/cennik" },
  { label: "O nas", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];

// Mapowanie pathname na indeks aktywnego elementu
const pathToNavIndex: Record<string, number> = {
  '/': 0,
  '/strategia': 1, // "Wiedza" dropdown
  '/nextjs': 1,    // "Wiedza" dropdown
  '/cennik': 2,
  '/o-nas': 3,
  '/kontakt': 4,
};

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileWiedzaOpen, setMobileWiedzaOpen] = useState(false);

  // Znajdź aktywny indeks na podstawie aktualnej ścieżki
  const activeNavIndex = useMemo(() => {
    return pathToNavIndex[pathname] ?? -1;
  }, [pathname]);

  // Sprawdź czy któryś z linków w "Wiedza" jest aktywny
  const isWiedzaActive = pathname === '/strategia' || pathname === '/nextjs';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        {/* Logo - na stronie głównej scroll do góry, na podstronach link do home */}
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
        
        {/* Desktop Navigation with GooeyNav - od 1024px (tablet landscape + desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <GooeyNav 
            items={navItems}
            particleCount={6}
            particleDistances={[60, 8]}
            particleR={50}
            initialActiveIndex={-1}
            externalActiveIndex={activeNavIndex}
            animationTime={400}
            timeVariance={150}
            colors={[1, 2, 3, 4]}
          />
        </div>
        
        {/* Mobile menu button - pokazuj do 1023px (mobile + tablet portrait) */}
        <button 
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu - pokazuj do 1023px */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 py-4">
          {/* Strona główna */}
          {pathname === '/' ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block py-3 text-sm font-light tracking-wider text-white w-full text-left"
            >
              Strona główna
            </button>
          ) : (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 text-sm font-light tracking-wider text-gray-400 hover:text-purple-300 transition-colors"
            >
              Strona główna
            </Link>
          )}
          
          {/* Wiedza dropdown */}
          <div>
            <button
              onClick={() => setMobileWiedzaOpen(!mobileWiedzaOpen)}
              className={`w-full flex items-center justify-between py-3 text-sm font-light tracking-wider transition-colors ${
                isWiedzaActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              Wiedza
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${mobileWiedzaOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-200 ${
                mobileWiedzaOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pl-4 space-y-1 border-l border-white/10 ml-2">
                <Link
                  href="/strategia"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileWiedzaOpen(false);
                  }}
                  className={`block py-2 text-sm font-light tracking-wider transition-colors ${
                    pathname === '/strategia' 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  Strategia
                </Link>
                <Link
                  href="/nextjs"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileWiedzaOpen(false);
                  }}
                  className={`block py-2 text-sm font-light tracking-wider transition-colors ${
                    pathname === '/nextjs' 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  Technologia
                </Link>
              </div>
            </div>
          </div>
          
          {/* Cennik */}
          <Link
            href="/cennik"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 text-sm font-light tracking-wider transition-colors ${
              pathname === '/cennik' ? 'text-white' : 'text-gray-400 hover:text-purple-300'
            }`}
          >
            Cennik
          </Link>
          
          {/* O nas */}
          <Link
            href="/o-nas"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 text-sm font-light tracking-wider transition-colors ${
              pathname === '/o-nas' ? 'text-white' : 'text-gray-400 hover:text-purple-300'
            }`}
          >
            O nas
          </Link>
          
          {/* Kontakt */}
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 text-sm font-light tracking-wider text-gray-400 hover:text-purple-300 transition-colors"
          >
            Kontakt
          </Link>
        </div>
      </div>
    </nav>
  );
}
