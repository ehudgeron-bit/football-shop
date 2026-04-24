/**
 * Imports all scraped HTML files from Images/www.fanshop.co.il/p/
 * into the Neon PostgreSQL database.
 *
 * Optimized: preloads existing slugs, runs 20 concurrent inserts.
 * Run: node --max-old-space-size=512 --import tsx/esm scripts/import-fanshop.ts
 */

import { readFileSync, readdirSync, existsSync, openSync, readSync, closeSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// ── Env loading ──────────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1 || line.startsWith("#")) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();
const IMAGES_DIR = path.join(process.cwd(), "Images/www.fanshop.co.il/p");
const SIZES = ["S", "M", "L", "XL", "XXL"];
const CONCURRENCY = 15;

// ── Team / category defs ─────────────────────────────────────────────────────
const TEAMS = [
  { k: ["ארגנטינה"], slug: "argentina", name: "ארגנטינה", country: "ארגנטינה" },
  { k: ["ברזיל"], slug: "brazil", name: "ברזיל", country: "ברזיל" },
  { k: ["צרפת"], slug: "france", name: "צרפת", country: "צרפת" },
  { k: ["ספרד"], slug: "spain", name: "ספרד", country: "ספרד" },
  { k: ["הולנד"], slug: "netherlands", name: "הולנד", country: "הולנד" },
  { k: ["קולומביה"], slug: "colombia", name: "קולומביה", country: "קולומביה" },
  { k: ["איטליה"], slug: "italy", name: "איטליה", country: "איטליה" },
  { k: ["גרמניה"], slug: "germany", name: "גרמניה", country: "גרמניה" },
  { k: ["אנגליה"], slug: "england", name: "אנגליה", country: "אנגליה" },
  { k: ["פורטוגל"], slug: "portugal", name: "פורטוגל", country: "פורטוגל" },
  { k: ["ריאל מדריד", "ריאל_מדריד", "ריאל-מדריד"], slug: "real-madrid", name: "ריאל מדריד", country: "ספרד" },
  { k: ["ברצלונה"], slug: "barcelona", name: "ברצלונה", country: "ספרד" },
  { k: ["יובנטוס"], slug: "juventus", name: "יובנטוס", country: "איטליה" },
  { k: ["נוטינגהאם"], slug: "nottingham-forest", name: "נוטינגהאם פורסט", country: "אנגליה" },
  { k: ["מנצ"], slug: "manchester-united", name: "מנצ'סטר יונייטד", country: "אנגליה" },
  { k: ["קריסטל פאלאס", "קריסטל_פאלאס", "קריסטל-פאלאס"], slug: "crystal-palace", name: "קריסטל פאלאס", country: "אנגליה" },
  { k: ["סנט פאולי", "סנט_פאולי"], slug: "st-pauli", name: "סנט פאולי", country: "גרמניה" },
  { k: ["מילאן"], slug: "ac-milan", name: "AC מילאן", country: "איטליה" },
  { k: ["אתלטיקו"], slug: "atletico-madrid", name: "אתלטיקו מדריד", country: "ספרד" },
  { k: ["וולבס"], slug: "wolves", name: "וולברהמפטון", country: "אנגליה" },
  { k: ["אל נאסר", "אל_נאסר", "אל-נאסר"], slug: "al-nassr", name: "אל נאסר", country: "סעודיה" },
  { k: ["קוראסאו"], slug: "curacao", name: "קוראסאו", country: "קוראסאו" },
  { k: ["ליון"], slug: "lyon", name: "אולימפיק ליון", country: "צרפת" },
  { k: ["מרסיי"], slug: "marseille", name: "אולימפיק מרסיי", country: "צרפת" },
  { k: ["ליברפול"], slug: "liverpool", name: "ליברפול", country: "אנגליה" },
  { k: ["ארסנל"], slug: "arsenal", name: "ארסנל", country: "אנגליה" },
  { k: ["צ'לסי", "צלסי"], slug: "chelsea", name: "צ'לסי", country: "אנגליה" },
  { k: ["אינטר"], slug: "inter-milan", name: "אינטר מילאן", country: "איטליה" },
  { k: ["נאפולי"], slug: "napoli", name: "נאפולי", country: "איטליה" },
  { k: ["פריז סן"], slug: "psg", name: "פריז סן ז'רמן", country: "צרפת" },
  { k: ["אייאקס"], slug: "ajax", name: "אייאקס", country: "הולנד" },
  { k: ["ישראל"], slug: "national-israel", name: "נבחרת ישראל", country: "ישראל" },
  { k: ["מקסיקו"], slug: "mexico", name: "מקסיקו", country: "מקסיקו" },
  { k: ["מרוקו"], slug: "morocco", name: "מרוקו", country: "מרוקו" },
  { k: ["קרואטיה"], slug: "croatia", name: "קרואטיה", country: "קרואטיה" },
  { k: ["בלגיה"], slug: "belgium", name: "בלגיה", country: "בלגיה" },
  { k: ["ביירן"], slug: "bayern", name: "באיירן מינכן", country: "גרמניה" },
  { k: ["דורטמונד"], slug: "dortmund", name: "בורוסיה דורטמונד", country: "גרמניה" },
  { k: ["לוורקוזן", "לברקוזן"], slug: "bayer-leverkusen", name: "באייר לוורקוזן", country: "גרמניה" },
  { k: ["פורטו"], slug: "porto", name: "FC פורטו", country: "פורטוגל" },
  { k: ["בנפיקה"], slug: "benfica", name: "בנפיקה", country: "פורטוגל" },
  { k: ["גלטה"], slug: "galatasaray", name: "גלטסאריי", country: "טורקיה" },
];

const CATEGORIES = [
  { k: ["חולצת משחק", "חולצת-משחק", "חולצת_משחק"], slug: "match-jerseys", name: "חולצות משחק" },
  { k: ["חולצת עבר", "חולצת_עבר", "חולצת-עבר"], slug: "retro", name: "חולצות רטרו" },
  { k: ["חליפת ילדים", "חליפת-ילדים", "חליפת_ילדים"], slug: "kids", name: "חליפות ילדים" },
  { k: ["בגד גוף", "בגד-גוף", "בגד_גוף"], slug: "babies", name: "תינוקות" },
  { k: ["חולצת חימום", "חולצת-חימום", "אימונית"], slug: "training", name: "אימון" },
  { k: ["שוער"], slug: "goalkeepers", name: "שוערים" },
  { k: ["ארוכה", "שרוול ארוך"], slug: "long-sleeve", name: "שרוול ארוך" },
  { k: [] as string[], slug: "fan-jerseys", name: "חולצות אוהדים" },
];

function detectTeam(text: string) {
  for (const t of TEAMS) if (t.k.some((k) => text.includes(k))) return t;
  return null;
}

function detectCategory(text: string) {
  for (const c of CATEGORIES) if (c.k.some((k) => text.includes(k))) return c;
  return CATEGORIES[CATEGORIES.length - 1]; // fan-jerseys
}

// ── HTML parser ──────────────────────────────────────────────────────────────
function parseHtml(dir: string) {
  const file = path.join(IMAGES_DIR, dir, "index.html");
  if (!existsSync(file)) return null;

  let html: string;
  try { html = readFileSync(file, "utf-8"); } catch { return null; }

  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/&#8211;/g, "-").replace(/&amp;/g, "&").replace(/&#039;/g, "'")
    .trim();
  if (!h1) return null;

  const rawPrice = (html.match(/amount[^>]*>\s*<bdi>([^<]+)<\/bdi>/s)?.[1] ||
    html.match(/"price":"([^"]+)"/)?.[1] || "149").replace(/[^\d.]/g, "");
  const price = parseFloat(rawPrice) || 149;

  const gallery = [...html.matchAll(/data-large_image="([^"]+)"/g)].map((m) => m[1]);
  const og = (html.match(/property="og:image"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:image"/))?.[1];

  const imgs = [...new Set([...gallery, ...(og ? [og] : [])])].slice(0, 4);
  if (!imgs.length) return null;

  return { slug: dir, name: h1, price, images: imgs };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(IMAGES_DIR)) { console.error("❌ Images dir not found"); process.exit(1); }

  const allDirs = readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  console.log(`📦 ${allDirs.length} product directories`);

  // ── Detect needed teams/categories from filename snippets ────────────────
  const teamSlugs = new Set<string>();
  const catSlugs = new Set<string>(["fan-jerseys"]);
  for (const dir of allDirs) {
    const text = dir.replace(/[-_]/g, " ");
    const t = detectTeam(text); if (t) teamSlugs.add(t.slug);
    const c = detectCategory(text); catSlugs.add(c.slug);
  }

  // ── Upsert teams ──────────────────────────────────────────────────────────
  console.log(`🏟️  Upserting ${teamSlugs.size} teams...`);
  const dbTeams = new Map<string, string>();
  for (const slug of teamSlugs) {
    const def = TEAMS.find((t) => t.slug === slug)!;
    const r = await prisma.team.upsert({ where: { slug }, update: { name: def.name }, create: { name: def.name, slug, country: def.country } });
    dbTeams.set(slug, r.id);
  }

  // ── Upsert categories ─────────────────────────────────────────────────────
  console.log(`📁 Upserting ${catSlugs.size} categories...`);
  const dbCats = new Map<string, string>();
  for (const slug of catSlugs) {
    const def = CATEGORIES.find((c) => c.slug === slug)!;
    if (!def) continue;
    const r = await prisma.category.upsert({ where: { slug }, update: { name: def.name }, create: { name: def.name, slug } });
    dbCats.set(slug, r.id);
  }

  // ── Deactivate old placeholder products ───────────────────────────────────
  await prisma.product.updateMany({
    where: { slug: { in: ["barcelona-home-2425", "real-madrid-home-2425", "man-city-home-2425", "psg-home-2425", "israel-national-home-2425"] } },
    data: { isActive: false },
  });

  // ── Preload all existing slugs (1 query instead of N) ────────────────────
  const existing = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );
  console.log(`ℹ️  ${existing.size} products already in DB\n🚀 Starting import (concurrency=${CONCURRENCY})...\n`);

  let created = 0; let skipped = 0; let errors = 0;

  async function importOne(dir: string) {
    if (existing.has(dir)) { skipped++; return; }
    const p = parseHtml(dir);
    if (!p) { errors++; return; }

    const teamDef = detectTeam(p.name + " " + dir.replace(/[-_]/g, " "));
    const catDef = detectCategory(p.name);
    const teamId = teamDef ? dbTeams.get(teamDef.slug) : undefined;
    const categoryId = dbCats.get(catDef.slug) ?? dbCats.get("fan-jerseys");

    const isFeatured = p.name.includes("2026") ||
      (teamDef !== null && ["argentina", "brazil", "france", "spain", "england", "portugal"].includes(teamDef.slug));
    const compareAtPrice = isFeatured ? Math.round(p.price * 1.28 / 10) * 10 : null;

    try {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: `${p.name}. ${teamDef ? `קבוצה: ${teamDef.name}.` : ""} מקורי בלבד, זמין במגוון מידות.`,
          basePrice: p.price,
          compareAtPrice,
          isActive: true,
          isFeatured,
          teamId: teamId ?? null,
          categoryId: categoryId ?? null,
          images: { create: p.images.map((url, i) => ({ url, altText: i === 0 ? p.name : `${p.name} ${i + 1}`, position: i })) },
          variants: { create: SIZES.map((size, i) => ({ size, stock: Math.floor(Math.random() * 15) + 3, priceOverride: i >= 3 ? p.price + 15 : null })) },
        },
      });
      created++;
      if (created % 100 === 0) console.log(`  ✅ ${created} created...`);
    } catch (e) {
      errors++;
      if (errors <= 3) console.error(`  ❌ ${p.name.slice(0, 40)}: ${(e as Error).message.slice(0, 60)}`);
    }
  }

  // Process in batches of CONCURRENCY
  for (let i = 0; i < allDirs.length; i += CONCURRENCY) {
    await Promise.all(allDirs.slice(i, i + CONCURRENCY).map(importOne));
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch((e) => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
