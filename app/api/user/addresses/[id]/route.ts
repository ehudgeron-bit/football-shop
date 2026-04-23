import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Verify ownership before deleting
  const address = await prisma.address.findFirst({
    where: { id, userId: session!.user.id },
  });

  if (!address) {
    return NextResponse.json({ error: "כתובת לא נמצאה" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
