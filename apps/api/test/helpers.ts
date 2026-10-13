import "dotenv/config";
import { buildApp } from "../src/app.js";
import { createDb, type Db } from "../src/db.js";
import { loadEnv } from "../src/env.js";
import { createMemoryMailer } from "../src/lib/mailer.js";
import type { PaymentEvent, PaymentGateway, PaymentIntentSummary } from "../src/lib/payments.js";
import { hashPassword } from "../src/lib/password.js";
import { seedProducts } from "../prisma/seed-products.js";

export function createFakePayments() {
  const intents = new Map<string, PaymentIntentSummary & { amountGrosze: number }>();
  let counter = 0;
  const gateway: PaymentGateway & { intents: typeof intents; succeed: (id: string) => void } = {
    intents,
    async createPaymentIntent({ amountGrosze }) {
      counter += 1;
      const id = `pi_test${counter}`;
      const intent = { id, clientSecret: `${id}_secret_fake${counter}`, status: "requires_payment_method", amountGrosze };
      intents.set(id, intent);
      return intent;
    },
    async retrievePaymentIntent(id) {
      const intent = intents.get(id);
      if (!intent) throw new Error("No such payment intent");
      return intent;
    },
    async cancelPaymentIntent(id) {
      const intent = intents.get(id);
      if (!intent) throw new Error("No such payment intent");
      if (intent.status === "succeeded") throw new Error("Payment intent already succeeded");
      intent.status = "canceled";
      return intent;
    },
    parseWebhook(rawBody, signature) {
      if (signature !== "valid-signature") throw new Error("Invalid signature");
      return JSON.parse(rawBody.toString("utf8")) as PaymentEvent;
    },
    succeed(id) {
      const intent = intents.get(id);
      if (intent) intent.status = "succeeded";
    },
  };
  return gateway;
}

export function testEnv(overrides: Record<string, string> = {}) {
  return loadEnv({
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    COOKIE_SECRET: "test-cookie-secret-test-cookie-secret-0000",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    RESEND_API_KEY: "",
    ...overrides,
  });
}

export async function resetDatabase(db: Db) {
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = tables.map(({ tablename }) => `"public"."${tablename}"`).join(", ");
  if (list) await db.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

export async function createTestContext() {
  const env = testEnv();
  const db = createDb(env.DATABASE_URL);
  await resetDatabase(db);
  await seedProducts(db);
  const payments = createFakePayments();
  const mailer = createMemoryMailer();
  const app = await buildApp({ env, db, payments, mailer });
  return {
    app,
    db,
    payments,
    mailer,
    createUser: async (email: string, password: string, role: "CUSTOMER" | "ADMIN" = "CUSTOMER") =>
      db.user.create({ data: { email, name: email.split("@")[0] ?? email, passwordHash: await hashPassword(password), role } }),
    close: async () => {
      await app.close();
      await db.$disconnect();
    },
  };
}
