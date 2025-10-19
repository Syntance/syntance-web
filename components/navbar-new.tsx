"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function NavbarNew() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 py-6 px-6 lg:px-12">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-medium tracking-widest glow-text">
          Syntance
        </Link>
        
        <div className="hidden md:flex space-x-8">
          <a href="#products" className="text-sm font-light tracking-wider hover:text-purple-300 transition-colors">
            Produkty
          </a>
          <a href="#manifest" className="text-sm font-light tracking-wider hover:text-purple-300 transition-colors">
            Filozofia
          </a>
          <a href="#cases" className="text-sm font-light tracking-wider hover:text-purple-300 transition-colors">
            Studia Przypadków
          </a>
          <Link href="/contact" className="text-sm font-light tracking-wider hover:text-purple-300 transition-colors">
            Kontakt
          </Link>
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
            href="#products" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Produkty
          </a>
          <a 
            href="#manifest" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Filozofia
          </a>
          <a 
            href="#cases" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Studia Przypadków
          </a>
          <Link 
            href="/contact" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Kontakt
          </Link>
        </div>
      )}
    </nav>
  );
}

