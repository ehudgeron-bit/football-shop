// Abstraction layer — swap Tranzila for any provider by changing the implementation

export interface PaymentInitiateParams {
  orderId: string;
  amount: number;        // in ILS, e.g. 449.00
  currency: string;      // "ILS"
  customerEmail: string;
  customerName: string;
  description: string;
  notifyUrl: string;     // webhook callback
  successUrl: string;    // redirect after success
  failUrl: string;       // redirect after failure
}

export interface PaymentInitiateResult {
  redirectUrl: string;   // URL to send the user to
  providerRef: string;   // provider's session/transaction reference
}

export interface WebhookPayload {
  raw: Record<string, string>; // raw POST body from provider
}

export interface WebhookVerificationResult {
  success: boolean;
  orderId: string;
  providerTransactionId: string;
  amount: number;
  failureReason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  verifyWebhook(payload: WebhookPayload): Promise<WebhookVerificationResult>;
}
