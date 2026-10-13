import { timingSafeEqual } from "node:crypto";
import { checkoutRequestSchema, shippingCostGrosze, type CheckoutResponse } from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { conflict, HttpError, notFound } from "../lib/errors.js";
import { generateOrderNumber, markOrderPaid, toOrderView } from "../lib/orders.js";
import { loadPricedLines } from "../lib/pricing.js";
import { readSessionUser } from "../lib/session.js";

const confirmationQuerySchema = z.object({
  paymentIntent: z.string().regex(/^pi_[A-Za-z0-9]+$/),
  clientSecret: z.string().min(10).max(200),
});

const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function checkoutRoutes(app: FastifyInstance) {
  app.post("/checkout", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request): Promise<CheckoutResponse> => {
    const input = checkoutRequestSchema.parse(request.body);
    const payments = app.payments;
    if (!payments) throw new HttpError(503, "payments_unavailable");

    const user = await readSessionUser(app, request);
    const priced = await loadPricedLines(app.db, input.items, input.locale);
    const unavailable = priced.filter(({ line, priced: variant }) => !variant || variant.stock < line.quantity);
    if (unavailable.length > 0) throw conflict("cart_changed");

    const items = priced.flatMap(({ line, priced: variant }) =>
      variant
        ? [
            {
              variantId: variant.variantId,
              productName: variant.productName,
              variantLabel: variant.variantLabel,
              sku: variant.sku,
              unitPriceGrosze: variant.unitPriceGrosze,
              quantity: line.quantity,
            },
          ]
        : [],
    );
    const subtotalGrosze = items.reduce((sum, item) => sum + item.unitPriceGrosze * item.quantity, 0);
    const shippingGrosze = shippingCostGrosze(input.shippingMethod, subtotalGrosze);
    const totalGrosze = subtotalGrosze + shippingGrosze;

    const createOrder = (attempt: number): Promise<{ id: string; number: string }> =>
      app.db.order
        .create({
          data: {
            number: generateOrderNumber(),
            userId: user?.id ?? null,
            email: input.email,
            locale: input.locale,
            subtotalGrosze,
            shippingGrosze,
            totalGrosze,
            shippingMethod: input.shippingMethod,
            parcelLockerCode: input.shippingMethod === "PARCEL_LOCKER" ? (input.parcelLockerCode ?? null) : null,
            shipFirstName: input.address.firstName,
            shipLastName: input.address.lastName,
            shipLine1: input.address.line1,
            shipLine2: input.address.line2,
            shipPostalCode: input.address.postalCode,
            shipCity: input.address.city,
            shipCountry: input.address.country,
            shipPhone: input.address.phone,
            notes: input.notes,
            items: { create: items },
          },
          select: { id: true, number: true },
        })
        .catch((error: unknown) => {
          const duplicateNumber = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
          if (duplicateNumber && attempt < 3) return createOrder(attempt + 1);
          throw error;
        });

    const order = await createOrder(1);
    const intent = await payments.createPaymentIntent({
      amountGrosze: totalGrosze,
      email: input.email,
      orderId: order.id,
      orderNumber: order.number,
    });
    await app.db.order.update({ where: { id: order.id }, data: { stripePaymentIntentId: intent.id } });

    return { orderId: order.id, orderNumber: order.number, clientSecret: intent.clientSecret, totalGrosze };
  });

  app.get("/checkout/confirmation", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (request) => {
    const { paymentIntent, clientSecret } = confirmationQuerySchema.parse(request.query);
    const payments = app.payments;
    if (!payments) throw new HttpError(503, "payments_unavailable");

    const intent = await payments.retrievePaymentIntent(paymentIntent).catch(() => null);
    if (!intent || !safeEqual(intent.clientSecret, clientSecret)) throw notFound("order_not_found");
    if (intent.status === "succeeded") await markOrderPaid(app, intent.id);

    const order = await app.db.order.findUnique({ where: { stripePaymentIntentId: paymentIntent }, include: { items: true } });
    if (!order) throw notFound("order_not_found");
    return toOrderView(order);
  });
}
