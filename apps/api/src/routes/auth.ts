import {
  loginRequestSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerRequestSchema,
} from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { Prisma } from "../generated/prisma/client.js";
import { passwordResetEmail } from "../lib/emails.js";
import { badRequest, conflict, HttpError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { createToken, endSession, hashToken, readSessionUser, startSession } from "../lib/session.js";

const strictLimit = { rateLimit: { max: 5, timeWindow: "1 minute" } };
const resetTtlMs = 60 * 60 * 1000;
let dummyHash: Promise<string> | null = null;

export async function authRoutes(app: FastifyInstance) {
  const toPublicUser = (user: { id: string; email: string; name: string; role: "CUSTOMER" | "ADMIN" }) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  app.post("/auth/register", { config: strictLimit }, async (request, reply) => {
    const input = registerRequestSchema.parse(request.body);
    const passwordHash = await hashPassword(input.password);
    const user = await app.db.user
      .create({ data: { email: input.email, name: input.name, passwordHash, locale: input.locale } })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw conflict("email_taken");
        throw error;
      });
    await app.db.order.updateMany({ where: { email: user.email, userId: null, status: { not: "PENDING" } }, data: { userId: user.id } });
    await startSession(app, reply, user.id);
    return reply.status(201).send({ user: toPublicUser(user) });
  });

  app.post("/auth/login", { config: strictLimit }, async (request, reply) => {
    const input = loginRequestSchema.parse(request.body);
    const user = await app.db.user.findUnique({ where: { email: input.email } });
    if (!user) {
      dummyHash ??= hashPassword("timing-equaliser-password");
      await verifyPassword(await dummyHash, input.password);
      throw new HttpError(401, "invalid_credentials");
    }
    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) throw new HttpError(401, "invalid_credentials");
    await startSession(app, reply, user.id);
    return { user: toPublicUser(user) };
  });

  app.post("/auth/logout", async (request, reply) => {
    await endSession(app, request, reply);
    return { ok: true };
  });

  app.get("/auth/me", async (request) => {
    const user = await readSessionUser(app, request);
    return { user };
  });

  app.post("/auth/password-reset/request", { config: strictLimit }, async (request, reply) => {
    const input = passwordResetRequestSchema.parse(request.body);
    const user = await app.db.user.findUnique({ where: { email: input.email } });
    if (user) {
      const token = createToken();
      await app.db.passwordResetToken.create({
        data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + resetTtlMs) },
      });
      const path = input.locale === "en" ? "/en/reset-password" : "/nowe-haslo";
      const url = `${app.env.WEB_URL}${path}?token=${encodeURIComponent(token)}`;
      await app.mailer.send(passwordResetEmail(user.email, url, input.locale)).catch((error: unknown) => {
        request.log.error({ err: error }, "password reset email failed");
      });
    }
    return reply.status(202).send({ ok: true });
  });

  app.post("/auth/password-reset/confirm", { config: strictLimit }, async (request) => {
    const input = passwordResetConfirmSchema.parse(request.body);
    const record = await app.db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(input.token) } });
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) throw badRequest("invalid_token");
    const passwordHash = await hashPassword(input.password);
    await app.db.$transaction([
      app.db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      app.db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      app.db.session.deleteMany({ where: { userId: record.userId } }),
    ]);
    return { ok: true };
  });
}
