import { TranzilaProvider } from "./tranzila.provider";
import type { PaymentProvider } from "./provider.interface";

// Singleton — instantiated once, reused across requests
let _provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!_provider) {
    _provider = new TranzilaProvider();
  }
  return _provider;
}

export type { PaymentProvider, PaymentInitiateParams, WebhookVerificationResult } from "./provider.interface";
