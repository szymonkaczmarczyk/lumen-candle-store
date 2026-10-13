import type { CheckoutResponse } from "@lumen/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cancelStaleOrders, unpaidOrderTtlMs } from "../src/lib/stale-orders.js";
import { createTestContext } from "./helpers.js";

let context: Awaited<ReturnType<typeof createTestContext>>;

const address = { firstName: "Anna", lastName: "Nowak", line1: "ul. Długa 1", postalCode: "00-001", city: "Warszawa", phone: "+48 600 000 000" };

async function placeOrder() {
  const variant = await context.db.productVariant.findUniqueOrThrow({ where: { sku: "LUM-AMBRA-NOCTURNA-180" } });
  const response = await context.app.inject({
    method: "POST",
    url: "/checkout",
    payload: { locale: "pl", email: "anna@example.com", items: [{ variantId: variant.id, quantity: 1 }], shippingMethod: "COURIER", address, acceptTerms: true },
  });
  return response.json<CheckoutResponse>();
}

async function ageOrder(orderId: string, ms: number) {
  await context.db.order.update({ where: { id: orderId }, data: { createdAt: new Date(Date.now() - ms) } });
}

const intentIdOf = async (orderId: string) => (await context.db.order.findUniqueOrThrow({ where: { id: orderId } })).stripePaymentIntentId ?? "";
const statusOf = async (orderId: string) => (await context.db.order.findUniqueOrThrow({ where: { id: orderId } })).status;

beforeAll(async () => {
  context = await createTestContext();
});

afterAll(async () => {
  await context.close();
});

describe("stale unpaid orders", () => {
  it("cancels pending orders older than 24 hours together with their payment intent", async () => {
    const order = await placeOrder();
    await ageOrder(order.orderId, unpaidOrderTtlMs + 60_000);
    expect(await cancelStaleOrders(context.app)).toBe(1);
    expect(await statusOf(order.orderId)).toBe("CANCELLED");
    expect(context.payments.intents.get(await intentIdOf(order.orderId))?.status).toBe("canceled");
  });

  it("leaves fresh pending orders alone", async () => {
    const order = await placeOrder();
    await ageOrder(order.orderId, unpaidOrderTtlMs - 60_000);
    expect(await cancelStaleOrders(context.app)).toBe(0);
    expect(await statusOf(order.orderId)).toBe("PENDING");
  });

  it("marks the order paid when the payment succeeded but the webhook never arrived", async () => {
    const order = await placeOrder();
    await ageOrder(order.orderId, unpaidOrderTtlMs + 60_000);
    context.payments.succeed(await intentIdOf(order.orderId));
    expect(await cancelStaleOrders(context.app)).toBe(0);
    expect(await statusOf(order.orderId)).toBe("PAID");
  });

  it("waits while the payment is still processing", async () => {
    const order = await placeOrder();
    await ageOrder(order.orderId, unpaidOrderTtlMs + 60_000);
    const intent = context.payments.intents.get(await intentIdOf(order.orderId));
    if (intent) intent.status = "processing";
    expect(await cancelStaleOrders(context.app)).toBe(0);
    expect(await statusOf(order.orderId)).toBe("PENDING");
  });
});
