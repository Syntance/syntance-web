"use client";

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Ustaw początkową wartość
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Sprawdź przy montowaniu
    checkMobile();

    // Nasłuchuj zmian rozmiaru okna
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
