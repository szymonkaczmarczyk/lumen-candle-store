import { formatPrice, freeShippingThresholdGrosze, shippingPriceGrosze, type ShippingMethod } from "@lumen/shared";
import { Package, Truck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RevealText } from "@/components/motion/RevealText";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "shipping" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: locale === "pl" ? "/dostawa" : "/en/shipping", languages: { pl: "/dostawa", en: "/en/shipping" } },
  };
}

const methods: { method: ShippingMethod; icon: typeof Truck }[] = [
  { method: "PARCEL_LOCKER", icon: Package },
  { method: "COURIER", icon: Truck },
];

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("shipping");
  const threshold = formatPrice(freeShippingThresholdGrosze, locale);
  const sections = ["dispatch", "returns", "damage", "payments"] as const;

  return (
    <div className="container-page pb-24 pt-10 md:pb-40 md:pt-16">
      <header className="mb-14 flex flex-col gap-5 md:mb-20">
        <RevealText as="h1" className="type-h1" immediate>
          {t("title")}
        </RevealText>
        <p className="type-body-lg measure text-ink-soft">{t("intro", { threshold })}</p>
      </header>

      <section aria-labelledby="rates-title" className="mb-20 md:mb-32">
        <h2 id="rates-title" className="type-label mb-6">
          {t("ratesTitle")}
        </h2>
        <ul className="flex flex-col gap-3 md:hidden">
          {methods.map(({ method, icon: Icon }) => (
            <li key={method} className="flex flex-col gap-3 bg-sand p-4">
              <span className="flex items-center gap-3">
                <Icon className="size-5 text-gold-text" strokeWidth={1.5} aria-hidden />
                <span className="type-body font-medium">{t(`methods.${method}.name`)}</span>
              </span>
              <span className="type-caption text-ink-soft">{t(`methods.${method}.note`)}</span>
              <dl className="type-caption grid grid-cols-2 gap-y-1 border-t border-line pt-3">
                <dt className="text-ink-soft">{t("colTime")}</dt>
                <dd className="text-right">{t("time")}</dd>
                <dt className="text-ink-soft">{t("colPrice", { threshold })}</dt>
                <dd className="text-right tabular-nums">{formatPrice(shippingPriceGrosze[method], locale)}</dd>
                <dt className="text-ink-soft">{t("colFree", { threshold })}</dt>
                <dd className="text-right text-success">{t("free")}</dd>
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="type-eyebrow border-b border-ink text-ink-soft">
                <th scope="col" className="py-3 pr-4 font-normal">{t("colMethod")}</th>
                <th scope="col" className="py-3 pr-4 font-normal">{t("colTime")}</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">{t("colPrice", { threshold })}</th>
                <th scope="col" className="py-3 text-right font-normal">{t("colFree", { threshold })}</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(({ method, icon: Icon }) => (
                <tr key={method} className="border-b border-line">
                  <th scope="row" className="py-5 pr-4 font-normal">
                    <span className="flex items-center gap-3">
                      <Icon className="size-5 text-gold-text" strokeWidth={1.5} aria-hidden />
                      <span className="type-body font-medium">{t(`methods.${method}.name`)}</span>
                    </span>
                    <span className="type-caption mt-1 block pl-8 text-ink-soft">{t(`methods.${method}.note`)}</span>
                  </th>
                  <td className="type-body py-5 pr-4">{t("time")}</td>
                  <td className="type-body py-5 pr-4 text-right tabular-nums">{formatPrice(shippingPriceGrosze[method], locale)}</td>
                  <td className="type-body py-5 text-right text-success">{t("free")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-12 md:grid-cols-2 md:gap-x-20 md:gap-y-16">
        {sections.map((key) => (
          <section key={key} className="flex flex-col gap-4 border-t border-ink pt-5">
            <h2 className="type-h3">{t(`${key}.title`)}</h2>
            <p className="type-body measure text-ink-soft">{t(`${key}.text`)}</p>
          </section>
        ))}
      </div>

      <p className="type-caption mt-16 text-ink-soft">
        {t.rich("termsNote", { link: (chunks) => <Link href="/terms" className="underline underline-offset-2">{chunks}</Link> })}
      </p>
    </div>
  );
}
