import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "לוח בקרה" };
export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, paid, pending, revenue, monthRevenue, products, lowStock, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: "PAID" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "PAID", createdAt: { gte: startOfMonth } },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, orderNumber: true, status: true,
          totalAmount: true, createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  return {
    total, paid, pending,
    revenue: Number(revenue._sum.totalAmount ?? 0),
    monthRevenue: Number(monthRevenue._sum.totalAmount ?? 0),
    products, lowStock, recentOrders,
  };
}

const statusColors: Record<string, string> = {
  PAID: "text-green-600", PENDING: "text-yellow-600",
  FAILED: "text-red-600", CANCELLED: "text-gray-500",
};
const statusLabels: Record<string, string> = {
  PAID: "שולם", PENDING: "ממתין", FAILED: "נכשל",
  CANCELLED: "בוטל", PROCESSING: "בעיבוד", REFUNDED: "הוחזר",
};

export default async function DashboardPage() {
  const s = await getStats();

  const cards = [
    { label: "הכנסות החודש", value: formatPrice(s.monthRevenue), sub: `סה"כ ${formatPrice(s.revenue)}` },
    { label: "הזמנות שולמו", value: s.paid, sub: `${s.total} סה"כ` },
    { label: "ממתינות לתשלום", value: s.pending, sub: "הזמנות פתוחות" },
    { label: "מוצרים פעילים", value: s.products, sub: `${s.lowStock} מידות במלאי נמוך` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">סקירה כללית</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-12 border border-surface-tertiary bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-text-muted">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-12 border border-surface-tertiary bg-white">
        <div className="border-b border-surface-tertiary px-6 py-4">
          <h2 className="font-semibold">הזמנות אחרונות</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-tertiary text-right text-xs font-medium text-text-secondary">
                <th className="px-6 py-3">מס' הזמנה</th>
                <th className="px-6 py-3">לקוח</th>
                <th className="px-6 py-3">תאריך</th>
                <th className="px-6 py-3">סטטוס</th>
                <th className="px-6 py-3">סכום</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-tertiary">
              {s.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-secondary">
                  <td className="px-6 py-4 font-mono text-xs">
                    {order.orderNumber.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${statusColors[order.status] ?? "text-text-primary"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {formatPrice(Number(order.totalAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
