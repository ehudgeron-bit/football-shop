import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "עגלת הקניות" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">עגלת הקניות</h1>
      <CartView />
    </div>
  );
}
