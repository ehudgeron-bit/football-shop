import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { authService } from "@/services/auth.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 10 registration attempts per IP per hour
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`register:${ip}`, {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "יותר מדי ניסיונות, נסה שוב מאוחר יותר" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const user = await authService.register(parsed.data);

    return NextResponse.json(
      { message: "נרשמת בהצלחה", userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error) {
      // Known domain errors (e.g. email already exists)
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
