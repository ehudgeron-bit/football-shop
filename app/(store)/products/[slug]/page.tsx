import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productService } from "@/services/product.service";
import { ProductGallery } from "./ProductGallery";
import { AddToCartSection } from "./AddToCartSection";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productService.getBySlug(slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: "מוצר לא נמצא" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    notFound();
  }

  const hasStock = product.variants.some((v) => v.stock > 0);
  const minPrice = Math.min(
    ...product.variants.map((v) => Number(v.priceOverride ?? product.basePrice))
  );
  const maxPrice = Math.max(
    ...product.variants.map((v) => Number(v.priceOverride ?? product.basePrice))
  );
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-text-secondary" aria-label="breadcrumb">
        <a href="/" className="hover:text-text-primary">בית</a>
        <span>/</span>
        <a href="/products" className="hover:text-text-primary">מוצרים</a>
        {product.category && (
          <>
            <span>/</span>
            <a href={`/products?category=${product.category.slug}`} className="hover:text-text-primary">
              {product.category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Details */}
        <div className="flex flex-col gap-6">
          {product.team && (
            <p className="text-sm font-medium text-text-secondary">{product.team.name}</p>
          )}

          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>

          <p className="text-2xl font-semibold">{priceDisplay}</p>

          {!hasStock && (
            <div className="rounded-8 border border-surface-tertiary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
              מוצר זה אזל מהמלאי כרגע
            </div>
          )}

          {/* Size selector + Add to Cart — client component */}
          <AddToCartSection product={product} />

          {/* Description */}
          <div className="border-t border-surface-tertiary pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
              תיאור המוצר
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {product.description}
            </p>
          </div>

          {/* Size guide */}
          <div className="rounded-8 border border-surface-tertiary p-4 text-sm">
            <p className="font-medium">מדריך מידות</p>
            <p className="mt-1 text-text-secondary">
              חולצות בגזרה רגילה. לגזרה רחבה יותר, הזמן מידה אחת גדולה יותר.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
