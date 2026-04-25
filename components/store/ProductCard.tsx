import Link from "next/link";
import type { ProductWithRelations } from "@/repositories/product.repository";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col" aria-label={product.name}>
      {/* Image container */}
      <div
        className="relative overflow-hidden bg-[#f4f4f5] dark:bg-[#161616]"
        style={{ aspectRatio: "3/4", borderRadius: 16 }}
      >
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

        {/* Out of stock */}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-sm dark:bg-black/80 dark:text-white">
              אזל מהמלאי
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && hasStock && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-bold leading-none text-white dark:bg-white dark:text-black">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Quick-view on hover */}
        {hasStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="rounded-xl bg-white/95 px-4 py-2.5 text-center text-xs font-bold text-[#0a0a0a] shadow-lg backdrop-blur-sm dark:bg-[#0a0a0a]/95 dark:text-white">
              בחר מידה
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-3 space-y-0.5 px-0.5">
        {product.team && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a1a1aa] dark:text-[#71717a]">
            {product.team.name}
          </p>
        )}
        <p className="text-sm font-medium leading-snug text-[#18181b] dark:text-[#f4f4f5] line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-bold text-[#18181b] dark:text-white">
            {formatPrice(minPrice)}
          </span>
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
      <div className="rounded-2xl bg-[#f4f4f5] dark:bg-[#161616]" style={{ aspectRatio: "3/4" }} />
      <div className="space-y-2 px-0.5">
        <div className="h-2 w-1/4 rounded-full bg-[#f4f4f5] dark:bg-[#222]" />
        <div className="h-3.5 w-3/4 rounded-full bg-[#f4f4f5] dark:bg-[#222]" />
        <div className="h-3.5 w-1/4 rounded-full bg-[#f4f4f5] dark:bg-[#222]" />
      </div>
    </div>
  );
}
