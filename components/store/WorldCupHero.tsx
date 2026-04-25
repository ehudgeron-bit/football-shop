import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getHeroImages(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } },
      take: 8,
      orderBy: { createdAt: "asc" },
    });
    return products.flatMap((p) => p.images.map((i) => i.url));
  } catch {
    return [];
  }
}

export async function WorldCupHero() {
  const images = await getHeroImages();

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ height: "100svh", minHeight: 600, maxHeight: 900 }}>
      {/* Cinematic jersey wall */}
      {images.length > 0 && (
        <div className="absolute inset-0 flex">
          {[...images, ...images].slice(0, 10).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i} src={url} alt="" aria-hidden
              className="flex-1 object-cover object-top"
              style={{ minWidth: 0 }}
            />
          ))}
        </div>
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-[#0a0a0a]/50" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.15) 100%)" }} />
      {/* Colorful glow — World Cup energy */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30" style={{ background: "linear-gradient(to top, #E69900 0%, transparent 100%)" }} />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "#74ACDF", transform: "translate(30%, 30%)" }} />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "#009C3B", transform: "translate(-30%, 30%)" }} />

      {/* Content — bottom-right aligned (RTL = bottom-right is visually prominent) */}
      <div className="relative flex h-full flex-col justify-end" dir="rtl">
        <div className="mx-auto w-full max-w-screen-xl px-8 pb-20 sm:pb-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E69900]/30 bg-[#E69900]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E69900]">
            🏆 FIFA World Cup · 2026
          </p>
          <h1 className="max-w-xl text-5xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl" style={{ letterSpacing: "-0.025em" }}>
            חולצות כדורגל<br />
            <span className="text-white/60">למי שמבין</span>
          </h1>
          <p className="mt-5 max-w-xs text-sm font-normal leading-relaxed text-white/50">
            🇦🇷 🇧🇷 🇫🇷 🇪🇸 🇩🇪 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇵🇹 🇳🇱 · משלוח מהיר
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0a0a0a] transition-all duration-200 hover:bg-[#E69900] hover:text-black"
            >
              קנה עכשיו
            </Link>
            <Link
              href="/mystery-box"
              className="text-sm font-medium text-white/60 underline-offset-4 transition hover:text-white hover:underline"
            >
              Mystery Box →
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="h-8 w-px animate-pulse bg-white" />
      </div>
    </section>
  );
}
