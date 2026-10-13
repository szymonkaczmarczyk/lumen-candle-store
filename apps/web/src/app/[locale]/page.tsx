import { scentFamilies } from "@lumen/shared";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Benefits } from "@/components/home/Benefits";
import { FamilyList, type FamilyEntry } from "@/components/home/FamilyList";
import { FeaturedStack } from "@/components/home/FeaturedStack";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { StoryTabs } from "@/components/home/StoryTabs";
import { ValuesCarousel } from "@/components/home/ValuesCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";
import { imageByRole } from "@/lib/product-images";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("homeTitle") },
    description: t("homeDescription"),
    alternates: { canonical: locale === "pl" ? "/" : "/en", languages: { pl: "/", en: "/en" } },
  };
}

const topImage = (slug: string) => `/products/${slug}-top.webp`;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  const products = await getProducts(locale);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const heroProduct = featured[0] ?? products[0];
  if (!heroProduct) return null;
  const slugs = products.map((product) => product.slug);
  const pick = (index: number) => slugs[index % slugs.length] ?? heroProduct.slug;

  const families: FamilyEntry[] = scentFamilies.flatMap((family) => {
    const first = products.find((product) => product.family === family);
    const image = first ? imageByRole(first.images, "COLOR") : undefined;
    if (!first || !image) return [];
    const label = t(`families.${family}`);
    return [{ family, label, description: t(`familyDescriptions.${family}`), cta: t("home.familyCta", { family: label.toLowerCase() }), imageUrl: image.url, imageAlt: image.alt }];
  });

  return (
    <>
      <Hero product={heroProduct} />
      <FeaturedStack products={featured} />
      <FamilyList entries={families} />
      <ValuesCarousel
        images={[
          { key: "glass", url: topImage(pick(4)) },
          { key: "wick", url: topImage(pick(3)) },
          { key: "wax", url: topImage(pick(2)) },
          { key: "batch", url: topImage(pick(7)) },
        ]}
      />
      <section className="pb-20 md:pb-32" aria-labelledby="grid-title">
        <ProductGrid
          products={products}
          heading={
            <h2 id="grid-title" className="type-h2">
              {t("home.gridTitle")}
            </h2>
          }
        />
      </section>
      <Manifesto images={[topImage(pick(0)), topImage(pick(5)), topImage(pick(6))]} />
      <Benefits imageUrl={`/products/${pick(1)}-color.webp`} />
      <StoryTabs images={{ story: `/products/${pick(4)}-color.webp`, process: topImage(pick(1)), materials: `/products/${pick(2)}-neutral.webp` }} />
    </>
  );
}
