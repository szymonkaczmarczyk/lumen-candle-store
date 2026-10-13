import { clsx } from "clsx";
import type { CSSProperties } from "react";

export type FlameShot = "front" | "top" | "hero";
export type FlameState = "lit" | "hover";

const shots: Record<FlameShot, { width: number; height: number; x: number; y: number; flameHeight: number }> = {
  front: { width: 1200, height: 1500, x: 0.5, y: 0.3097, flameHeight: 0.0744 },
  top: { width: 1200, height: 1500, x: 0.5, y: 0.3831, flameHeight: 0.0538 },
  hero: { width: 2400, height: 1500, x: 0.5, y: 0.2014, flameHeight: 0.0522 },
};

interface CandleFlameProps {
  shot: FlameShot;
  state?: FlameState;
  fit?: "cover" | "contain";
  position?: [number, number];
  seed?: string;
  embers?: number;
  className?: string;
}

const delayFrom = (seed: string) => {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return `${-(hash % 40) / 10}s`;
};

export function CandleFlameDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <radialGradient id="candle-flame-outer" cx="50%" cy="78%" r="70%">
          <stop offset="0" stopColor="#fff7e0" />
          <stop offset="0.35" stopColor="#ffd27a" />
          <stop offset="0.75" stopColor="#ff9b2f" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="candle-flame-core" cx="50%" cy="80%" r="60%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fff3cf" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CandleFlame({ shot, state = "lit", fit = "cover", position = [0.5, 0.5], seed = shot, embers = 0, className }: CandleFlameProps) {
  const geometry = shots[shot];
  const style = {
    "--iw": geometry.width,
    "--ih": geometry.height,
    "--fx": geometry.x,
    "--fy": geometry.y,
    "--fh": geometry.flameHeight,
    "--ox": position[0],
    "--oy": position[1],
    "--flame-delay": delayFrom(seed),
  } as CSSProperties;

  return (
    <span aria-hidden data-fit={fit} data-state={state} className={clsx("candle-flame-layer", className)} style={style}>
      <span className="candle-flame">
        <span className="candle-flame-glow" />
        {Array.from({ length: embers }, (_, index) => (
          <span
            key={index}
            className="candle-ember"
            style={
              {
                "--ember-x": `${((index * 37) % 13) - 6}cqw`,
                "--ember-rise": `${30 + ((index * 53) % 26)}cqh`,
                "--ember-duration": `${4 + ((index * 29) % 5)}s`,
                "--ember-delay": `${-((index * 71) % 60) / 10}s`,
              } as CSSProperties
            }
          />
        ))}
        <span className="candle-flame-sway">
          <svg viewBox="0 0 40 120" className="candle-flame-body">
            <path d="M20 2 C 27 30, 38 58, 37 84 C 36 106, 28 118, 20 118 C 12 118, 4 106, 3 84 C 2 58, 13 30, 20 2 Z" fill="url(#candle-flame-outer)" />
            <path d="M20 40 C 24 60, 29 76, 28 92 C 27 106, 24 112, 20 112 C 16 112, 13 106, 12 92 C 11 76, 16 60, 20 40 Z" fill="url(#candle-flame-core)" />
            <ellipse cx="20" cy="112" rx="5" ry="6" fill="#6f8cff" opacity="0.45" />
          </svg>
        </span>
      </span>
    </span>
  );
}
