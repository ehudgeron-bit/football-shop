import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { orderService } from "@/services/order.service";

// Tranzila POSTs to this endpoint after payment completion.
// Must respond 200 quickly — any error response causes Tranzila to retry.
export async function POST(req: NextRequest) {
  let rawBody: Record<string, string> = {};

  try {
    // Tranzila sends application/x-www-form-urlencoded
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      rawBody = await req.json();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => { rawBody[key] = value; });
    }

    const provider = getPaymentProvider();
    const result = await provider.verifyWebhook({ raw: rawBody });

    if (!result.orderId) {
      console.error("[webhook] Missing orderId in payload", rawBody);
      // Return 200 to stop retries — we cannot process without an order ID
      return NextResponse.json({ received: true });
    }

    if (result.success) {
      await orderService.confirmPayment(
        result.orderId,
        result.providerTransactionId,
        rawBody
      );
    } else {
      await orderService.failPayment(result.orderId, rawBody);
      console.warn("[webhook] Payment failed", {
        orderId: result.orderId,
        reason: result.failureReason,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Log but still return 200 — prevents Tranzila from flooding us with retries.
    // The order will remain PENDING and can be reconciled manually.
    console.error("[webhook] Processing error", err, { rawBody });
    return NextResponse.json({ received: true });
  }
}
