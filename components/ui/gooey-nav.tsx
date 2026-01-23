'use client';

import { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

interface GooeyNavProps {
  items: NavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  externalActiveIndex?: number;
  isExternalScrolling?: boolean;
  onNavigate?: (index: number) => void;
}

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  externalActiveIndex,
  isExternalScrolling = false,
  onNavigate
}: GooeyNavProps) => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const navigatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zamknij dropdown przy zmianie pathname (nawigacja) i resetuj blokadę nawigacji
  useEffect(() => {
    setOpenDropdown(null);
    // Resetuj blokadę nawigacji - pathname się zmienił, więc nawigacja zakończona
    isNavigatingRef.current = false;
  }, [pathname]);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };
  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    
    // Użyj DocumentFragment dla lepszej wydajności
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.cssText = `
          --start-x: ${p.start[0]}px;
          --start-y: ${p.start[1]}px;
          --end-x: ${p.end[0]}px;
          --end-y: ${p.end[1]}px;
          --time: ${p.time}ms;
          --scale: ${p.scale};
          --color: var(--color-${p.color}, white);
          --rotate: ${p.rotate}deg;
        `;
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };
  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Znajdź element <a> wewnątrz li żeby uzyskać prawidłowe wymiary (bez dropdown)
    const anchorEl = element.querySelector('a');
    const targetEl = anchorEl || element;
    const pos = targetEl.getBoundingClientRect();
    
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    
    // Pobierz tylko tekst z pierwszego dziecka tekstowego (label), nie z dropdown
    const labelText = element.querySelector('a')?.childNodes[0]?.textContent || element.innerText;
    textRef.current.innerText = labelText.trim();
  };
  const handleClick = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    const liEl = e.currentTarget;
    const item = items[index];
    
    // Jeśli element ma dropdown, otwórz/zamknij go zamiast nawigować
    if (item.dropdown && item.dropdown.length > 0) {
      setOpenDropdown(openDropdown === index ? null : index);
      return;
    }
    
    // Zamknij dropdown przy nawigacji
    setOpenDropdown(null);
    
    // Jeśli klikamy "Strona główna" będąc już na stronie głównej - scroll do góry
    if (activeIndex === index && item.href === '/' && pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (activeIndex === index) return;
    
    // Blokuj reakcję na externalActiveIndex przez czas scrollowania
    // Anuluj poprzedni timeout żeby szybkie kliknięcia nie resetowały blokady przedwcześnie
    isNavigatingRef.current = true;
    if (navigatingTimeoutRef.current) clearTimeout(navigatingTimeoutRef.current);
    navigatingTimeoutRef.current = setTimeout(() => { isNavigatingRef.current = false; }, 1200);
    
    // Wywołaj callback przed ustawieniem active index
    if (onNavigate) {
      onNavigate(index);
    }
    
    setActiveIndex(index);
    updateEffectPosition(liEl);
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current!.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
    // Navigate to href
    const href = item.href;
    if (href.startsWith('#')) {
      const element = document.querySelector(href) as HTMLElement;
      if (element) {
        const navbarHeight = 100; // wysokość fixed navbar + padding
        const viewportHeight = window.innerHeight;
        const elementHeight = element.offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        
        // Centrowanie sekcji na ekranie
        const centerOffset = (viewportHeight - elementHeight) / 2;
        const offsetPosition = elementPosition - Math.max(navbarHeight, centerOffset);
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else if (href.startsWith('/#')) {
      // Link do sekcji na stronie głównej z innej podstrony
      // Dispatch event - ProgressBar obsłuży nawigację z animacją
      window.dispatchEvent(new CustomEvent('navigation-start', { detail: { href } }));
    } else {
      // Link do podstrony - dispatch event, ProgressBar obsłuży nawigację
      window.dispatchEvent(new CustomEvent('navigation-start', { detail: { href } }));
    }
  };
  
  const handleDropdownClick = (href: string) => {
    setOpenDropdown(null);
    // Dispatch event - ProgressBar obsłuży nawigację z animacją
    window.dispatchEvent(new CustomEvent('navigation-start', { detail: { href } }));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        handleClick({ currentTarget: liEl } as React.MouseEvent<HTMLLIElement>, index);
      }
    }
  };
  // Obsługa zewnętrznego activeIndex - reaguj na zmianę pathname
  useEffect(() => {
    // Ignoruj zmiany podczas programowego scrollowania (po kliknięciu w navbar)
    if (isExternalScrolling) return;
    
    if (externalActiveIndex !== undefined && externalActiveIndex >= 0) {
      const newActiveLi = navRef.current?.querySelectorAll('li')[externalActiveIndex] as HTMLElement;
      if (newActiveLi && externalActiveIndex !== activeIndex) {
        setActiveIndex(externalActiveIndex);
        updateEffectPosition(newActiveLi);
        
        if (filterRef.current) {
          const particles = filterRef.current.querySelectorAll('.particle');
          particles.forEach(p => filterRef.current!.removeChild(p));
          makeParticles(filterRef.current);
        }
        
        if (textRef.current) {
          textRef.current.classList.remove('active');
          void textRef.current.offsetWidth;
          textRef.current.classList.add('active');
        }
      } else if (newActiveLi && externalActiveIndex === activeIndex) {
        // Jeśli indeks się nie zmienił, ale pathname tak - zaktualizuj pozycję
        updateEffectPosition(newActiveLi);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalActiveIndex, pathname, isExternalScrolling]);

  // Gdy użytkownik zaczyna ręcznie scrollować, natychmiast odblokuj
  useEffect(() => {
    const handleUserScroll = () => {
      if (isNavigatingRef.current) {
        if (navigatingTimeoutRef.current) clearTimeout(navigatingTimeoutRef.current);
        isNavigatingRef.current = false;
      }
    };
    
    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, []);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi as HTMLElement);
      textRef.current?.classList.add('active');
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi as HTMLElement);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      <style jsx global>{`
        :root {
          --color-1: rgba(168, 85, 247, 1);
          --color-2: rgba(147, 51, 234, 1);
          --color-3: rgba(126, 34, 206, 1);
          --color-4: rgba(109, 40, 217, 1);
        }
        .gooey-effect {
          position: absolute;
          opacity: 1;
          pointer-events: none;
          display: grid;
          place-items: center;
          z-index: 1;
        }
        .gooey-effect.text {
          color: white;
          transition: color 0.3s ease, font-weight 0.3s ease;
          font-size: 0.875rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .gooey-effect.text.active {
          color: #000000;
          font-weight: 600;
        }
        .gooey-effect.filter {
          filter: blur(3px) contrast(50) blur(0);
          mix-blend-mode: lighten;
        }
        .gooey-effect.filter::before {
          content: none;
        }
        .gooey-effect.filter::after {
          content: "";
          position: absolute;
          inset: 0;
          background: #e5e5e5;
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          border-radius: 9999px;
        }
        .gooey-effect.active::after {
          animation: pill 0.3s ease both;
        }
        @keyframes pill {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .particle,
        .point {
          display: block;
          opacity: 0;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          transform-origin: center;
        }
        .particle {
          --time: 5s;
          position: absolute;
          top: calc(50% - 8px);
          left: calc(50% - 8px);
          animation: particle calc(var(--time)) ease 1 -350ms;
        }
        .point {
          background: var(--color);
          opacity: 1;
          animation: point calc(var(--time)) ease 1 -350ms;
        }
        @keyframes particle {
          0% {
            transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
            opacity: 1;
            animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
          }
          70% {
            transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
            opacity: 1;
            animation-timing-function: ease;
          }
          85% {
            transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
            opacity: 1;
          }
        }
        @keyframes point {
          0% {
            transform: scale(0);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
          }
          25% {
            transform: scale(calc(var(--scale) * 0.25));
          }
          38% {
            opacity: 1;
          }
          65% {
            transform: scale(var(--scale));
            opacity: 1;
            animation-timing-function: ease;
          }
          85% {
            transform: scale(var(--scale));
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        .gooey-nav-item.active {
          text-shadow: none;
        }
        .gooey-nav-item.active a {
          color: transparent;
        }
        .gooey-nav-item.active::after {
          opacity: 1;
          transform: scale(1);
        }
        .gooey-nav-item::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: #e5e5e5;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
          z-index: -1;
        }
        .gooey-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 1rem;
          padding: 0.5rem 0;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          min-width: 180px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          z-index: 50;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .gooey-dropdown.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .gooey-dropdown-item {
          display: block;
          padding: 0.5rem 1rem;
          color: rgba(156, 163, 175, 1);
          font-size: 0.875rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .gooey-dropdown-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .gooey-chevron {
          display: inline-block;
          margin-left: 4px;
          transition: transform 0.2s ease;
        }
        .gooey-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>
      <div className="relative" ref={containerRef}>
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-8 list-none p-0 px-4 m-0 relative z-[3]"
            style={{
              color: 'white',
              textShadow: '0 1px 1px hsl(205deg 30% 10% / 0.2)'
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`gooey-nav-item rounded-full relative cursor-pointer transition-[background-color_color] duration-300 ease text-white text-sm font-light tracking-wider ${
                  activeIndex === index ? 'active' : ''
                }`}
                onClick={(e) => handleClick(e, index)}
              >
                <a
                  href={item.href}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="outline-none py-[0.6em] px-[1em] inline-flex items-center"
                  onClick={(e) => item.dropdown && e.preventDefault()}
                >
                  {item.label}
                  {item.dropdown && item.dropdown.length > 0 && (
                    <svg 
                      className={`gooey-chevron ${openDropdown === index ? 'open' : ''}`}
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </a>
                {/* Dropdown menu */}
                {item.dropdown && item.dropdown.length > 0 && (
                  <div 
                    ref={openDropdown === index ? dropdownRef : null}
                    className={`gooey-dropdown ${openDropdown === index ? 'open' : ''}`}
                  >
                    {item.dropdown.map((dropItem, dropIndex) => (
                      <button
                        key={dropIndex}
                        className="gooey-dropdown-item w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropdownClick(dropItem.href);
                        }}
                      >
                        {dropItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <span className="gooey-effect filter" ref={filterRef} />
        <span className="gooey-effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;

