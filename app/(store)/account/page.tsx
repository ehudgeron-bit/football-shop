import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "./AddressManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "החשבון שלי" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-screen-md px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">החשבון שלי</h1>

      {/* Personal info (read-only for now) */}
      <section className="mb-8 rounded-12 border border-surface-tertiary bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">פרטים אישיים</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-text-secondary">שם מלא</dt>
            <dd className="font-medium">
              {session.user.firstName} {session.user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">כתובת מייל</dt>
            <dd className="font-medium" dir="ltr">
              {session.user.email}
            </dd>
          </div>
        </dl>
      </section>

      {/* Addresses */}
      <section className="rounded-12 border border-surface-tertiary bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">כתובות משלוח</h2>
        <AddressManager initialAddresses={addresses} />
      </section>
    </div>
  );
}
