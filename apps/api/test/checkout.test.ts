import type { CartQuote, CheckoutResponse, OrderView } from "@lumen/shared";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestContext } from "./helpers.js";

let context: Awaited<ReturnType<typeof createTestContext>>;

const address = {
  firstName: "Anna",
  lastName: "Nowak",
  line1: "ul. Długa 1",
  postalCode: "00-001",
  city: "Warszawa",
  phone: "+48 600 000 000",
};

async function variant(sku: string) {
  return context.db.productVariant.findUniqueOrThrow({ where: { sku } });
}

async function checkout(items: { variantId: string; quantity: number }[], extra: Record<string, unknown> = {}) {
  return context.app.inject({
    method: "POST",
    url: "/checkout",
    payload: { locale: "pl", email: "anna@example.com", items, shippingMethod: "COURIER", address, acceptTerms: true, ...extra },
  });
}

function webhook(event: object, signature = "valid-signature") {
  return context.app.inject({
    method: "POST",
    url: "/webhooks/stripe",
    headers: { "content-type": "application/json", "stripe-signature": signature },
    payload: JSON.stringify(event),
  });
}

beforeAll(async () => {
  context = await createTestContext();
});

beforeEach(() => {
  context.mailer.sent.length = 0;
});

afterAll(async () => {
  await context.close();
});

describe("cart quote", () => {
  it("prices lines from the database and drops unavailable variants", async () => {
    const ambra = await variant("LUM-AMBRA-NOCTURNA-180");
    const soldOut = await variant("LUM-TYTON-I-WANILIA-380");
    const response = await context.app.inject({
      method: "POST",
      url: "/cart/quote",
      payload: { locale: "pl", items: [{ variantId: ambra.id, quantity: 2 }, { variantId: soldOut.id, quantity: 1 }, { variantId: "missing", quantity: 1 }] },
    });
    const quote = response.json<CartQuote>();
    expect(quote.lines).toHaveLength(1);
    expect(quote.subtotalGrosze).toBe(ambra.priceGrosze * 2);
    expect(quote.removedVariantIds).toEqual([soldOut.id, "missing"]);
  });

  it("caps quantity at available stock", async () => {
    const neroli = await variant("LUM-NEROLI-O-SWICIE-180");
    const response = await context.app.inject({
      method: "POST",
      url: "/cart/quote",
      payload: { locale: "en", items: [{ variantId: neroli.id, quantity: 9 }] },
    });
    const [line] = response.json<CartQuote>().lines;
    expect(line?.quantity).toBe(neroli.stock);
    expect(line?.productName).toBe("Neroli at Dawn");
  });
});

describe("checkout", () => {
  it("creates a pending order with server-side prices and shipping", async () => {
    const cedr = await variant("LUM-CEDR-I-DYM-180");
    const response = await checkout([{ variantId: cedr.id, quantity: 1 }]);
    expect(response.statusCode).toBe(200);
    const body = response.json<CheckoutResponse>();
    expect(body.totalGrosze).toBe(cedr.priceGrosze + 1999);
    const order = await context.db.order.findUniqueOrThrow({ where: { id: body.orderId }, include: { items: true } });
    expect(order.status).toBe("PENDING");
    expect(order.items[0]?.unitPriceGrosze).toBe(cedr.priceGrosze);
    expect(context.payments.intents.get(order.stripePaymentIntentId ?? "")?.amountGrosze).toBe(body.totalGrosze);
  });

  it("gives free shipping above the threshold", async () => {
    const roza = await variant("LUM-ROZA-DAMASCENSKA-380");
    const body = (await checkout([{ variantId: roza.id, quantity: 2 }])).json<CheckoutResponse>();
    expect(body.totalGrosze).toBe(roza.priceGrosze * 2);
  });

  it("rejects quantities above stock", async () => {
    const neroli = await variant("LUM-NEROLI-O-SWICIE-180");
    const response = await checkout([{ variantId: neroli.id, quantity: neroli.stock + 1 }]);
    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("cart_changed");
  });

  it("rejects a filled honeypot", async () => {
    const cedr = await variant("LUM-CEDR-I-DYM-180");
    const response = await checkout([{ variantId: cedr.id, quantity: 1 }], { website: "bot" });
    expect(response.statusCode).toBe(400);
  });

  it("rejects requests from foreign origins", async () => {
    const response = await context.app.inject({ method: "POST", url: "/checkout", headers: { origin: "https://evil.example" }, payload: {} });
    expect(response.statusCode).toBe(403);
  });
});

describe("payment confirmation", () => {
  it("marks the order paid once, deducts stock and sends one email", async () => {
    const figa = await variant("LUM-FIGA-SRODZIEMNA-180");
    const { orderId } = (await checkout([{ variantId: figa.id, quantity: 3 }])).json<CheckoutResponse>();
    const order = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    const intentId = order.stripePaymentIntentId ?? "";
    context.payments.succeed(intentId);

    const event = { id: "evt_1", type: "payment_intent.succeeded", paymentIntentId: intentId };
    expect((await webhook(event)).statusCode).toBe(200);
    expect((await webhook(event)).statusCode).toBe(200);
    await webhook({ ...event, id: "evt_2" });

    const paid = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(paid.status).toBe("PAID");
    expect((await variant("LUM-FIGA-SRODZIEMNA-180")).stock).toBe(figa.stock - 3);
    expect(context.mailer.sent).toHaveLength(1);
    expect(context.mailer.sent[0]?.subject).toContain(paid.number);
  });

  it("rejects webhooks with an invalid signature", async () => {
    const response = await webhook({ id: "evt_bad", type: "payment_intent.succeeded", paymentIntentId: "pi_x" }, "forged");
    expect(response.statusCode).toBe(400);
  });

  it("confirms via the success page when the webhook has not arrived yet", async () => {
    const herbata = await variant("LUM-BIALA-HERBATA-180");
    const { orderId, clientSecret } = (await checkout([{ variantId: herbata.id, quantity: 1 }])).json<CheckoutResponse>();
    const order = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    context.payments.succeed(order.stripePaymentIntentId ?? "");

    const response = await context.app.inject({
      method: "GET",
      url: `/checkout/confirmation?paymentIntent=${order.stripePaymentIntentId}&clientSecret=${clientSecret}`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json<OrderView>().status).toBe("PAID");
  });

  it("hides the order when the client secret does not match", async () => {
    const herbata = await variant("LUM-BIALA-HERBATA-380");
    const { orderId } = (await checkout([{ variantId: herbata.id, quantity: 1 }])).json<CheckoutResponse>();
    const order = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    const response = await context.app.inject({
      method: "GET",
      url: `/checkout/confirmation?paymentIntent=${order.stripePaymentIntentId}&clientSecret=wrong_secret_value`,
    });
    expect(response.statusCode).toBe(404);
  });

  it("marks failed payments as FAILED", async () => {
    const cedr = await variant("LUM-CEDR-I-DYM-380");
    const { orderId } = (await checkout([{ variantId: cedr.id, quantity: 1 }])).json<CheckoutResponse>();
    const order = await context.db.order.findUniqueOrThrow({ where: { id: orderId } });
    await webhook({ id: "evt_fail", type: "payment_intent.payment_failed", paymentIntentId: order.stripePaymentIntentId });
    expect((await context.db.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("FAILED");
  });
});
