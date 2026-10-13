import type { ProductSummary } from "@lumen/shared";
import { ArrowDown, Flame, Package, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroMotion } from "../motion/HeroMotion";
import { RevealText } from "../motion/RevealText";
import { buttonStyles } from "../ui/button-styles";
import { HeroCandle } from "./HeroCandle";

export async function Hero({ product }: { product: ProductSummary }) {
  const t = await getTranslations("home");

  return (
    <section className="relative -mt-[var(--header-h)] overflow-hidden bg-night text-cream" aria-labelledby="hero-title" data-header-dark>
      <HeroMotion className="relative flex min-h-[calc(100svh-var(--announcement-h))] flex-col justify-end">
        <div className="pointer-events-none absolute inset-0" aria-hidden data-hero-art>
          <HeroCandle
            accentColor={product.accentColor}
            stillUrl={`/products/${product.slug}-hero.webp`}
            stillAlt=""
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/80 to-transparent" aria-hidden />
        <div data-hero-scroll className="relative z-10 mx-auto w-full max-w-[60rem] px-[var(--spacing-gutter)] pb-4 md:pb-8">
          <div data-hero-panel className="glass-panel flex flex-col rounded-xs">
            <div className="type-eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-cream/10 px-4 py-3 text-cream-soft md:px-5">
              <span className="inline-flex items-center gap-2 text-flame">
                <Flame className="size-3.5" strokeWidth={1.75} aria-hidden />
                {t("heroMetaLeft")}
              </span>
              <span className="hidden items-center gap-2 md:inline-flex">
                <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
                {t("heroMetaCenter")}
              </span>
              <span className="inline-flex items-center gap-2">
                {t("heroMetaRight")}
                <Package className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
            </div>
            <div className="flex flex-col gap-6 px-4 pb-4 pt-8 md:flex-row md:items-end md:justify-between md:px-5 md:pb-5 md:pt-16">
              <RevealText as="h1" id="hero-title" className="type-h1 max-w-[11ch]" immediate delay={0.35}>
                {t("heroTitle")}
              </RevealText>
              <a href="#kolekcja" className={buttonStyles("primary", "self-start md:self-end")}>
                {t("heroCta")}
                <ArrowDown className="size-4" strokeWidth={1.75} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </HeroMotion>
    </section>
  );
}
