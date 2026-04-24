/**
 * Parses all scraped HTML files from Images/www.fanshop.co.il/p/
 * and seeds the Neon PostgreSQL database with real products.
 *
 * Run: node --max-old-space-size=512 --import tsx/esm scripts/import-fanshop.ts
 * Or:  npx tsx scripts/import-fanshop.ts
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

const IMAGES_DIR = path.join(process.cwd(), "Images/www.fanshop.co.il/p");
const SIZES = ["S", "M", "L", "XL", "XXL"];

// ── Team / category definitions ──────────────────────────────────────────────
interface TeamDef { keywords: string[]; slug: string; name: string; country: string }
interface CategoryDef { keywords: string[]; slug: string; name: string }

const TEAM_DEFS: TeamDef[] = [
  { keywords: ["ארגנטינה"], slug: "argentina", name: "ארגנטינה", country: "ארגנטינה" },
  { keywords: ["ברזיל"], slug: "brazil", name: "ברזיל", country: "ברזיל" },
  { keywords: ["צרפת"], slug: "france", name: "צרפת", country: "צרפת" },
  { keywords: ["ספרד"], slug: "spain", name: "ספרד", country: "ספרד" },
  { keywords: ["הולנד"], slug: "netherlands", name: "הולנד", country: "הולנד" },
  { keywords: ["קולומביה"], slug: "colombia", name: "קולומביה", country: "קולומביה" },
  { keywords: ["איטליה"], slug: "italy", name: "איטליה", country: "איטליה" },
  { keywords: ["גרמניה"], slug: "germany", name: "גרמניה", country: "גרמניה" },
  { keywords: ["אנגליה"], slug: "england", name: "אנגליה", country: "אנגליה" },
  { keywords: ["פורטוגל"], slug: "portugal", name: "פורטוגל", country: "פורטוגל" },
  { keywords: ["ריאל מדריד", "ריאל_מדריד", "ריאל-מדריד"], slug: "real-madrid", name: "ריאל מדריד", country: "ספרד" },
  { keywords: ["ברצלונה"], slug: "barcelona", name: "ברצלונה", country: "ספרד" },
  { keywords: ["יובנטוס"], slug: "juventus", name: "יובנטוס", country: "איטליה" },
  { keywords: ["נוטינגהאם"], slug: "nottingham-forest", name: "נוטינגהאם פורסט", country: "אנגליה" },
  { keywords: ["מנצ"], slug: "manchester-united", name: "מנצ'סטר יונייטד", country: "אנגליה" },
  { keywords: ["קריסטל פאלאס", "קריסטל_פאלאס", "קריסטל-פאלאס"], slug: "crystal-palace", name: "קריסטל פאלאס", country: "אנגליה" },
  { keywords: ["סנט פאולי", "סנט_פאולי"], slug: "st-pauli", name: "סנט פאולי", country: "גרמניה" },
  { keywords: ["מילאן"], slug: "ac-milan", name: "AC מילאן", country: "איטליה" },
  { keywords: ["אתלטיקו"], slug: "atletico-madrid", name: "אתלטיקו מדריד", country: "ספרד" },
  { keywords: ["וולבס"], slug: "wolves", name: "וולברהמפטון", country: "אנגליה" },
  { keywords: ["אל נאסר", "אל_נאסר", "אל-נאסר"], slug: "al-nassr", name: "אל נאסר", country: "סעודיה" },
  { keywords: ["קוראסאו"], slug: "curacao", name: "קוראסאו", country: "קוראסאו" },
  { keywords: ["ליון"], slug: "lyon", name: "אולימפיק ליון", country: "צרפת" },
  { keywords: ["מרסיי"], slug: "marseille", name: "אולימפיק מרסיי", country: "צרפת" },
  { keywords: ["ליברפול"], slug: "liverpool", name: "ליברפול", country: "אנגליה" },
  { keywords: ["ארסנל"], slug: "arsenal", name: "ארסנל", country: "אנגליה" },
  { keywords: ["צ'לסי", "צלסי"], slug: "chelsea", name: "צ'לסי", country: "אנגליה" },
  { keywords: ["אינטר"], slug: "inter-milan", name: "אינטר מילאן", country: "איטליה" },
  { keywords: ["נאפולי"], slug: "napoli", name: "נאפולי", country: "איטליה" },
  { keywords: ["PSG", "פריז סן"], slug: "psg", name: "פריז סן ז'רמן", country: "צרפת" },
  { keywords: ["אייאקס"], slug: "ajax", name: "אייאקס", country: "הולנד" },
  { keywords: ["ישראל"], slug: "national-israel", name: "נבחרת ישראל", country: "ישראל" },
  { keywords: ["מקסיקו"], slug: "mexico", name: "מקסיקו", country: "מקסיקו" },
  { keywords: ["מרוקו"], slug: "morocco", name: "מרוקו", country: "מרוקו" },
  { keywords: ["קרואטיה"], slug: "croatia", name: "קרואטיה", country: "קרואטיה" },
  { keywords: ["בלגיה"], slug: "belgium", name: "בלגיה", country: "בלגיה" },
  { keywords: ["ביירן"], slug: "bayern", name: "באיירן מינכן", country: "גרמניה" },
  { keywords: ["דורטמונד"], slug: "dortmund", name: "בורוסיה דורטמונד", country: "גרמניה" },
  { keywords: ["לוורקוזן", "לברקוזן"], slug: "bayer-leverkusen", name: "באייר לוורקוזן", country: "גרמניה" },
  { keywords: ["פורטו"], slug: "porto", name: "FC פורטו", country: "פורטוגל" },
  { keywords: ["בנפיקה"], slug: "benfica", name: "בנפיקה", country: "פורטוגל" },
  { keywords: ["גלטה"], slug: "galatasaray", name: "גלטסאריי", country: "טורקיה" },
];

const CATEGORY_DEFS: CategoryDef[] = [
  { keywords: ["חולצת משחק", "חולצת-משחק", "חולצת_משחק"], slug: "match-jerseys", name: "חולצות משחק" },
  { keywords: ["חולצת עבר", "חולצת_עבר", "חולצת-עבר"], slug: "retro", name: "חולצות רטרו" },
  { keywords: ["חליפת ילדים", "חליפת-ילדים", "חליפת_ילדים"], slug: "kids", name: "חליפות ילדים" },
  { keywords: ["בגד גוף", "בגד-גוף", "בגד_גוף"], slug: "babies", name: "תינוקות" },
  { keywords: ["חולצת חימום", "חולצת-חימום", "אימונית"], slug: "training", name: "אימון" },
  { keywords: ["שוער"], slug: "goalkeepers", name: "שוערים" },
  { keywords: ["ארוכה", "שרוול ארוך"], slug: "long-sleeve", name: "שרוול ארוך" },
];

function detectTeam(name: string, slug: string): TeamDef | null {
  const text = name + " " + slug.replace(/[-_]/g, " ");
  for (const def of TEAM_DEFS) {
    if (def.keywords.some((k) => text.includes(k))) return def;
  }
  return null;
}

function detectCategory(name: string): CategoryDef {
  for (const def of CATEGORY_DEFS) {
    if (def.keywords.some((k) => name.includes(k))) return def;
  }
  return { keywords: [], slug: "fan-jerseys", name: "חולצות אוהדים" };
}

// ── Parse a single HTML file (reads file, extracts data, releases memory) ────
interface ParsedProduct {
  slug: string;
  name: string;
  price: number;
  images: string[];
}

function parseOne(dir: string): ParsedProduct | null {
  const htmlPath = path.join(IMAGES_DIR, dir, "index.html");
  if (!existsSync(htmlPath)) return null;

  let html: string;
  try {
    html = readFileSync(htmlPath, "utf-8");
  } catch {
    return null;
  }

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
  if (!h1Match) return null;
  const name = h1Match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .trim();
  if (!name) return null;

  const priceMatch =
    html.match(/amount[^>]*>\s*<bdi>([^<]+)<\/bdi>/s) ||
    html.match(/"price":"([^"]+)"/);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/[^\d.]/g, "")) || 149 : 149;

  const galleryUrls = [...html.matchAll(/data-large_image="([^"]+)"/g)].map((m) => m[1]);
  const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:image"/);

  const imgSet = new Set<string>();
  for (const u of galleryUrls) imgSet.add(u);
  if (ogMatch) imgSet.add(ogMatch[1]);

  const images = [...imgSet].slice(0, 4);
  if (images.length === 0) return null;

  return { slug: dir, name, price, images };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍 Scanning product directories...");

  if (!existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const allDirs = readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`📦 ${allDirs.length} product directories found`);

  // ── Pass 1: collect unique teams/categories needed (small data) ──────────
  console.log("🔎 Pass 1 — detecting teams & categories...");
  const teamSlugsNeeded = new Set<string>();
  const catSlugsNeeded = new Set<string>();
  catSlugsNeeded.add("fan-jerseys");

  for (const dir of allDirs) {
    const htmlPath = path.join(IMAGES_DIR, dir, "index.html");
    if (!existsSync(htmlPath)) continue;
    let snippet = "";
    try {
      // Read only first 4KB to get the h1 quickly
      const buf = Buffer.alloc(4096);
      const fd = require("fs").openSync(htmlPath, "r");
      const bytesRead = require("fs").readSync(fd, buf, 0, 4096, 0);
      require("fs").closeSync(fd);
      snippet = buf.slice(0, bytesRead).toString("utf-8");
    } catch { continue; }

    // Get name from snippet (approximate — may be incomplete for long h1s)
    const h1 = snippet.match(/<h1[^>]*>([^<]*)/)?.[1]?.replace(/&#8211;/g, "-").trim() ?? dir;

    const team = detectTeam(h1, dir);
    const cat = detectCategory(h1);
    if (team) teamSlugsNeeded.add(team.slug);
    catSlugsNeeded.add(cat.slug);
  }

  // ── Upsert teams ─────────────────────────────────────────────────────────
  console.log(`🏟️  Upserting ${teamSlugsNeeded.size} teams...`);
  const dbTeams = new Map<string, string>(); // slug → id

  for (const slug of teamSlugsNeeded) {
    const def = TEAM_DEFS.find((d) => d.slug === slug)!;
    if (!def) continue;
    const rec = await prisma.team.upsert({
      where: { slug },
      update: { name: def.name, country: def.country },
      create: { name: def.name, slug, country: def.country },
    });
    dbTeams.set(slug, rec.id);
  }

  // ── Upsert categories ─────────────────────────────────────────────────────
  const allCatDefs: CategoryDef[] = [
    ...CATEGORY_DEFS,
    { keywords: [], slug: "fan-jerseys", name: "חולצות אוהדים" },
  ];
  console.log(`📁 Upserting ${catSlugsNeeded.size} categories...`);
  const dbCats = new Map<string, string>(); // slug → id

  for (const slug of catSlugsNeeded) {
    const def = allCatDefs.find((d) => d.slug === slug);
    if (!def) continue;
    const rec = await prisma.category.upsert({
      where: { slug },
      update: { name: def.name },
      create: { name: def.name, slug },
    });
    dbCats.set(slug, rec.id);
  }

  // Mark old placeholder products inactive (don't delete — FK constraints from orders)
  await prisma.product.updateMany({
    where: { slug: { in: ["barcelona-home-2425", "real-madrid-home-2425", "man-city-home-2425", "psg-home-2425", "israel-national-home-2425"] } },
    data: { isActive: false },
  });
  console.log("🗑️  Deactivated placeholder products");

  // ── Pass 2: import products one at a time (memory-safe) ──────────────────
  console.log(`\n🚀 Importing products...\n`);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of allDirs) {
    const p = parseOne(dir); // reads file, returns data, then releases
    if (!p) { errors++; continue; }

    const exists = await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) { skipped++; continue; }

    const teamDef = detectTeam(p.name, p.slug);
    const catDef = detectCategory(p.name);

    const teamId = teamDef ? dbTeams.get(teamDef.slug) : undefined;
    const categoryId = dbCats.get(catDef.slug) ?? dbCats.get("fan-jerseys");

    const isFeatured =
      p.name.includes("2026") ||
      (teamDef !== null &&
        ["argentina", "brazil", "france", "spain", "england", "portugal"].includes(teamDef.slug));

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
          images: {
            create: p.images.map((url, i) => ({
              url,
              altText: i === 0 ? p.name : `${p.name} - ${i + 1}`,
              position: i,
            })),
          },
          variants: {
            create: SIZES.map((size, i) => ({
              size,
              stock: Math.floor(Math.random() * 15) + 3,
              priceOverride: i >= 3 ? p.price + 15 : null,
            })),
          },
        },
      });
      created++;
      if (created % 100 === 0) process.stdout.write(`  ✅ ${created} imported...\n`);
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`  ❌ ${p.name}: ${(err as Error).message.slice(0, 80)}`);
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
