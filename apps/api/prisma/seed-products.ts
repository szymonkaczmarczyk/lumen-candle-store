import type { Db } from "../src/db.js";
import { demoProducts } from "./seed-data.js";

export async function seedProducts(db: Db) {
  for (const [index, product] of demoProducts.entries()) {
    const record = await db.product.upsert({
      where: { slug: product.slug },
      update: { family: product.family, accentColor: product.accentColor, featured: product.featured, sortOrder: index },
      create: {
        slug: product.slug,
        family: product.family,
        accentColor: product.accentColor,
        featured: product.featured,
        sortOrder: index,
        status: "ACTIVE",
      },
    });

    for (const locale of ["pl", "en"] as const) {
      const translation = product[locale];
      await db.productTranslation.upsert({
        where: { productId_locale: { productId: record.id, locale } },
        update: translation,
        create: { ...translation, locale, productId: record.id },
      });
    }

    const imageAlts = {
      COLOR: [`Świeca ${product.pl.name} w barwionym szkle na kolorowym tle`, `${product.en.name} candle in tinted glass on a coloured backdrop`],
      NEUTRAL: [`Świeca ${product.pl.name} na jasnym tle`, `${product.en.name} candle on a light backdrop`],
      TOP: [`Świeca ${product.pl.name} z góry, widoczny wosk i płonący knot`, `${product.en.name} candle from above with the wax pool and lit wick`],
    } as const;
    for (const [imageIndex, role] of (["COLOR", "NEUTRAL", "TOP"] as const).entries()) {
      const [altPl, altEn] = imageAlts[role];
      const url = `/products/${product.slug}-${role.toLowerCase()}.webp`;
      await db.productImage.upsert({
        where: { productId_role: { productId: record.id, role } },
        update: { url, altPl, altEn, sortOrder: imageIndex },
        create: { productId: record.id, role, url, altPl, altEn, width: 1200, height: 1500, sortOrder: imageIndex },
      });
    }

    for (const [variantIndex, variant] of product.variants.entries()) {
      const sku = `LUM-${product.slug.toUpperCase()}-${variant.weightGrams}`;
      await db.productVariant.upsert({
        where: { sku },
        update: { weightGrams: variant.weightGrams, burnHours: variant.burnHours, priceGrosze: variant.priceGrosze, sortOrder: variantIndex },
        create: { ...variant, sku, sortOrder: variantIndex, productId: record.id },
      });
    }
  }
  return demoProducts.length;
}
