"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motionQuery, useGSAP } from "@/lib/gsap";

export function StackMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(`${motionQuery} and (min-width: 768px)`, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", ref.current);
        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;
          gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
            scale: 0.94,
            filter: "brightness(0.7)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: () => `top ${Number.parseFloat(getComputedStyle(next).top) || 96}px`, scrub: true },
          });
        });
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
