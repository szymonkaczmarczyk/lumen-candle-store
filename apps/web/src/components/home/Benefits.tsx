import { formatPrice, freeShippingThresholdGrosze, shippingPriceGrosze, type Locale } from "@lumen/shared";
import { ArrowUpRight, Package, RotateCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CandleFlame } from "../product/CandleFlame";
import { RevealText } from "../motion/RevealText";

const items: { key: "shipping" | "returns" | "dispatch" | "payments"; icon: LucideIcon }[] = [
  { key: "shipping", icon: Truck },
  { key: "returns", icon: RotateCcw },
  { key: "dispatch", icon: Package },
  { key: "payments", icon: ShieldCheck },
];

export async function Benefits({ imageUrl }: { imageUrl: string }) {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;

  return (
    <section className="bg-night py-20 text-cream md:py-32" aria-labelledby="benefits-title" data-header-dark>
      <div className="container-page grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xs md:aspect-[4/5]">
          <Image src={imageUrl} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover object-[50%_40%]" />
          <CandleFlame shot="front" position={[0.5, 0.4]} seed="benefits" />
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <p className="type-eyebrow text-gold-light">{t("benefitsEyebrow")}</p>
            <RevealText id="benefits-title" className="type-h2 max-w-[14ch]">
              {t("benefitsTitle")}
            </RevealText>
          </div>
          <ol className="flex flex-col">
            {items.map(({ key, icon: Icon }, index) => (
              <li key={key} className="group grid grid-cols-[3rem_1fr] gap-x-5 border-t border-cream/15 py-6 last:border-b">
                <span className="flex size-12 items-center justify-center rounded-xs border border-cream/15 text-gold-light transition-colors duration-300 group-hover:border-gold-light/60 group-hover:bg-cream/5">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="type-h4">{t(`benefits.${key}.title`)}</h3>
                    <span className="type-eyebrow tabular-nums text-cream-soft" aria-hidden>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="type-caption measure text-cream-soft">
                    {t(`benefits.${key}.text`, {
                      threshold: formatPrice(freeShippingThresholdGrosze, locale),
                      locker: formatPrice(shippingPriceGrosze.PARCEL_LOCKER, locale),
                      courier: formatPrice(shippingPriceGrosze.COURIER, locale),
                    })}
                  </p>
                  {key === "shipping" && (
                    <Link href="/shipping" className="type-label mt-1 inline-flex min-h-11 items-center gap-2 self-start border-b border-cream/40 text-cream transition-colors hover:border-cream">
                      {t("benefits.shipping.cta")}
                      <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
