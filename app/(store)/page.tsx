import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

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
  const [{ items: featured }, teams] = await Promise.all([
    productService.list({ featured: true, limit: 4 }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col" dir="rtl">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#0a0a0a]"
        style={{ minHeight: 480 }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.3) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.3) 60px)",
          }}
        />
        {/* Accent circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FF5000] opacity-10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#FF5000] opacity-5 blur-3xl" />

        <div className="relative mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <span className="mb-4 inline-block rounded-pill border border-[#FF5000]/40 bg-[#FF5000]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FF5000]">
            מונדיאל 2026
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            חולצות כדורגל<br />
            <span className="text-[#FF5000]">מהנבחרות הגדולות</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-gray-400">
            מקורי בלבד · ליגות ונבחרות מובילות · משלוח מהיר לכל הארץ
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-pill bg-[#FF5000] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF5000]/30 transition hover:bg-[#e04800]"
            >
              לקנייה עכשיו
            </Link>
            <Link
              href="/products?featured=true"
              className="rounded-pill border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              מבצעים
            </Link>
          </div>
        </div>
      </section>

      {/* ── WORLD CUP TEAMS STRIP ─────────────────────────── */}
      <section className="border-b border-surface-tertiary bg-surface-secondary py-8">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-lg font-bold">מונדיאל 2026</span>
            <span className="rounded-4 bg-[#FF5000] px-2 py-0.5 text-xs font-bold text-white">NEW</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {wc2026Teams.map((team) => (
              <Link
                key={team.name}
                href={`/products?q=${encodeURIComponent(team.name)}`}
                className="flex flex-shrink-0 flex-col items-center gap-2 rounded-12 border border-surface-tertiary bg-white px-4 py-3 transition hover:border-[#FF5000]/40 hover:shadow-sm"
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
              className="flex items-center gap-1 text-sm font-medium text-[#FF5000] hover:underline"
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
            background: "linear-gradient(135deg, #FF5000 0%, #cc2200 100%)",
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200">
              חדש בחנות
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">
              חולצות מונדיאל 2026 הגיעו
            </h3>
            <p className="mt-2 text-sm text-orange-100">
              הזמן עכשיו לפני שייגמר המלאי
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 rounded-pill bg-white px-8 py-3 text-sm font-bold text-[#FF5000] shadow transition hover:shadow-lg"
          >
            לחנות
          </Link>
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
                  className="rounded-pill border border-surface-tertiary bg-white px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-[#FF5000] hover:text-[#FF5000]"
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
