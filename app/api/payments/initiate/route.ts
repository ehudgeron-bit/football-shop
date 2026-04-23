import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { orderService } from "@/services/order.service";
import { checkoutSchema } from "@/lib/validators/order";

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const result = await orderService.initiateCheckout(
      session!.user.id,
      parsed.data.addressId
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[POST /api/payments/initiate]", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
