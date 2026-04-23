"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import type { CartSummary } from "@/services/cart.service";

type CartItem = CartSummary["cart"]["items"][number];

export function CartView() {
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) setSummary(await res.json());
    } catch {
      toast("שגיאה בטעינת העגלה", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        setSummary(await res.json());
      } else {
        const data = await res.json();
        toast(data.error ?? "שגיאה", "error");
      }
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setSummary(await res.json());
        toast("פריט הוסר מהעגלה", "info");
      }
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!summary || summary.cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <div>
          <p className="text-xl font-semibold">העגלה שלך ריקה</p>
          <p className="mt-2 text-text-secondary">הוסף מוצרים כדי להתחיל</p>
        </div>
        <Link href="/products">
          <Button variant="primary" size="lg">
            לחנות
          </Button>
        </Link>
      </div>
    );
  }

  const { cart, itemCount, subtotal } = summary;
  const SHIPPING_THRESHOLD = 500;
  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = shippingFree ? 0 : 35;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Items list */}
      <div className="lg:col-span-2">
        <div className="flex flex-col divide-y divide-surface-tertiary">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              updating={updatingId === item.id}
              onQuantityChange={(qty) => updateQuantity(item.id, qty)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-12 border border-surface-tertiary bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">סיכום הזמנה</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">
                מוצרים ({itemCount})
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">משלוח</span>
              {shippingFree ? (
                <span className="font-medium text-green-600">חינם</span>
              ) : (
                <span>{formatPrice(shippingCost)}</span>
              )}
            </div>
            {!shippingFree && (
              <p className="text-xs text-text-secondary">
                הוסף עוד {formatPrice(SHIPPING_THRESHOLD - subtotal)} לקבלת משלוח חינם
              </p>
            )}
          </div>

          <div className="my-4 border-t border-surface-tertiary" />

          <div className="flex justify-between text-base font-semibold">
            <span>סה"כ לתשלום</span>
            <span>{formatPrice(subtotal + shippingCost)}</span>
          </div>

          <Link href="/checkout" className="mt-5 block">
            <Button fullWidth size="lg">
              המשך לתשלום
            </Button>
          </Link>

          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-text-secondary hover:text-text-primary"
          >
            המשך בקנייה
          </Link>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  updating: boolean;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

function CartItemRow({ item, updating, onQuantityChange, onRemove }: CartItemRowProps) {
  const { variant } = item;
  const { product } = variant;
  const unitPrice = Number(variant.priceOverride ?? product.basePrice);
  const lineTotal = unitPrice * item.quantity;
  const image = product.images[0];

  return (
    <div className={`flex gap-4 py-5 ${updating ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="flex-shrink-0">
        <div className="relative h-24 w-20 overflow-hidden rounded-8 bg-surface-secondary sm:h-28 sm:w-24">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">⚽</div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium leading-snug hover:underline"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-text-secondary">מידה: {variant.size}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-8 border border-surface-tertiary">
            <button
              onClick={() => onQuantityChange(item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
              aria-label="הפחת כמות"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium" aria-live="polite">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= variant.stock}
              className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
              aria-label="הוסף כמות"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-end">
            <p className="text-sm font-semibold">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-text-secondary">{formatPrice(unitPrice)} ליחידה</p>
            )}
          </div>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="self-start text-text-muted transition-colors hover:text-red-500"
        aria-label={`הסר ${product.name}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
