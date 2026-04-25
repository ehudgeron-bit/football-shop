import type { Metadata } from "next";
import Link from "next/link";
import { getMysteryBoxProduct } from "@/lib/mystery-box-product";
import { MysteryBoxOrderClient } from "./MysteryBoxOrderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "קופסת מסתורין - נבחרות מונדיאל 2026 | Football Shop",
  description:
    "הזמן קופסת מסתורין וקבל חולצת נבחרת אקראית מתוך 13 הנבחרות המובילות במונדיאל 2026.",
};

const nations = [
  { name: "ארגנטינה", flag: "🇦🇷" },
  { name: "ברזיל", flag: "🇧🇷" },
  { name: "צרפת", flag: "🇫🇷" },
  { name: "ספרד", flag: "🇪🇸" },
  { name: "גרמניה", flag: "🇩🇪" },
  { name: "אנגליה", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "פורטוגל", flag: "🇵🇹" },
  { name: "הולנד", flag: "🇳🇱" },
  { name: "קולומביה", flag: "🇨🇴" },
  { name: "איטליה", flag: "🇮🇹" },
  { name: "בלגיה", flag: "🇧🇪" },
  { name: "מקסיקו", flag: "🇲🇽" },
  { name: "קוראסאו", flag: "🇨🇼" },
];

export default async function MysteryBoxPage() {
  const product = await getMysteryBoxProduct();
  const price = Number(product.basePrice);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]" dir="rtl">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/8 dark:bg-[#111111] sm:px-6">
        <div className="mx-auto max-w-screen-lg">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white">ראשי</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">קופסת מסתורין</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

          {/* ── LEFT: Images ── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-20">
              <div
                className="absolute inset-0 opacity-15 blur-3xl dark:opacity-25"
                style={{ background: "radial-gradient(circle at 50% 40%, #E69900 0%, transparent 65%)" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mystery-box.jpeg"
                alt="קופסת מסתורין נבחרות מונדיאל"
                className="relative w-full rounded-20 object-cover shadow-xl"
                style={{ aspectRatio: "4/5", objectPosition: "center" }}
              />

              {/* Mystery badge */}
              <div
                className="absolute left-5 top-5 flex flex-col items-center justify-center rounded-full bg-[#E69900] text-center font-black text-black shadow-xl"
                style={{ width: 90, height: 90 }}
              >
                <span className="text-[9px] uppercase leading-none tracking-wider">מסתורין</span>
                <span className="text-4xl leading-none">?</span>
              </div>

              {/* HOT badge */}
              <div className="absolute right-5 top-5 rounded-pill bg-[#cf2e2e] px-3 py-1 text-xs font-black text-white shadow-lg">
                🔥 HOT
              </div>
            </div>

            {/* Second image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mystery-box-promo.jpeg"
              alt="Mystery Box Promo"
              className="w-full rounded-16 object-cover shadow-md"
              style={{ maxHeight: 200, objectPosition: "center top" }}
            />
          </div>

          {/* ── RIGHT: Info + Order ── */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-24">
            {/* Title & price */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E69900]">
                🏆 מונדיאל 2026 · מהדורה מוגבלת
              </p>
              <h1 className="text-3xl font-black leading-tight text-gray-900 dark:text-white">
                קופסת מסתורין<br />
                <span className="text-[#E69900]">נבחרות עולם</span>
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                הזמן וקבל חולצת נבחרת מקורית בהפתעה — אחת מתוך 13 הנבחרות הגדולות ביותר
                במונדיאל 2026. החולצה תבחר אקראית ותישלח ישירות אליך.
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-black text-[#E69900]">₪{price}</span>
                <span className="text-sm text-gray-400 line-through">₪{Math.round(price * 1.3)}</span>
                <span className="rounded-4 bg-[#cf2e2e] px-2 py-0.5 text-xs font-black text-white">
                  חיסכון של ₪{Math.round(price * 0.3)}
                </span>
              </div>
            </div>

            {/* What's inside */}
            <div className="rounded-16 border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="mb-4 text-sm font-black text-gray-900 dark:text-white">מה מקבלים בקופסה?</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {nations.map((n) => (
                  <div
                    key={n.name}
                    className="flex flex-col items-center gap-1 rounded-10 border border-gray-200 bg-white py-2 px-1 text-center dark:border-white/8 dark:bg-white/5"
                  >
                    <span className="text-xl leading-none">{n.flag}</span>
                    <span className="text-[9px] font-semibold leading-tight text-gray-500 dark:text-gray-400">
                      {n.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                * הנבחרת תבחר אקראית. לא ניתן לבחור נבחרת ספציפית.
              </p>
            </div>

            {/* Order form */}
            <MysteryBoxOrderClient
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                stock: v.stock,
              }))}
              price={price}
            />
          </div>
        </div>

        {/* ── Bottom: Why mystery box? ── */}
        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-gray-200 pt-12 dark:border-white/8 sm:grid-cols-3">
          {[
            {
              icon: "🎁",
              title: "חוויית הפתעה",
              text: "פתח את הקופסה ולא תדע מה עד הרגע האחרון — חוויה ייחודית לכל מי שאוהב כדורגל.",
            },
            {
              icon: "✅",
              title: "חולצה מקורית מובטחת",
              text: "כל קופסה מכילה חולצת נבחרת מקורית עם תגית. 100% אותנטי.",
            },
            {
              icon: "💰",
              title: "מחיר משתלם",
              text: `קבל חולצה בשווי ₪${Math.round(price * 1.3)} במחיר של ₪${price} בלבד — חיסכון של עד 30%.`,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-16 border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5"
            >
              <span className="text-3xl">{item.icon}</span>
              <p className="mt-3 text-sm font-black text-gray-900 dark:text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
