"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

// Główne linki nawigacyjne
const navItems = [
  { label: "Strona główna", href: "/" },
  {
    label: "Oferta",
    href: "#",
    dropdown: [
      { label: "Strony", href: "/strony-www" },
      { label: "Sklepy", href: "/sklepy-internetowe" },
      { label: "Dla agencji", href: "/agencje-marketingowe" },
    ],
  },
  {
    label: "Produkty",
    href: "#",
    dropdown: [{ label: "Panel", href: "/panel" }],
  },
  { label: "Portfolio", href: "/#portfolio-studio" },
  {
    label: "Blog",
    href: "#",
    dropdown: [
      { label: "Strategia", href: "/strategia-marketingu-i-sprzedazy" },
      { label: "Technologia", href: "/nextjs" },
    ],
  },
  { label: "Cennik", href: "/cennik" },
  { label: "Kontakt", href: "/kontakt" },
];

// Mapowanie pathname na indeks aktywnego elementu
const pathToNavIndex: Record<string, number> = {
  '/': 0,
  '/strony-www': 1,
  '/sklepy-internetowe': 1,
  '/agencje-marketingowe': 1,
  '/panel': 2,
  '/realizacje': 3,
  '/strategia-marketingu-i-sprzedazy': 4,
  '/nextjs': 4,
  '/cennik': 5,
  '/kontakt': 6,
};

const HIDDEN_NAVBAR_PATHS = new Set<string>([])
const HIDDEN_NAVBAR_PREFIXES = ['/admin']

