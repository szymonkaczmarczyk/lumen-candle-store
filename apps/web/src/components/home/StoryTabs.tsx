"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { CandleFlame } from "../product/CandleFlame";

const tabs = ["story", "process", "materials"] as const;

export function StoryTabs({ images }: { images: Record<(typeof tabs)[number], string> }) {
  const t = useTranslations("home");
  const [active, setActive] = useState<(typeof tabs)[number]>("story");

  return (
    <section className="border-t border-line py-20 md:py-32">
      <div className="container-page">
        <div role="tablist" aria-label={t("story.story.title")} className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`story-tab-${tab}`}
              aria-selected={active === tab}
              aria-controls="story-panel"
              onClick={() => setActive(tab)}
              className={clsx("type-eyebrow inline-flex min-h-11 items-center gap-2 px-2 transition-colors", active === tab ? "text-ink" : "text-ink-soft hover:text-ink")}
            >
              <span aria-hidden className={clsx("h-px bg-ink transition-[width] duration-300", active === tab ? "w-4" : "w-0")} />
              {t(`storyTabs.${tab}`)}
            </button>
          ))}
        </div>
        <div id="story-panel" role="tabpanel" aria-labelledby={`story-tab-${active}`} className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <div key={active} className="flex flex-col items-start gap-6 md:sticky md:top-[22svh] md:pt-6">
              <h2 className="type-h2">{t(`story.${active}.title`)}</h2>
              <p className="type-body-lg measure text-ink-soft">{t(`story.${active}.text`)}</p>
              <p className="type-body-lg measure text-ink-soft">{t(`story.${active}.text2`)}</p>
              <Link href="/about" className="type-label inline-flex min-h-11 items-center gap-2 border-b border-ink">
                {t("storyCta")}
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-sand md:aspect-[3/4]">
            {tabs.map((tab) => (
              <div key={tab} className={clsx("absolute inset-0 transition-opacity duration-700", active === tab ? "opacity-100" : "opacity-0")}>
                <Image src={images[tab]} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
                {tab !== "materials" && <CandleFlame shot={tab === "process" ? "top" : "front"} seed={tab} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
