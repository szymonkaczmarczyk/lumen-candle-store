"use client";

import type { CartQuote, Locale } from "@lumen/shared";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useCartStore } from "./cart-store";
import { apiFetch } from "./client-api";

export function useCartSync(enabled: boolean) {
  const locale = useLocale() as Locale;
  const items = useCartStore((state) => state.items);
  const replace = useCartStore((state) => state.replace);
  const removedNotice = useCartStore((state) => state.removalNotice);
  const requestItems = items.map(({ variantId, quantity }) => ({ variantId, quantity }));
  const key = requestItems.map((item) => `${item.variantId}:${item.quantity}`).join(",");

  const query = useQuery({
    queryKey: ["cart-quote", locale, key],
    queryFn: () => apiFetch<CartQuote>("/cart/quote", { body: { locale, items: requestItems } }),
    enabled: enabled && requestItems.length > 0,
  });

  useEffect(() => {
    const quote = query.data;
    if (!quote) return;
    const current = useCartStore.getState().items;
    const next = quote.lines.map((line) => ({
      variantId: line.variantId,
      quantity: line.quantity,
      productSlug: line.productSlug,
      productName: line.productName,
      variantLabel: line.variantLabel,
      unitPriceGrosze: line.unitPriceGrosze,
      accentColor: line.accentColor,
      imageUrl: line.image?.url ?? null,
    }));
    const changed =
      next.length !== current.length ||
      next.some((line, index) => {
        const existing = current[index];
        return !existing || existing.variantId !== line.variantId || existing.quantity !== line.quantity || existing.unitPriceGrosze !== line.unitPriceGrosze || existing.productName !== line.productName || existing.imageUrl !== line.imageUrl;
      });
    const removedSome = quote.removedVariantIds.length > 0;
    if (changed || removedSome) replace(next, removedSome);
  }, [query.data, replace]);

  return { quote: query.data, isFetching: query.isFetching, removedNotice };
}
