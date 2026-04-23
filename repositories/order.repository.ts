import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const orderWithDetails = {
  id: true,
  orderNumber: true,
  status: true,
  totalAmount: true,
  shippingSnapshot: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  items: {
    select: {
      id: true,
      productName: true,
      productSlug: true,
      size: true,
      unitPrice: true,
      quantity: true,
      imageUrl: true,
    },
  },
  payment: {
    select: {
      id: true,
      provider: true,
      providerRef: true,
      status: true,
      amount: true,
      currency: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderSelect;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  select: typeof orderWithDetails;
}>;

export const orderRepository = {
  async findById(id: string): Promise<OrderWithDetails | null> {
    return prisma.order.findUnique({ where: { id }, select: orderWithDetails });
  },

  async findByUserId(
    userId: string,
    limit = 20
  ): Promise<OrderWithDetails[]> {
    return prisma.order.findMany({
      where: { userId },
      select: orderWithDetails,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async findAll(opts: { page: number; limit: number; status?: string }) {
    const where: Prisma.OrderWhereInput = opts.status
      ? { status: opts.status }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        select: orderWithDetails,
        orderBy: { createdAt: "desc" },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await prisma.order.update({ where: { id }, data: { status } });
  },
};
