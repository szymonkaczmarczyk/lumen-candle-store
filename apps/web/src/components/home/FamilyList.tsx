"use client";

import type { ScentFamily } from "@lumen/shared";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { gsap, motionQuery, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CandleFlame } from "../product/CandleFlame";

export interface FamilyEntry {
  family: ScentFamily;
  label: string;
  description: string;
  cta: string;
  imageUrl: string;
  imageAlt: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function FamilyList({ entries }: { entries: FamilyEntry[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const current = entries[active];
  const count = entries.length;

  const activate = (index: number) => {
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);
    setSeen((previous) => (previous.has(index) ? previous : new Set(previous).add(index)));
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || count < 2) return;
      gsap.matchMedia().add(motionQuery, () => {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.6 * count}`,
          pin: true,
          scrub: true,
          snap: { snapTo: (value) => (Math.min(count - 1, Math.floor(value * count)) + 0.5) / count, duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: "power2.out" },
          onEnter: () => setSeen(new Set(entries.map((_, index) => index))),
          onUpdate: (self) => activate(Math.min(count - 1, Math.floor(self.progress * count))),
        });
        return () => trigger.kill();
      });
    },
    { scope: sectionRef, dependencies: [count] },
  );

  return (
    <section ref={sectionRef} className="flex min-h-svh items-center bg-ivory" aria-label={entries.map((entry) => entry.label).join(", ")}>
      <div className="container-page grid w-full items-center gap-6 py-10 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-16">
        <div className="relative aspect-[4/3] max-h-[40svh] w-full overflow-hidden bg-sand md:aspect-[4/5] md:max-h-[82svh]">
          {entries.map((entry, index) =>
            seen.has(index) ? (
              <Image
                key={entry.family}
                src={entry.imageUrl}
                alt={entry.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={clsx(
                  "object-cover transition-[opacity,scale] duration-700 ease-out-soft",
                  index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
                )}
              />
            ) : null,
          )}
          <CandleFlame shot="front" seed="families" />
        </div>
        <div className="flex flex-col justify-center gap-6 md:gap-10">
          <ul className="flex flex-col">
            {entries.map((entry, index) => (
              <li key={entry.family}>
                <Link
                  href={{ pathname: "/shop", query: { family: entry.family } }}
                  onMouseEnter={() => activate(index)}
                  onFocus={() => activate(index)}
                  className={clsx(
                    "type-h2 flex items-baseline gap-4 py-0.5 transition-[color,translate] duration-500 ease-out-soft md:py-1",
                    index === active ? "translate-x-0 text-ink md:translate-x-3" : "text-ink/45 hover:text-ink/75",
                  )}
                >
                  <span className={clsx("type-eyebrow tabular-nums transition-opacity duration-500", index === active ? "opacity-100" : "opacity-0")} aria-hidden>
                    {pad(index + 1)}
                  </span>
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
          {current && (
            <div className="flex flex-col items-start gap-4 md:gap-5" aria-live="polite">
              <div className="flex w-full max-w-sm items-center gap-3">
                <span className="type-eyebrow tabular-nums text-ink-soft">
                  {pad(active + 1)} / {pad(count)}
                </span>
                <span className="relative h-px flex-1 bg-line">
                  <span className="absolute inset-0 origin-left bg-ink transition-[scale] duration-500 ease-out-soft" style={{ scale: `${(active + 1) / count} 1` }} />
                </span>
              </div>
              <p className="type-body measure text-ink-soft">{current.description}</p>
              <Link href={{ pathname: "/shop", query: { family: current.family } }} className="type-label inline-flex min-h-11 items-center gap-2 border-b border-ink">
                {current.cta}
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
