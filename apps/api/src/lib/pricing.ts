import { maxQuantityPerLine, type CartLineInput, type Locale } from "@lumen/shared";
import type { Db } from "../db.js";
import { variantLabel } from "./catalog.js";

export function mergeLines(items: CartLineInput[]): CartLineInput[] {
  const totals = new Map<string, number>();
  for (const item of items) totals.set(item.variantId, (totals.get(item.variantId) ?? 0) + item.quantity);
  return [...totals].map(([variantId, quantity]) => ({ variantId, quantity: Math.min(quantity, maxQuantityPerLine) }));
}

export async function loadPricedLines(db: Db, items: CartLineInput[], locale: Locale) {
  const lines = mergeLines(items);
  const variants = await db.productVariant.findMany({
    where: { id: { in: lines.map((line) => line.variantId) }, active: true, product: { status: "ACTIVE" } },
    include: {
      product: {
        include: {
          translations: { where: { locale } },
          images: { where: { role: "NEUTRAL" }, take: 1 },
        },
      },
    },
  });

  return lines.map((line) => {
    const variant = variants.find((candidate) => candidate.id === line.variantId);
    if (!variant) return { line, priced: null };
    const translation = variant.product.translations[0];
    const image = variant.product.images[0];
    return {
      line,
      priced: {
        variantId: variant.id,
        sku: variant.sku,
        stock: variant.stock,
        unitPriceGrosze: variant.priceGrosze,
        productSlug: variant.product.slug,
        productName: translation?.name ?? variant.product.slug,
        variantLabel: variantLabel(variant.weightGrams),
        accentColor: variant.product.accentColor,
        image: image ? { url: image.url, alt: locale === "pl" ? image.altPl : image.altEn } : null,
      },
    };
  });
}
