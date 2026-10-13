import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { clsx } from "clsx";
import { RevealText } from "../motion/RevealText";
import { CandleFlame } from "../product/CandleFlame";
import { DragScroll } from "../ui/DragScroll";

export interface ValueImage {
  key: "wax" | "wick" | "glass" | "batch";
  url: string;
}

export async function ValuesCarousel({ images }: { images: ValueImage[] }) {
  const t = await getTranslations("home");

  return (
    <section className="py-20 md:py-32" aria-labelledby="values-title">
      <div className="container-page flex flex-col gap-6">
        <p className="type-eyebrow text-ink-soft">{t("valuesEyebrow")}</p>
        <RevealText id="values-title" className="type-h2 max-w-[24ch]">
          {t("valuesTitle")}
        </RevealText>
      </div>
      <DragScroll
        tabIndex={0}
        aria-label={t("valuesEyebrow")}
        className="mt-12 flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] items-start gap-3 overflow-x-auto px-[var(--spacing-gutter)] pb-2 focus-visible:outline-offset-[-2px] md:mt-20 md:gap-4 md:scroll-px-6 md:px-6 lg:scroll-px-8 lg:px-8"
        data-lenis-prevent-wheel
      >
        {images.map((image, index) => (
          <li key={image.key} className={clsx("flex shrink-0 snap-start flex-col gap-3", index % 2 === 0 ? "w-[72vw] md:w-[30vw]" : "w-[60vw] md:mt-24 md:w-[24vw]")}>
            <div className={clsx("relative overflow-hidden bg-sand", index % 2 === 0 ? "aspect-[4/5]" : "aspect-square")}>
              <Image src={image.url} alt="" fill sizes="(min-width: 768px) 30vw, 72vw" className="object-cover" />
              <CandleFlame shot="top" seed={image.key} />
            </div>
            <h3 className="type-caption font-medium">{t(`values.${image.key}.title`)}</h3>
            <p className="type-caption -mt-2 text-ink-soft">{t(`values.${image.key}.text`)}</p>
          </li>
        ))}
      </DragScroll>
    </section>
  );
}
