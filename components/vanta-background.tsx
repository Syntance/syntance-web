"use client";

import { useEffect, useRef } from "react";

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    const loadVanta = async () => {
      // Load Three.js
      const THREE = await import("three");
      (window as any).THREE = THREE;

      // Load Vanta Globe
      const VANTA = await import("vanta/dist/vanta.globe.min.js");

      if (vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = (VANTA as any).default({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x8a63ff,
          backgroundColor: 0x05030c,
          size: 1.5,
          showDots: false,
        });
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return <div ref={vantaRef} className="fixed inset-0 z-0" />;
}

