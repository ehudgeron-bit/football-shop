import { cartRepository, type CartWithItems } from "@/repositories/cart.repository";
import { prisma } from "@/lib/prisma";
import {
  getCartSessionId,
  createCartSessionId,
  clearCartSessionCookie,
} from "@/lib/cart-session";

export type CartSummary = {
  cart: CartWithItems;
  itemCount: number;
  subtotal: number;
};

export const cartService = {
  // Resolve the cart for the current request context.
  // userId is passed in from the session (never trust client).
  async getOrCreate(userId?: string): Promise<CartWithItems> {
    if (userId) {
      const existing = await cartRepository.findByUserId(userId);
      if (existing) return existing;
      return cartRepository.createForUser(userId);
    }

    // Guest flow
    const sessionId = await getCartSessionId();
    if (sessionId) {
      const existing = await cartRepository.findBySessionId(sessionId);
      if (existing) return existing;
    }

    const newSessionId = await createCartSessionId();
    return cartRepository.createForSession(newSessionId);
  },

  async getCart(userId?: string): Promise<CartWithItems | null> {
    if (userId) return cartRepository.findByUserId(userId);
    const sessionId = await getCartSessionId();
    if (!sessionId) return null;
    return cartRepository.findBySessionId(sessionId);
  },

  async addItem(
    userId: string | undefined,
    variantId: string,
    quantity: number
  ): Promise<CartWithItems> {
    // Validate variant exists and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { id: true, isActive: true } } },
    });

    if (!variant || !variant.product.isActive) {
      throw new Error("מוצר לא נמצא");
    }
    if (variant.stock < quantity) {
      throw new Error(`אין מספיק מלאי. נותרו ${variant.stock} יחידות`);
    }

    const cart = await this.getOrCreate(userId);

    // Check if adding to an existing item would exceed stock
    const existingItem = cart.items.find((i) => i.variantId === variantId);
    const currentQty = existingItem?.quantity ?? 0;
    if (currentQty + quantity > variant.stock) {
      throw new Error(`אין מספיק מלאי. נותרו ${variant.stock} יחידות`);
    }

    await cartRepository.upsertItem(cart.id, variantId, variant.product.id, quantity);
    return this.getOrCreate(userId);
  },

  async updateQuantity(
    userId: string | undefined,
    itemId: string,
    quantity: number
  ): Promise<CartWithItems> {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("עגלה לא נמצאה");

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new Error("פריט לא נמצא בעגלה");

    if (quantity <= 0) {
      await cartRepository.deleteItem(itemId);
    } else {
      // Re-validate stock
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      });
      if (!variant || variant.stock < quantity) {
        throw new Error(`אין מספיק מלאי`);
      }
      await cartRepository.updateItemQuantity(itemId, quantity);
    }

    return this.getOrCreate(userId);
  },

  async removeItem(
    userId: string | undefined,
    itemId: string
  ): Promise<CartWithItems> {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("עגלה לא נמצאה");

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new Error("פריט לא נמצא בעגלה");

    await cartRepository.deleteItem(itemId);
    return this.getOrCreate(userId);
  },

  // Called when a user logs in — merges their guest cart into their user cart
  async mergeGuestCart(userId: string): Promise<void> {
    const sessionId = await getCartSessionId();
    if (!sessionId) return;

    const guestCart = await cartRepository.findBySessionId(sessionId);
    if (!guestCart || guestCart.items.length === 0) {
      await clearCartSessionCookie();
      return;
    }

    const userCart = await cartRepository.findByUserId(userId) ??
      await cartRepository.createForUser(userId);

    await cartRepository.mergeGuestIntoUser(guestCart.id, userCart.id, guestCart.items);
    await clearCartSessionCookie();
  },

  summarize(cart: CartWithItems): CartSummary {
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.items.reduce((sum, i) => {
      const price = Number(i.variant.priceOverride ?? i.variant.product.basePrice);
      return sum + price * i.quantity;
    }, 0);
    return { cart, itemCount, subtotal };
  },
};
