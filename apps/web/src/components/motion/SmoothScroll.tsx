"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { gsap, reducedMotionQuery, ScrollTrigger } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/lenis";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(reducedMotionQuery).matches) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.12, anchors: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
