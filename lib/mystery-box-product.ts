import { prisma } from "@/lib/prisma";

const SLUG = "mystery-box";
const PRICE = 149;
const SIZES = ["S", "M", "L", "XL", "XXL"];
const STOCK = 999; // virtual — always available

export async function getMysteryBoxProduct() {
  const existing = await prisma.product.findUnique({
    where: { slug: SLUG },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });

  if (existing) return existing;

  // First-time creation
  return prisma.product.create({
    data: {
      slug: SLUG,
      name: "קופסת מסתורין - נבחרות מונדיאל 2026",
      description:
        "קבל חולצת נבחרת אקראית אחת מתוך 13 הנבחרות המובילות במונדיאל 2026. חולצה מקורית מובטחת.",
      basePrice: PRICE,
      isActive: true,
      isFeatured: true,
      images: {
        create: [
          { url: "/images/mystery-box.jpeg", altText: "קופסת מסתורין", position: 0 },
          { url: "/images/mystery-box-promo.jpeg", altText: "Mystery Box Promo", position: 1 },
        ],
      },
      variants: {
        create: SIZES.map((size) => ({ size, stock: STOCK, priceOverride: null })),
      },
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });
}
