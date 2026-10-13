"use client";

import { formatPrice, type Locale, type ProductDetail } from "@lumen/shared";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { clsx } from "clsx";
import { useCartStore } from "@/lib/cart-store";
import { flyToCart } from "@/lib/fly-to-cart";
import { imageByRole } from "@/lib/product-images";
import { QuantityStepper } from "../cart/QuantityStepper";
import { buttonStyles } from "../ui/button-styles";
import { ProductName } from "./ProductName";

export function BuyBar({ product }: { product: ProductDetail }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const add = useCartStore((state) => state.add);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [selectedId, setSelectedId] = useState(product.defaultVariant.id);
  const [quantity, setQuantity] = useState(1);
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.defaultVariant;
  const soldOut = selected.stockStatus === "OUT_OF_STOCK";
  const perHour = formatPrice(Math.round(selected.priceGrosze / selected.burnHours), locale);

  const handleAdd = () => {
    add(
      {
        variantId: selected.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: selected.label,
        unitPriceGrosze: selected.priceGrosze,
        accentColor: product.accentColor,
        imageUrl: imageByRole(product.images, "NEUTRAL")?.url ?? null,
      },
      quantity,
    );
    setQuantity(1);
    void flyToCart(document.querySelector("[data-product-image]"), openDrawer);
  };

  const sizes = (
    <div role="radiogroup" aria-label={t("product.sizeLabel")} className="grid grid-cols-2 gap-1">
      {product.variants.map((variant) => {
        const active = variant.id === selected.id;
        const unavailable = variant.stockStatus === "OUT_OF_STOCK";
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setSelectedId(variant.id)}
            className={clsx(
              "flex min-h-11 flex-col items-start justify-center rounded-xs border px-3 text-left transition-colors",
              active ? "border-cream bg-cream text-ink" : "border-cream/15 text-cream hover:border-cream/40",
              unavailable && "opacity-50",
            )}
          >
            <span className="type-label">{variant.label}</span>
            <span className={clsx("type-eyebrow", active ? "text-ink-soft" : "text-cream-soft")}>
              {unavailable ? t("common.soldOut") : `${variant.burnHours} h`}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div data-buybar className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="container-page">
        <div className="pointer-events-auto border border-cream/10 bg-night-soft/95 shadow-[0_-12px_40px_-20px_rgba(13,11,20,0.6)] backdrop-blur-md flex flex-col gap-2 rounded-xs p-2 text-cream lg:flex-row lg:items-stretch lg:gap-0 lg:divide-x lg:divide-cream/10 lg:p-0">
          <div className="hidden min-w-0 flex-col justify-center gap-1 px-5 py-3 lg:flex lg:w-[22%]">
            <ProductName name={product.name} tone="dark" className="type-h4 truncate" />
            <span className="type-eyebrow text-cream-soft">{t(`families.${product.family}`)}</span>
          </div>
          <div className="lg:flex lg:w-[26%] lg:items-center lg:px-3 lg:py-2">
            <div className="w-full">{sizes}</div>
          </div>
          <div className="flex items-center gap-2 lg:contents">
            <div className="hidden items-center px-3 lg:flex">
              <QuantityStepper value={quantity} onChange={setQuantity} tone="dark" size="sm" />
            </div>
            <div className="flex flex-1 flex-col justify-center px-2 lg:px-5">
              <span className="type-h4 tabular-nums" aria-live="polite">
                {formatPrice(selected.priceGrosze * quantity, locale)}
              </span>
              <span className="type-eyebrow hidden text-cream-soft sm:block">{t("product.perHour", { price: perHour })}</span>
            </div>
            <div className="flex items-center lg:p-2">
              <button type="button" onClick={handleAdd} disabled={soldOut} className={buttonStyles("primary", "h-full min-h-12 px-6 lg:px-8")} data-add-to-cart>
                {soldOut ? t("common.soldOut") : t("common.addToCart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
