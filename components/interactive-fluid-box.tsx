'use client';

import { useState, useRef, useEffect } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;
      
      setIsHovered(isInside);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`h-96 w-full backdrop-filter bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden transition-all duration-500 ${
        isHovered ? 'backdrop-blur-none' : 'backdrop-blur-sm'
      }`}
    >
      <SplashCursorContained />
    </div>
  );
}

