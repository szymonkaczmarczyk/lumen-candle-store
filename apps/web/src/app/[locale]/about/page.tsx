import "@fontsource/pinyon-script/400.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FlameMark } from "@/components/brand/Logo";
import { RevealText } from "@/components/motion/RevealText";
import { SmokeTrail } from "@/components/motion/SmokeTrail";
import Image from "next/image";
import { buttonStyles } from "@/components/ui/button-styles";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/lib/locale";
import { CandleFlame } from "@/components/product/CandleFlame";

const steps = ["compose", "pour", "cure", "pack"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    alternates: { canonical: locale === "pl" ? "/o-nas" : "/en/about", languages: { pl: "/o-nas", en: "/en/about" } },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  await resolveLocale(params);
  const t = await getTranslations("about");

  return (
    <>
      <section className="container-page grid gap-12 pb-24 pt-12 md:pb-40 md:pt-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:pt-8">
        <div className="flex flex-col gap-6">
          <p className="type-eyebrow text-gold-text">{t("eyebrow")}</p>
          <RevealText as="h1" className="type-h1" immediate>
            {t("title")}
          </RevealText>
          <p className="type-body-lg measure text-ink-soft">{t("intro")}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-sand md:aspect-[4/3] lg:aspect-auto lg:h-[min(calc(100svh-var(--announcement-h)-var(--header-h)-4rem),56rem)]">
          <Image src="/products/ambra-nocturna-top.webp" alt="" fill preload loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <CandleFlame shot="top" seed="about" />
        </div>
      </section>

      <section className="bg-night py-24 text-cream md:py-40" aria-labelledby="process-title">
        <div className="container-page flex flex-col gap-12 md:gap-20">
          <div className="flex flex-col gap-3">
            <p className="type-eyebrow text-gold-light">{t("processEyebrow")}</p>
            <RevealText id="process-title" className="type-h2 max-w-[16ch]">
              {t("processTitle")}
            </RevealText>
          </div>
          <ol className="grid gap-10 md:grid-cols-2 md:gap-x-16 md:gap-y-20">
            {steps.map((step, index) => (
              <li key={step} className="flex flex-col gap-4 border-t border-cream/15 pt-6">
                <span className="type-eyebrow text-gold-light tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="type-h3">{t(`steps.${step}.title`)}</h3>
                <p className="type-body measure text-cream-soft">{t(`steps.${step}.text`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page grid gap-10 py-24 md:grid-cols-[auto_1fr] md:gap-20 md:py-40" aria-labelledby="note-title">
        <div className="relative self-start">
          <SmokeTrail className="absolute bottom-[90%] left-1/2 hidden h-56 w-auto -translate-x-1/2 md:block" />
          <FlameMark className="relative h-24 w-auto text-gold md:h-40" />
        </div>
        <div className="relative flex max-w-3xl flex-col gap-8">
          <p id="note-title" className="type-eyebrow text-gold-text">
            {t("noteEyebrow")}
          </p>
          <blockquote className="font-display text-[24px] leading-[1.3] tracking-[-0.02em] md:text-[30px]">{t("note")}</blockquote>
          <div className="flex flex-col gap-1">
            <p className="font-signature text-4xl leading-tight text-gold-text md:text-5xl">{t("signature")}</p>
            <p className="type-caption text-ink-soft">{t("signatureRole")}</p>
          </div>
          <Link href="/shop" className={buttonStyles("primary", "self-start")}>
            {t("cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
