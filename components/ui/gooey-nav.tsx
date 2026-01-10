'use client';

import { useRef, useEffect, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const isNavigatingRef = useRef(false);
  const navigatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };
  const handleClick = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    const liEl = e.currentTarget;
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
    const href = items[index].href;
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
    } else {
      window.location.href = href;
    }
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
  // Obsługa zewnętrznego activeIndex
  useEffect(() => {
    // Ignoruj zmiany podczas programowego scrollowania (po kliknięciu w navbar)
    // Używamy ref dla synchronicznego dostępu (props mogą być opóźnione)
    if (isExternalScrolling || isNavigatingRef.current) return;
    
    if (externalActiveIndex !== undefined && externalActiveIndex !== activeIndex) {
      const newActiveLi = navRef.current?.querySelectorAll('li')[externalActiveIndex] as HTMLElement;
      if (newActiveLi) {
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalActiveIndex, activeIndex, isExternalScrolling]);

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
          transition: color 0.3s ease;
        }
        .gooey-effect.text.active {
          color: black;
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
          background: white;
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
          color: black;
          text-shadow: none;
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
          background: white;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
          z-index: -1;
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
                  className="outline-none py-[0.6em] px-[1em] inline-block"
                >
                  {item.label}
                </a>
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

