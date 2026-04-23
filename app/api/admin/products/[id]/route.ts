import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { productService } from "@/services/product.service";
import { updateProductSchema } from "@/lib/validators/product";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const product = await productService.update(id, parsed.data);
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Error) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await productService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error) return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
