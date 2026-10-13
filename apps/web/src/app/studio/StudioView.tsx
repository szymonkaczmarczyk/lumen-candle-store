"use client";

import { CandleScene, type CandleView } from "@/components/three/CandleScene";
import { backdropFor, deepFor } from "@/lib/scent-color";

interface StudioViewProps {
  glass: string;
  name: string;
  caption: string;
  view?: string;
  backdrop?: string;
  flame?: string;
}

export function StudioView({ glass, name, caption, view, backdrop, flame }: StudioViewProps) {
  const background = backdrop === "neutral" ? "#f3f0ea" : backdrop === "deep" ? deepFor(glass) : backdropFor(glass);
  const safeView: CandleView = view === "top" || view === "detail" || view === "hero" ? view : "front";
  return (
    <div style={{ width: "100vw", height: "100vh" }} data-studio-ready>
      <CandleScene glassColor={glass} background={background} name={name} caption={caption} view={safeView} lit={flame !== "off"} flameBody={flame !== "light"} />
    </div>
  );
}
