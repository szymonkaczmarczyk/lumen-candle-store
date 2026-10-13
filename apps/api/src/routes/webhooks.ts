import type { FastifyInstance } from "fastify";
import { HttpError } from "../lib/errors.js";
import { markOrderPaid, markOrderStatusFromPayment } from "../lib/orders.js";
import type { PaymentEvent } from "../lib/payments.js";

export async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_request, body, done) => done(null, body));

  app.post("/webhooks/stripe", { config: { rateLimit: false } }, async (request, reply) => {
    const payments = app.payments;
    if (!payments) throw new HttpError(503, "payments_unavailable");
    const signature = request.headers["stripe-signature"];
    if (typeof signature !== "string" || !Buffer.isBuffer(request.body)) throw new HttpError(400, "invalid_signature");

    let event: PaymentEvent;
    try {
      event = payments.parseWebhook(request.body, signature);
    } catch {
      return reply.status(400).send({ error: "invalid_signature" });
    }
    if (event.type === "ignored") return { received: true };

    const alreadyProcessed = await app.db.stripeEvent.findUnique({ where: { id: event.id } });
    if (alreadyProcessed) return { received: true };

    if (event.type === "payment_intent.succeeded") await markOrderPaid(app, event.paymentIntentId);
    if (event.type === "payment_intent.payment_failed") await markOrderStatusFromPayment(app, event.paymentIntentId, "FAILED");
    if (event.type === "payment_intent.canceled") await markOrderStatusFromPayment(app, event.paymentIntentId, "CANCELLED");

    await app.db.stripeEvent.createMany({ data: [{ id: event.id, type: event.type }], skipDuplicates: true });
    return { received: true };
  });
}
