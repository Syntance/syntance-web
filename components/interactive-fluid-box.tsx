'use client';

import { useState, useRef } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [isHovered, setIsHovered] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetBlurTimeout = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Remove blur immediately when mouse moves
    setIsHovered(true);
    
    // Set new timeout - blur returns after 3 seconds of no movement
    if (isInside) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    }
  };

  const handleMouseEnter = () => {
    setIsInside(true);
    setIsHovered(true);
    resetBlurTimeout();
  };

  const handleMouseLeave = () => {
    setIsInside(false);
    // Clear timeout when leaving
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Blur returns immediately when mouse leaves
    setIsHovered(false);
  };

  const handleMouseMove = () => {
    if (isInside) {
      resetBlurTimeout();
    }
  };

  return (
    <div 
      className={`h-96 w-full bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden transition-all duration-1000 ${
        isHovered ? '' : 'backdrop-filter backdrop-blur-sm'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <SplashCursorContained />
    </div>
  );
}

