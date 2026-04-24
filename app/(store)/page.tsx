import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { getBannerImages, getProductImages } from "@/lib/local-images";
import { HeroCarousel } from "@/components/store/HeroCarousel";
import { LocalImageCarousel } from "@/components/store/LocalImageCarousel";

const trustItems = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: "משלוח חינם",
    subtitle: "בקנייה מעל ₪199",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "תשלום מאובטח",
    subtitle: "SSL · Tranzila מאושר",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "החזרות קלות",
    subtitle: "תוך 30 יום ללא שאלות",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "4.9 ★ ביקורות",
    subtitle: "מעל 2,000 לקוחות מרוצים",
  },
];

const faqs = [
  {
    q: "כמה זמן לוקח המשלוח?",
    a: "משלוח רגיל 3–5 ימי עסקים. משלוח מהיר 1–2 ימים. כל ההזמנות נשלחות עם מספר מעקב.",
  },
  {
    q: "האם ניתן להחזיר מוצר?",
    a: "כן. החזרה חינמית תוך 30 יום מקבלת החבילה, בתנאי שהמוצר לא נעשה שימוש ועם התגים המקוריים.",
  },
  {
    q: "האם החולצות מקוריות?",
    a: "כן, כל המוצרים בחנות הם מקוריים בלבד עם תעודות אותנטיות מהיצרן.",
  },
  {
    q: "איך בוחרים מידה נכונה?",
    a: "בכל עמוד מוצר יש מדריך מידות מפורט. בספק — הזמינו מידה אחת גדולה יותר, אנחנו מחליפים ללא עלות.",
  },
  {
    q: "אילו אמצעי תשלום מקבלים?",
    a: "כרטיס אשראי (כל הסוגים), PayBox, Apple Pay ו-Google Pay. כל העסקאות מאובטחות ומוצפנות.",
  },
];

export const dynamic = "force-dynamic";

