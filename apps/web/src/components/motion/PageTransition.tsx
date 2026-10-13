"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motionQuery, useGSAP } from "@/lib/gsap";

let hasRenderedOnce = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!hasRenderedOnce) {
        hasRenderedOnce = true;
        return;
      }
      gsap.matchMedia().add(motionQuery, () => {
        gsap.from(ref.current, { autoAlpha: 0, y: 18, duration: 0.7, clearProps: "transform,opacity,visibility" });
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
