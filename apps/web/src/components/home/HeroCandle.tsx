import Image from "next/image";
import { deepFor } from "@/lib/scent-color";
import { CandleFlame } from "../product/CandleFlame";

interface HeroCandleProps {
  accentColor: string;
  stillUrl: string;
  stillAlt: string;
}

export function HeroCandle({ accentColor, stillUrl, stillAlt }: HeroCandleProps) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: deepFor(accentColor) }}>
      <div className="absolute inset-0" data-hero-candle>
        <Image
          src={stillUrl}
          alt={stillAlt}
          fill
          preload
          loading="eager"
          fetchPriority="high"
          sizes="(max-aspect-ratio: 8/5) 160vh, 100vw"
          className="object-cover object-[50%_30%]"
        />
        <CandleFlame shot="hero" position={[0.5, 0.3]} embers={16} seed="hero" className="hero-flame" />
      </div>
      <div className="hero-ambient" aria-hidden />
    </div>
  );
}
