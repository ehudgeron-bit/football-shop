import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { productService } from "@/services/product.service";
import { createProductSchema } from "@/lib/validators/product";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const { items, total } = await productService.list({ page, limit: 20 });
  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const product = await productService.create(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
