import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestContext } from "./helpers.js";

let context: Awaited<ReturnType<typeof createTestContext>>;

const sessionCookie = (setCookie: string | string[] | undefined) => {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return header?.split(";")[0] ?? "";
};

beforeAll(async () => {
  context = await createTestContext();
});

afterAll(async () => {
  await context.close();
});

describe("auth", () => {
  it("registers with a hardened session cookie and never stores the raw token", async () => {
    const response = await context.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Ola", email: "Ola@Example.com", password: "very-secret-pass", acceptTerms: true },
    });
    expect(response.statusCode).toBe(201);
    const header = String(response.headers["set-cookie"]);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    const token = sessionCookie(response.headers["set-cookie"]).split("=")[1] ?? "";
    const sessions = await context.db.session.findMany();
    expect(sessions.some((session) => session.tokenHash === token)).toBe(false);
    const user = await context.db.user.findUniqueOrThrow({ where: { email: "ola@example.com" } });
    expect(user.passwordHash.startsWith("$argon2id$")).toBe(true);
    expect(response.json().user).toEqual({ id: user.id, email: "ola@example.com", name: "Ola", role: "CUSTOMER" });
  });

  it("ignores a role sent by the client", async () => {
    await context.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Hacker", email: "hacker@example.com", password: "very-secret-pass", acceptTerms: true, role: "ADMIN" },
    });
    expect((await context.db.user.findUniqueOrThrow({ where: { email: "hacker@example.com" } })).role).toBe("CUSTOMER");
  });

  it("rejects duplicate emails and short passwords", async () => {
    const duplicate = await context.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Ola", email: "ola@example.com", password: "very-secret-pass", acceptTerms: true },
    });
    expect(duplicate.statusCode).toBe(409);
    const short = await context.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "Ola", email: "ola2@example.com", password: "short", acceptTerms: true },
    });
    expect(short.statusCode).toBe(400);
  });

  it("logs in, reads the session and logs out", async () => {
    const wrong = await context.app.inject({ method: "POST", url: "/auth/login", payload: { email: "ola@example.com", password: "nope-nope-nope" } });
    expect(wrong.statusCode).toBe(401);
    const login = await context.app.inject({ method: "POST", url: "/auth/login", payload: { email: "ola@example.com", password: "very-secret-pass" } });
    const cookie = sessionCookie(login.headers["set-cookie"]);
    const me = await context.app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });
    expect(me.json().user.email).toBe("ola@example.com");
    await context.app.inject({ method: "POST", url: "/auth/logout", headers: { cookie } });
    const after = await context.app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });
    expect(after.json().user).toBeNull();
  });

  it("resets the password with a single-use token", async () => {
    await context.app.inject({ method: "POST", url: "/auth/password-reset/request", payload: { email: "ola@example.com" } });
    const mail = context.mailer.sent.at(-1);
    const token = new URL(mail?.text.split("\n").at(-1) ?? "").searchParams.get("token") ?? "";
    const confirm = await context.app.inject({ method: "POST", url: "/auth/password-reset/confirm", payload: { token, password: "brand-new-password" } });
    expect(confirm.statusCode).toBe(200);
    const reuse = await context.app.inject({ method: "POST", url: "/auth/password-reset/confirm", payload: { token, password: "another-password-1" } });
    expect(reuse.statusCode).toBe(400);
    const login = await context.app.inject({ method: "POST", url: "/auth/login", payload: { email: "ola@example.com", password: "brand-new-password" } });
    expect(login.statusCode).toBe(200);
  });

  it("does not reveal whether an email exists on reset", async () => {
    const response = await context.app.inject({ method: "POST", url: "/auth/password-reset/request", payload: { email: "nobody@example.com" } });
    expect(response.statusCode).toBe(202);
  });
});

describe("account", () => {
  it("requires a session", async () => {
    expect((await context.app.inject({ method: "GET", url: "/account/orders" })).statusCode).toBe(401);
  });

  it("keeps addresses private to their owner", async () => {
    await context.createUser("first@example.com", "first-password-1");
    await context.createUser("second@example.com", "second-password-2");
    const loginAs = async (email: string, password: string) =>
      sessionCookie((await context.app.inject({ method: "POST", url: "/auth/login", payload: { email, password } })).headers["set-cookie"]);
    const first = await loginAs("first@example.com", "first-password-1");
    const second = await loginAs("second@example.com", "second-password-2");

    const created = await context.app.inject({
      method: "POST",
      url: "/account/addresses",
      headers: { cookie: first },
      payload: { firstName: "Jan", lastName: "Kowalski", line1: "Rynek 1", postalCode: "31-001", city: "Kraków", phone: "600100200" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().isDefault).toBe(true);
    const id = created.json().id;

    const foreignDelete = await context.app.inject({ method: "DELETE", url: `/account/addresses/${id}`, headers: { cookie: second } });
    expect(foreignDelete.statusCode).toBe(404);
    const foreignList = await context.app.inject({ method: "GET", url: "/account/addresses", headers: { cookie: second } });
    expect(foreignList.json()).toEqual([]);
  });
});
