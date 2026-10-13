import {
  adminOrdersQuerySchema,
  adminOrderStatusUpdateSchema,
  adminProductUpdateSchema,
  adminVariantUpdateSchema,
  canTransition,
  lowStockThreshold,
  type AdminOrderListItem,
  type AdminProductView,
  type AdminStats,
} from "@lumen/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../lib/errors.js";
import { toOrderView } from "../lib/orders.js";
import { requireAdmin } from "../lib/session.js";

const idParamsSchema = z.object({ id: z.string().min(1).max(40) });
const pageSize = 20;

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    await requireAdmin(app, request);
  });

  app.get("/admin/stats", async (): Promise<AdminStats> => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [ordersToday, revenue, pendingShipment, lowStockVariants] = await Promise.all([
      app.db.order.count({ where: { createdAt: { gte: startOfDay }, status: { notIn: ["PENDING", "FAILED"] } } }),
      app.db.order.aggregate({ _sum: { totalGrosze: true }, where: { paidAt: { gte: since30d }, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
      app.db.order.count({ where: { status: "PAID" } }),
      app.db.productVariant.count({ where: { active: true, stock: { lte: lowStockThreshold } } }),
    ]);
    return { ordersToday, paidRevenueGrosze30d: revenue._sum.totalGrosze ?? 0, pendingShipment, lowStockVariants };
  });

  app.get("/admin/products", async (): Promise<AdminProductView[]> => {
    const products = await app.db.product.findMany({
      include: { translations: { where: { locale: "pl" } }, variants: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.translations[0]?.name ?? product.slug,
      family: product.family,
      accentColor: product.accentColor,
      status: product.status,
      featured: product.featured,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        weightGrams: variant.weightGrams,
        burnHours: variant.burnHours,
        priceGrosze: variant.priceGrosze,
        stock: variant.stock,
        active: variant.active,
      })),
    }));
  });

  app.patch("/admin/products/:id", async (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = adminProductUpdateSchema.parse(request.body);
    const { count } = await app.db.product.updateMany({ where: { id }, data: input });
    if (count === 0) throw notFound("product_not_found");
    return { ok: true };
  });

  app.patch("/admin/variants/:id", async (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = adminVariantUpdateSchema.parse(request.body);
    const { count } = await app.db.productVariant.updateMany({ where: { id }, data: input });
    if (count === 0) throw notFound("variant_not_found");
    return { ok: true };
  });

  app.get("/admin/orders", async (request) => {
    const { status, query, page } = adminOrdersQuerySchema.parse(request.query);
    const where = {
      ...(status ? { status } : { status: { not: "PENDING" as const } }),
      ...(query
        ? {
            OR: [
              { number: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { shipLastName: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [orders, total] = await Promise.all([
      app.db.order.findMany({
        where,
        include: { items: { select: { quantity: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      app.db.order.count({ where }),
    ]);
    const items: AdminOrderListItem[] = orders.map((order) => ({
      id: order.id,
      number: order.number,
      email: order.email,
      status: order.status,
      totalGrosze: order.totalGrosze,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
    }));
    return { items, total, page, pageSize };
  });

  app.get("/admin/orders/:id", async (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const order = await app.db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw notFound("order_not_found");
    return { ...toOrderView(order), notes: order.notes };
  });

  app.patch("/admin/orders/:id/status", async (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = adminOrderStatusUpdateSchema.parse(request.body);
    const order = await app.db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw notFound("order_not_found");
    if (!canTransition(order.status, input.status)) throw badRequest("invalid_transition");
    if (input.status === "SHIPPED" && !input.trackingNumber && !order.trackingNumber) throw badRequest("tracking_required");
    const restock = order.status === "PAID" && input.status === "CANCELLED";
    const updated = await app.db.$transaction(async (tx) => {
      if (restock) {
        for (const item of order.items) {
          if (item.variantId) await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
      return tx.order.update({
        where: { id },
        data: { status: input.status, ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}) },
        include: { items: true },
      });
    });
    return toOrderView(updated);
  });
}
