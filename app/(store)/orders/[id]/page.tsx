import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { orderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "פרטי הזמנה" };

type PageProps = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  let order;
  try {
    order = await orderService.getOrderForUser(id, session.user.id);
  } catch {
    notFound();
  }

  const shipping = order.shippingSnapshot as {
    street: string; city: string; zipCode: string;
  } | null;

  const statusMap: Record<string, string> = {
    PENDING: "ממתין לתשלום", PROCESSING: "בעיבוד", PAID: "שולם",
    FAILED: "נכשל", CANCELLED: "בוטל", REFUNDED: "הוחזר",
  };

  return (
    <div className="mx-auto max-w-screen-md px-4 py-10 sm:px-6">
      <Link href="/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        ← חזור להזמנות
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">הזמנה #{order.orderNumber.slice(0, 8)}</h1>
          <p className="text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-pill px-3 py-1 text-sm font-medium ${
          order.status === "PAID" ? "bg-green-50 text-green-700" :
          order.status === "FAILED" ? "bg-red-50 text-red-600" :
          "bg-yellow-50 text-yellow-700"
        }`}>
          {statusMap[order.status] ?? order.status}
        </span>
      </div>

      {/* Items */}
      <div className="mb-6 rounded-12 border border-surface-tertiary bg-white">
        <div className="border-b border-surface-tertiary px-5 py-4">
          <h2 className="font-semibold">פריטים שהוזמנו</h2>
        </div>
        <div className="flex flex-col divide-y divide-surface-tertiary">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-8 bg-surface-secondary">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">⚽</div>
                )}
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-text-secondary">מידה {item.size} · כמות {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Shipping */}
        {shipping && (
          <div className="rounded-12 border border-surface-tertiary bg-white p-5">
            <h2 className="mb-3 font-semibold">כתובת משלוח</h2>
            <p className="text-sm">{shipping.street}</p>
            <p className="text-sm text-text-secondary">{shipping.city}, {shipping.zipCode}</p>
          </div>
        )}

        {/* Payment summary */}
        <div className="rounded-12 border border-surface-tertiary bg-white p-5">
          <h2 className="mb-3 font-semibold">סיכום תשלום</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">סה"כ</span>
              <span className="font-semibold">{formatPrice(Number(order.totalAmount))}</span>
            </div>
            {order.payment && (
              <div className="flex justify-between">
                <span className="text-text-secondary">ספק תשלום</span>
                <span className="capitalize">{order.payment.provider}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
