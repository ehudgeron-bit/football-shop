import Link from "next/link";
import type { ProductWithRelations } from "@/repositories/product.repository";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: ProductWithRelations;
  adidas?: boolean; // flat Adidas-style grid card (no border-radius, no gap)
}

export function ProductCard({ product, adidas }: ProductCardProps) {
  const primaryImage = product.images[0];
  const hasStock = product.variants.some((v) => v.stock > 0);

  const minPrice = product.variants.reduce((min, v) => {
    const price = Number(v.priceOverride ?? product.basePrice);
    return price < min ? price : min;
  }, Number(product.basePrice));

  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPct =
    compareAt && compareAt > minPrice
      ? Math.round((1 - minPrice / compareAt) * 100)
      : null;

  if (adidas) {
    return (
      <Link href={`/products/${product.slug}`} className="group flex flex-col bg-white dark:bg-black" aria-label={product.name}>
        {/* Image */}
        <div className="relative overflow-hidden bg-[#f5f5f5] dark:bg-[#111]" style={{ aspectRatio: "3/4" }}>
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-black/10 dark:text-white/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                <rect x="3" y="3" width="18" height="18" rx="0" />
                <path strokeLinecap="square" d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}

          {!hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80">
              <span className="bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white dark:bg-white dark:text-black">
                אזל מהמלאי
              </span>
            </div>
          )}

          {discountPct && hasStock && (
            <div className="absolute left-0 top-0 bg-black px-2.5 py-1 text-[11px] font-bold tracking-wider text-white dark:bg-white dark:text-black">
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="border-t border-black/10 px-3 py-3 dark:border-white/10">
          {product.team && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
              {product.team.name}
            </p>
          )}
          <p className="mt-0.5 text-sm font-black leading-snug text-black dark:text-white line-clamp-1">
            {product.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-bold text-black dark:text-white">{formatPrice(minPrice)}</span>
            {compareAt && compareAt > minPrice && (
              <span className="text-xs text-black/30 line-through dark:text-white/30">{formatPrice(compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default rounded card (used in other pages)
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col" aria-label={product.name}>
      <div className="relative overflow-hidden bg-[#f5f5f5] dark:bg-[#161616]" style={{ aspectRatio: "3/4", borderRadius: 16 }}>
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#d4d4d8]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path strokeLinecap="round" d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-sm dark:bg-black/80 dark:text-white">
              אזל מהמלאי
            </span>
          </div>
        )}
        {discountPct && hasStock && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-bold leading-none text-white dark:bg-white dark:text-black">
              -{discountPct}%
            </span>
          </div>
        )}
        {hasStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="rounded-xl bg-white/95 px-4 py-2.5 text-center text-xs font-bold text-[#0a0a0a] shadow-lg backdrop-blur-sm dark:bg-[#0a0a0a]/95 dark:text-white">
              בחר מידה
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-0.5 px-0.5">
        {product.team && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a1a1aa]">{product.team.name}</p>
        )}
        <p className="text-sm font-medium leading-snug text-[#18181b] dark:text-[#f4f4f5] line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-bold text-[#18181b] dark:text-white">{formatPrice(minPrice)}</span>
          {compareAt && compareAt > minPrice && (
            <span className="text-xs text-[#a1a1aa] line-through">{formatPrice(compareAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="bg-[#f5f5f5] dark:bg-[#1a1a1a]" style={{ aspectRatio: "3/4" }} />
      <div className="space-y-2 px-0.5">
        <div className="h-2 w-1/4 bg-[#f5f5f5] dark:bg-[#222]" />
        <div className="h-3.5 w-3/4 bg-[#f5f5f5] dark:bg-[#222]" />
        <div className="h-3.5 w-1/4 bg-[#f5f5f5] dark:bg-[#222]" />
      </div>
    </div>
  );
}
