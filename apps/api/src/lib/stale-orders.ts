import type { FastifyInstance } from "fastify";
import { markOrderPaid } from "./orders.js";

export const unpaidOrderTtlMs = 24 * 60 * 60 * 1000;
const sweepIntervalMs = 15 * 60 * 1000;
const batchSize = 100;

export async function cancelStaleOrders(app: FastifyInstance, now = new Date()) {
  const cutoff = new Date(now.getTime() - unpaidOrderTtlMs);
  const stale = await app.db.order.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    select: { id: true, stripePaymentIntentId: true },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let cancelled = 0;
  for (const order of stale) {
    if (order.stripePaymentIntentId && app.payments) {
      const intent = await app.payments.retrievePaymentIntent(order.stripePaymentIntentId).catch(() => null);
      if (!intent || intent.status === "processing") continue;
      if (intent.status === "succeeded") {
        await markOrderPaid(app, intent.id);
        continue;
      }
      if (intent.status !== "canceled") {
        const released = await app.payments
          .cancelPaymentIntent(intent.id)
          .then(() => true)
          .catch((error: unknown) => {
            app.log.warn({ err: error, orderId: order.id }, "could not cancel stale payment intent");
            return false;
          });
        if (!released) continue;
      }
    }
    const { count } = await app.db.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "CANCELLED" } });
    cancelled += count;
  }
  return cancelled;
}

export function scheduleStaleOrderSweep(app: FastifyInstance) {
  const sweep = () =>
    cancelStaleOrders(app)
      .then((count) => {
        if (count > 0) app.log.info(`cancelled ${count} unpaid orders older than 24 h`);
      })
      .catch((error: unknown) => app.log.error({ err: error }, "stale order sweep failed"));
  void sweep();
  const timer = setInterval(sweep, sweepIntervalMs);
  timer.unref();
  app.addHook("onClose", async () => clearInterval(timer));
}
