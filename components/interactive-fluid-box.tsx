'use client';

import SplashCursorContained from './splash-cursor-contained';

export default function InteractiveFluidBox() {
  return (
    <div className="h-96 w-full border border-gray-800 rounded-2xl relative overflow-hidden">
      <SplashCursorContained />
    </div>
  );
}

