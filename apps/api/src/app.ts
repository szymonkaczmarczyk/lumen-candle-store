import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyServerOptions } from "fastify";
import { ZodError } from "zod";
import type { Db } from "./db.js";
import type { Env } from "./env.js";
import { HttpError } from "./lib/errors.js";
import type { Mailer } from "./lib/mailer.js";
import type { PaymentGateway } from "./lib/payments.js";
import { accountRoutes } from "./routes/account.js";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import { cartRoutes } from "./routes/cart.js";
import { catalogRoutes } from "./routes/catalog.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { healthRoutes } from "./routes/health.js";
import { webhookRoutes } from "./routes/webhooks.js";

export interface AppDependencies {
  env: Env;
  db: Db;
  payments: PaymentGateway | null;
  mailer: Mailer;
}

declare module "fastify" {
  interface FastifyInstance {
    env: Env;
    db: Db;
    payments: PaymentGateway | null;
    mailer: Mailer;
  }
}

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export async function buildApp(dependencies: AppDependencies, options: FastifyServerOptions = {}) {
  const app = Fastify({
    trustProxy: true,
    bodyLimit: 64 * 1024,
    ...options,
  });

  app.decorate("env", dependencies.env);
  app.decorate("db", dependencies.db);
  app.decorate("payments", dependencies.payments);
  app.decorate("mailer", dependencies.mailer);

  const allowedOrigins = new Set([new URL(dependencies.env.WEB_URL).origin, ...dependencies.env.ALLOWED_ORIGINS.map((origin) => new URL(origin).origin)]);
  app.addHook("onRequest", async (request) => {
    if (safeMethods.has(request.method)) return;
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) throw new HttpError(403, "origin_not_allowed");
  });

  await app.register(helmet, {
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: "same-site" },
  });
  await app.register(cookie, { secret: dependencies.env.COOKIE_SECRET });
  await app.register(rateLimit, { global: true, max: 300, timeWindow: "1 minute" });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_error",
        issues: error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message })),
      });
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.code });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode && statusCode < 500) {
      return reply.status(statusCode).send({ error: statusCode === 429 ? "rate_limited" : "bad_request" });
    }
    request.log.error(error);
    return reply.status(500).send({ error: "internal_error" });
  });

  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: "not_found" }));

  await app.register(healthRoutes);
  await app.register(catalogRoutes);
  await app.register(cartRoutes);
  await app.register(checkoutRoutes);
  await app.register(webhookRoutes);
  await app.register(authRoutes);
  await app.register(accountRoutes);
  await app.register(adminRoutes);

  return app;
}
