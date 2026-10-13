import Stripe from "stripe";

export interface CreatePaymentInput {
  amountGrosze: number;
  email: string;
  orderId: string;
  orderNumber: string;
}

export interface PaymentIntentSummary {
  id: string;
  clientSecret: string;
  status: string;
}

export type PaymentEvent =
  | { id: string; type: "payment_intent.succeeded" | "payment_intent.payment_failed" | "payment_intent.canceled"; paymentIntentId: string }
  | { id: string; type: "ignored" };

export interface PaymentGateway {
  createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentSummary>;
  retrievePaymentIntent(id: string): Promise<PaymentIntentSummary>;
  cancelPaymentIntent(id: string): Promise<PaymentIntentSummary>;
  parseWebhook(rawBody: Buffer, signature: string): PaymentEvent;
}

const handledEvents = new Set(["payment_intent.succeeded", "payment_intent.payment_failed", "payment_intent.canceled"]);

export function createStripeGateway(secretKey: string, webhookSecret: string | undefined): PaymentGateway {
  const stripe = new Stripe(secretKey);

  const summarize = (intent: Stripe.PaymentIntent): PaymentIntentSummary => ({
    id: intent.id,
    clientSecret: intent.client_secret ?? "",
    status: intent.status,
  });

  return {
    async createPaymentIntent({ amountGrosze, email, orderId, orderNumber }) {
      const intent = await stripe.paymentIntents.create(
        {
          amount: amountGrosze,
          currency: "pln",
          automatic_payment_methods: { enabled: true },
          receipt_email: email,
          description: `Lumen ${orderNumber}`,
          metadata: { orderId, orderNumber },
        },
        { idempotencyKey: `order-${orderId}` },
      );
      return summarize(intent);
    },
    async retrievePaymentIntent(id) {
      return summarize(await stripe.paymentIntents.retrieve(id));
    },
    async cancelPaymentIntent(id) {
      return summarize(await stripe.paymentIntents.cancel(id, { cancellation_reason: "abandoned" }));
    },
    parseWebhook(rawBody, signature) {
      if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      if (!handledEvents.has(event.type)) return { id: event.id, type: "ignored" };
      const intent = event.data.object as Stripe.PaymentIntent;
      return { id: event.id, type: event.type as "payment_intent.succeeded", paymentIntentId: intent.id };
    },
  };
}
