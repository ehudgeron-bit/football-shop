import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard — middleware catches most cases, this is the safety net
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-surface-secondary" dir="rtl">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="border-b border-surface-tertiary bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">פאנל ניהול</h1>
            <span className="text-sm text-text-secondary">
              שלום, {session.user.firstName}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
