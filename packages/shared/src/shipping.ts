import "./zod-setup.js";
import { z } from "zod";

export const shippingMethods = ["COURIER", "PARCEL_LOCKER"] as const;
export type ShippingMethod = (typeof shippingMethods)[number];
export const shippingMethodSchema = z.enum(shippingMethods);

export const shippingPriceGrosze: Record<ShippingMethod, number> = {
  COURIER: 1999,
  PARCEL_LOCKER: 1499,
};

export const freeShippingThresholdGrosze = 30000;

export function shippingCostGrosze(method: ShippingMethod, subtotalGrosze: number): number {
  return subtotalGrosze >= freeShippingThresholdGrosze ? 0 : shippingPriceGrosze[method];
}
