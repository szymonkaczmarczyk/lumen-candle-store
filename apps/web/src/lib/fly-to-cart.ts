"use client";

import { gsap, reducedMotionQuery } from "./gsap";

export const revealHeaderEvent = "lumen:reveal-header";

const centerOf = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

export function flyToCart(source: Element | null, onDone: () => void) {
  const target = document.querySelector<HTMLElement>("[data-cart-button]");
  window.dispatchEvent(new Event(revealHeaderEvent));
  if (!source || !target || window.matchMedia(reducedMotionQuery).matches) {
    onDone();
    return;
  }
  const start = centerOf(source.querySelector(".candle-flame-body") ?? source);
  const spark = document.createElement("span");
  spark.setAttribute("aria-hidden", "true");
  spark.className = "cart-spark";
  Object.assign(spark.style, { left: `${start.x}px`, top: `${start.y}px` });
  document.body.appendChild(spark);

  const easeX = gsap.parseEase("power2.in");
  const easeY = gsap.parseEase("power3.out");
  const flight = { progress: 0 };

  gsap.fromTo(spark, { scale: 0.2, opacity: 0 }, { scale: 1.3, opacity: 1, duration: 0.18, ease: "power2.out" });
  gsap.to(flight, {
    progress: 1,
    duration: 0.85,
    delay: 0.12,
    ease: "none",
    onUpdate: () => {
      const end = centerOf(target);
      const t = flight.progress;
      gsap.set(spark, { x: (end.x - start.x) * easeX(t), y: (end.y - start.y) * easeY(t), scale: 1.3 - 0.8 * t });
    },
    onComplete: () => {
      spark.remove();
      gsap.fromTo(target, { scale: 1.18 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)", clearProps: "transform" });
      onDone();
    },
  });
}
