'use client';

import { useState, useRef } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Clear any pending timeout when mouse enters
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Set timeout for blur to return after 9 seconds
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 9000);
  };

  return (
    <div 
      className={`h-96 w-full bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden transition-all duration-1000 ${
        isHovered ? '' : 'backdrop-filter backdrop-blur-sm'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SplashCursorContained />
    </div>
  );
}

