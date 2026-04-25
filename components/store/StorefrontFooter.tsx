import Link from "next/link";

const cols = [
  {
    title: "קטגוריות",
    links: [
      { href: "/products?category=national-teams", label: "נבחרות" },
      { href: "/products?category=match-jerseys", label: "חולצות משחק" },
      { href: "/products?category=kids", label: "חליפות ילדים" },
      { href: "/products?category=retro", label: "חולצות רטרו" },
      { href: "/products?featured=true", label: "מבצעים" },
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
    ],
  },
];

export function StorefrontFooter() {
  return (
    <footer className="bg-gray-50 text-gray-600 dark:bg-[#0a0a0a] dark:text-gray-300">
      <div className="mx-auto max-w-screen-lg px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">Football Shop</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-500">
              חולצות כדורגל מקוריות — ליגות, קבוצות ונבחרות מובילות בעולם.
            </p>
            <div className="mt-5 flex gap-3">
              {["facebook", "instagram", "tiktok"].map((s) => (
                <span
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500"
                >
                  {s[0].toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
          <span>© {new Date().getFullYear()} Football Shop. כל הזכויות שמורות.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-gray-600 dark:hover:text-gray-400">פרטיות</Link>
            <Link href="/terms" className="transition hover:text-gray-600 dark:hover:text-gray-400">תנאי שימוש</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
