'use client';

import { useState } from 'react';
import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`h-96 w-full backdrop-filter bg-gray-900 bg-opacity-20 border border-gray-800 rounded-2xl relative overflow-hidden transition-all duration-500 ${
        isHovered ? 'backdrop-blur-none' : 'backdrop-blur-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SplashCursorContained />
    </div>
  );
}

