"use client";

import { formatPrice, type Locale, type ProductSummary } from "@lumen/shared";
import { Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useLitInView } from "@/lib/use-lit-in-view";
import { Link } from "@/i18n/navigation";
import { imageByRole } from "@/lib/product-images";
import { useQuickAdd } from "@/lib/use-quick-add";
import { CandleFlame } from "./CandleFlame";

interface ProductTileProps {
  product: ProductSummary;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}

export function ProductTile({ product, priority = false, headingLevel = "h3" }: ProductTileProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const quickAdd = useQuickAdd();
  const imageRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLElement>(null);
  const litInView = useLitInView(tileRef);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  const add = () => {
    quickAdd(product, imageRef.current);
    setAdded(true);
  };
  const neutral = imageByRole(product.images, "NEUTRAL");
  const status = product.defaultVariant.stockStatus;
  const badge = !product.available ? t("common.soldOut") : status === "LOW_STOCK" ? t("common.lowStock") : null;
  const Heading = headingLevel;

  return (
    <article ref={tileRef} data-lit={litInView || undefined} className="group relative flex h-full flex-col bg-sand">
      <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} className="flex h-full flex-col focus-visible:outline-offset-[-4px]">
        <div ref={imageRef} className="relative aspect-[4/5] overflow-hidden">
          {neutral && (
            <Image
              src={neutral.url}
              alt={neutral.alt}
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          )}
          <CandleFlame shot="front" state="hover" seed={product.slug} />
          {badge && <span className="type-eyebrow absolute left-3 top-3 bg-paper/90 px-1.5 py-0.5 text-ink">{badge}</span>}
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2 md:px-4 md:pb-4">
          <Heading className="type-caption font-medium text-ink">{product.name}</Heading>
          <div className="flex items-baseline justify-between gap-3">
            <p className="type-eyebrow text-ink-soft">{t(`families.${product.family}`)}</p>
            <p className="type-eyebrow shrink-0 text-ink">
              <span className="text-ink-soft max-sm:hidden">{product.defaultVariant.label} · </span>
              {formatPrice(product.defaultVariant.priceGrosze, locale)}
            </p>
          </div>
        </div>
      </Link>
      {product.available && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-[4/5] items-start justify-end p-2 md:p-3">
          <button
            type="button"
            onClick={add}
            className={clsx(
              "group/add pointer-events-auto flex h-11 min-w-11 items-center justify-center rounded-xs bg-paper/80 px-3 shadow-[0_10px_30px_-12px_rgba(13,11,20,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,translate,background-color,color] duration-300 ease-out-soft hover:bg-paper",
              "can-hover:-translate-y-1 can-hover:opacity-0 can-hover:group-focus-within:translate-y-0 can-hover:group-focus-within:opacity-100 can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100",
              added ? "text-success" : "text-ink",
            )}
            aria-label={t("common.quickAdd", { name: product.name, size: product.defaultVariant.label })}
          >
            <span
              aria-hidden
              className={clsx(
                "grid overflow-hidden whitespace-nowrap transition-[grid-template-columns,opacity,margin] duration-300 ease-out-soft",
                added ? "mr-2 grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0 can-hover:group-hover/add:mr-2 can-hover:group-hover/add:grid-cols-[1fr] can-hover:group-hover/add:opacity-100 group-focus-visible/add:mr-2 group-focus-visible/add:grid-cols-[1fr] group-focus-visible/add:opacity-100",
              )}
            >
              <span className="type-caption min-w-0 font-medium">{added ? t("common.addedShort") : t("common.toCart")}</span>
            </span>
            {added ? <Check className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden /> : <ShoppingBag className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />}
          </button>
        </div>
      )}
    </article>
  );
}
