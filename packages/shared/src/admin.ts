import "./zod-setup.js";
import { z } from "zod";
import { orderStatusSchema } from "./order.js";

export const productStatuses = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const adminVariantUpdateSchema = z.object({
  priceGrosze: z.number().int().min(100).max(10_000_00).optional(),
  stock: z.number().int().min(0).max(100_000).optional(),
  active: z.boolean().optional(),
});
export type AdminVariantUpdate = z.infer<typeof adminVariantUpdateSchema>;

export const adminProductUpdateSchema = z.object({
  status: z.enum(productStatuses).optional(),
  featured: z.boolean().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});
export type AdminProductUpdate = z.infer<typeof adminProductUpdateSchema>;

export const adminOrderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
  trackingNumber: z.string().trim().max(64).optional(),
});

export const adminOrdersQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  query: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export interface AdminVariantView {
  id: string;
  sku: string;
  weightGrams: number;
  burnHours: number;
  priceGrosze: number;
  stock: number;
  active: boolean;
}

export interface AdminProductView {
  id: string;
  slug: string;
  name: string;
  family: string;
  accentColor: string;
  status: ProductStatus;
  featured: boolean;
  variants: AdminVariantView[];
}

export interface AdminOrderListItem {
  id: string;
  number: string;
  email: string;
  status: z.infer<typeof orderStatusSchema>;
  totalGrosze: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminStats {
  ordersToday: number;
  paidRevenueGrosze30d: number;
  pendingShipment: number;
  lowStockVariants: number;
}
