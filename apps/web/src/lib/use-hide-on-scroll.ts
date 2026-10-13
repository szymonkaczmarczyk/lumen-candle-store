"use client";

import { useEffect, useState } from "react";
import { revealHeaderEvent } from "./fly-to-cart";

const revealZone = 120;
const threshold = 6;

export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < revealZone) setHidden(false);
      else if (delta > threshold) setHidden(true);
      else if (delta < -threshold) setHidden(false);
      if (Math.abs(delta) > threshold || y < revealZone) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const reveal = () => {
      lastY = window.scrollY;
      setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(revealHeaderEvent, reveal);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(revealHeaderEvent, reveal);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}
