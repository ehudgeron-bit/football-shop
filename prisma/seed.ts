import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@footballshop.co.il" },
    update: {},
    create: {
      email: "admin@footballshop.co.il",
      hashedPassword: adminPassword,
      role: "ADMIN",
      firstName: "מנהל",
      lastName: "ראשי",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Demo customer
  const customerPassword = await bcrypt.hash("Customer123!", 12);
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      hashedPassword: customerPassword,
      role: "CUSTOMER",
      firstName: "ישראל",
      lastName: "ישראלי",
      phone: "050-0000000",
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "match-jerseys" },
      update: {},
      create: { name: "חולצות משחק", slug: "match-jerseys" },
    }),
    prisma.category.upsert({
      where: { slug: "fan-jerseys" },
      update: {},
      create: { name: "חולצות אוהדים", slug: "fan-jerseys" },
    }),
    prisma.category.upsert({
      where: { slug: "training" },
      update: {},
      create: { name: "אימון", slug: "training" },
    }),
  ]);

  // Teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { slug: "barcelona" },
      update: {},
      create: { name: "ברצלונה", slug: "barcelona", country: "ספרד" },
    }),
    prisma.team.upsert({
      where: { slug: "real-madrid" },
      update: {},
      create: { name: "ריאל מדריד", slug: "real-madrid", country: "ספרד" },
    }),
    prisma.team.upsert({
      where: { slug: "manchester-city" },
      update: {},
      create: { name: "מנצ'סטר סיטי", slug: "manchester-city", country: "אנגליה" },
    }),
    prisma.team.upsert({
      where: { slug: "psg" },
      update: {},
      create: { name: "פריז סן ז'רמן", slug: "psg", country: "צרפת" },
    }),
    prisma.team.upsert({
      where: { slug: "national-israel" },
      update: {},
      create: { name: "נבחרת ישראל", slug: "national-israel", country: "ישראל" },
    }),
  ]);

  const sizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  const productSeed = [
    {
      slug: "barcelona-home-2425",
      name: "חולצת ברצלונה בית 24/25",
      nameEn: "Barcelona Home Jersey 2024/25",
      description:
        "חולצת הבית הרשמית של ברצלונה לעונת 2024/25. עשויה מבד Dri-FIT המנדף זיעה לנוחות מרבית במהלך המשחק.",
      basePrice: 449,
      teamId: teams[0].id,
      categoryId: categories[0].id,
      isFeatured: true,
      images: [
        { url: "https://placehold.co/600x750/a50044/ffffff?text=ברצלונה+בית", altText: "ברצלונה בית", position: 0 },
        { url: "https://placehold.co/600x750/a50044/ffffff?text=ברצלונה+בית+אחורי", altText: "ברצלונה בית - אחורי", position: 1 },
      ],
    },
    {
      slug: "real-madrid-home-2425",
      name: "חולצת ריאל מדריד בית 24/25",
      nameEn: "Real Madrid Home Jersey 2024/25",
      description: "חולצת הבית של ריאל מדריד לעונת 2024/25. לבן קלאסי עם סמל הקלאסיקו.",
      basePrice: 449,
      teamId: teams[1].id,
      categoryId: categories[0].id,
      isFeatured: true,
      images: [
        { url: "https://placehold.co/600x750/ffffff/000000?text=ריאל+מדריד", altText: "ריאל מדריד בית", position: 0 },
      ],
    },
    {
      slug: "man-city-home-2425",
      name: "חולצת מנצ'סטר סיטי בית 24/25",
      nameEn: "Manchester City Home Jersey 2024/25",
      description: "חולצת הבית של מנצ'סטר סיטי בצבע כחול שמיים אייקוני.",
      basePrice: 449,
      teamId: teams[2].id,
      categoryId: categories[0].id,
      images: [
        { url: "https://placehold.co/600x750/6cabdd/ffffff?text=מנצ'סטר+סיטי", altText: "מנצ'סטר סיטי בית", position: 0 },
      ],
    },
    {
      slug: "psg-home-2425",
      name: "חולצת פריז סן ז'רמן בית 24/25",
      nameEn: "PSG Home Jersey 2024/25",
      description: "חולצת הבית של PSG לעונת 2024/25.",
      basePrice: 469,
      teamId: teams[3].id,
      categoryId: categories[0].id,
      images: [
        { url: "https://placehold.co/600x750/003087/ffffff?text=PSG", altText: "PSG בית", position: 0 },
      ],
    },
    {
      slug: "israel-national-home-2425",
      name: "חולצת נבחרת ישראל בית 24/25",
      nameEn: "Israel National Team Home 2024/25",
      description: "חולצת נבחרת ישראל הרשמית. תמכו בנבחרת!",
      basePrice: 399,
      teamId: teams[4].id,
      categoryId: categories[1].id,
      isFeatured: true,
      images: [
        { url: "https://placehold.co/600x750/0038b8/ffffff?text=נבחרת+ישראל", altText: "נבחרת ישראל", position: 0 },
      ],
    },
  ];

  for (const p of productSeed) {
    const { images, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        isActive: true,
        images: { create: images },
        variants: {
          create: sizes.map((size, i) => ({
            size,
            stock: Math.floor(Math.random() * 20) + 5,
            // XXL and 3XL cost slightly more
            priceOverride: i >= 4 ? Number(productData.basePrice) + 20 : null,
          })),
        },
      },
    });
    console.log(`✅ Product: ${product.name}`);
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
