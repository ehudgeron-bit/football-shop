import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { WorldCupHero } from "@/components/store/WorldCupHero";

export const dynamic = "force-dynamic";

// World Cup 2026 nations
const wc2026Teams = [
  { name: "ארגנטינה", flag: "🇦🇷", q: "ארגנטינה" },
  { name: "ברזיל", flag: "🇧🇷", q: "ברזיל" },
  { name: "צרפת", flag: "🇫🇷", q: "צרפת" },
  { name: "ספרד", flag: "🇪🇸", q: "ספרד" },
  { name: "גרמניה", flag: "🇩🇪", q: "גרמניה" },
  { name: "אנגליה", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", q: "אנגליה" },
  { name: "פורטוגל", flag: "🇵🇹", q: "פורטוגל" },
  { name: "הולנד", flag: "🇳🇱", q: "הולנד" },
  { name: "קולומביה", flag: "🇨🇴", q: "קולומביה" },
  { name: "מרוקו", flag: "🇲🇦", q: "מרוקו" },
  { name: "איטליה", flag: "🇮🇹", q: "איטליה" },
  { name: "בלגיה", flag: "🇧🇪", q: "בלגיה" },
];

// Champions League clubs
const clClubs = [
  { name: "ריאל מדריד", flag: "🇪🇸", q: "ריאל מדריד" },
  { name: "ברצלונה", flag: "🇪🇸", q: "ברצלונה" },
  { name: "ביירן מינכן", flag: "🇩🇪", q: "ביירן" },
  { name: "פריז סן ז׳רמן", flag: "🇫🇷", q: "פריז" },
  { name: "ליברפול", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", q: "ליברפול" },
  { name: "אינטר מילאן", flag: "🇮🇹", q: "אינטר" },
  { name: "יובנטוס", flag: "🇮🇹", q: "יובנטוס" },
  { name: "AC מילאן", flag: "🇮🇹", q: "מילאן" },
  { name: "דורטמונד", flag: "🇩🇪", q: "דורטמונד" },
  { name: "אתלטיקו", flag: "🇪🇸", q: "אתלטיקו" },
  { name: "ארסנל", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", q: "ארסנל" },
  { name: "צ׳לסי", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", q: "צלסי" },
];

async function getCategoryCards() {
  try {
    const cats = await prisma.category.findMany({
      include: {
        products: {
          where: { isActive: true },
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
          orderBy: { isFeatured: "desc" },
          take: 1,
        },
      },
    });
    return cats
      .filter((c) => c.products[0]?.images[0])
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        image: c.products[0].images[0].url,
      }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof productService.list>>["items"] = [];
  let newArrivals: Awaited<ReturnType<typeof productService.list>>["items"] = [];
  let categoryCards: Awaited<ReturnType<typeof getCategoryCards>> = [];

  try {
    [{ items: featured }, { items: newArrivals }, categoryCards] = await Promise.all([
      productService.list({ featured: true, limit: 8 }),
      productService.list({ limit: 8, page: 2 }),
      getCategoryCards(),
    ]);
    const featuredIds = new Set(featured.map((p) => p.id));
    newArrivals = newArrivals.filter((p) => !featuredIds.has(p.id)).slice(0, 8);
  } catch {
    // DB not yet configured
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a]" dir="rtl">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <WorldCupHero />

      {/* ── WORLD CUP NATIONS ──────────────────────────────────── */}
      <section className="border-b border-white/8 bg-[#111111] py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-lg">🏆</span>
            <span className="text-base font-black text-white">נבחרות מונדיאל 2026</span>
            <span className="rounded-4 bg-[#E69900] px-2 py-0.5 text-[10px] font-black text-black">48 נבחרות</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {wc2026Teams.map((team) => (
              <Link
                key={team.name}
                href={`/products?q=${encodeURIComponent(team.q)}`}
                className="group flex flex-shrink-0 flex-col items-center gap-2 rounded-12 border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#E69900]/50 hover:bg-[#E69900]/10"
                style={{ minWidth: 76 }}
              >
                <span className="text-3xl leading-none">{team.flag}</span>
                <span className="text-[11px] font-semibold text-gray-300 group-hover:text-[#E69900]">{team.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-[#E69900]" />
              <h2 className="text-xl font-black text-white">המוצרים הנמכרים ביותר</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-[#E69900] hover:text-[#cc8800]">
              לכל המוצרים ←
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── CHAMPIONS LEAGUE CLUBS ─────────────────────────────── */}
      <section className="border-y border-white/8 bg-[#111111] py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-lg">⭐</span>
            <span className="text-base font-black text-white">ליגת האלופות</span>
            <span className="rounded-4 bg-[#507ABE] px-2 py-0.5 text-[10px] font-black text-white">Champions League</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {clClubs.map((club) => (
              <Link
                key={club.name}
                href={`/products?q=${encodeURIComponent(club.q)}`}
                className="group flex flex-shrink-0 flex-col items-center gap-2 rounded-12 border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#507ABE]/50 hover:bg-[#507ABE]/10"
                style={{ minWidth: 88 }}
              >
                <span className="text-2xl leading-none">{club.flag}</span>
                <span className="text-center text-[11px] font-semibold leading-tight text-gray-300 group-hover:text-[#507ABE]">{club.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORLD CUP PROMO BANNER ─────────────────────────────── */}
      <section className="mx-auto w-full max-w-screen-lg px-4 py-10 sm:px-6">
        <div
          className="relative overflow-hidden rounded-20 px-8 py-10 text-white"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #E69900 0%, transparent 50%), radial-gradient(circle at 80% 50%, #507ABE 0%, transparent 50%)" }} />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#E69900]">🏆 חדש בחנות</p>
              <h3 className="mt-2 text-3xl font-black leading-tight">
                חולצות מונדיאל 2026<br />
                <span className="text-[#E69900]">הגיעו לחנות!</span>
              </h3>
              <p className="mt-2 text-sm text-gray-300">ארגנטינה · ברזיל · צרפת · ספרד · ועוד 44 נבחרות</p>
            </div>
            <Link
              href="/products?q=מונדיאל"
              className="flex-shrink-0 rounded-pill bg-[#E69900] px-10 py-4 text-sm font-black text-black shadow-lg transition hover:bg-[#cc8800]"
            >
              לקנייה עכשיו ←
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES WITH REAL IMAGES ────────────────────────── */}
      {categoryCards.length > 0 && (
        <section className="border-t border-white/8 bg-[#111111] py-12">
          <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
            <div className="mb-7 flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-[#E69900]" />
              <h2 className="text-xl font-black text-white">קנה לפי קטגוריה</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categoryCards.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-16 bg-[#1a1a1a]"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Product image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 70%, transparent 100%)" }} />
                  {/* Category name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-black text-white">{cat.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#E69900] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      לצפייה ←
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ─────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-[#0a0a0a] py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: "🚚", title: "משלוח חינם", sub: "בקנייה מעל ₪199" },
              { icon: "🔒", title: "תשלום מאובטח", sub: "SSL · Tranzila מאושר" },
              { icon: "↩️", title: "החזרות קלות", sub: "תוך 30 יום" },
              { icon: "⭐", title: "4.9 ★ ביקורות", sub: "מעל 2,000 לקוחות" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-[#507ABE]" />
              <h2 className="text-xl font-black text-white">חדש בחנות</h2>
              <span className="rounded-4 bg-[#507ABE] px-2 py-0.5 text-[10px] font-black text-white">NEW</span>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-[#507ABE] hover:text-white">
              לכל המוצרים ←
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── SECOND PROMO ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-screen-lg px-4 pb-12 sm:px-6">
        <div
          className="relative overflow-hidden rounded-20 px-8 py-10"
          style={{ background: "linear-gradient(135deg, #1e3a1e 0%, #0d2b0d 100%)" }}
        >
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #4caf50 0%, transparent 60%)" }} />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-green-400">⚽ ליגת האלופות</p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                חולצות הקבוצות הגדולות
              </h3>
              <p className="mt-2 text-sm text-gray-400">ריאל מדריד · ברצלונה · ביירן · PSG · ליברפול</p>
            </div>
            <Link
              href="/products?q=ריאל מדריד"
              className="flex-shrink-0 rounded-pill border border-green-500/40 bg-green-500/10 px-10 py-4 text-sm font-black text-green-300 shadow-lg transition hover:bg-green-500/20"
            >
              לצפייה בקבוצות ←
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 bg-[#111111] py-14">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-[#E69900]" />
            <h2 className="text-xl font-black text-white">שאלות נפוצות</h2>
          </div>
          <div className="mx-auto max-w-2xl divide-y divide-white/8">
            {[
              { q: "כמה זמן לוקח המשלוח?", a: "משלוח רגיל 3–5 ימי עסקים. משלוח מהיר 1–2 ימים. כל ההזמנות נשלחות עם מספר מעקב." },
              { q: "האם ניתן להחזיר מוצר?", a: "כן. החזרה חינמית תוך 30 יום מקבלת החבילה, בתנאי שהמוצר לא נעשה שימוש ועם התגים המקוריים." },
              { q: "האם החולצות מקוריות?", a: "כן, כל המוצרים בחנות הם מקוריים בלבד עם תעודות אותנטיות מהיצרן." },
              { q: "איך בוחרים מידה נכונה?", a: "בכל עמוד מוצר יש מדריך מידות מפורט. בספק — הזמינו מידה אחת גדולה יותר, אנחנו מחליפים ללא עלות." },
            ].map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">
                  {faq.q}
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-500 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 10.293L2.854 5.146a.5.5 0 0 0-.708.708l5.5 5.5a.5.5 0 0 0 .708 0l5.5-5.5a.5.5 0 0 0-.708-.708L8 10.293z" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
