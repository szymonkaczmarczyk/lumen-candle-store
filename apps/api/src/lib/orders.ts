import { randomInt } from "node:crypto";
import type { OrderView } from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import type { Prisma } from "../generated/prisma/client.js";
import { orderConfirmationEmail } from "./emails.js";

const numberAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(now = new Date()) {
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Array.from({ length: 4 }, () => numberAlphabet[randomInt(numberAlphabet.length)]).join("");
  return `LM-${date}-${suffix}`;
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export function toOrderView(order: OrderWithItems): OrderView {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    email: order.email,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    subtotalGrosze: order.subtotalGrosze,
    shippingGrosze: order.shippingGrosze,
    totalGrosze: order.totalGrosze,
    trackingNumber: order.trackingNumber,
    shipping: {
      method: order.shippingMethod,
      parcelLockerCode: order.parcelLockerCode,
      firstName: order.shipFirstName,
      lastName: order.shipLastName,
      line1: order.shipLine1,
      line2: order.shipLine2,
      postalCode: order.shipPostalCode,
      city: order.shipCity,
      country: order.shipCountry,
      phone: order.shipPhone,
    },
    items: order.items.map((item) => ({
      productName: item.productName,
      variantLabel: item.variantLabel,
      unitPriceGrosze: item.unitPriceGrosze,
      quantity: item.quantity,
    })),
  };
}

export async function markOrderPaid(app: FastifyInstance, paymentIntentId: string) {
  const order = await app.db.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId }, include: { items: true } });
  if (!order) return null;

  const transitioned = await app.db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (count === 0) return false;
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
      }
    }
    return true;
  });

  if (transitioned) await sendConfirmationOnce(app, order.id);
  return transitioned;
}

async function sendConfirmationOnce(app: FastifyInstance, orderId: string) {
  const { count } = await app.db.order.updateMany({ where: { id: orderId, confirmationSentAt: null }, data: { confirmationSentAt: new Date() } });
  if (count === 0) return;
  const order = await app.db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  try {
    await app.mailer.send(orderConfirmationEmail(order));
  } catch (error) {
    app.log.error({ err: error, orderId }, "order confirmation email failed");
    await app.db.order.update({ where: { id: orderId }, data: { confirmationSentAt: null } });
  }
}

export async function markOrderStatusFromPayment(app: FastifyInstance, paymentIntentId: string, status: "FAILED" | "CANCELLED") {
  await app.db.order.updateMany({
    where: { stripePaymentIntentId: paymentIntentId, status: { in: ["PENDING", "FAILED"] } },
    data: { status },
  });
}
