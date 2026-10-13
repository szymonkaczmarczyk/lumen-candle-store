import "./zod-setup.js";
import { z } from "zod";

const trimmed = (max: number) => z.string().trim().min(1).max(max);

export const postalCodeSchema = z.string().trim().regex(/^\d{2}-\d{3}$/);
export const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{9,20}$/);

export const addressSchema = z.object({
  firstName: trimmed(60),
  lastName: trimmed(80),
  line1: trimmed(120),
  line2: z.string().trim().max(120).optional().default(""),
  postalCode: postalCodeSchema,
  city: trimmed(80),
  country: z.literal("PL").default("PL"),
  phone: phoneSchema,
});
export type AddressInput = z.infer<typeof addressSchema>;
