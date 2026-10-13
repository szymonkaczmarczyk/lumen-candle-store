import "./zod-setup.js";
import { z } from "zod";
import { honeypotSchema } from "./checkout.js";
import { localeSchema } from "./locale.js";

export const passwordSchema = z.string().min(10).max(128);
export const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());

export const registerRequestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: passwordSchema,
  locale: localeSchema.default("pl"),
  acceptTerms: z.literal(true),
  website: honeypotSchema,
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
  locale: localeSchema.default("pl"),
  website: honeypotSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const roles = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
