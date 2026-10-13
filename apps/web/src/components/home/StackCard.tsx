"use client";

import { formatPrice, type Locale, type ProductSummary } from "@lumen/shared";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { imageByRole } from "@/lib/product-images";
import { useQuickAdd } from "@/lib/use-quick-add";
import { ProductName } from "../product/ProductName";
import { buttonStyles } from "../ui/button-styles";
import { CandleFlame } from "../product/CandleFlame";

export function StackCard({ product }: { product: ProductSummary }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const quickAdd = useQuickAdd();
  const imageRef = useRef<HTMLDivElement>(null);
  const image = imageByRole(product.images, "COLOR");
  const variant = product.defaultVariant;

  return (
    <article data-stack-card className="w-[84vw] max-w-sm shrink-0 snap-start origin-top overflow-hidden rounded-xs bg-night-soft text-cream md:sticky md:top-[11svh] md:mb-[12vh] md:w-auto md:max-w-none md:min-h-[78svh]">
      <div className="flex flex-col md:grid md:min-h-[78svh] md:grid-cols-[1fr_1.15fr_1fr]">
        <div className="hidden flex-col justify-between gap-6 p-8 md:flex">
          <p className="type-h2 max-w-[11ch]">{product.tagline}</p>
          <p className="type-eyebrow text-cream-soft">{t(`families.${product.family}`)}</p>
        </div>
        <div ref={imageRef} className="relative aspect-[4/5] md:aspect-auto">
          {image && <Image src={image.url} alt={image.alt} fill sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" />}
          <CandleFlame shot="front" seed={product.slug} />
        </div>
        <div className="flex flex-col justify-end gap-4 p-4 md:gap-5 md:p-8">
          <h3>
            <ProductName name={product.name} tone="dark" className="type-h3" />
          </h3>
          <p className="type-caption text-cream md:hidden">{product.tagline}</p>
          <p className="type-caption text-cream-soft">{[...product.notes.top, ...product.notes.heart].slice(0, 4).join(", ")}</p>
          <div className="flex items-baseline justify-between border-t border-night-line pt-4 md:pt-5">
            <span className="type-h4 tabular-nums">{formatPrice(variant.priceGrosze, locale)}</span>
            <span className="type-eyebrow text-cream-soft">{product.available ? t("common.inStock") : t("common.soldOut")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={!product.available} onClick={() => quickAdd(product, imageRef.current)} className={buttonStyles("light", "px-3")}>
              {t("home.stackAdd")}
            </button>
            <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} className={buttonStyles("outlineLight", "px-3")}>
              {t("home.stackMore")}
              <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
          <p className="type-eyebrow flex items-center justify-between text-cream-soft">
            <span>{variant.label}</span>
            <span>{t("home.stackSizes", { count: product.variantCount })}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
