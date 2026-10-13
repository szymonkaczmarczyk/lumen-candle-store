import { addressSchema, type AddressView } from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Address } from "../generated/prisma/client.js";
import { notFound } from "../lib/errors.js";
import { toOrderView } from "../lib/orders.js";
import { requireUser } from "../lib/session.js";

const idParamsSchema = z.object({ id: z.string().min(1).max(40) });
const addressInputSchema = addressSchema.extend({ isDefault: z.boolean().optional().default(false) });
const maxAddresses = 10;

const toAddressView = (address: Address): AddressView => ({
  id: address.id,
  firstName: address.firstName,
  lastName: address.lastName,
  line1: address.line1,
  line2: address.line2,
  postalCode: address.postalCode,
  city: address.city,
  country: "PL",
  phone: address.phone,
  isDefault: address.isDefault,
});

export async function accountRoutes(app: FastifyInstance) {
  app.get("/account/orders", async (request) => {
    const user = await requireUser(app, request);
    const orders = await app.db.order.findMany({
      where: { userId: user.id, status: { notIn: ["PENDING", "FAILED"] } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return orders.map(toOrderView);
  });

  app.get("/account/orders/:id", async (request) => {
    const user = await requireUser(app, request);
    const { id } = idParamsSchema.parse(request.params);
    const order = await app.db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
    if (!order) throw notFound("order_not_found");
    return toOrderView(order);
  });

  app.get("/account/addresses", async (request) => {
    const user = await requireUser(app, request);
    const addresses = await app.db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
    return addresses.map(toAddressView);
  });

  app.post("/account/addresses", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (request, reply) => {
    const user = await requireUser(app, request);
    const input = addressInputSchema.parse(request.body);
    const count = await app.db.address.count({ where: { userId: user.id } });
    if (count >= maxAddresses) return reply.status(409).send({ error: "address_limit" });
    const address = await app.db.$transaction(async (tx) => {
      const makeDefault = input.isDefault || count === 0;
      if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.create({ data: { ...input, isDefault: makeDefault, userId: user.id } });
    });
    return reply.status(201).send(toAddressView(address));
  });

  app.put("/account/addresses/:id", async (request) => {
    const user = await requireUser(app, request);
    const { id } = idParamsSchema.parse(request.params);
    const input = addressInputSchema.parse(request.body);
    const address = await app.db.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({ where: { id, userId: user.id } });
      if (!existing) throw notFound("address_not_found");
      if (input.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: { ...input, isDefault: input.isDefault || existing.isDefault } });
    });
    return toAddressView(address);
  });

  app.delete("/account/addresses/:id", async (request, reply) => {
    const user = await requireUser(app, request);
    const { id } = idParamsSchema.parse(request.params);
    const { count } = await app.db.address.deleteMany({ where: { id, userId: user.id } });
    if (count === 0) throw notFound("address_not_found");
    return reply.status(204).send();
  });
}
