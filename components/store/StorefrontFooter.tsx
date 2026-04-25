import Link from "next/link";

const links = [
  {
    title: "חנות",
    items: [
      { href: "/products", label: "כל המוצרים" },
      { href: "/products?category=national-teams", label: "נבחרות" },
      { href: "/products?category=match-jerseys", label: "מועדונים" },
      { href: "/products?featured=true", label: "מבצעים" },
      { href: "/mystery-box", label: "Mystery Box" },
    ],
  },
  {
    title: "חשבון",
    items: [
      { href: "/login", label: "כניסה" },
      { href: "/register", label: "הרשמה" },
      { href: "/orders", label: "הזמנות" },
      { href: "/account", label: "פרופיל" },
    ],
  },
  {
    title: "עזרה",
    items: [
      { href: "/shipping", label: "משלוחים" },
      { href: "/returns", label: "החזרות" },
      { href: "/contact", label: "צור קשר" },
      { href: "/privacy", label: "פרטיות" },
    ],
  },
];

export function StorefrontFooter() {
  return (
    <footer className="border-t border-[#f4f4f5] bg-white dark:border-[#1c1c1c] dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-screen-xl px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-black tracking-tight text-[#18181b] dark:text-white">
              Football<span className="text-[#E69900]">.</span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[#a1a1aa]">
              חולצות כדורגל מקוריות — ליגות, קבוצות ונבחרות מובילות בעולם.
            </p>
          </div>

          {/* Links */}
          {links.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#a1a1aa]">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-[#52525b] transition hover:text-[#18181b] dark:text-[#71717a] dark:hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[#f4f4f5] pt-8 dark:border-[#1c1c1c]">
          <p className="text-xs text-[#a1a1aa]">
            © {new Date().getFullYear()} Football. כל הזכויות שמורות.
          </p>
          <div className="flex gap-3">
            {["Visa", "Mastercard", "PayPal", "Bit"].map((p) => (
              <span key={p} className="rounded-md border border-[#e4e4e7] px-2.5 py-1 text-[10px] font-semibold text-[#a1a1aa] dark:border-[#2a2a2a]">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
