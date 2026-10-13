import type { ProductDetail, ProductSummary } from "@lumen/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestContext } from "./helpers.js";

let context: Awaited<ReturnType<typeof createTestContext>>;

beforeAll(async () => {
  context = await createTestContext();
});

afterAll(async () => {
  await context.close();
});

describe("catalog", () => {
  it("reports health", async () => {
    const response = await context.app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("lists active products in Polish by default", async () => {
    const response = await context.app.inject({ method: "GET", url: "/products" });
    const products = response.json<ProductSummary[]>();
    expect(response.statusCode).toBe(200);
    expect(products).toHaveLength(8);
    expect(products[0]?.name).toBe("Ambra Nocturna");
    expect(products.find((product) => product.slug === "cedr-i-dym")?.name).toBe("Cedr i Dym");
  });

  it("returns English translations", async () => {
    const response = await context.app.inject({ method: "GET", url: "/products?locale=en" });
    const names = response.json<ProductSummary[]>().map((product) => product.name);
    expect(names).toContain("Cedar & Smoke");
  });

  it("filters by scent family", async () => {
    const response = await context.app.inject({ method: "GET", url: "/products?family=WOODY" });
    expect(response.json<ProductSummary[]>().every((product) => product.family === "WOODY")).toBe(true);
  });

  it("hides draft products", async () => {
    await context.db.product.update({ where: { slug: "las-po-deszczu" }, data: { status: "DRAFT" } });
    const response = await context.app.inject({ method: "GET", url: "/products/las-po-deszczu" });
    expect(response.statusCode).toBe(404);
    await context.db.product.update({ where: { slug: "las-po-deszczu" }, data: { status: "ACTIVE" } });
  });

  it("returns product detail with variants and stock status but no raw stock", async () => {
    const response = await context.app.inject({ method: "GET", url: "/products/tyton-i-wanilia?locale=pl" });
    const product = response.json<ProductDetail>();
    expect(product.variants.map((variant) => variant.stockStatus)).toEqual(["IN_STOCK", "OUT_OF_STOCK"]);
    expect(JSON.stringify(product)).not.toContain('"stock"');
  });

  it("rejects invalid query values", async () => {
    const response = await context.app.inject({ method: "GET", url: "/products?locale=de" });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("validation_error");
  });
});
