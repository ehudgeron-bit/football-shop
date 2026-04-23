import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "תוצאת תשלום" };

interface PageProps {
  searchParams: Promise<{ orderId?: string; status?: string }>;
}

export default async function CheckoutResultPage({ searchParams }: PageProps) {
  const { orderId, status } = await searchParams;
  const success = status === "success";

  return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            success ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {success ? "✓" : "✕"}
        </div>
      </div>

      <h1 className="text-2xl font-bold">
        {success ? "ההזמנה התקבלה!" : "התשלום נכשל"}
      </h1>

      <p className="mt-3 text-text-secondary">
        {success
          ? "תודה על הרכישה. שלחנו אישור לכתובת המייל שלך."
          : "משהו השתבש בעיבוד התשלום. ניתן לנסות שוב."}
      </p>

      {/* Note: This page is cosmetic only.
          The actual order status is determined exclusively by the webhook.
          Do NOT show order details here — they may not be confirmed yet. */}
      {success && orderId && (
        <p className="mt-2 text-sm text-text-muted">
          מספר הזמנה: <span className="font-mono" dir="ltr">{orderId.slice(0, 8)}…</span>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {success ? (
          <>
            <Link href="/orders">
              <Button fullWidth variant="primary">
                לצפייה בהזמנות
              </Button>
            </Link>
            <Link href="/products">
              <Button fullWidth variant="secondary">
                המשך בקנייה
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/cart">
              <Button fullWidth variant="primary">
                חזור לעגלה ונסה שוב
              </Button>
            </Link>
            <Link href="/">
              <Button fullWidth variant="ghost">
                לדף הבית
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
