"use client";

import { formatPrice, type Locale } from "@lumen/shared";
import { useLocale, useTranslations } from "next-intl";
import type { CartItem } from "@/lib/cart-store";
import Image from "next/image";

interface OrderSummaryProps {
  items: CartItem[];
  subtotalGrosze: number;
  shippingGrosze: number;
}

export function OrderSummary({ items, subtotalGrosze, shippingGrosze }: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;

  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-6 rounded-xs border border-line bg-paper p-6 md:p-8">
      <h2 id="summary-title" className="type-h4">
        {t("summary")}
      </h2>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-4">
            <div className="relative w-14 shrink-0 overflow-hidden rounded-xs">
              <div className="relative aspect-[4/5] bg-sand">
                {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <span className="type-eyebrow absolute -right-0 -top-0 inline-flex min-w-5 items-center justify-center bg-ink px-1 text-[10px] tracking-normal text-cream tabular-nums">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="type-body truncate font-medium">{item.productName}</p>
              <p className="type-caption text-ink-soft">{item.variantLabel}</p>
            </div>
            <span className="type-body tabular-nums">{formatPrice(item.unitPriceGrosze * item.quantity, locale)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-2 border-t border-line pt-5">
        <div className="flex justify-between">
          <dt className="type-body text-ink-soft">{t("subtotal")}</dt>
          <dd className="type-body tabular-nums">{formatPrice(subtotalGrosze, locale)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="type-body text-ink-soft">{t("shipping")}</dt>
          <dd className="type-body tabular-nums">{shippingGrosze === 0 ? t("free") : formatPrice(shippingGrosze, locale)}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-ink pt-4">
          <dt className="type-h4">{t("total")}</dt>
          <dd className="type-h3 tabular-nums">{formatPrice(subtotalGrosze + shippingGrosze, locale)}</dd>
        </div>
      </dl>
    </section>
  );
}
