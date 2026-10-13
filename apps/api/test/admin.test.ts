import type { AdminProductView, CheckoutResponse, OrderView } from "@lumen/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestContext } from "./helpers.js";

let context: Awaited<ReturnType<typeof createTestContext>>;
let adminCookie = "";
let customerCookie = "";

const login = async (email: string, password: string) => {
  const response = await context.app.inject({ method: "POST", url: "/auth/login", payload: { email, password } });
  const header = response.headers["set-cookie"];
  return (Array.isArray(header) ? header[0] : header)?.split(";")[0] ?? "";
};

beforeAll(async () => {
  context = await createTestContext();
  await context.createUser("admin@lumen.test", "admin-password-1", "ADMIN");
  await context.createUser("client@example.com", "client-password-1");
  adminCookie = await login("admin@lumen.test", "admin-password-1");
  customerCookie = await login("client@example.com", "client-password-1");
});

afterAll(async () => {
  await context.close();
});

describe("admin", () => {
  it("is closed to anonymous users and customers", async () => {
    expect((await context.app.inject({ method: "GET", url: "/admin/products" })).statusCode).toBe(401);
    expect((await context.app.inject({ method: "GET", url: "/admin/products", headers: { cookie: customerCookie } })).statusCode).toBe(403);
  });

  it("updates stock and price of a variant", async () => {
    const products = (await context.app.inject({ method: "GET", url: "/admin/products", headers: { cookie: adminCookie } })).json<AdminProductView[]>();
    const variant = products[0]?.variants[0];
    expect(variant).toBeDefined();
    const response = await context.app.inject({
      method: "PATCH",
      url: `/admin/variants/${variant?.id}`,
      headers: { cookie: adminCookie },
      payload: { stock: 3, priceGrosze: 17900 },
    });
    expect(response.statusCode).toBe(200);
    const updated = await context.db.productVariant.findUniqueOrThrow({ where: { id: variant?.id } });
    expect(updated).toMatchObject({ stock: 3, priceGrosze: 17900 });
  });

  it("enforces order status transitions and restocks cancelled paid orders", async () => {
    const variant = await context.db.productVariant.findUniqueOrThrow({ where: { sku: "LUM-CEDR-I-DYM-180" } });
    const checkout = await context.app.inject({
      method: "POST",
      url: "/checkout",
      payload: {
        locale: "pl",
        email: "client@example.com",
        items: [{ variantId: variant.id, quantity: 2 }],
        shippingMethod: "PARCEL_LOCKER",
        parcelLockerCode: "kra01m",
        address: { firstName: "Ewa", lastName: "Lis", line1: "Polna 2", postalCode: "30-001", city: "Kraków", phone: "600200300" },
        acceptTerms: true,
      },
    });
    const { orderId } = checkout.json<CheckoutResponse>();
    const order = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order.parcelLockerCode).toBe("KRA01M");

    const tooEarly = await context.app.inject({
      method: "PATCH",
      url: `/admin/orders/${orderId}/status`,
      headers: { cookie: adminCookie },
      payload: { status: "SHIPPED", trackingNumber: "123" },
    });
    expect(tooEarly.statusCode).toBe(400);

    context.payments.succeed(order.stripePaymentIntentId ?? "");
    await context.app.inject({
      method: "POST",
      url: "/webhooks/stripe",
      headers: { "content-type": "application/json", "stripe-signature": "valid-signature" },
      payload: JSON.stringify({ id: "evt_admin", type: "payment_intent.succeeded", paymentIntentId: order.stripePaymentIntentId }),
    });
    expect((await context.db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(variant.stock - 2);

    const cancelled = await context.app.inject({
      method: "PATCH",
      url: `/admin/orders/${orderId}/status`,
      headers: { cookie: adminCookie },
      payload: { status: "CANCELLED" },
    });
    expect(cancelled.json<OrderView>().status).toBe("CANCELLED");
    expect((await context.db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(variant.stock);
  });

  it("lists orders with search", async () => {
    const response = await context.app.inject({ method: "GET", url: "/admin/orders?query=client", headers: { cookie: adminCookie } });
    expect(response.json().items.length).toBeGreaterThan(0);
  });
});
