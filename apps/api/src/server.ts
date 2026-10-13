import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { createDb } from "./db.js";
import { loadEnv } from "./env.js";
import { createFileMailer, createResendMailer } from "./lib/mailer.js";
import { createStripeGateway } from "./lib/payments.js";
import { scheduleStaleOrderSweep } from "./lib/stale-orders.js";

const env = loadEnv();
const db = createDb(env.DATABASE_URL);
const mailDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.mail");
const mailer = env.RESEND_API_KEY ? createResendMailer(env.RESEND_API_KEY, env.MAIL_FROM) : createFileMailer(mailDirectory);
const payments = env.STRIPE_SECRET_KEY ? createStripeGateway(env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET) : null;

const app = await buildApp(
  { env, db, payments, mailer },
  {
    logger:
      env.NODE_ENV === "development"
        ? { level: "info", transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } } }
        : { level: "info" },
  },
);

const shutdown = async () => {
  await app.close();
  await db.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

scheduleStaleOrderSweep(app);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`payments: ${payments ? "stripe test mode" : "not configured"}, mail: ${env.RESEND_API_KEY ? "resend" : `files in ${mailDirectory}`}`);
