import Link from "next/link";

const wc2026Nations = [
  { name: "ארגנטינה", flag: "🇦🇷" },
  { name: "ברזיל", flag: "🇧🇷" },
  { name: "צרפת", flag: "🇫🇷" },
  { name: "ספרד", flag: "🇪🇸" },
  { name: "גרמניה", flag: "🇩🇪" },
  { name: "אנגליה", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "פורטוגל", flag: "🇵🇹" },
  { name: "הולנד", flag: "🇳🇱" },
  { name: "קולומביה", flag: "🇨🇴" },
  { name: "איטליה", flag: "🇮🇹" },
  { name: "בלגיה", flag: "🇧🇪" },
  { name: "מקסיקו", flag: "🇲🇽" },
  { name: "קוראסאו", flag: "🇨🇼" },
];

export function MysteryBoxSection() {
  return (
    <section className="border-y border-white/8 bg-[#0d0d0d] py-16">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-10 flex items-center gap-3">
          <div className="h-7 w-1.5 rounded-full bg-[#E69900]" />
          <h2 className="text-xl font-black text-white">קופסת המסתורין</h2>
          <span className="rounded-4 bg-[#cf2e2e] px-2 py-0.5 text-[10px] font-black text-white">
            HOT
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          {/* ── Left: image ── */}
          <div className="relative">
            {/* Glow effect behind image */}
            <div
              className="absolute inset-0 rounded-24 opacity-30 blur-2xl"
              style={{ background: "radial-gradient(circle at 50% 50%, #E69900 0%, transparent 70%)" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mystery-box.jpeg"
              alt="קופסת מסתורין - חולצות נבחרות"
              className="relative w-full rounded-20 object-cover shadow-2xl"
              style={{ aspectRatio: "4/5", objectPosition: "center" }}
            />
            {/* Mystery badge */}
            <div
              className="absolute left-4 top-4 flex flex-col items-center justify-center rounded-full bg-[#E69900] text-center font-black text-black shadow-lg"
              style={{ width: 80, height: 80 }}
            >
              <span className="text-[10px] uppercase leading-none tracking-wider">רק</span>
              <span className="text-2xl leading-none">?</span>
              <span className="text-[10px] uppercase leading-none tracking-wider">חולצה!</span>
            </div>
          </div>

          {/* ── Right: copy + nations ── */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#E69900]">
                🏆 מונדיאל 2026
              </p>
              <h3 className="mt-2 text-3xl font-black leading-tight text-white">
                קבל חולצת נבחרת<br />
                <span className="text-[#E69900]">בהפתעה!</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                הזמן קופסת מסתורין וקבל חולצת נבחרת אחת מתוך 13 הנבחרות המובילות במונדיאל 2026 —
                אחריות על הפתעה מושלמת.
              </p>
            </div>

            {/* Nations grid */}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {wc2026Nations.map((n) => (
                <div
                  key={n.name}
                  className="flex flex-col items-center gap-1 rounded-12 border border-white/10 bg-white/5 py-2.5 px-1"
                >
                  <span className="text-2xl leading-none">{n.flag}</span>
                  <span className="text-center text-[10px] font-semibold leading-tight text-gray-400">
                    {n.name}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/mystery-box"
                className="flex-shrink-0 rounded-pill bg-[#E69900] px-8 py-4 text-center text-sm font-black text-black shadow-lg transition hover:bg-[#cc8800]"
              >
                הזמן קופסת מסתורין ←
              </Link>
              <p className="text-xs text-gray-500">
                ✓ משלוח חינם&nbsp;&nbsp;✓ עד 30 יום החזרה&nbsp;&nbsp;✓ חולצה מקורית מובטחת
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
