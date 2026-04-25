import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { WorldCupHero } from "@/components/store/WorldCupHero";

export const dynamic = "force-dynamic";

const nations = [
  { name: "ארגנטינה", q: "ארגנטינה" },
  { name: "ברזיל",    q: "ברזיל" },
  { name: "צרפת",     q: "צרפת" },
  { name: "ספרד",     q: "ספרד" },
  { name: "גרמניה",   q: "גרמניה" },
  { name: "אנגליה",   q: "אנגליה" },
  { name: "פורטוגל",  q: "פורטוגל" },
  { name: "הולנד",    q: "הולנד" },
];

async function getData() {
  try {
    const [f, n, imgs] = await Promise.all([
      productService.list({ featured: true, limit: 8 }),
      productService.list({ limit: 16, page: 2 }),
      Promise.all(
        nations.map((nation) =>
          prisma.product.findFirst({
            where: { isActive: true, team: { name: { contains: nation.q } } },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
            orderBy: { isFeatured: "desc" },
          })
        )
      ),
    ]);
    const ids = new Set(f.items.map((p) => p.id));
    return {
      featured: f.items,
      newArrivals: n.items.filter((p) => !ids.has(p.id)).slice(0, 8),
      nationImages: imgs,
    };
  } catch {
    return { featured: [], newArrivals: [], nationImages: [] };
  }
}

/* ─── Minimal section heading ──────────────────────────────── */
function SectionHeading({
  label, title, href,
}: {
  label?: string; title: string; href?: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        {label && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a1a1aa]">{label}</p>
        )}
        <h2 className="text-2xl font-black text-[#18181b] dark:text-white sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-[#a1a1aa] transition hover:text-[#18181b] dark:hover:text-white">
          הכל ←
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { featured, newArrivals, nationImages } = await getData();

  return (
    <main className="bg-white dark:bg-[#0a0a0a]" dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <WorldCupHero />

      {/* ── NATIONS ──────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading label="World Cup 2026" title="נבחרות המונדיאל" href="/products?category=national-teams" />
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {nations.map((nation, i) => {
              const img = nationImages[i]?.images?.[0]?.url;
              return (
                <Link
                  key={nation.q}
                  href={`/products?q=${encodeURIComponent(nation.q)}`}
                  className="group relative overflow-hidden bg-[#f4f4f5] dark:bg-[#161616]"
                  style={{ aspectRatio: "2/3", borderRadius: 12 }}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={nation.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />
                  <p className="absolute bottom-0 left-0 right-0 p-2 text-center text-[10px] font-bold text-white">
                    {nation.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-[#f4f4f5] px-6 py-20 dark:border-[#1c1c1c] sm:py-24">
          <div className="mx-auto max-w-screen-xl">
            <SectionHeading label="Best Sellers" title="הנמכרים ביותר" href="/products?featured=true" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── MYSTERY BOX BANNER ───────────────────────────────── */}
      <section className="px-6 py-4 pb-20 sm:pb-24">
        <div className="mx-auto max-w-screen-xl">
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 24, background: "#0a0a0a", minHeight: 280 }}
          >
            {/* Background imagery */}
            {featured.length >= 6 && (
              <div className="absolute inset-0 flex opacity-20">
                {featured.slice(0, 6).map((p, i) => p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p.images[0].url} alt=""
                    className="flex-1 object-cover object-top"
                    style={{ minWidth: 0 }}
                  />
                ))}
              </div>
            )}
            {/* Gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to left, transparent 30%, rgba(10,10,10,0.95) 70%)" }} />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-center px-10 py-14">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E69900]">
                Limited Drop
              </p>
              <h3 className="max-w-xs text-3xl font-black leading-tight text-white sm:text-4xl" style={{ letterSpacing: "-0.025em" }}>
                קופסת<br />מסתורין
              </h3>
              <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
                חולצת נבחרת מקורית בהפתעה — אחת מ-13 הנבחרות הגדולות של המונדיאל 2026.
              </p>
              <Link
                href="/mystery-box"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#E69900] px-7 py-3 text-sm font-bold text-black transition-all hover:bg-[#cc8800]"
              >
                הזמן עכשיו
              </Link>
            </div>

            {/* Mystery box image */}
            <div className="absolute bottom-0 left-10 hidden overflow-hidden sm:block" style={{ width: 200, height: "90%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/mystery-box.jpeg" alt="" className="h-full w-full object-cover object-top opacity-70" style={{ borderRadius: "12px 12px 0 0" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="border-t border-[#f4f4f5] px-6 py-20 dark:border-[#1c1c1c] sm:py-24">
          <div className="mx-auto max-w-screen-xl">
            <SectionHeading label="New In" title="הגיעו זה עתה" href="/products" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {newArrivals.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST ────────────────────────────────────────────── */}
      <section className="border-t border-[#f4f4f5] px-6 py-14 dark:border-[#1c1c1c]">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { icon: "↗", title: "משלוח חינם", sub: "בכל הזמנה" },
              { icon: "⌛", title: "1–2 ימי עסקים", sub: "משלוח מהיר" },
              { icon: "↩", title: "30 יום החזרה", sub: "ללא שאלות" },
              { icon: "★", title: "4.9 / 5", sub: "מעל 2,000 ביקורות" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-1.5">
                <span className="text-xl font-black text-[#E69900]">{item.icon}</span>
                <p className="text-sm font-bold text-[#18181b] dark:text-white">{item.title}</p>
                <p className="text-xs text-[#a1a1aa]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP ─────────────────────────────────────────── */}
      <a
        href="https://wa.me/972501234567"
        target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110"
        style={{ width: 52, height: 52, background: "#25D366" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </main>
  );
}
