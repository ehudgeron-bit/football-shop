import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { WorldCupHero } from "@/components/store/WorldCupHero";
import { MysteryBoxSection } from "@/components/store/MysteryBoxSection";

export const dynamic = "force-dynamic";

const wc2026Nations = [
  { name: "נבחרת ארגנטינה", q: "ארגנטינה" },
  { name: "נבחרת ברזיל", q: "ברזיל" },
  { name: "נבחרת צרפת", q: "צרפת" },
  { name: "נבחרת ספרד", q: "ספרד" },
  { name: "נבחרת גרמניה", q: "גרמניה" },
  { name: "נבחרת אנגליה", q: "אנגליה" },
  { name: "נבחרת פורטוגל", q: "פורטוגל" },
  { name: "נבחרת הולנד", q: "הולנד" },
];

const clClubs = [
  { name: "מנצ'סטר יונייטד", color: "#DA291C", abbr: "MU" },
  { name: "ליברפול", color: "#C8102E", abbr: "LIV" },
  { name: "טוטנהאם", color: "#132257", abbr: "TOT" },
  { name: "צ'לסי", color: "#034694", abbr: "CHE" },
  { name: "ריאל מדריד", color: "#FEBE10", abbr: "RM" },
  { name: "ברצלונה", color: "#A50044", abbr: "BAR" },
  { name: "ביירן מינכן", color: "#DC052D", abbr: "BAY" },
  { name: "פריז", color: "#004170", abbr: "PSG" },
  { name: "יובנטוס", color: "#000000", abbr: "JUV" },
  { name: "אינטר", color: "#010E80", abbr: "INT" },
];

const categories = [
  { slug: "national-teams", label: "חולצות נבחרות" },
  { slug: "match-jerseys", label: "חולצות מועדון" },
  { slug: "kids", label: "חליפות ילדים" },
  { slug: "retro", label: "חולצות רטרו" },
  { slug: "training", label: "אימוניות" },
  { slug: "basketball", label: "בגדי כדורסל" },
  { slug: "sets", label: "מהדורה מוגבלת" },
  { slug: "accessories", label: "ג'קטים ווינדברייקר" },
];

async function getSectionData() {
  try {
    const [featuredResult, newArrivalsResult, categoryImages, nationImages] = await Promise.all([
      productService.list({ featured: true, limit: 8 }),
      productService.list({ limit: 8, page: 3 }),
      // one image per category slug
      prisma.category.findMany({
        include: {
          products: {
            where: { isActive: true },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
            orderBy: { isFeatured: "desc" },
            take: 1,
          },
        },
      }),
      // nation images — one product image per nation name
      Promise.all(
        wc2026Nations.map((n) =>
          prisma.product.findFirst({
            where: { isActive: true, team: { name: { contains: n.q } } },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
            orderBy: { isFeatured: "desc" },
          })
        )
      ),
    ]);

    const featuredIds = new Set(featuredResult.items.map((p) => p.id));
    const newArrivals = newArrivalsResult.items.filter((p) => !featuredIds.has(p.id)).slice(0, 8);

    const catImageMap = Object.fromEntries(
      categoryImages
        .filter((c) => c.products[0]?.images[0])
        .map((c) => [c.slug, c.products[0].images[0].url])
    );

    return {
      featured: featuredResult.items,
      newArrivals,
      catImageMap,
      nationImages,
    };
  } catch {
    return { featured: [], newArrivals: [], catImageMap: {}, nationImages: [] };
  }
}

