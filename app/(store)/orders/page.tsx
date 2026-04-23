export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/format";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ההזמנות שלי" };

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "ממתין לתשלום", className: "bg-yellow-50 text-yellow-700" },
  PROCESSING: { label: "בעיבוד",        className: "bg-blue-50 text-blue-700" },
  PAID:       { label: "שולם",           className: "bg-green-50 text-green-700" },
  FAILED:     { label: "נכשל",           className: "bg-red-50 text-red-600" },
  CANCELLED:  { label: "בוטל",           className: "bg-gray-50 text-gray-600" },
  REFUNDED:   { label: "הוחזר",          className: "bg-purple-50 text-purple-700" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await orderService.getUserOrders(session.user.id);

  return (
    <div className="mx-auto max-w-screen-md px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">ההזמנות שלי</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-5xl">📦</span>
          <p className="text-lg font-medium">אין הזמנות עדיין</p>
          <Link href="/products">
            <span className="text-sm font-medium text-brand-primary underline">
              לחנות
            </span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const badge = statusLabels[order.status] ?? statusLabels["PENDING"];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-12 border border-surface-tertiary bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">
                    הזמנה #{order.orderNumber.slice(0, 8)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatDate(order.createdAt)} · {order.items.length} פריטים
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  <p className="text-sm font-semibold">{formatPrice(Number(order.totalAmount))}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