export default function NavbarStudio() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOfertaOpen, setMobileOfertaOpen] = useState(false);
  const [mobileProduktyOpen, setMobileProduktyOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  // Ukryj floating CTA (StickyCtaFloat → body) gdy drawer jest otwarty — ten sam z-index co nav.
  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.setAttribute("data-mobile-nav-open", "true");
    } else {
      document.documentElement.removeAttribute("data-mobile-nav-open");
    }
    return () => {
      document.documentElement.removeAttribute("data-mobile-nav-open");
    };
  }, [mobileMenuOpen]);

  // Body scroll lock (rules: 60-quality "Memory leaks") + Escape close + focus management
  useEffect(() => {
    if (!mobileMenuOpen) return;

    // Lock body scroll na czas otwartego menu (zachowuje pozycję scrolla)
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Focus na pierwszym linku menu po otwarciu (a11y)
    const focusTimer = setTimeout(() => firstLinkRef.current?.focus(), 100);

    return () => {
      // Restore body scroll + position
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      const restored = top ? parseInt(top.replace('-', '').replace('px', ''), 10) : scrollY;
      window.scrollTo(0, restored);

      document.removeEventListener('keydown', handleEscape);
      clearTimeout(focusTimer);
    };
  }, [mobileMenuOpen]);

  // Auto-close on pathname change (przy nawigacji między stronami)
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileOfertaOpen(false);
    setMobileProduktyOpen(false);
    setMobileBlogOpen(false);
  }, [pathname]);

  const activeNavIndex = useMemo(() => {
    return pathToNavIndex[pathname] ?? -1;
  }, [pathname]);

  const isOfertaActive =
    pathname === '/strony-www' ||
    pathname === '/sklepy-internetowe' ||
    pathname === '/agencje-marketingowe';

  const isProduktyActive = pathname === '/panel';

  const isPortfolioActive = pathname === '/realizacje';

  const isBlogActive = pathname === '/strategia-marketingu-i-sprzedazy' || pathname === '/nextjs';

  if (HIDDEN_NAVBAR_PATHS.has(pathname) || HIDDEN_NAVBAR_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <>
      {/* Backdrop dla mobile drawer (poza nav żeby pokrywał całość) */}
      <div
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:py-6 sm:px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300 safe-pt">
        <div className="flex justify-between items-center">
          {pathname === '/' ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xl sm:text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance
            </button>
          ) : (
            <Link
              href="/"
              className="text-xl sm:text-2xl font-medium tracking-widest glow-text cursor-pointer hover:opacity-80 transition-opacity"
            >
              Syntance
            </Link>
          )}

          {/* Desktop Navigation z GooeyNav (≥1024px) */}
          <div className="hidden lg:flex items-center gap-4">
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

          {/* Mobile menu button — tap-target zapewnia 44×44 (WCAG 2.2) */}
          <button
            ref={menuButtonRef}
            className="lg:hidden tap-target text-white -mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-drawer"
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — pełnoekranowy, slide-in z prawej, safe-area aware (<1024px) */}
      <aside
        id="mobile-menu-drawer"
        aria-label="Menu mobilne"
        aria-hidden={!mobileMenuOpen}
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-black border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out safe-pt safe-pb ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <span className="text-xl font-medium tracking-widest glow-text">Syntance</span>
          <button
            className="tap-target text-white -mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Zamknij menu"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-72px)] px-6 py-4">
          <div className="space-y-0.5">
            {/* Strona główna */}
            {pathname === '/' ? (
              <button
                ref={firstLinkRef as React.RefObject<HTMLButtonElement>}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left tap-target justify-start py-4 text-base font-light tracking-wider text-white border-b border-white/5 cursor-pointer"
              >
                Strona główna
              </button>
            ) : (
              <Link
                ref={firstLinkRef as React.RefObject<HTMLAnchorElement>}
                href="/"
                className="block tap-target justify-start py-4 text-base font-light tracking-wider text-gray-300 hover:text-white active:text-purple-300 transition-colors border-b border-white/5"
              >
                Strona główna
              </Link>
            )}

            {/* Oferta dropdown */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setMobileOfertaOpen(!mobileOfertaOpen)}
                aria-expanded={mobileOfertaOpen}
                aria-controls="mobile-oferta-submenu"
                className={`w-full flex items-center justify-between tap-target py-4 text-base font-light tracking-wider transition-colors cursor-pointer ${
                  isOfertaActive ? 'text-white' : 'text-gray-300'
                }`}
              >
                Oferta
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${mobileOfertaOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id="mobile-oferta-submenu"
                className={
                  mobileOfertaOpen
                    ? 'overflow-hidden max-h-[240px] opacity-100 transition-all duration-300 ease-out'
                    : 'hidden'
                }
              >
                <div className="pl-4 pb-2 space-y-0.5 border-l-2 border-purple-500/30 ml-2">
                  <Link
                    href="/strony-www"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/strony-www'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Strony
                  </Link>
                  <Link
                    href="/sklepy-internetowe"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/sklepy-internetowe'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Sklepy
                  </Link>
                  <Link
                    href="/agencje-marketingowe"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/agencje-marketingowe'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Dla agencji
                  </Link>
                </div>
              </div>
            </div>

            {/* Produkty dropdown */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setMobileProduktyOpen(!mobileProduktyOpen)}
                aria-expanded={mobileProduktyOpen}
                aria-controls="mobile-produkty-submenu"
                className={`w-full flex items-center justify-between tap-target py-4 text-base font-light tracking-wider transition-colors cursor-pointer ${
                  isProduktyActive ? 'text-white' : 'text-gray-300'
                }`}
              >
                Produkty
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${mobileProduktyOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id="mobile-produkty-submenu"
                className={
                  mobileProduktyOpen
                    ? 'overflow-hidden max-h-[120px] opacity-100 transition-all duration-300 ease-out'
                    : 'hidden'
                }
              >
                <div className="pl-4 pb-2 space-y-0.5 border-l-2 border-purple-500/30 ml-2">
                  <Link
                    href="/panel"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/panel'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Panel
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/#portfolio-studio"
              className={`block tap-target justify-start py-4 text-base font-light tracking-wider transition-colors border-b border-white/5 ${
                isPortfolioActive ? 'text-white' : 'text-gray-300 hover:text-white active:text-purple-300'
              }`}
            >
              Portfolio
            </Link>

            {/* Blog dropdown */}
            <div className="border-b border-white/5">
              <button
                onClick={() => setMobileBlogOpen(!mobileBlogOpen)}
                aria-expanded={mobileBlogOpen}
                aria-controls="mobile-blog-submenu"
                className={`w-full flex items-center justify-between tap-target py-4 text-base font-light tracking-wider transition-colors cursor-pointer ${
                  isBlogActive ? 'text-white' : 'text-gray-300'
                }`}
              >
                Blog
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${mobileBlogOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id="mobile-blog-submenu"
                className={
                  mobileBlogOpen
                    ? 'overflow-hidden max-h-[200px] opacity-100 transition-all duration-300 ease-out'
                    : 'hidden'
                }
              >
                <div className="pl-4 pb-2 space-y-0.5 border-l-2 border-purple-500/30 ml-2">
                  <Link
                    href="/strategia-marketingu-i-sprzedazy"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/strategia-marketingu-i-sprzedazy'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Strategia
                  </Link>
                  <Link
                    href="/nextjs"
                    className={`block tap-target justify-start py-3 text-sm font-light tracking-wider transition-colors ${
                      pathname === '/nextjs'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white active:text-purple-300'
                    }`}
                  >
                    Technologia
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/cennik"
              className={`block tap-target justify-start py-4 text-base font-light tracking-wider transition-colors border-b border-white/5 ${
                pathname === '/cennik' ? 'text-white' : 'text-gray-300 hover:text-white active:text-purple-300'
              }`}
            >
              Cennik
            </Link>

            <Link
              href="/kontakt"
              className={`block tap-target justify-start py-4 text-base font-light tracking-wider transition-colors border-b border-white/5 ${
                pathname === '/kontakt' ? 'text-white' : 'text-gray-300 hover:text-white active:text-purple-300'
              }`}
            >
              Kontakt
            </Link>
          </div>

          {/* CTA primary w mobile drawer — najmocniejsza akcja na końcu listy */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/cennik"
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-white/90 active:bg-white/80 transition-colors glow-box cursor-pointer"
            >
              Sprawdź cenę
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
