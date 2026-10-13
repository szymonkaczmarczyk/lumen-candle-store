"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motionQuery, SplitText, useGSAP } from "@/lib/gsap";

interface RevealTextProps {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  id?: string;
  immediate?: boolean;
  delay?: number;
}

export function RevealText({ as: Tag = "h2", children, className, id, immediate = false, delay = 0 }: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add(motionQuery, () => {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "reveal-line",
          aria: "none",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 130,
              duration: 1.1,
              stagger: 0.09,
              delay,
              scrollTrigger: immediate ? undefined : { trigger: element, start: "top 88%", once: true },
            }),
        });
        gsap.set(element, { visibility: "visible" });
        return () => split.revert();
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(element, { visibility: "visible" });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal>
      {children}
    </Tag>
  );
}
