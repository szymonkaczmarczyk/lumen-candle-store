"use client";

import { freeShippingThresholdGrosze, formatPrice, type Locale } from "@lumen/shared";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { selectSubtotal, useCartStore } from "@/lib/cart-store";
import { useCartSync } from "@/lib/use-cart-sync";
import { FormAlert } from "../form/FormAlert";
import { Sheet } from "../layout/Sheet";
import { buttonStyles } from "../ui/button-styles";
import Image from "next/image";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const { items, drawerOpen, closeDrawer, setQuantity, remove } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);
  const { removedNotice } = useCartSync(drawerOpen);
  const remaining = Math.max(0, freeShippingThresholdGrosze - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThresholdGrosze) * 100));

  const footer =
    items.length > 0 ? (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="type-caption text-ink-soft">
            {remaining > 0 ? t("freeShippingLeft", { amount: formatPrice(remaining, locale) }) : t("freeShippingReached")}
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-sand" aria-hidden>
            <div className="h-full bg-gold transition-[width] duration-500 ease-out-soft" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="type-body">{t("subtotal")}</span>
          <span className="type-h4 tabular-nums">{formatPrice(subtotal, locale)}</span>
        </div>
        <p className="type-caption text-ink-soft">{t("shippingInfo")}</p>
        <Link
          href="/checkout"
          onClick={closeDrawer}
          className={buttonStyles("primary")}
        >
          {t("checkout")}
        </Link>
      </div>
    ) : undefined;

  return (
    <Sheet open={drawerOpen} onClose={closeDrawer} side="right" title={t("title")} closeLabel={tCommon("close")} footer={footer}>
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-start justify-center gap-6 p-6">
          <p className="type-body-lg text-ink-soft">{t("empty")}</p>
          <Link
            href="/shop"
            onClick={closeDrawer}
            className={buttonStyles("outline")}
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <>
        {removedNotice && (
          <div className="p-5 pb-0">
            <FormAlert tone="error">{t("unavailable")}</FormAlert>
          </div>
        )}
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 p-5">
              <Link
                href={{ pathname: "/product/[slug]", params: { slug: item.productSlug } }}
                onClick={closeDrawer}
                className="w-20 shrink-0 overflow-hidden rounded-xs"
                tabIndex={-1}
                aria-hidden
              >
                <div className="relative aspect-[4/5] bg-sand">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                </div>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={{ pathname: "/product/[slug]", params: { slug: item.productSlug } }}
                      onClick={closeDrawer}
                      className="type-h4 hover-underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="type-caption text-ink-soft">{item.variantLabel}</p>
                  </div>
                  <span className="type-body shrink-0 tabular-nums">{formatPrice(item.unitPriceGrosze * item.quantity, locale)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper value={item.quantity} onChange={(value) => setQuantity(item.variantId, value)} size="sm" />
                  <button
                    type="button"
                    onClick={() => remove(item.variantId)}
                    className="inline-flex size-11 items-center justify-center rounded-xs text-ink-soft transition-colors hover:bg-sand hover:text-danger"
                    aria-label={t("remove", { name: item.productName })}
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
    </Sheet>
  );
}
