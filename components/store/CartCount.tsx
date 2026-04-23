"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// This component is mounted inside the header and independently fetches
// the cart count so it stays live without a full page reload.
export function CartCount() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setCount(data.itemCount ?? 0);
      } catch {
        // Non-critical — silently fail
      }
    }

    loadCount();
    return () => { cancelled = true; };
  // Re-fetch whenever navigation happens (catches add-to-cart updates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <Link
      href="/cart"
      className="relative rounded-8 p-2 text-text-primary transition-colors hover:bg-surface-secondary"
      aria-label={`עגלת קניות${count > 0 ? ` (${count} פריטים)` : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
