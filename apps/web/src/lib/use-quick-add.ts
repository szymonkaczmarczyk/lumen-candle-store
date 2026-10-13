"use client";

import type { ProductSummary } from "@lumen/shared";
import { useCartStore } from "./cart-store";
import { flyToCart } from "./fly-to-cart";
import { imageByRole } from "./product-images";

export function useQuickAdd() {
  const add = useCartStore((state) => state.add);
  const openDrawer = useCartStore((state) => state.openDrawer);

  return (product: ProductSummary, source: Element | null) => {
    const variant = product.defaultVariant;
    if (variant.stockStatus === "OUT_OF_STOCK") return;
    add(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        unitPriceGrosze: variant.priceGrosze,
        accentColor: product.accentColor,
        imageUrl: imageByRole(product.images, "NEUTRAL")?.url ?? null,
      },
      1,
    );
    void flyToCart(source, openDrawer);
  };
}
