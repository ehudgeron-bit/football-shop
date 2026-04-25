import Link from "next/link";

const cols = [
  {
    title: "ניווט מהיר",
    links: [
      { href: "/products?category=national-teams", label: "חולצות נבחרות" },
      { href: "/products?category=match-jerseys", label: "חולצות מועדון" },
      { href: "/products?category=kids", label: "חליפות ילדים" },
      { href: "/products?category=retro", label: "חולצות עבר" },
      { href: "/products?featured=true", label: "מבצעים" },
      { href: "/mystery-box", label: "🎁 קופסת מסתורין" },
    ],
  },
  {
    title: "החשבון שלי",
    links: [
      { href: "/login", label: "כניסה" },
      { href: "/register", label: "הרשמה" },
      { href: "/orders", label: "ההזמנות שלי" },
      { href: "/account", label: "פרופיל" },
    ],
  },
  {
    title: "שירות לקוחות",
    links: [
      { href: "/shipping", label: "מדיניות משלוחים" },
      { href: "/returns", label: "החזרות והחלפות" },
      { href: "/contact", label: "צור קשר" },
      { href: "/privacy", label: "מדיניות פרטיות" },
      { href: "/terms", label: "תנאי שימוש" },
    ],
  },
];

export function StorefrontFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E69900] text-xl font-black text-black">⚽</div>
              <span className="text-base font-extrabold text-white">Football Shop</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              חולצות כדורגל מקוריות — ליגות, קבוצות ונבחרות מובילות בעולם.
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-3">
              {[
                { label: "F", name: "Facebook" },
                { label: "I", name: "Instagram" },
                { label: "T", name: "TikTok" },
              ].map((s) => (
                <span
                  key={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-xs font-bold text-gray-400 transition hover:border-gray-500 hover:text-white"
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-10 border-t border-gray-800 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600">אמצעי תשלום:</span>
              {["Visa", "MC", "PayPal", "Bit"].map((p) => (
                <span key={p} className="rounded-6 border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-bold text-gray-400">
                  {p}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Football Shop · כל הזכויות שמורות
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
