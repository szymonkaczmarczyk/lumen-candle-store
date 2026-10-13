import "./zod-setup.js";
import { z } from "zod";
import type { ShippingMethod } from "./shipping.js";

export const orderStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const orderStatusSchema = z.enum(orderStatuses);

export const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedStatusTransitions[from].includes(to);
}

export interface OrderItemView {
  productName: string;
  variantLabel: string;
  unitPriceGrosze: number;
  quantity: number;
}

export interface OrderShippingView {
  method: ShippingMethod;
  parcelLockerCode: string | null;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

export interface OrderView {
  id: string;
  number: string;
  status: OrderStatus;
  email: string;
  createdAt: string;
  paidAt: string | null;
  subtotalGrosze: number;
  shippingGrosze: number;
  totalGrosze: number;
  trackingNumber: string | null;
  shipping: OrderShippingView;
  items: OrderItemView[];
}
