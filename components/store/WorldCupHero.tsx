import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getHeroImages(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } },
      take: 6,
      orderBy: { createdAt: "asc" },
    });
    return products.flatMap((p) => p.images.map((i) => i.url));
  } catch {
    return [];
  }
}

export async function WorldCupHero() {
  const images = await getHeroImages();
  const heroImage = images[0];

  return (
    <section className="relative overflow-hidden bg-black" style={{ height: "100svh", minHeight: 600, maxHeight: 960 }}>
      {/* Full-bleed background jersey */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-top opacity-40"
        />
      )}

      {/* Hard black gradient from bottom */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)" }} />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end" dir="rtl">
        <div className="mx-auto w-full max-w-screen-xl px-6 pb-16 sm:pb-24">

          {/* Tag */}
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.35em] text-white/50">
            FIFA World Cup · 2026
          </p>

          {/* Main headline */}
          <h1
            className="text-white"
            style={{
              fontWeight: 900,
              fontSize: "clamp(3rem, 9vw, 8rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            National<br />
            <span style={{ WebkitTextStroke: "2px white", color: "transparent" }}>
              Team
            </span>
            <br />
            Jerseys
          </h1>

          <p className="mt-6 text-sm font-medium tracking-[0.15em] text-white/50 uppercase">
            🇦🇷 Argentina &nbsp;·&nbsp; 🇧🇷 Brazil &nbsp;·&nbsp; 🇫🇷 France &nbsp;·&nbsp; 🇪🇸 Spain &nbsp;·&nbsp; 🇩🇪 Germany
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products?category=national-teams"
              className="inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-80"
            >
              Shop Now
            </Link>
            <Link
              href="/mystery-box"
              className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all hover:border-white hover:bg-white/10"
            >
              Mystery Box
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
