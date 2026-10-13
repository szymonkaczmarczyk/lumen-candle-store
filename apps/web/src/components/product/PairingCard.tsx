"use client";

import { formatPrice, type Locale, type ProductSummary } from "@lumen/shared";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { imageByRole } from "@/lib/product-images";
import { useQuickAdd } from "@/lib/use-quick-add";
import { ProductName } from "./ProductName";
import { CandleFlame } from "./CandleFlame";

export function PairingCard({ product }: { product: ProductSummary }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const quickAdd = useQuickAdd();
  const imageRef = useRef<HTMLAnchorElement>(null);
  const image = imageByRole(product.images, "NEUTRAL");

  return (
    <div className="group grid grid-cols-[7rem_1fr] items-center gap-4 bg-sand p-3">
      <Link ref={imageRef} href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} className="relative aspect-[4/5] overflow-hidden" tabIndex={-1} aria-hidden>
        {image && <Image src={image.url} alt="" fill sizes="112px" className="object-cover" />}
        <CandleFlame shot="front" state="hover" seed={product.slug} />
      </Link>
      <div className="flex flex-col gap-2">
        <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} className="hover-underline self-start">
          <ProductName name={product.name} className="type-caption font-medium" />
        </Link>
        <span className="type-eyebrow text-ink-soft">
          {product.defaultVariant.label} · {formatPrice(product.defaultVariant.priceGrosze, locale)}
        </span>
        <button
          type="button"
          onClick={() => quickAdd(product, imageRef.current)}
          className="type-label inline-flex min-h-11 items-center gap-2 self-start rounded-xs bg-ink px-3 text-cream transition-colors hover:bg-night-soft"
          aria-label={t("common.quickAdd", { name: product.name, size: product.defaultVariant.label })}
        >
          <Plus className="size-3.5" strokeWidth={2} aria-hidden />
          {t("product.add")}
        </button>
      </div>
    </div>
  );
}
