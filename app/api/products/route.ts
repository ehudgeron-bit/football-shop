import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const filters = {
    categorySlug: searchParams.get("category") ?? undefined,
    teamSlug: searchParams.get("team") ?? undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    search: searchParams.get("q") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    limit: Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? 12))),
  };

  try {
    const result = await productService.list(filters);
    return NextResponse.json(result, {
      headers: {
        // Allow CDN to cache catalog pages for 60s
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
