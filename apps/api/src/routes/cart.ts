import { cartQuoteRequestSchema, maxQuantityPerLine, type CartQuote } from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { loadPricedLines } from "../lib/pricing.js";

export async function cartRoutes(app: FastifyInstance) {
  app.post("/cart/quote", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (request): Promise<CartQuote> => {
    const { items, locale } = cartQuoteRequestSchema.parse(request.body);
    const priced = await loadPricedLines(app.db, items, locale);
    const lines: CartQuote["lines"] = [];
    const removedVariantIds: string[] = [];

    for (const { line, priced: variant } of priced) {
      const availableQuantity = variant ? Math.min(variant.stock, maxQuantityPerLine) : 0;
      if (!variant || availableQuantity <= 0) {
        removedVariantIds.push(line.variantId);
        continue;
      }
      const quantity = Math.min(line.quantity, availableQuantity);
      lines.push({
        variantId: variant.variantId,
        productSlug: variant.productSlug,
        productName: variant.productName,
        variantLabel: variant.variantLabel,
        accentColor: variant.accentColor,
        unitPriceGrosze: variant.unitPriceGrosze,
        quantity,
        availableQuantity,
        lineTotalGrosze: variant.unitPriceGrosze * quantity,
        image: variant.image,
      });
    }

    return { lines, subtotalGrosze: lines.reduce((sum, line) => sum + line.lineTotalGrosze, 0), removedVariantIds };
  });
}
