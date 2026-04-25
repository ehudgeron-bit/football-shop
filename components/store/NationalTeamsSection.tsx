import Link from "next/link";
import { prisma } from "@/lib/prisma";

const teamFlags: Record<string, string> = {
  ארגנטינה: "🇦🇷", ברזיל: "🇧🇷", צרפת: "🇫🇷", ספרד: "🇪🇸",
  גרמניה: "🇩🇪", אנגליה: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", פורטוגל: "🇵🇹", הולנד: "🇳🇱",
  קולומביה: "🇨🇴", מרוקו: "🇲🇦", איטליה: "🇮🇹", בלגיה: "🇧🇪",
  מקסיקו: "🇲🇽", קוראסאו: "🇨🇼", ארהב: "🇺🇸", קנדה: "🇨🇦",
};

async function getNationalTeams() {
  try {
    const nationalCat = await prisma.category.findUnique({ where: { slug: "national-teams" } });
    const catFilter = nationalCat
      ? { isActive: true, categoryId: nationalCat.id }
      : { isActive: true };

    const teams = await prisma.team.findMany({
      where: { products: { some: catFilter } },
      include: {
        products: {
          where: catFilter,
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
          orderBy: { isFeatured: "desc" },
          take: 1,
        },
        _count: { select: { products: { where: catFilter } } },
      },
    });

    return teams
      .filter((t) => t.products[0]?.images[0])
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        image: t.products[0].images[0].url,
        count: t._count.products,
        flag: teamFlags[t.name] ?? "🏳️",
      }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export async function NationalTeamsSection() {
  const teams = await getNationalTeams();
  if (teams.length === 0) return null;

  return (
    <section className="border-t border-[#f4f4f5] px-6 py-20 dark:border-[#1c1c1c] sm:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a1a1aa]">National Teams</p>
            <h2 className="text-2xl font-black text-[#18181b] dark:text-white sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
              נבחרות מונדיאל 2026
            </h2>
          </div>
          <Link href="/products?category=national-teams" className="text-sm font-medium text-[#a1a1aa] transition hover:text-[#18181b] dark:hover:text-white">
            הכל ←
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-5">
          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/products?q=${encodeURIComponent(team.name)}`}
              className="group relative overflow-hidden bg-[#f4f4f5] dark:bg-[#161616]"
              style={{ aspectRatio: "3/4", borderRadius: 16 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.image}
                alt={team.name}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />

              {/* Flag */}
              <div className="absolute right-3 top-3 text-xl drop-shadow">{team.flag}</div>

              {/* Count */}
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white/80 backdrop-blur-sm">
                {team.count}
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-black text-white">{team.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
