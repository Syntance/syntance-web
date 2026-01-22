"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Struktura nawigacji z rozwijanym menu
const navStructure = [
  { label: "Strona główna", href: "/" },
  { 
    label: "Wiedza", 
    dropdown: true,
    items: [
      { label: "Strategia", href: "/strategia" },
      { label: "Technologia", href: "/nextjs" },
    ]
  },
  { label: "Cennik", href: "/cennik" },
  { label: "O nas", href: "/o-nas" },
  { label: "Kontakt", href: "/#contact" },
];

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wiedzaOpen, setWiedzaOpen] = useState(false);
  const [mobileWiedzaOpen, setMobileWiedzaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWiedzaOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navStructure.map((item, index) => {
            if (item.dropdown && item.items) {
              return (
                <div key={index} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setWiedzaOpen(!wiedzaOpen)}
                    className={`flex items-center gap-1 text-sm font-light tracking-wider transition-colors ${
                      isWiedzaActive ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${wiedzaOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div 
                    className={`absolute top-full left-0 mt-4 py-2 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl min-w-[180px] shadow-xl transition-all duration-200 ${
                      wiedzaOpen 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        onClick={() => setWiedzaOpen(false)}
                        className={`block px-4 py-2 text-sm font-light tracking-wider transition-colors ${
                          pathname === subItem.href 
                            ? 'text-white bg-white/10' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            
            return (
              <Link
                key={index}
                href={item.href!}
                className={`text-sm font-light tracking-wider transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 py-4">
          {navStructure.map((item, index) => {
            if (item.dropdown && item.items) {
              return (
                <div key={index}>
                  <button
                    onClick={() => setMobileWiedzaOpen(!mobileWiedzaOpen)}
                    className={`w-full flex items-center justify-between py-3 text-sm font-light tracking-wider transition-colors ${
                      isWiedzaActive ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
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
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileWiedzaOpen(false);
                          }}
                          className={`block py-2 text-sm font-light tracking-wider transition-colors ${
                            pathname === subItem.href 
                              ? 'text-white' 
                              : 'text-gray-400 hover:text-purple-300'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={index}
                href={item.href!}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 text-sm font-light tracking-wider transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
