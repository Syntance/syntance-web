"use client";

import { useLayoutEffect } from "react";

export default function ScrollRestoration() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);
  return null;
}
