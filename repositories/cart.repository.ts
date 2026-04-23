import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Full cart shape needed by the UI — includes product info via variant
const cartSelect = {
  id: true,
  userId: true,
  sessionId: true,
  items: {
    select: {
      id: true,
      quantity: true,
      variantId: true,
      variant: {
        select: {
          id: true,
          size: true,
          stock: true,
          priceOverride: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              basePrice: true,
              images: {
                select: { url: true, altText: true },
                orderBy: { position: "asc" as const },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.CartSelect;

export type CartWithItems = Prisma.CartGetPayload<{ select: typeof cartSelect }>;

export const cartRepository = {
  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({ where: { userId }, select: cartSelect });
  },

  async findBySessionId(sessionId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({ where: { sessionId }, select: cartSelect });
  },

  async createForUser(userId: string): Promise<CartWithItems> {
    return prisma.cart.create({ data: { userId }, select: cartSelect });
  },

  async createForSession(sessionId: string): Promise<CartWithItems> {
    return prisma.cart.create({ data: { sessionId }, select: cartSelect });
  },

  async upsertItem(
    cartId: string,
    variantId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  },

  async deleteItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  },

  async clearItems(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  },

  // Transfer all items from guest cart into user cart, then delete guest cart
  async mergeGuestIntoUser(
    guestCartId: string,
    userCartId: string,
    guestItems: CartWithItems["items"]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const item of guestItems) {
        await tx.cartItem.upsert({
          where: { cartId_variantId: { cartId: userCartId, variantId: item.variantId } },
          create: {
            cartId: userCartId,
            variantId: item.variantId,
            productId: item.variant.product.id,
            quantity: item.quantity,
          },
          // Merge quantities — guest cart wins on top of existing
          update: { quantity: { increment: item.quantity } },
        });
      }
      await tx.cart.delete({ where: { id: guestCartId } });
    });
  },
};
