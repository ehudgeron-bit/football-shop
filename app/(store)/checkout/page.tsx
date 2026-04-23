export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cartService } from "@/services/cart.service";
import { cartRepository } from "@/repositories/cart.repository";
import { CheckoutForm } from "./CheckoutForm";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "תשלום" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const cart = await cartRepository.findByUserId(session.user.id);
  if (!cart || cart.items.length === 0) redirect("/cart");

  const summary = cartService.summarize(cart);
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">סיום הזמנה</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Checkout form */}
        <div className="lg:col-span-3">
          <CheckoutForm addresses={addresses} />
        </div>

        {/* Order summary (read-only) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-12 border border-surface-tertiary bg-white p-6">
            <h2 className="mb-5 text-base font-semibold">סיכום הזמנה</h2>

            <div className="flex flex-col divide-y divide-surface-tertiary">
              {cart.items.map((item) => {
                const price = Number(
                  item.variant.priceOverride ?? item.variant.product.basePrice
                );
                const image = item.variant.product.images[0];
                return (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-8 bg-surface-secondary">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={item.variant.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">⚽</div>
                      )}
                      <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div className="text-xs">
                        <p className="font-medium leading-snug">{item.variant.product.name}</p>
                        <p className="text-text-secondary">מידה {item.variant.size}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-surface-tertiary pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">סכום ביניים</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">משלוח</span>
                {summary.subtotal >= 500 ? (
                  <span className="text-green-600">חינם</span>
                ) : (
                  <span>{formatPrice(35)}</span>
                )}
              </div>
              <div className="flex justify-between border-t border-surface-tertiary pt-2 text-base font-semibold">
                <span>סה"כ</span>
                <span>
                  {formatPrice(summary.subtotal + (summary.subtotal >= 500 ? 0 : 35))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
