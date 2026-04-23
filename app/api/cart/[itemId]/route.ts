import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cartService } from "@/services/cart.service";
import { z } from "zod";

type Params = { params: Promise<{ itemId: string }> };

const updateSchema = z.object({
  quantity: z.number().int().min(0).max(10),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const { itemId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "כמות לא תקינה" }, { status: 422 });
  }

  try {
    const cart = await cartService.updateQuantity(
      session?.user?.id,
      itemId,
      parsed.data.quantity
    );
    return NextResponse.json(cartService.summarize(cart));
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const { itemId } = await params;

  try {
    const cart = await cartService.removeItem(session?.user?.id, itemId);
    return NextResponse.json(cartService.summarize(cart));
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
