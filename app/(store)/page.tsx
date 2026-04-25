import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { WorldCupHero } from "@/components/store/WorldCupHero";

export const dynamic = "force-dynamic";

const nations = [
  { name: "ארגנטינה", q: "ארגנטינה", flag: "🇦🇷", en: "Argentina" },
  { name: "ברזיל",    q: "ברזיל",    flag: "🇧🇷", en: "Brazil" },
  { name: "צרפת",     q: "צרפת",     flag: "🇫🇷", en: "France" },
  { name: "ספרד",     q: "ספרד",     flag: "🇪🇸", en: "Spain" },
  { name: "גרמניה",   q: "גרמניה",   flag: "🇩🇪", en: "Germany" },
  { name: "אנגליה",   q: "אנגליה",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", en: "England" },
  { name: "פורטוגל",  q: "פורטוגל",  flag: "🇵🇹", en: "Portugal" },
  { name: "הולנד",    q: "הולנד",    flag: "🇳🇱", en: "Netherlands" },
  { name: "קולומביה", q: "קולומביה", flag: "🇨🇴", en: "Colombia" },
  { name: "מרוקו",    q: "מרוקו",    flag: "🇲🇦", en: "Morocco" },
  { name: "איטליה",   q: "איטליה",   flag: "🇮🇹", en: "Italy" },
  { name: "מקסיקו",   q: "מקסיקו",   flag: "🇲🇽", en: "Mexico" },
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40">
      {children}
    </p>
  );
}

export default async function HomePage() {
  const { featured, newArrivals, nationImages } = await getData();

  return (
    <main className="bg-white dark:bg-black" dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <WorldCupHero />

      {/* ── NATIONS ──────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-screen-xl">

          {/* Section header */}
          <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-6 dark:border-white/10">
            <div>
              <SectionLabel>FIFA World Cup 2026</SectionLabel>
              <h2 className="mt-2 text-4xl font-black uppercase dark:text-white sm:text-5xl" style={{ letterSpacing: "-0.03em" }}>
                נבחרות המונדיאל
              </h2>
            </div>
            <Link
              href="/products?category=national-teams"
              className="hidden text-sm font-bold uppercase tracking-[0.1em] text-black underline-offset-4 transition hover:underline dark:text-white sm:block"
            >
              כל הנבחרות →
            </Link>
          </div>

          {/* Nations grid — Adidas federation style */}
          <div className="grid grid-cols-2 gap-px bg-black/10 dark:bg-white/10 sm:grid-cols-3 lg:grid-cols-4">
            {nations.map((nation, i) => {
              const img = nationImages[i]?.images?.[0]?.url;
              return (
                <Link
                  key={nation.q}
                  href={`/products?q=${encodeURIComponent(nation.q)}`}
                  className="group relative flex flex-col bg-white dark:bg-black"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Jersey image */}
                  <div className="relative flex-1 overflow-hidden bg-[#f5f5f5] dark:bg-[#111]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={nation.name}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl opacity-20">
                        {nation.flag}
                      </div>
                    )}
                  </div>

                  {/* Country info bar */}
                  <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{nation.flag}</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 dark:text-white/40">
                          {nation.en}
                        </p>
                        <p className="text-sm font-black text-black dark:text-white">{nation.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-black/30 transition-all group-hover:text-black dark:text-white/30 dark:group-hover:text-white">
                      Shop →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-black/10 px-6 py-20 dark:border-white/10 sm:py-28">
          <div className="mx-auto max-w-screen-xl">
            <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-6 dark:border-white/10">
              <div>
                <SectionLabel>Top Picks</SectionLabel>
                <h2 className="mt-2 text-4xl font-black uppercase dark:text-white sm:text-5xl" style={{ letterSpacing: "-0.03em" }}>
                  הנמכרים ביותר
                </h2>
              </div>
              <Link href="/products?featured=true" className="hidden text-sm font-bold uppercase tracking-[0.1em] text-black underline-offset-4 transition hover:underline dark:text-white sm:block">
                הכל →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-black/10 dark:bg-white/10 sm:grid-cols-4">
              {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} adidas />)}
            </div>
          </div>
        </section>
      )}

      {/* ── MYSTERY BOX BANNER ───────────────────────────────── */}
      <section className="bg-black px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-white/40">
                Limited Drop
              </p>
              <h2
                className="text-white"
                style={{ fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.9, letterSpacing: "-0.03em", textTransform: "uppercase" }}
              >
                Mystery<br />
                <span style={{ WebkitTextStroke: "2px white", color: "transparent" }}>Box</span>
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
                חולצת נבחרת מקורית בהפתעה — אחת מ-13 הנבחרות הגדולות של מונדיאל 2026.
              </p>
              <Link
                href="/mystery-box"
                className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-80"
              >
                הזמן עכשיו
              </Link>
            </div>

            {/* Mystery box image */}
            <div className="relative w-full max-w-xs overflow-hidden sm:w-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/mystery-box.jpeg" alt="Mystery Box" className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="border-t border-black/10 px-6 py-20 dark:border-white/10 sm:py-28">
          <div className="mx-auto max-w-screen-xl">
            <div className="mb-12 flex items-end justify-between border-b border-black/10 pb-6 dark:border-white/10">
              <div>
                <SectionLabel>New In</SectionLabel>
                <h2 className="mt-2 text-4xl font-black uppercase dark:text-white sm:text-5xl" style={{ letterSpacing: "-0.03em" }}>
                  הגיעו זה עתה
                </h2>
              </div>
              <Link href="/products" className="hidden text-sm font-bold uppercase tracking-[0.1em] text-black underline-offset-4 transition hover:underline dark:text-white sm:block">
                הכל →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-black/10 dark:bg-white/10 sm:grid-cols-4">
              {newArrivals.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} adidas />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 md:grid-cols-4 [&>*]:divide-x">
            {[
              { icon: "📦", title: "משלוח חינם", sub: "בכל הזמנה" },
              { icon: "⚡", title: "1–2 ימי עסקים", sub: "משלוח מהיר" },
              { icon: "↩", title: "30 יום החזרה", sub: "ללא שאלות" },
              { icon: "⭐", title: "4.9 / 5", sub: "מעל 2,000 ביקורות" },
            ].map((item, i) => (
              <div key={item.title} className={`flex flex-col gap-1 px-6 py-8 ${i > 0 ? "border-r border-black/10 dark:border-white/10" : ""}`} style={{ direction: "rtl" }}>
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-2 text-sm font-black uppercase tracking-tight text-black dark:text-white">{item.title}</p>
                <p className="text-xs text-black/40 dark:text-white/40">{item.sub}</p>
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
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center shadow-xl transition-transform hover:scale-110"
        style={{ width: 52, height: 52, background: "#25D366", borderRadius: 0 }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </main>
  );
}
