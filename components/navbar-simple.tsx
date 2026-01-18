"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function NavbarSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <Link 
          href="/"
          className="text-2xl font-medium tracking-widest glow-text hover:opacity-80 transition-opacity"
        >
          Syntance
        </Link>
        
        <div className="hidden md:flex items-center gap-8 mr-12">
          <Link 
            href="/" 
            className="text-sm font-light tracking-wider text-white hover:text-purple-300 transition-colors"
          >
            Strona główna
          </Link>
          <Link 
            href="/#o-nas" 
            className="text-sm font-light tracking-wider text-white hover:text-purple-300 transition-colors"
          >
            O nas
          </Link>
        </div>
        
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          <Link 
            href="/" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Strona główna
          </Link>
          <Link 
            href="/#o-nas" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            O nas
          </Link>
        </div>
      )}
    </nav>
  );
}

