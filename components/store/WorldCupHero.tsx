import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getHeroImages(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } },
      take: 18,
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
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ minHeight: 560 }} dir="rtl">
      {/* Jersey mosaic background */}
      {images.length > 0 && (
        <div
          className="absolute inset-0 grid opacity-35"
          style={{ gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}
        >
          {[...images, ...images].slice(0, 18).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              aria-hidden
              className="h-full w-full object-cover object-top"
              style={{ aspectRatio: "3/4" }}
            />
          ))}
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0a 20%, rgba(10,10,10,0.65) 60%, rgba(10,10,10,0.4) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.3) 0%, transparent 50%, rgba(10,10,10,0.3) 100%)" }} />

      {/* Content */}
      <div className="relative mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-28 text-center sm:px-6" style={{ minHeight: 560 }}>
        {/* Trophy badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="rounded-pill border border-[#E69900]/50 bg-[#E69900]/10 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#E69900]">
            FIFA WORLD CUP 2026
          </span>
          <span className="text-2xl">⚽</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl md:text-7xl">
          חולצות כדורגל
          <br />
          <span className="text-[#E69900]">למונדיאל 2026</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base font-medium text-gray-300">
          כל הנבחרות · ליגות ונבחרות מובילות · מקורי בלבד · משלוח מהיר לכל הארץ
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="rounded-pill bg-[#E69900] px-10 py-4 text-sm font-black text-black shadow-lg shadow-[#E69900]/20 transition hover:bg-[#cc8800] hover:shadow-[#E69900]/40"
          >
            לקנייה עכשיו ←
          </Link>
          <Link
            href="/products?featured=true"
            className="rounded-pill border border-white/25 bg-white/8 px-10 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            מבצעים מיוחדים
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          {[
            { n: "1,000+", label: "חולצות" },
            { n: "50+", label: "נבחרות וקבוצות" },
            { n: "48", label: "נבחרות מונדיאל" },
            { n: "100%", label: "מקורי מאושר" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-black text-[#E69900]">{s.n}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: "linear-gradient(to bottom, transparent, #0a0a0a)" }} />
    </section>
  );
}
