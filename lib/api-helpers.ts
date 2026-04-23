import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Call at the top of any admin API route handler
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "לא מחובר" }, { status: 401 }),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "אין הרשאה" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

// Call at the top of any user-protected API route handler
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "לא מחובר" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

// Wraps Zod parse errors into a consistent API response
export function validationError(errors: Record<string, string[]>) {
  return NextResponse.json({ error: "שגיאת אימות", details: errors }, { status: 422 });
}
