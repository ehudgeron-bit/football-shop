import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function orderConfirmationHtml(order: {
  orderNumber: string;
  totalAmount: { toString(): string } | string | number;
  items: {
    productName: string;
    size: string;
    quantity: number;
    unitPrice: { toString(): string } | string | number;
    imageUrl?: string | null;
  }[];
  shippingSnapshot: unknown;
}): string {
  const snapshot = order.shippingSnapshot as {
    street?: string;
    city?: string;
    zipCode?: string;
  } | null;

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee">
          <strong>${item.productName}</strong> — מידה ${item.size}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center">
          ${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:left">
          ${formatPrice(Number(item.unitPrice))}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#2563eb;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">⚽ Football Shop</h1>
      <p style="color:#bfdbfe;margin:8px 0 0">אישור הזמנה</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:16px">תודה על הזמנתך!</p>
      <p>מספר הזמנה: <strong>${order.orderNumber.slice(0, 8).toUpperCase()}</strong></p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 0;text-align:right;font-size:13px;color:#6b7280">מוצר</th>
            <th style="padding:10px 0;text-align:center;font-size:13px;color:#6b7280">כמות</th>
            <th style="padding:10px 0;text-align:left;font-size:13px;color:#6b7280">מחיר</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0;font-weight:bold">סה"כ לתשלום</td>
            <td style="padding:12px 0;font-weight:bold;text-align:left">
              ${formatPrice(Number(order.totalAmount))}
            </td>
          </tr>
        </tfoot>
      </table>

      ${
        snapshot
          ? `<div style="background:#f9fafb;border-radius:6px;padding:16px;margin-top:16px">
          <p style="margin:0 0 8px;font-weight:bold;font-size:14px">כתובת משלוח</p>
          <p style="margin:0;font-size:14px;color:#374151">
            ${snapshot.street ?? ""}, ${snapshot.city ?? ""} ${snapshot.zipCode ?? ""}
          </p>
        </div>`
          : ""
      }

      <p style="margin-top:24px;font-size:13px;color:#6b7280">
        אם יש לך שאלות, אנחנו כאן לעזור.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export const emailService = {
  async sendOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, firstName: true } },
        items: true,
      },
    });

    if (!order) {
      console.error(`[email] Order ${orderId} not found — skipping confirmation`);
      return;
    }

    // Skip silently if SMTP is not configured (dev / CI environments)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[email] SMTP not configured — skipping order confirmation for ${orderId}`);
      return;
    }

    const transport = createTransport();
    const html = orderConfirmationHtml(order);

    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? "Football Shop <noreply@footballshop.co.il>",
      to: order.user.email,
      subject: `אישור הזמנה #${order.orderNumber.slice(0, 8).toUpperCase()} — Football Shop`,
      html,
    });

    console.log(`[email] Order confirmation sent to ${order.user.email}`);
  },
};
