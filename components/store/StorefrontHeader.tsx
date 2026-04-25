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
      {/* Adidas-style: always black header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-black">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex h-14 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="text-base font-black uppercase tracking-[0.05em] text-white">
              Football<span className="text-white">.</span>
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center text-white/60 transition hover:text-white"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
              </button>

              <CartCount />
              <ThemeToggle />

              {session ? (
                <>
                  <Link href="/account" className="hidden h-9 w-9 items-center justify-center text-white/60 transition hover:text-white sm:flex">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    </svg>
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin/dashboard" className="hidden text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 hover:text-white sm:block px-2">
                      ניהול
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden text-[11px] text-white/40 hover:text-white sm:block px-1 font-bold uppercase tracking-[0.1em]">
                    יציאה
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden border border-white/30 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:block"
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
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 pt-20 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-[#111]">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-6 py-5 border-b border-black/10 dark:border-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="shrink-0 text-black/40 dark:text-white/40">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jerseys, teams..."
                className="flex-1 bg-transparent text-base font-medium text-black placeholder:text-black/30 focus:outline-none dark:text-white dark:placeholder:text-white/30"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
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
