"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  // Keep SSR and the first client render still until the preference is known.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
