import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { cartService } from "@/services/cart.service";

// Called by the client immediately after login to merge guest cart
export async function POST() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await cartService.mergeGuestCart(session!.user.id);
    return NextResponse.json({ merged: true });
  } catch (err) {
    console.error("[POST /api/cart/merge]", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
