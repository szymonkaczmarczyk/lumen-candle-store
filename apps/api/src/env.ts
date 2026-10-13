import "dotenv/config";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = (schema: z.ZodString) => z.preprocess(emptyToUndefined, schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4300),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.url(),
  WEB_URL: z.url().default("http://localhost:3300"),
  ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  COOKIE_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: optionalString(z.string().startsWith("sk_test_")),
  STRIPE_WEBHOOK_SECRET: optionalString(z.string().startsWith("whsec_")),
  RESEND_API_KEY: optionalString(z.string().startsWith("re_")),
  MAIL_FROM: z.string().default("Lumen <zamowienia@example.com>"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}