// World Cup 2026 team flags strip
const wc2026Teams = [
  { name: "ברזיל", flag: "🇧🇷", color: "#009c3b" },
  { name: "ארגנטינה", flag: "🇦🇷", color: "#74acdf" },
  { name: "צרפת", flag: "🇫🇷", color: "#002395" },
  { name: "ספרד", flag: "🇪🇸", color: "#aa151b" },
  { name: "גרמניה", flag: "🇩🇪", color: "#000000" },
  { name: "אנגליה", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#cf081f" },
  { name: "פורטוגל", flag: "🇵🇹", color: "#006600" },
  { name: "הולנד", flag: "🇳🇱", color: "#ae1c28" },
  { name: "בלגיה", flag: "🇧🇪", color: "#ef3340" },
  { name: "ישראל", flag: "🇮🇱", color: "#0038b8" },
  { name: "מרוקו", flag: "🇲🇦", color: "#c1272d" },
  { name: "יפן", flag: "🇯🇵", color: "#002b7f" },
];

const categories = [
  { slug: "match-jerseys", label: "חולצות משחק", bg: "#111111", emoji: "⚽" },
  { slug: "fan-jerseys", label: "חולצות אוהדים", bg: "#1d4ed8", emoji: "👕" },
  { slug: "training", label: "אימון", bg: "#15803d", emoji: "🏃" },
  { slug: "match-jerseys&featured=true", label: "מבצעים", bg: "#b91c1c", emoji: "🏷️" },
];

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof productService.list>>["items"] = [];
  let newArrivals: Awaited<ReturnType<typeof productService.list>>["items"] = [];
  let teams: Awaited<ReturnType<typeof prisma.team.findMany>> = [];
  try {
    [{ items: featured }, { items: newArrivals }, teams] = await Promise.all([
      productService.list({ featured: true, limit: 4 }),
      productService.list({ limit: 4, page: 1 }),
      prisma.team.findMany({ orderBy: { name: "asc" } }),
    ]);
    const featuredIds = new Set(featured.map((p) => p.id));
    newArrivals = newArrivals.filter((p) => !featuredIds.has(p.id)).slice(0, 4);
  } catch {
    // DB not yet configured — render static shell
  }

  const bannerImages = getBannerImages();
  const localProductImages = getProductImages();

  return (
    <div className="flex flex-col" dir="rtl">
      {/* ── HERO ─────────────────────────────────────────── */}
      <HeroCarousel images={bannerImages} />

      {/* ── WORLD CUP TEAMS STRIP ─────────────────────────── */}
      <section className="border-b border-surface-tertiary bg-surface-secondary py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-lg font-bold">מונדיאל 2026</span>
            <span className="rounded-4 bg-[#333333] px-2 py-0.5 text-xs font-bold text-white">NEW</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {wc2026Teams.map((team) => (
              <Link
                key={team.name}
                href={`/products?q=${encodeURIComponent(team.name)}`}
                className="flex flex-shrink-0 flex-col items-center gap-2 rounded-12 border border-surface-tertiary bg-white px-4 py-3 transition hover:border-[#333333]/40 hover:shadow-sm"
                style={{ minWidth: 80 }}
              >
                <span className="text-3xl leading-none">{team.flag}</span>
                <span className="text-xs font-medium text-text-secondary">{team.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-xl font-bold">המוצרים הנמכרים ביותר</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-[#507ABE] hover:underline"
            >
              לכל המוצרים
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.293 8L6.146 3.854a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 1 1-.708-.708L10.293 8z"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── LOCAL PRODUCT IMAGE CAROUSEL ─────────────────── */}
      <LocalImageCarousel images={localProductImages} title="גלריית מוצרים" />

      {/* ── CATEGORIES GRID ──────────────────────────────── */}
      <section className="border-t border-surface-tertiary bg-surface-secondary py-12">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <h2 className="mb-6 text-xl font-bold">קנה לפי קטגוריה</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?${cat.slug.includes("&") ? cat.slug : `category=${cat.slug}`}`}
                className="group relative flex items-center justify-between overflow-hidden rounded-12 p-5 text-white transition hover:scale-[1.02] hover:shadow-lg"
                style={{ background: cat.bg, minHeight: 90 }}
              >
                <span className="text-sm font-bold leading-tight">{cat.label}</span>
                <span className="text-3xl opacity-70 transition group-hover:opacity-100">{cat.emoji}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ─────────────────────────────────── */}
      <section className="mx-auto w-full max-w-screen-lg px-4 py-8 sm:px-6">
        <div
          className="flex flex-col items-center justify-between gap-6 overflow-hidden rounded-16 px-8 py-10 text-white md:flex-row"
          style={{
            background: "linear-gradient(135deg, #507ABE 0%, #35568D 100%)",
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
              חדש בחנות
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">
              חולצות מונדיאל 2026 הגיעו
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              הזמן עכשיו לפני שייגמר המלאי
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 bg-white px-8 py-3 text-sm font-bold text-[#35568D] shadow transition hover:shadow-lg"
            style={{ borderRadius: "var(--rounded-corners-radius)" }}
          >
            לחנות
          </Link>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="border-y border-surface-tertiary bg-white py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">חדש בחנות</h2>
              <span className="rounded-4 bg-[#111] px-2 py-0.5 text-xs font-bold text-white">NEW</span>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-[#507ABE] hover:underline"
            >
              לכל המוצרים
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.293 8L6.146 3.854a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 1 1-.708-.708L10.293 8z"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="border-t border-surface-tertiary bg-surface-secondary py-14">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-bold">שאלות נפוצות</h2>
          <div className="mx-auto max-w-2xl divide-y divide-surface-tertiary">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-text-primary">
                  {faq.q}
                  <svg
                    className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180 text-text-muted"
                    viewBox="0 0 16 16" fill="currentColor"
                  >
                    <path d="M8 10.293L2.854 5.146a.5.5 0 0 0-.708.708l5.5 5.5a.5.5 0 0 0 .708 0l5.5-5.5a.5.5 0 0 0-.708-.708L8 10.293z"/>
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL TEAMS ─────────────────────────────────────── */}
      {teams.length > 0 && (
        <section className="border-t border-surface-tertiary py-10">
          <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
            <h2 className="mb-5 text-xl font-bold">קנה לפי קבוצה</h2>
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/products?team=${team.slug}`}
                  className="rounded-pill border border-surface-tertiary bg-white px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-[#333333] hover:text-[#507ABE]"
                >
                  {team.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
