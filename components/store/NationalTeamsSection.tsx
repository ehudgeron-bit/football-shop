import Link from "next/link";
import { prisma } from "@/lib/prisma";

const teamFlags: Record<string, string> = {
  ארגנטינה: "🇦🇷", ברזיל: "🇧🇷", צרפת: "🇫🇷", ספרד: "🇪🇸",
  גרמניה: "🇩🇪", אנגליה: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", פורטוגל: "🇵🇹", הולנד: "🇳🇱",
  קולומביה: "🇨🇴", מרוקו: "🇲🇦", איטליה: "🇮🇹", בלגיה: "🇧🇪",
  מקסיקו: "🇲🇽", קוראסאו: "🇨🇼", ארהב: "🇺🇸", קנדה: "🇨🇦",
};

const teamColors: Record<string, string> = {
  ארגנטינה: "#74ACDF", ברזיל: "#009C3B", צרפת: "#002395", ספרד: "#AA151B",
  גרמניה: "#CC0000", אנגליה: "#CF081F", פורטוגל: "#006600", הולנד: "#FF6000",
  קולומביה: "#FCD116", מרוקו: "#C1272D", איטליה: "#003DA5", בלגיה: "#000000",
  מקסיקו: "#006847", קוראסאו: "#003DA5", ארהב: "#B22234", קנדה: "#FF0000",
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
        color: teamColors[t.name] ?? "#333333",
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
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E69900]">🏆 National Teams · World Cup 2026</p>
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
              className="group relative overflow-hidden"
              style={{ aspectRatio: "3/4", borderRadius: 16, background: team.color + "22" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.image}
                alt={team.name}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              {/* Team-color gradient */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${team.color}ee 0%, rgba(0,0,0,0.15) 50%, transparent 70%)` }} />

              {/* Flag badge */}
              <div className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-lg backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.5)" }}>
                {team.flag}
              </div>

              {/* Count */}
              <div className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white/90 backdrop-blur-sm">
                {team.count}
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-black text-white drop-shadow">{team.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
