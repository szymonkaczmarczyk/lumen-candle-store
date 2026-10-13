import { scentFamilySchema } from "@lumen/shared";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RevealText } from "@/components/motion/RevealText";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ family?: string | string[] }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("shopTitle"),
    description: t("shopDescription"),
    alternates: { canonical: locale === "pl" ? "/sklep" : "/en/shop", languages: { pl: "/sklep", en: "/en/shop" } },
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  const { family } = await searchParams;
  const initialFamily = scentFamilySchema.safeParse(family).data ?? null;
  const products = await getProducts(locale);

  return (
    <div className="pb-24 pt-10 md:pb-40 md:pt-16">
      <header className="container-page mb-14 flex flex-col gap-5 md:mb-20">
        <RevealText as="h1" className="type-h1" immediate>
          {t("shop.title")}
        </RevealText>
        <p className="type-body-lg measure text-ink-soft">{t("shop.intro")}</p>
      </header>
      <ProductGrid
        key={initialFamily ?? "all"}
        products={products}
        initialFamily={initialFamily}
        syncUrl
        prioritize
        tileHeading="h2"
        heading={<p key="count" className="type-eyebrow text-ink-soft">{t("shop.count", { count: products.length })}</p>}
      />
    </div>
  );
}
