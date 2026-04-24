import Link from "next/link";
import { prisma } from "@/lib/prisma";

const teamFlags: Record<string, string> = {
  ארגנטינה: "🇦🇷",
  ברזיל: "🇧🇷",
  צרפת: "🇫🇷",
  ספרד: "🇪🇸",
  גרמניה: "🇩🇪",
  אנגליה: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  פורטוגל: "🇵🇹",
  הולנד: "🇳🇱",
  קולומביה: "🇨🇴",
  מרוקו: "🇲🇦",
  איטליה: "🇮🇹",
  בלגיה: "🇧🇪",
  מקסיקו: "🇲🇽",
  קוראסאו: "🇨🇼",
  ארהב: "🇺🇸",
  קנדה: "🇨🇦",
  יפן: "🇯🇵",
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
      orderBy: { name: "asc" },
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
    <section className="border-t border-white/8 bg-[#0d0d0d] py-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-[#E69900]" />
            <h2 className="text-xl font-black text-white">נבחרות מונדיאל 2026</h2>
            <span className="rounded-4 bg-[#E69900] px-2 py-0.5 text-[10px] font-black text-black">
              {teams.length} נבחרות
            </span>
          </div>
          <Link
            href="/products?category=national-teams"
            className="text-sm font-semibold text-[#E69900] hover:text-[#cc8800]"
          >
            לכל הנבחרות ←
          </Link>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/products?q=${encodeURIComponent(team.name)}`}
              className="group relative overflow-hidden rounded-16 bg-[#1a1a1a]"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Jersey image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.image}
                alt={team.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.90) 30%, rgba(0,0,0,0.25) 65%, transparent 100%)",
                }}
              />

              {/* Flag badge top-right */}
              <div className="absolute right-2 top-2 text-2xl leading-none drop-shadow">
                {team.flag}
              </div>

              {/* Product count badge top-left */}
              <div className="absolute left-2 top-2 rounded-4 bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-gray-300">
                {team.count} מוצרים
              </div>

              {/* Team name bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-black leading-tight text-white">{team.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#E69900] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  לצפייה ←
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
