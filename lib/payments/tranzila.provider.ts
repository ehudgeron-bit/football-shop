import type {
  PaymentProvider,
  PaymentInitiateParams,
  PaymentInitiateResult,
  WebhookPayload,
  WebhookVerificationResult,
} from "./provider.interface";

// Tranzila hosted-page integration.
// No card data ever touches our server — PCI scope is minimal.
// Docs: https://www.tranzila.com/integration/

const TRANZILA_BASE_URL = "https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi";

export class TranzilaProvider implements PaymentProvider {
  readonly name = "tranzila";

  private terminal: string;
  private apiKey: string;

  constructor() {
    const terminal = process.env.TRANZILA_TERMINAL_NAME;
    const apiKey = process.env.TRANZILA_API_KEY;

    if (!terminal || !apiKey) {
      throw new Error("TRANZILA_TERMINAL_NAME and TRANZILA_API_KEY must be set");
    }

    this.terminal = terminal;
    this.apiKey = apiKey;
  }

  async initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    // Build Tranzila hosted-page URL with signed parameters.
    // The user is redirected here and enters card details on Tranzila's page.
    const queryParams = new URLSearchParams({
      supplier: this.terminal,
      sum: params.amount.toFixed(2),
      currency: "1",               // 1 = ILS
      tranmode: "A",               // Authorize + Capture
      cred_type: "1",              // Credit card
      contact: params.customerName,
      email: params.customerEmail,
      notify_url: params.notifyUrl,
      success_url: params.successUrl,
      fail_url: params.failUrl,
      // We store our orderId in Tranzila's "order" field so the webhook can reference it
      order: params.orderId,
      pdesc: params.description.slice(0, 50),
      // lang: "he" for Hebrew UI on Tranzila's page
      lang: "he",
    });

    const redirectUrl = `${TRANZILA_BASE_URL}?${queryParams.toString()}`;

    // providerRef is the orderId at initiation time —
    // Tranzila will echo it back in the webhook as the "order" field
    return {
      redirectUrl,
      providerRef: params.orderId,
    };
  }

  async verifyWebhook(payload: WebhookPayload): Promise<WebhookVerificationResult> {
    const p = payload.raw;

    // Tranzila posts these fields on completion
    const responseCode = p["Response"] ?? p["response"];
    const orderId = p["order"] ?? p["Order"];
    const tranzilaRef = p["index"] ?? p["TranzilaTK"] ?? p["ConfirmationCode"];
    const sumStr = p["sum"] ?? p["Sum"];
    const supplier = p["supplier"] ?? p["Supplier"];

    // Verify the terminal name matches — prevents spoofed webhooks
    if (supplier && supplier !== this.terminal) {
      return {
        success: false,
        orderId: orderId ?? "",
        providerTransactionId: tranzilaRef ?? "",
        amount: 0,
        failureReason: "Terminal mismatch",
      };
    }

    if (!orderId) {
      return {
        success: false,
        orderId: "",
        providerTransactionId: tranzilaRef ?? "",
        amount: 0,
        failureReason: "Missing order reference",
      };
    }

    // Response code "000" = approved in Tranzila
    const approved = responseCode === "000";

    return {
      success: approved,
      orderId,
      providerTransactionId: tranzilaRef ?? "",
      amount: parseFloat(sumStr ?? "0"),
      failureReason: approved ? undefined : `Tranzila response code: ${responseCode}`,
    };
  }
}
