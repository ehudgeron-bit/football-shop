import { productRepository, type ProductFilters } from "@/repositories/product.repository";
import { prisma } from "@/lib/prisma";
import type { CreateProductInput } from "@/lib/validators/product";
import Decimal from "decimal.js";

export const productService = {
  async list(filters: ProductFilters) {
    return productRepository.findMany(filters);
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new Error("מוצר לא נמצא");
    return product;
  },

  async create(input: CreateProductInput) {
    const slugExists = await prisma.product.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (slugExists) throw new Error("ה-slug כבר קיים במערכת");

    const { variants, ...productData } = input;

    return productRepository.create({
      ...productData,
      basePrice: new Decimal(productData.basePrice),
      ...(productData.teamId && { team: { connect: { id: productData.teamId } } }),
      ...(productData.categoryId && { category: { connect: { id: productData.categoryId } } }),
      teamId: undefined,
      categoryId: undefined,
      variants: {
        create: variants.map((v) => ({
          size: v.size,
          stock: v.stock,
          priceOverride: v.priceOverride ? new Decimal(v.priceOverride) : undefined,
        })),
      },
    } as Parameters<typeof productRepository.create>[0]);
  },

  async update(id: string, input: Partial<CreateProductInput>) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("מוצר לא נמצא");

    const { variants, ...rest } = input;

    return productRepository.update(id, {
      ...rest,
      ...(rest.basePrice !== undefined && { basePrice: new Decimal(rest.basePrice) }),
      ...(rest.teamId !== undefined && {
        team: rest.teamId ? { connect: { id: rest.teamId } } : { disconnect: true },
        teamId: undefined,
      }),
      ...(rest.categoryId !== undefined && {
        category: rest.categoryId ? { connect: { id: rest.categoryId } } : { disconnect: true },
        categoryId: undefined,
      }),
    } as Parameters<typeof productRepository.update>[1]);
  },

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("מוצר לא נמצא");
    await productRepository.softDelete(id);
  },
};
