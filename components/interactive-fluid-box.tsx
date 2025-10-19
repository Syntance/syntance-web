'use client';

import { useState, useRef, useEffect } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;
      
      if (isInside) {
        // Clear any pending timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsHovered(true);
      } else if (isHovered) {
        // Delay blur return by 3 seconds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsHovered(false);
        }, 3000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  return (
    <div 
      ref={containerRef}
      className={`h-96 w-full bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden transition-all duration-1000 ${
        isHovered ? '' : 'backdrop-filter backdrop-blur-sm'
      }`}
    >
      <SplashCursorContained />
    </div>
  );
}

