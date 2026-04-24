"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LocalImage } from "@/lib/local-images";

interface HeroCarouselProps {
  images: LocalImage[];
}

const ROTATION_INTERVAL_MS = 5000;

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = images.length;

  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setInterval(next, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [total, paused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  if (total === 0) return <HeroFallback />;

  const image = images[current];

  return (
    <section
      className="relative overflow-hidden bg-[#0a0a0a]"
      style={{ minHeight: 480 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="באנר ראשי"
      dir="rtl"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          key={image.src}
          src={image.src}
          alt={image.name}
          fill
          priority={current === 0}
          className="object-cover transition-opacity duration-700"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content overlay */}
      <div className="relative mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6" style={{ minHeight: 480 }}>
        <span className="mb-4 inline-block rounded-pill border border-[#E69900]/60 bg-[#E69900]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E69900]">
          מונדיאל 2026
        </span>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          חולצות כדורגל
          <br />
          <span className="text-[#E69900]">מהנבחרות הגדולות</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-gray-300">
          מקורי בלבד · ליגות ונבחרות מובילות · משלוח מהיר לכל הארץ
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-pill bg-[#333333] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:bg-[#4F4F4F]"
          >
            לקנייה עכשיו
          </Link>
          <Link
            href="/products?featured=true"
            className="rounded-pill border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            מבצעים
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows — only if multiple images */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/70"
            aria-label="תמונה קודמת"
          >
            ›
          </button>
          <button
            onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/70"
            aria-label="תמונה הבאה"
          >
            ‹
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-[#E69900]" : "w-2 bg-white/40 hover:bg-white/70"}`}
              aria-label={`עבור לתמונה ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroFallback() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ minHeight: 480 }} dir="rtl">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.3) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.3) 60px)" }} />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#E69900] opacity-10 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#E69900] opacity-5 blur-3xl" />
      <div className="relative mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <span className="mb-4 inline-block rounded-pill border border-[#FF5000]/40 bg-[#E69900]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E69900]">
          מונדיאל 2026
        </span>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          חולצות כדורגל<br />
          <span className="text-[#E69900]">מהנבחרות הגדולות</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-gray-400">
          מקורי בלבד · ליגות ונבחרות מובילות · משלוח מהיר לכל הארץ
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="rounded-pill bg-[#E69900] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF5000]/30 transition hover:bg-[#e04800]">
            לקנייה עכשיו
          </Link>
          <Link href="/products?featured=true" className="rounded-pill border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
            מבצעים
          </Link>
        </div>
      </div>
    </section>
  );
}
