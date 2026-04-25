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
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-screen-xl px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-black uppercase tracking-[0.05em] text-white">
              Football.
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              חולצות כדורגל מקוריות — נבחרות מונדיאל 2026.
            </p>
          </div>

          {/* Links */}
          {links.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/60 transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Football. All rights reserved.
          </p>
          <div className="flex gap-3">
            {["Visa", "Mastercard", "PayPal", "Bit"].map((p) => (
              <span key={p} className="border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
