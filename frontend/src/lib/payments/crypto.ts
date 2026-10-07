import crypto from "node:crypto";
import { getRazorpayServerConfig, getSandboxSecret } from "./config";

/**
 * Safely compares two strings in constant time to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Computes standard Razorpay HMAC-SHA256 signature for checkout verification:
 * HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function calculateRazorpayHmac(
  orderId: string,
  paymentId: string,
  secret: string
): string {
  if (!secret) {
    throw new Error("Cannot compute HMAC: Secret is missing or empty.");
  }
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/**
 * Verifies standard client-submitted Razorpay signature.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayServerConfig();
  const expectedSignature = calculateRazorpayHmac(
    params.orderId,
    params.paymentId,
    keySecret
  );
  return safeCompare(params.signature, expectedSignature);
}

/**
 * Verifies Razorpay Webhook signature against raw request body:
 * HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string;
}): boolean {
  const { webhookSecret } = getRazorpayServerConfig();
  if (!webhookSecret) {
    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured. Webhook verification rejected."
    );
  }
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(params.rawBody)
    .digest("hex");

  return safeCompare(params.signature, expectedSignature);
}

/**
 * Generates an authoritative sandbox HMAC signature using SANDBOX_PAYMENT_SECRET.
 */
export function generateSandboxSignature(
  orderId: string,
  paymentId: string
): string {
  const sandboxSecret = getSandboxSecret();
  return crypto
    .createHmac("sha256", sandboxSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/**
 * Verifies sandbox signature using server-side SANDBOX_PAYMENT_SECRET.
 */
export function verifySandboxSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expectedSignature = generateSandboxSignature(
    params.orderId,
    params.paymentId
  );
  return safeCompare(params.signature, expectedSignature);
}
