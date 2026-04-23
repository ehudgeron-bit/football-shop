"use client";

import { useState } from "react";

const messages = [
  "🚚 משלוח חינם בקנייה מעל ₪199",
  "⚽ מונדיאל 2026 — מלאי מוגבל! הזמן לפני שייגמר",
  "🔒 תשלום מאובטח · החזרות קלות תוך 30 יום",
];

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [idx, setIdx] = useState(0);

  if (dismissed) return null;

  return (
    <div
      dir="rtl"
      className="relative flex items-center justify-center bg-[#111] px-10 py-2 text-center text-xs font-medium text-white"
    >
      <button
        onClick={() => setIdx((i) => (i - 1 + messages.length) % messages.length)}
        className="absolute right-10 text-gray-400 hover:text-white"
        aria-label="הודעה קודמת"
      >
        ‹
      </button>

      <span>{messages[idx]}</span>

      <button
        onClick={() => setIdx((i) => (i + 1) % messages.length)}
        className="absolute left-10 text-gray-400 hover:text-white"
        aria-label="הודעה הבאה"
      >
        ›
      </button>

      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        aria-label="סגור"
      >
        ✕
      </button>
    </div>
  );
}
