"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState, useMemo } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

// Główne linki nawigacyjne - odniesienia do podstron
const navItems = [
  { label: "Strategia", href: "/strategia" },
  { label: "Technologia", href: "/nextjs" },
  { label: "Cennik", href: "/cennik" },
  { label: "Kontakt", href: "/#contact" },
];

// Mapowanie pathname na indeks aktywnego elementu
const pathToNavIndex: Record<string, number> = {
  '/strategia': 0,
  '/nextjs': 1,
  '/cennik': 2,
};

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Znajdź aktywny indeks na podstawie aktualnej ścieżki
  const activeNavIndex = useMemo(() => {
    return pathToNavIndex[pathname] ?? -1;
  }, [pathname]);

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
        
        {/* Nawigacja - ta sama na wszystkich stronach */}
        <div className="hidden md:flex items-center gap-4">
          <GooeyNav 
            items={navItems}
            particleCount={8}
            particleDistances={[90, 10]}
            particleR={80}
            initialActiveIndex={-1}
            externalActiveIndex={activeNavIndex}
            animationTime={450}
            timeVariance={200}
            colors={[1, 2, 3, 4]}
          />
        </div>
        
        {/* Przycisk menu mobilnego */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          {navItems.map((item, index) => {
            const isCurrentPage = pathname === item.href;
            
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
                className="block text-sm font-light tracking-wider text-gray-400 hover:text-purple-300 transition-colors"
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
