import { orderRepository } from "@/repositories/order.repository";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminOrderActions } from "./AdminOrderActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ניהול הזמנות" };

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "ממתין", PROCESSING: "בעיבוד", PAID: "שולם",
  FAILED: "נכשל", CANCELLED: "בוטל", REFUNDED: "הוחזר",
};
const statusColors: Record<string, string> = {
  PAID: "bg-green-50 text-green-700", PENDING: "bg-yellow-50 text-yellow-700",
  FAILED: "bg-red-50 text-red-600", CANCELLED: "bg-gray-50 text-gray-500",
  PROCESSING: "bg-blue-50 text-blue-700", REFUNDED: "bg-purple-50 text-purple-700",
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const { items: orders, total } = await orderRepository.findAll({ page, limit: 20 });
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">הזמנות ({total})</h1>
      </div>

      <div className="rounded-12 border border-surface-tertiary bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-tertiary text-right text-xs font-medium text-text-secondary">
                <th className="px-4 py-3">מס' הזמנה</th>
                <th className="px-4 py-3">לקוח</th>
                <th className="px-4 py-3">תאריך</th>
                <th className="px-4 py-3">פריטים</th>
                <th className="px-4 py-3">סכום</th>
                <th className="px-4 py-3">סטטוס</th>
                <th className="px-4 py-3">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-tertiary">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-secondary">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNumber.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    {order.user.firstName} {order.user.lastName}
                    <span className="block text-xs text-text-muted">{order.user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-center">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${statusColors[order.status] ?? ""}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 text-sm">
          {page > 1 && <a href={`?page=${page - 1}`} className="rounded-8 border px-4 py-2 hover:bg-surface-secondary">הקודם</a>}
          <span className="px-4 py-2 text-text-secondary">עמוד {page} / {totalPages}</span>
          {page < totalPages && <a href={`?page=${page + 1}`} className="rounded-8 border px-4 py-2 hover:bg-surface-secondary">הבא</a>}
        </div>
      )}
    </div>
  );
}
