import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { orderRepository } from "@/repositories/order.repository";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"]),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 422 });
  }

  const order = await orderRepository.findById(id);
  if (!order) return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });

  await orderRepository.updateStatus(id, parsed.data.status);
  return NextResponse.json({ success: true });
}
