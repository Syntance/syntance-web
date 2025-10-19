'use client';

import { useState, useRef } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [showBlur, setShowBlur] = useState(false);
  const [animateBlur, setAnimateBlur] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetBlurTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Remove blur immediately when mouse moves
    setShowBlur(false);
    setAnimateBlur(false);
    
    // Set new timeout - start blur animation after 3 seconds of no movement
    if (isInside) {
      timeoutRef.current = setTimeout(() => {
        setShowBlur(true);
        // Start animation after a tiny delay to trigger CSS transition
        animationTimeoutRef.current = setTimeout(() => {
          setAnimateBlur(true);
        }, 50);
      }, 3000);
    }
  };

  const handleMouseEnter = () => {
    setIsInside(true);
    setShowBlur(false);
    setAnimateBlur(false);
    resetBlurTimeout();
  };

  const handleMouseLeave = () => {
    setIsInside(false);
    // Clear timeouts when leaving
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    // Blur returns immediately when mouse leaves
    setShowBlur(true);
    setAnimateBlur(true);
  };

  const handleMouseMove = () => {
    if (isInside) {
      resetBlurTimeout();
    }
  };

  return (
    <div 
      className={`h-96 w-full bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden ${
        showBlur ? 'backdrop-filter transition-all duration-[2000ms]' : ''
      } ${
        animateBlur ? 'backdrop-blur-sm' : 'backdrop-blur-none'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <SplashCursorContained />
    </div>
  );
}

