import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cartService } from "@/services/cart.service";
import { z } from "zod";

const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});

export async function GET() {
  const session = await auth();
  const cart = await cartService.getCart(session?.user?.id);

  if (!cart) {
    return NextResponse.json({ items: [], itemCount: 0, subtotal: 0 });
  }

  return NextResponse.json(cartService.summarize(cart));
}

export async function POST(req: NextRequest) {
  const session = await auth();

  const body = await req.json().catch(() => null);
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const cart = await cartService.addItem(
      session?.user?.id,
      parsed.data.variantId,
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
