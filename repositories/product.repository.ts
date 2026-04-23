import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface ProductFilters {
  categorySlug?: string;
  teamSlug?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// The shape returned by findMany — includes relations needed by the UI
export const productWithRelations = {
  id: true,
  slug: true,
  name: true,
  nameEn: true,
  description: true,
  basePrice: true,
  isFeatured: true,
  isActive: true,
  team: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: { select: { url: true, altText: true, position: true }, orderBy: { position: "asc" as const } },
  variants: { select: { id: true, size: true, stock: true, priceOverride: true }, orderBy: { size: "asc" as const } },
} satisfies Prisma.ProductSelect;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  select: typeof productWithRelations;
}>;

export const productRepository = {
  async findMany(filters: ProductFilters = {}): Promise<{
    items: ProductWithRelations[];
    total: number;
  }> {
    const { categorySlug, teamSlug, featured, search, page = 1, limit = 12 } = filters;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(featured !== undefined && { isFeatured: featured }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(teamSlug && { team: { slug: teamSlug } }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { team: { name: { contains: search } } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: productWithRelations,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      select: productWithRelations,
    });
  },

  async findById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findFirst({
      where: { id, isActive: true },
      select: productWithRelations,
    });
  },

  async create(data: Prisma.ProductCreateInput): Promise<ProductWithRelations> {
    return prisma.product.create({ data, select: productWithRelations });
  },

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations> {
    return prisma.product.update({ where: { id }, data, select: productWithRelations });
  },

  async softDelete(id: string): Promise<void> {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  },
};
