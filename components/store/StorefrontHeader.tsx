"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartCount } from "./CartCount";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function StorefrontHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const navLinks = [
    { href: "/products?category=national-teams", label: "מוצרים לפי נבחרת" },
    { href: "/products?category=kids", label: "ילדים" },
    { href: "/products?category=match-jerseys", label: "חולצות משחק" },
    { href: "/products?q=מונדיאל", label: "מונדיאל 2026" },
    { href: "/products?category=retro", label: "חולצות עבר" },
    { href: "/products?category=training", label: "אימוניות" },
    { href: "/mystery-box", label: "🎁 מסתורין" },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40">
      {/* ── Promo bar ── */}
      <div className="bg-black py-2 text-center text-xs font-medium text-white">
        🚚 משלוח חינם בכל הזמנה
      </div>

      {/* ── Main header ── */}
      <div className="border-b border-gray-200 bg-white dark:border-white/8 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Left: icons ── */}
            <div className="flex items-center gap-1">
              {/* User */}
              {session ? (
                <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/8">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </Link>
              ) : (
                <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/8">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <CartCount />

              {/* Wishlist heart */}
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/8">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              <ThemeToggle />

              {/* Admin link */}
              {session?.user?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="hidden px-3 py-1.5 text-xs font-semibold text-[#507ABE] border border-[#507ABE]/40 rounded-pill transition hover:bg-[#507ABE] hover:text-white sm:block">
                  ניהול
                </Link>
              )}

              {/* Sign out */}
              {session && (
                <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden text-xs text-gray-500 transition hover:text-gray-900 dark:hover:text-white sm:block">
                  התנתק
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                className="rounded-8 p-2 text-gray-600 dark:text-gray-400 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="תפריט"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  {mobileMenuOpen ? (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
            </div>

            {/* ── Center: nav ── */}
            <nav className="hidden items-center gap-5 md:flex" aria-label="ניווט ראשי">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Right: logo badge ── */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative flex h-14 w-14 items-center justify-center">
                {/* Outer ring */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <circle cx="50" cy="50" r="48" fill="#f5e6c8" stroke="#8B6914" strokeWidth="2" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#8B6914" strokeWidth="1.5" />
                  {/* Football */}
                  <circle cx="50" cy="50" r="14" fill="white" stroke="#333" strokeWidth="1.5" />
                  <polygon points="50,38 54,46 62,46 56,52 58,60 50,55 42,60 44,52 38,46 46,46" fill="#222" />
                  {/* Stars */}
                  <text x="50" y="18" textAnchor="middle" fontSize="8" fill="#8B6914" fontWeight="bold">★ FOOTBALL SHOP ★</text>
                  <text x="50" y="90" textAnchor="middle" fontSize="6" fill="#8B6914">חולצות כדורגל</text>
                </svg>
              </div>
            </Link>
          </div>

          {/* ── Search bar ── */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש מוצרים..."
                  className="w-full rounded-pill border border-gray-300 bg-gray-50 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 py-4 dark:border-white/8 dark:bg-[#111111]">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            {!session && (
              <>
                <li><Link href="/login" className="text-sm text-gray-500 dark:text-gray-400" onClick={() => setMobileMenuOpen(false)}>כניסה</Link></li>
                <li><Link href="/register" className="text-sm font-bold text-[#E69900]" onClick={() => setMobileMenuOpen(false)}>הרשמה</Link></li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
