import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { orderRepository } from "@/repositories/order.repository";
const VALID_STATUSES = [
  "PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"
] as const;
type OrderStatus = typeof VALID_STATUSES[number];

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined;

  const result = await orderRepository.findAll({ page, limit: 20, status });
  return NextResponse.json(result);
}
