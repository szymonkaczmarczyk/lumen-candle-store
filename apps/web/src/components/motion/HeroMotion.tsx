"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motionQuery, useGSAP } from "@/lib/gsap";

export function HeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(motionQuery, () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro.from("[data-hero-art]", { scale: 1.08, duration: 2.4 }).from("[data-hero-panel]", { y: 48, duration: 1.2 }, 0.2);

        gsap.to("[data-hero-art]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-scroll]", {
          y: -40,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "center center", end: "bottom top", scrub: true },
        });

        if (!window.matchMedia("(pointer: fine)").matches) return;
        const moveX = gsap.quickTo("[data-hero-candle]", "x", { duration: 1.4, ease: "power3.out" });
        const moveY = gsap.quickTo("[data-hero-candle]", "y", { duration: 1.4, ease: "power3.out" });
        const onPointerMove = (event: PointerEvent) => {
          moveX((event.clientX / window.innerWidth - 0.5) * -28);
          moveY((event.clientY / window.innerHeight - 0.5) * -16);
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        return () => window.removeEventListener("pointermove", onPointerMove);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