export default async function HomePage() {
  const { featured, newArrivals, catImageMap, nationImages } = await getSectionData();

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]" dir="rtl">

      {/* ── HERO ────────────────────────────────────────────────── */}
      <WorldCupHero />

      {/* ── WORLD CUP 2026 NATIONS ──────────────────────────────── */}
      <section className="bg-white py-10 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          {/* Section title fanshop-style */}
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">מונדיאל 2026</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {wc2026Nations.map((nation, i) => {
              const product = nationImages[i];
              const imgUrl = product?.images?.[0]?.url;
              return (
                <Link
                  key={nation.q}
                  href={`/products?q=${encodeURIComponent(nation.q)}`}
                  className="group relative overflow-hidden rounded-12 bg-gray-100 dark:bg-[#1a1a1a]"
                  style={{ aspectRatio: "2/3" }}
                >
                  {imgUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={nation.name} className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                    <p className="text-[11px] font-bold leading-tight text-white drop-shadow">{nation.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-white py-10 dark:bg-[#0a0a0a]">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
                <h2 className="text-lg font-black text-gray-900 dark:text-white">המוצרים הנמכרים ביותר</h2>
                <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#E69900] hover:text-[#cc8800]">
                לכל המוצרים ←
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 dark:bg-[#111111]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">הקטגוריות שלנו</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat) => {
              const img = catImageMap[cat.slug];
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-12 bg-gray-200 dark:bg-[#1a1a1a]"
                  style={{ aspectRatio: "3/4" }}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={cat.label} className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <p className="text-sm font-black text-white drop-shadow">{cat.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CLUB LOGOS STRIP ─────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-white py-8 dark:border-white/8 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">קנה לפי קבוצה</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {clClubs.map((club) => (
              <Link
                key={club.name}
                href={`/products?q=${encodeURIComponent(club.name)}`}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 transition group-hover:scale-110 group-hover:border-gray-400 dark:border-white/10"
                  style={{ backgroundColor: club.color + "18" }}
                >
                  <span className="text-xs font-black" style={{ color: club.color }}>{club.abbr}</span>
                </div>
                <span className="text-center text-[10px] font-semibold text-gray-600 dark:text-gray-400">{club.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NBA-STYLE PROMO BANNER ───────────────────────────────── */}
      <section className="relative overflow-hidden py-0">
        <div className="relative flex items-center justify-between" style={{ background: "linear-gradient(135deg, #8B0000 0%, #C0392B 50%, #8B0000 100%)", minHeight: 220 }}>
          {/* Left jersey collage */}
          {featured[0]?.images?.[0] && (
            <div className="hidden w-56 flex-shrink-0 sm:block" style={{ height: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured[0].images[0].url} alt="" className="h-full w-full object-cover object-top opacity-80" />
            </div>
          )}
          {/* Center text */}
          <div className="flex-1 px-8 py-10 text-center text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-red-200">חדש בחנות</p>
            <h3 className="mt-1 text-3xl font-black leading-tight">
              החולצות החדשות
              <br />
              <span className="text-[#E69900]">של המונדיאל 2026</span>
            </h3>
            <Link
              href="/products?featured=true"
              className="mt-5 inline-block rounded-pill bg-[#E69900] px-8 py-3 text-sm font-black text-black shadow-lg transition hover:bg-[#cc8800]"
            >
              לרכישה
            </Link>
          </div>
          {/* Right jersey collage */}
          {featured[1]?.images?.[0] && (
            <div className="hidden w-56 flex-shrink-0 sm:block" style={{ height: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured[1].images[0].url} alt="" className="h-full w-full object-cover object-top opacity-80" />
            </div>
          )}
        </div>
      </section>

      {/* ── MYSTERY BOX ──────────────────────────────────────────── */}
      <MysteryBoxSection />

      {/* ── NEW ARRIVALS ─────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="bg-white py-10 dark:bg-[#0a0a0a]">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
                <h2 className="text-lg font-black text-gray-900 dark:text-white">מוצרים חדשים</h2>
                <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#E69900] hover:text-[#cc8800]">
                לכל המוצרים ←
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="border-t border-gray-200 bg-gray-50 py-8 dark:border-white/8 dark:bg-[#111111]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: "🚚", title: "משלוח חינם", sub: "בכל הזמנה" },
              { icon: "🔒", title: "תשלום מאובטח", sub: "SSL · Tranzila" },
              { icon: "↩️", title: "החזרות קלות", sub: "תוך 30 יום" },
              { icon: "⭐", title: "4.9 ★ ביקורות", sub: "מעל 2,000 לקוחות" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-white py-12 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">שאלות נפוצות</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="mx-auto max-w-2xl divide-y divide-gray-200 dark:divide-white/8">
            {[
              { q: "כמה זמן לוקח המשלוח?", a: "משלוח רגיל 3–5 ימי עסקים. משלוח מהיר 1–2 ימים. כל ההזמנות נשלחות עם מספר מעקב." },
              { q: "האם ניתן להחזיר מוצר?", a: "כן. החזרה חינמית תוך 30 יום מקבלת החבילה, בתנאי שהמוצר לא נעשה שימוש ועם התגים המקוריים." },
              { q: "האם החולצות מקוריות?", a: "כן, כל המוצרים בחנות הם מקוריים בלבד עם תעודות אותנטיות מהיצרן." },
              { q: "איך בוחרים מידה נכונה?", a: "בכל עמוד מוצר יש מדריך מידות מפורט. בספק — הזמינו מידה אחת גדולה יותר, אנחנו מחליפים ללא עלות." },
            ].map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-gray-900 dark:text-white">
                  {faq.q}
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 10.293L2.854 5.146a.5.5 0 0 0-.708.708l5.5 5.5a.5.5 0 0 0 .708 0l5.5-5.5a.5.5 0 0 0-.708-.708L8 10.293z" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP FLOAT ───────────────────────────────────────── */}
      <a
        href="https://wa.me/972501234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition hover:scale-110"
        style={{ background: "#25D366" }}
        aria-label="WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
