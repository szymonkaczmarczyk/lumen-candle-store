import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { RevealText } from "../motion/RevealText";

function InlineImage({ src }: { src: string }) {
  return (
    <span className="relative mx-[0.12em] inline-block h-[0.8em] w-[1.3em] translate-y-[0.08em] overflow-hidden rounded-xs align-baseline">
      <Image src={src} alt="" fill sizes="120px" className="object-cover" />
    </span>
  );
}

export async function Manifesto({ images }: { images: [string, string, string] }) {
  const t = await getTranslations("home");

  return (
    <section className="container-page pb-44 pt-24 md:pb-72 md:pt-40">
      <RevealText as="p" className="mx-auto max-w-[22ch] text-center font-display text-[34px] leading-[1.05] tracking-[-0.035em] md:text-[64px] lg:text-[72px]">
        {t("manifestoA")}
        <InlineImage src={images[0]} />
        {t("manifestoB")}
        <InlineImage src={images[1]} />
        {t("manifestoC")}
        <InlineImage src={images[2]} />
        <span className="text-ink-soft">{t("manifestoD")}</span>
      </RevealText>
    </section>
  );
}
