import { getRazorpayServerConfig } from "./config";

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string;
  method: string;
  captured: boolean;
  email?: string;
  contact?: string;
  error_code?: string | null;
  error_description?: string | null;
}

function getBasicAuthHeader(): string {
  const { keyId, keySecret } = getRazorpayServerConfig();
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Creates an official order on Razorpay servers.
 */
export async function createRazorpayOrder(params: {
  amount: number; // amount in paise (1 INR = 100 paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const authHeader = getBasicAuthHeader();

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt,
      payment_capture: 1, // Automatically capture successful UPI payments
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const json = JSON.parse(errorBody);
      parsedMessage = json?.error?.description || json?.message || errorBody;
    } catch {}
    throw new Error(
      `Razorpay order creation failed (HTTP ${response.status}): ${parsedMessage}`
    );
  }

  return (await response.json()) as RazorpayOrderResponse;
}

/**
 * Retrieves payment details directly from Razorpay servers.
 * Used for dual-layer server-side payment verification.
 */
export async function getRazorpayPayment(
  paymentId: string
): Promise<RazorpayPaymentResponse> {
  if (!paymentId || paymentId.trim() === "") {
    throw new Error("Razorpay payment ID is required for verification.");
  }

  const authHeader = getBasicAuthHeader();

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const json = JSON.parse(errorBody);
      parsedMessage = json?.error?.description || json?.message || errorBody;
    } catch {}
    throw new Error(
      `Razorpay payment lookup failed (HTTP ${response.status}): ${parsedMessage}`
    );
  }

  return (await response.json()) as RazorpayPaymentResponse;
}
