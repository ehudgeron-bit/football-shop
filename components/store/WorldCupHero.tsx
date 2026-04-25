import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getHeroImages(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } },
      take: 12,
      orderBy: { createdAt: "asc" },
    });
    return products.flatMap((p) => p.images.map((img) => img.url));
  } catch {
    return [];
  }
}

export async function WorldCupHero() {
  const images = await getHeroImages();

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 520 }} dir="rtl">
      {/* Jersey row background — like jerseys hanging */}
      <div className="absolute inset-0 flex">
        {images.length > 0 ? (
          <div className="flex w-full">
            {[...images, ...images, ...images].slice(0, 14).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                aria-hidden
                className="flex-1 object-cover object-top"
                style={{ minWidth: 0 }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-gray-800" />
        )}
      </div>

      {/* Dark overlay — stronger at bottom for text legibility */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%)" }} />

      {/* Content */}
      <div className="relative mx-auto flex max-w-screen-xl flex-col items-center justify-end px-4 pb-16 pt-24 text-center sm:px-6" style={{ minHeight: 520 }}>
        <h1 className="text-4xl font-black leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          חולצות כדורגל למונדיאל 2026
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-pill bg-[#E69900] px-10 py-3.5 text-sm font-black text-black shadow-xl transition hover:bg-[#cc8800]"
          >
            לקנייה עכשיו
          </Link>
          <Link
            href="/mystery-box"
            className="rounded-pill border border-white/40 bg-white/10 px-10 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            🎁 קופסת מסתורין
          </Link>
        </div>
      </div>
    </section>
  );
}
