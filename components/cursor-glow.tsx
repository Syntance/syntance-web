"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const cursorGlow = document.getElementById("cursor-glow");
    if (!cursorGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <div id="cursor-glow" className="cursor-glow" />;
}

