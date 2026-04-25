"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface Props {
  variants: Variant[];
  price: number;
}

export function MysteryBoxOrderClient({ variants, price }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const sorted = [...variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );
  const selectedVariant = sorted.find((v) => v.size === selectedSize);

  async function addToCart(redirect: boolean) {
    if (!selectedVariant) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "שגיאה בהוספה לסל", "error");
        setLoading(false);
        return;
      }

      if (redirect) {
        router.push("/checkout");
      } else {
        toast("קופסת המסתורין נוספה לסל הקניות!", "success");
        router.refresh();
        setLoading(false);
      }
    } catch {
      toast("שגיאת שרת", "error");
      setLoading(false);
    }
  }

  const total = price * quantity;

  return (
    <div className="flex flex-col gap-6">
      {/* Size picker */}
      <div>
        <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">בחר מידה</p>
        <div className="flex flex-wrap gap-2">
          {sorted.map((v) => {
            const isSelected = v.size === selectedSize;
            return (
              <button
                key={v.id}
                onClick={() => { setSelectedSize(v.size); setSizeError(false); }}
                className={[
                  "h-12 min-w-[3.5rem] rounded-12 border px-4 text-sm font-bold transition-all duration-150",
                  isSelected
                    ? "border-[#E69900] bg-[#E69900] text-black shadow-lg"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#E69900] dark:border-white/20 dark:bg-white/5 dark:text-gray-300 dark:hover:border-[#E69900]/60",
                ].join(" ")}
                aria-pressed={isSelected}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        {sizeError && (
          <p className="mt-2 text-xs font-semibold text-red-500">נא לבחור מידה לפני ההזמנה</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">כמות</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-lg text-gray-700 transition hover:bg-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            −
          </button>
          <span className="w-6 text-center text-lg font-bold text-gray-900 dark:text-white">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(5, q + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-lg text-gray-700 transition hover:bg-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            +
          </button>
          <span className="text-sm text-gray-500">מקסימום 5 יחידות</span>
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-16 border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>מחיר ליחידה</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(price)}</span>
        </div>
        {quantity > 1 && (
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>כמות</span>
            <span className="font-semibold text-gray-900 dark:text-white">× {quantity}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-white/10">
          <span className="text-base font-bold text-gray-900 dark:text-white">סה״כ</span>
          <span className="text-xl font-black text-[#E69900]">{formatPrice(total)}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => addToCart(true)}
          disabled={loading}
          className="w-full rounded-pill bg-[#E69900] py-4 text-sm font-black text-black shadow-lg transition hover:bg-[#cc8800] disabled:opacity-60"
        >
          {loading ? "מעבד..." : "הזמן עכשיו ←"}
        </button>
        <button
          onClick={() => addToCart(false)}
          disabled={loading}
          className="w-full rounded-pill border border-gray-300 bg-white py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 disabled:opacity-60"
        >
          הוסף לסל הקניות
        </button>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span>✓ חולצה מקורית מובטחת</span>
        <span>✓ משלוח חינם מ-₪199</span>
        <span>✓ החזרה תוך 30 יום</span>
      </div>
    </div>
  );
}
