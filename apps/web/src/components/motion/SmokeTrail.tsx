"use client";

import { useId, useRef } from "react";
import { clsx } from "clsx";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, motionQuery, useGSAP } from "@/lib/gsap";

gsap.registerPlugin(DrawSVGPlugin);

const wisps = [
  "M60 600 C 20 520, 110 470, 70 400 S 10 300, 80 230 S 130 120, 60 40",
  "M75 600 C 120 540, 30 480, 85 410 S 140 320, 70 250 S 20 140, 95 60",
  "M50 600 C 90 560, 10 500, 55 430 S 100 330, 40 270 S 0 170, 50 100",
];

export function SmokeTrail({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const gradientId = `smoke-${useId().replace(/:/g, "")}`;

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>("path", ref.current);
      gsap.matchMedia().add(motionQuery, () => {
        gsap.fromTo(
          paths,
          { drawSVG: "0% 0%" },
          {
            drawSVG: "0% 100%",
            ease: "none",
            stagger: 0.15,
            scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 30%", scrub: 1.2 },
          },
        );
        gsap.to(paths, { x: "random(-6, 6)", duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.6 });
      });
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} viewBox="0 0 150 620" fill="none" aria-hidden className={clsx("pointer-events-none", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b08a55" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#b08a55" stopOpacity="0.35" />
          <stop offset="1" stopColor="#b08a55" stopOpacity="0" />
        </linearGradient>
      </defs>
      {wisps.map((d, index) => (
        <path key={d} d={d} stroke={`url(#${gradientId})`} strokeWidth={index === 0 ? 1.5 : 1} strokeLinecap="round" opacity={1 - index * 0.25} />
      ))}
    </svg>
  );
}
