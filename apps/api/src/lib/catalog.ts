import {
  stockStatusOf,
  type Locale,
  type ProductDetail,
  type ProductImageView,
  type ProductSummary,
} from "@lumen/shared";
import type { Prisma } from "../generated/prisma/client.js";

export const productInclude = (locale: Locale) =>
  ({
    translations: { where: { locale } },
    variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    images: { orderBy: { sortOrder: "asc" } },
  }) satisfies Prisma.ProductInclude;

export const publicProductWhere = {
  status: "ACTIVE",
  variants: { some: { active: true } },
} satisfies Prisma.ProductWhereInput;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: ReturnType<typeof productInclude> }>;
type ImageRecord = ProductWithRelations["images"][number];

export const variantLabel = (weightGrams: number) => `${weightGrams} g`;

export function toImageView(image: ImageRecord, locale: Locale): ProductImageView {
  return {
    role: image.role,
    url: image.url,
    alt: locale === "pl" ? image.altPl : image.altEn,
    width: image.width,
    height: image.height,
  };
}

type VariantRecord = ProductWithRelations["variants"][number];

const toVariantView = (variant: VariantRecord) => ({
  id: variant.id,
  sku: variant.sku,
  label: variantLabel(variant.weightGrams),
  weightGrams: variant.weightGrams,
  burnHours: variant.burnHours,
  priceGrosze: variant.priceGrosze,
  stockStatus: stockStatusOf(variant.stock),
});

export function toProductSummary(product: ProductWithRelations, locale: Locale): ProductSummary | null {
  const translation = product.translations[0];
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  if (!translation || !defaultVariant) return null;
  return {
    id: product.id,
    slug: product.slug,
    name: translation.name,
    tagline: translation.tagline,
    family: product.family,
    accentColor: product.accentColor,
    fromPriceGrosze: Math.min(...product.variants.map((variant) => variant.priceGrosze)),
    notes: { top: translation.notesTop, heart: translation.notesHeart, base: translation.notesBase },
    images: product.images.map((image) => toImageView(image, locale)),
    available: product.variants.some((variant) => variant.stock > 0),
    featured: product.featured,
    defaultVariant: toVariantView(defaultVariant),
    variantCount: product.variants.length,
  };
}

export function toProductDetail(product: ProductWithRelations, locale: Locale): ProductDetail | null {
  const summary = toProductSummary(product, locale);
  const translation = product.translations[0];
  if (!summary || !translation) return null;
  return {
    ...summary,
    description: translation.description,
    mood: translation.mood,
    ritual: translation.ritual,
    variants: product.variants.map(toVariantView),
  };
}
