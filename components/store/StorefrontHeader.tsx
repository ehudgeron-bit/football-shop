"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CartCount } from "./CartCount";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function StorefrontHeader() {
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  const navLinks = [
    { href: "/products", label: "חנות" },
    { href: "/products?q=מונדיאל", label: "מונדיאל 2026" },
    { href: "/products?category=national-teams", label: "נבחרות" },
    { href: "/products?category=match-jerseys", label: "מועדונים" },
    { href: "/mystery-box", label: "Mystery Box" },
  ];

  return (
    <>
      <header
        className={[
          "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-white/6 dark:bg-[#0a0a0a]/95"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo — right (RTL) */}
            <Link
              href="/"
              className={[
                "text-xl font-black tracking-tight transition-colors",
                scrolled ? "text-gray-900 dark:text-white" : "text-white",
              ].join(" ")}
            >
              Football<span className="text-[#E69900]">.</span>
            </Link>

            {/* Nav — center */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "text-sm font-medium transition-colors",
                    scrolled
                      ? "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      : "text-white/70 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions — left (RTL) */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition",
                  scrolled
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/8"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
              </button>

              {/* Cart */}
              <CartCount />

              <ThemeToggle />

              {/* Account */}
              {session ? (
                <>
                  <Link href="/account" className={["hidden h-9 w-9 items-center justify-center rounded-full transition sm:flex", scrolled ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/8" : "text-white/70 hover:text-white"].join(" ")}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    </svg>
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin/dashboard" className="hidden text-xs font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white sm:block px-2">
                      ניהול
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white sm:block px-1">
                    יציאה
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={[
                    "hidden rounded-full px-5 py-2 text-xs font-semibold transition sm:block",
                    scrolled
                      ? "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
                      : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm",
                  ].join(" ")}
                >
                  כניסה
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111]">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 text-gray-400">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חפש חולצה, קבוצה, נבחרת..."
                className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
