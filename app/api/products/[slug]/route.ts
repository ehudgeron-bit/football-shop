import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const product = await productService.getBySlug(slug);
    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "מוצר לא נמצא") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("[GET /api/products/[slug]]", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
