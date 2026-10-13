import { createHash, randomBytes } from "node:crypto";
import type { SessionUser } from "@lumen/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { forbidden, unauthorized } from "./errors.js";

export const sessionCookieName = "lumen_session";
const sessionTtlMs = 30 * 24 * 60 * 60 * 1000;

export const createToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(app: FastifyInstance, reply: FastifyReply, userId: string) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + sessionTtlMs);
  await app.db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  reply.setCookie(sessionCookieName, token, {
    httpOnly: true,
    secure: app.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[sessionCookieName];
  if (token) await app.db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  reply.clearCookie(sessionCookieName, { path: "/" });
}

export async function readSessionUser(app: FastifyInstance, request: FastifyRequest): Promise<SessionUser | null> {
  const token = request.cookies[sessionCookieName];
  if (!token) return null;
  const session = await app.db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await app.db.session.delete({ where: { id: session.id } });
    return null;
  }
  const { id, email, name, role } = session.user;
  return { id, email, name, role };
}

export async function requireUser(app: FastifyInstance, request: FastifyRequest): Promise<SessionUser> {
  const user = await readSessionUser(app, request);
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin(app: FastifyInstance, request: FastifyRequest): Promise<SessionUser> {
  const user = await requireUser(app, request);
  if (user.role !== "ADMIN") throw forbidden();
  return user;
}
