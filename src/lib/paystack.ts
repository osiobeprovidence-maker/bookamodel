const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || "";
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export interface PaystackVerification {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata: Record<string, unknown>;
    created_at: string;
  };
}

export function generateReference(): string {
  return `BM_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function initializePayment(config: PaystackConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const handler = (window as any).PaystackPop?.setup({
      key: config.key || PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: config.amount,
      currency: config.currency || "NGN",
      ref: config.reference || generateReference(),
      metadata: {
        custom_fields: config.metadata
          ? Object.entries(config.metadata).map(([name, value]) => ({
              display_name: name,
              variable_name: name,
              value,
            }))
          : [],
      },
      callback: (response: { reference: string }) => {
        config.onSuccess?.(response.reference);
        resolve(response.reference);
      },
      onClose: () => {
        config.onClose?.();
        reject(new Error("Payment cancelled"));
      },
    });
    handler.openIframe();
  });
}

export async function verifyPayment(reference: string): Promise<PaystackVerification> {
  const response = await fetch(`/api/paystack/verify/${reference}`);
  if (!response.ok) throw new Error("Failed to verify payment");
  return response.json();
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export function formatNairaAmount(amountInKobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountInKobo / 100);
}

export function toKobo(amountInNaira: number): number {
  return amountInNaira * 100;
}
