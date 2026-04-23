import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    revenueResult,
    monthRevenueResult,
    totalProducts,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
  ]);

  return NextResponse.json({
    totalOrders,
    paidOrders,
    pendingOrders,
    totalRevenue: Number(revenueResult._sum.totalAmount ?? 0),
    monthRevenue: Number(monthRevenueResult._sum.totalAmount ?? 0),
    totalProducts,
    lowStockVariants,
  });
}
