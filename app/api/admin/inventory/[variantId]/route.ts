import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ variantId: string }> };

const updateSchema = z.object({
  stock: z.number().int().min(0, "מלאי לא יכול להיות שלילי"),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { variantId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ערך מלאי לא תקין" }, { status: 422 });
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return NextResponse.json({ error: "גרסה לא נמצאה" }, { status: 404 });

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: parsed.data.stock },
    select: { id: true, size: true, stock: true, productId: true },
  });

  return NextResponse.json(updated);
}
