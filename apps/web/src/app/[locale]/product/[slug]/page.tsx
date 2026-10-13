import { formatPrice, freeShippingThresholdGrosze, shippingPriceGrosze } from "@lumen/shared";
import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RevealText } from "@/components/motion/RevealText";
import { BuyBar } from "@/components/product/BuyBar";
import { PairingCard } from "@/components/product/PairingCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductName } from "@/components/product/ProductName";
import { ProductTile } from "@/components/product/ProductTile";
import { Link } from "@/i18n/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { resolveLocale } from "@/lib/locale";
import { imageByRole } from "@/lib/product-images";
import { backdropFor, isDark } from "@/lib/scent-color";
import { siteUrl } from "@/lib/site";
import { CandleFlame } from "@/components/product/CandleFlame";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const product = await getProduct(locale, slug);
  if (!product) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const notes = [...product.notes.top, ...product.notes.heart, ...product.notes.base].slice(0, 4).join(", ");
  const image = imageByRole(product.images, "COLOR");
  return {
    title: product.name,
    description: t("productDescription", {
      name: product.name,
      tagline: product.tagline.toLowerCase(),
      notes,
      price: formatPrice(product.fromPriceGrosze, locale),
    }),
    openGraph: image ? { images: [{ url: image.url, width: 1200, height: 1500, alt: image.alt }] } : undefined,
    alternates: {
      canonical: locale === "pl" ? `/produkt/${slug}` : `/en/product/${slug}`,
      languages: { pl: `/produkt/${slug}`, en: `/en/product/${slug}` },
    },
  };
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="type-label">{title}</span>
        <ChevronDown className="size-4 shrink-0 transition-transform duration-300 ease-out-soft group-open:rotate-180" strokeWidth={1.5} aria-hidden />
      </summary>
      <div className="type-body measure pb-6 text-ink-soft">{children}</div>
    </details>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="flex flex-col gap-4 border-t border-ink pt-4">
      <h3 className="type-label">{title}</h3>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row} className="type-caption text-ink-soft">
            {row}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const [product, allProducts] = await Promise.all([getProduct(locale, slug), getProducts(locale)]);
  if (!product) notFound();

  const t = await getTranslations();
  const familyName = t(`families.${product.family}`);
  const care = t.raw("product.care") as string[];
  const highlights = t.raw("product.highlights") as string[];
  const background = backdropFor(product.accentColor);
  const others = allProducts.filter((item) => item.id !== product.id);
  const pairing = others.find((item) => item.family !== product.family && item.available) ?? others[0];
  const related = [...others.filter((item) => item.family === product.family), ...others.filter((item) => item.family !== product.family)].slice(0, 4);
  const top = imageByRole(product.images, "TOP");
  const smallest = product.variants[0] ?? product.defaultVariant;

  const productUrl = `${siteUrl}${locale === "pl" ? `/produkt/${slug}` : `/en/product/${slug}`}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => `${siteUrl}${image.url}`),
    brand: { "@type": "Brand", name: "Lumen" },
    category: familyName,
    url: productUrl,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      price: (variant.priceGrosze / 100).toFixed(2),
      priceCurrency: "PLN",
      availability: variant.stockStatus === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: productUrl,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductGallery images={product.images} label={t("product.galleryLabel", { name: product.name })} background={background} dark={isDark(background)} />

      <header className="container-page flex flex-col gap-3 border-b border-line py-8 md:flex-row md:items-end md:justify-between md:py-10">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow text-ink-soft">{familyName}</p>
          <h1 className="type-h2">
            <ProductName name={product.name} />
          </h1>
        </div>
        <p className="type-body-lg text-ink-soft md:text-right">{product.tagline}</p>
      </header>

      <section className="container-page py-16 md:py-28">
        <RevealText as="p" className="max-w-[26ch] font-display text-[28px] leading-[1.1] tracking-[-0.03em] md:text-[44px] lg:text-[52px]">
          {product.description}
        </RevealText>
      </section>

      <section className="container-page grid gap-12 pb-20 md:grid-cols-[1.3fr_1fr] md:gap-20 md:pb-32">
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col border-t border-line">
            {highlights.map((highlight) => (
              <li key={highlight} className="type-body border-b border-line py-3">
                {highlight.replace("{hours}", String(smallest.burnHours)).replace("{label}", smallest.label)}
              </li>
            ))}
          </ul>
          <div className="flex flex-col">
            <Disclosure title={t("product.shippingTitle")}>
              <p>
                {t("product.shippingText", {
                  locker: formatPrice(shippingPriceGrosze.PARCEL_LOCKER, locale),
                  courier: formatPrice(shippingPriceGrosze.COURIER, locale),
                  threshold: formatPrice(freeShippingThresholdGrosze, locale),
                })}
              </p>
              <Link href="/shipping" className="type-label mt-4 inline-flex min-h-11 items-center border-b border-ink text-ink">
                {t("product.shippingLink")}
              </Link>
            </Disclosure>
            <Disclosure title={t("product.safetyTitle")}>
              <p>{t("product.safetyText")}</p>
            </Disclosure>
          </div>
        </div>
        {pairing && (
          <aside className="flex flex-col gap-4 self-start" aria-labelledby="pairing-title">
            <h2 id="pairing-title" className="type-eyebrow text-ink-soft">
              {t("product.pairsWith")}
            </h2>
            <PairingCard product={pairing} />
          </aside>
        )}
      </section>

      {top && (
        <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-night text-cream" aria-labelledby="feature-title" data-header-dark>
          <Image src={top.url} alt={top.alt} fill sizes="100vw" className="object-cover opacity-80" />
          <CandleFlame shot="top" seed={product.slug} />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/20 to-transparent" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/45 to-transparent md:via-night/30" aria-hidden />
          <div className="container-page relative flex flex-col gap-5 py-16">
            <p className="type-eyebrow text-cream-soft">{t("product.featureLabel")}</p>
            <RevealText id="feature-title" className="type-h2 max-w-[16ch]">
              {t("product.featureTitle")}
            </RevealText>
            <p className="type-body-lg measure text-cream-soft">{t("product.featureText")}</p>
          </div>
        </section>
      )}

      <section className="container-page py-20 md:py-32" aria-labelledby="specs-title">
        <h2 id="specs-title" className="type-h3 mb-10 md:mb-14">
          {t("product.specsTitle")}
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <SpecGroup
            title={t("product.specScent")}
            rows={[
              `${t("product.notesTop")}: ${product.notes.top.join(", ")}`,
              `${t("product.notesHeart")}: ${product.notes.heart.join(", ")}`,
              `${t("product.notesBase")}: ${product.notes.base.join(", ")}`,
            ]}
          />
          <SpecGroup
            title={t("product.specBurn")}
            rows={[...product.variants.map((variant) => t("product.burnValue", { label: variant.label, hours: variant.burnHours })), t("product.burnFirst")]}
          />
          <SpecGroup title={t("product.specCare")} rows={care} />
          <SpecGroup title={t("product.specMood")} rows={[product.mood, product.ritual]} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 md:pb-24" aria-labelledby="related-title">
          <h2 id="related-title" className="type-h3 container-page mb-8">
            {t("product.relatedTitle")}
          </h2>
          <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductTile product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <BuyBar product={product} />
    </>
  );
}
