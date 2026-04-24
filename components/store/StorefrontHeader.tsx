"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { CartCount } from "./CartCount";

export function StorefrontHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "כל המוצרים" },
    { href: "/products?q=מונדיאל", label: "🏆 מונדיאל 2026" },
    { href: "/products?category=national-teams", label: "נבחרות" },
    { href: "/products?category=match-jerseys", label: "חולצות משחק" },
    { href: "/products?featured=true", label: "מבצעים" },
    { href: "/mystery-box", label: "🎁 קופסת מסתורין" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a] shadow-lg shadow-black/30">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Left: actions ── */}
          <div className="flex items-center gap-3">
            <CartCount />

            {session ? (
              <>
                <Link
                  href="/account"
                  aria-label="חשבון"
                  className="hidden rounded-pill p-2 text-gray-400 transition hover:bg-white/8 hover:text-white sm:block"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden px-3 py-1.5 text-xs font-semibold text-[#507ABE] border border-[#507ABE]/40 transition hover:bg-[#507ABE] hover:text-white sm:block"
                    style={{ borderRadius: "var(--rounded-corners-radius)" }}
                  >
                    ניהול
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden rounded-pill bg-white/8 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/15 hover:text-white sm:block"
                >
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-gray-400 transition hover:text-white sm:block"
                >
                  כניסה
                </Link>
                <Link
                  href="/register"
                  className="hidden px-4 py-2 text-sm font-bold text-black transition sm:block"
                  style={{ background: "#E69900", borderRadius: "var(--rounded-corners-radius)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#cc8800")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#E69900")}
                >
                  הרשמה
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="rounded-8 p-2 text-gray-400 md:hidden"
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
                className="text-sm font-medium text-gray-400 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right: logo ── */}
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E69900] text-base font-black text-black">⚽</span>
            <span>Football Shop</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-white/8 bg-[#111111] px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {session ? (
              <>
                <li><Link href="/account" className="text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>חשבון</Link></li>
                <li><button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-400">התנתק</button></li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>כניסה</Link></li>
                <li><Link href="/register" className="text-sm font-bold text-[#E69900]" onClick={() => setMobileMenuOpen(false)}>הרשמה</Link></li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
