import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { createAddressSchema } from "@/lib/validators/order";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שגיאת אימות", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const userId = session!.user.id;

  // If this address is being set as default, unset all existing defaults
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId },
  });

  return NextResponse.json(address, { status: 201 });
}
