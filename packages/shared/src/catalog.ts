import "./zod-setup.js";
import { z } from "zod";
import { localeSchema } from "./locale.js";

export const scentFamilies = ["WOODY", "FLORAL", "CITRUS", "GOURMAND", "FRESH", "SPICY"] as const;
export type ScentFamily = (typeof scentFamilies)[number];
export const scentFamilySchema = z.enum(scentFamilies);

export const stockStatuses = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const;
export type StockStatus = (typeof stockStatuses)[number];

export const lowStockThreshold = 5;

export function stockStatusOf(stock: number): StockStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export const catalogQuerySchema = z.object({
  locale: localeSchema.default("pl"),
  family: scentFamilySchema.optional(),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export const productSlugParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
});

export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductVariantView {
  id: string;
  sku: string;
  label: string;
  weightGrams: number;
  burnHours: number;
  priceGrosze: number;
  stockStatus: StockStatus;
}

export const imageRoles = ["COLOR", "NEUTRAL", "TOP"] as const;
export type ImageRole = (typeof imageRoles)[number];

export interface ProductImageView {
  role: ImageRole;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  family: ScentFamily;
  accentColor: string;
  fromPriceGrosze: number;
  notes: ScentNotes;
  images: ProductImageView[];
  available: boolean;
  featured: boolean;
  defaultVariant: ProductVariantView;
  variantCount: number;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  mood: string;
  ritual: string;
  variants: ProductVariantView[];
}
