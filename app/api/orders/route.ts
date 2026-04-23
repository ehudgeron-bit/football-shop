import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { orderService } from "@/services/order.service";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const orders = await orderService.getUserOrders(session!.user.id);
  return NextResponse.json(orders);
}
