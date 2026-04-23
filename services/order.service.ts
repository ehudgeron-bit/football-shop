import { prisma } from "@/lib/prisma";
import { cartRepository } from "@/repositories/cart.repository";
import { orderRepository } from "@/repositories/order.repository";
import { getPaymentProvider } from "@/lib/payments";
import { emailService } from "@/services/email.service";
import Decimal from "decimal.js";

type TxClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

function buildAppUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

export const orderService = {
  // Creates a PENDING order and returns the Tranzila redirect URL.
  // Inventory is NOT deducted yet — only on confirmed payment.
  async initiateCheckout(
    userId: string,
    addressId: string
  ): Promise<{ redirectUrl: string; orderId: string }> {
    // 1. Load and validate cart
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error("העגלה ריקה");
    }

    // 2. Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new Error("כתובת לא נמצאה");

    // 3. Validate all variants still have stock (pre-check, not atomic yet)
    for (const item of cart.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      });
      if (!variant || variant.stock < item.quantity) {
        throw new Error(
          `${item.variant.product.name} (${item.variant.size}) אזל מהמלאי`
        );
      }
    }

    // 4. Calculate total
    const total = cart.items.reduce((sum, item) => {
      const price = Number(item.variant.priceOverride ?? item.variant.product.basePrice);
      return sum + price * item.quantity;
    }, 0);

    // 5. Build address snapshot (immutable record of where order ships)
    const shippingSnapshot = {
      street: address.street,
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
    };

    // 6. Create PENDING order with items snapshot — all in a transaction
    const order = await prisma.$transaction(async (tx: TxClient) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          shippingSnapshot: JSON.stringify(shippingSnapshot),
          totalAmount: new Decimal(total),
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productName: item.variant.product.name,
              productSlug: item.variant.product.slug,
              size: item.variant.size,
              unitPrice: new Decimal(
                Number(item.variant.priceOverride ?? item.variant.product.basePrice)
              ),
              quantity: item.quantity,
              imageUrl: item.variant.product.images[0]?.url ?? null,
            })),
          },
        },
        include: { user: true },
      });

      // Create the Payment record in INITIATED state
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: new Decimal(total),
          currency: "ILS",
          status: "INITIATED",
          provider: "tranzila",
          providerRef: newOrder.id,
        },
      });

      return newOrder;
    });

    // 7. Get payment redirect URL from provider
    const provider = getPaymentProvider();
    const { redirectUrl } = await provider.initiate({
      orderId: order.id,
      amount: total,
      currency: "ILS",
      customerEmail: order.user.email,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      description: `הזמנה #${order.orderNumber}`,
      notifyUrl: buildAppUrl("/api/payments/webhook"),
      successUrl: buildAppUrl(`/checkout/result?orderId=${order.id}&status=success`),
      failUrl: buildAppUrl(`/checkout/result?orderId=${order.id}&status=failed`),
    });

    return { redirectUrl, orderId: order.id };
  },

  // Called by webhook handler after Tranzila confirms payment.
  // This is where inventory is atomically deducted.
  async confirmPayment(
    orderId: string,
    providerTransactionId: string,
    rawWebhook: Record<string, string>
  ): Promise<void> {
    await prisma.$transaction(async (tx: TxClient) => {
      // Lock the order row to prevent duplicate webhook processing
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });

      if (!order) throw new Error(`Order ${orderId} not found`);

      // Idempotency: if already paid, silently succeed
      if (order.status === "PAID") return;

      if (order.status !== "PENDING") {
        throw new Error(`Order ${orderId} is in unexpected status: ${order.status}`);
      }

      // Atomically deduct inventory for each line item
      for (const item of order.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity }, // optimistic lock — fails if not enough stock
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(
            `Stock exhausted for variant ${item.variantId} during payment confirmation`
          );
        }
      }

      // Update order and payment status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      await tx.payment.update({
        where: { orderId },
        data: {
          status: "SUCCESS",
          providerRef: providerTransactionId,
          rawWebhookPayload: rawWebhook,
        },
      });
    });

    // Clear the cart after successful payment (outside transaction — non-critical)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });
    if (order?.userId) {
      const cart = await cartRepository.findByUserId(order.userId);
      if (cart) await cartRepository.clearItems(cart.id);
    }

    // Send confirmation email (async — never block order completion)
    emailService.sendOrderConfirmation(orderId).catch((err) =>
      console.error("[email] Failed to send order confirmation:", err)
    );
  },

  async failPayment(
    orderId: string,
    rawWebhook: Record<string, string>
  ): Promise<void> {
    await prisma.$transaction(async (tx: TxClient) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order || order.status !== "PENDING") return;

      await tx.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      await tx.payment.update({
        where: { orderId },
        data: { status: "FAILED", rawWebhookPayload: rawWebhook },
      });
    });
  },

  async getOrderForUser(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.user.id !== userId) throw new Error("הזמנה לא נמצאה");
    return order;
  },

  async getUserOrders(userId: string) {
    return orderRepository.findByUserId(userId);
  },
};
