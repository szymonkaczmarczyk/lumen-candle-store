import "./zod-setup.js";
import { z } from "zod";
import { addressSchema } from "./address.js";
import { localeSchema } from "./locale.js";
import { shippingMethodSchema } from "./shipping.js";

export const maxQuantityPerLine = 10;
export const maxCartLines = 20;

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(maxQuantityPerLine),
});
export type CartLineInput = z.infer<typeof cartLineSchema>;

export const honeypotSchema = z.string().max(0).optional();

export const checkoutRequestSchema = z.object({
  locale: localeSchema,
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  items: z.array(cartLineSchema).min(1).max(maxCartLines),
  shippingMethod: shippingMethodSchema,
  parcelLockerCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,12}$/).optional(),
  address: addressSchema,
  notes: z.string().trim().max(500).optional().default(""),
  acceptTerms: z.literal(true),
  website: honeypotSchema,
}).refine((data) => data.shippingMethod !== "PARCEL_LOCKER" || Boolean(data.parcelLockerCode), {
  path: ["parcelLockerCode"],
  message: "parcel_locker_required",
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const cartQuoteRequestSchema = z.object({
  locale: localeSchema,
  items: z.array(cartLineSchema).max(maxCartLines),
});
export type CartQuoteRequest = z.infer<typeof cartQuoteRequestSchema>;

export interface CartQuoteLine {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  accentColor: string;
  unitPriceGrosze: number;
  quantity: number;
  availableQuantity: number;
  lineTotalGrosze: number;
  image: { url: string; alt: string } | null;
}

export interface CartQuote {
  lines: CartQuoteLine[];
  subtotalGrosze: number;
  removedVariantIds: string[];
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  totalGrosze: number;
}
