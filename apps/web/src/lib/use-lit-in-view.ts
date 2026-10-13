"use client";

import { useEffect, useState, type RefObject } from "react";

export function useLitInView(ref: RefObject<HTMLElement | null>) {
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(hover: none)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setLit(Boolean(entry?.isIntersecting)), { rootMargin: "-30% 0px -30% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return lit;
}
