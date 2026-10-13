import { catalogQuerySchema, localeSchema, productSlugParamsSchema } from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { productInclude, publicProductWhere, toProductDetail, toProductSummary } from "../lib/catalog.js";
import { notFound } from "../lib/errors.js";

const productQuerySchema = z.object({ locale: localeSchema.default("pl") });

export async function catalogRoutes(app: FastifyInstance) {
  app.get("/products", async (request) => {
    const { locale, family } = catalogQuerySchema.parse(request.query);
    const products = await app.db.product.findMany({
      where: { ...publicProductWhere, ...(family ? { family } : {}) },
      include: productInclude(locale),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return products.map((product) => toProductSummary(product, locale)).filter((product) => product !== null);
  });

  app.get("/products/:slug", async (request) => {
    const { slug } = productSlugParamsSchema.parse(request.params);
    const { locale } = productQuerySchema.parse(request.query);
    const product = await app.db.product.findFirst({
      where: { ...publicProductWhere, slug },
      include: productInclude(locale),
    });
    const detail = product ? toProductDetail(product, locale) : null;
    if (!detail) throw notFound("product_not_found");
    return detail;
  });
}
