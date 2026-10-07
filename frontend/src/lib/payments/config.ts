export type PaymentMode = "sandbox" | "razorpay_test" | "razorpay_live";

export function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE || "sandbox";
  if (mode !== "sandbox" && mode !== "razorpay_test" && mode !== "razorpay_live") {
    throw new Error(
      `Invalid PAYMENT_MODE "${mode}". Must be "sandbox", "razorpay_test", or "razorpay_live".`
    );
  }
  return mode as PaymentMode;
}

export function getSandboxSecret(): string {
  const secret = process.env.SANDBOX_PAYMENT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "SANDBOX_PAYMENT_SECRET is not configured in environment variables. Fail-closed: Cannot process sandbox payments."
    );
  }
  return secret.trim();
}

export function getRazorpayServerConfig(): {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
} {
  const mode = getPaymentMode();
  if (mode === "sandbox") {
    throw new Error("Razorpay credentials are not required in sandbox mode.");
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.trim() === "" || keySecret.trim() === "") {
    throw new Error(
      `Payment gateway credentials missing for mode "${mode}". Fail-closed: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.`
    );
  }

  return {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim(),
  };
}

export function getClientPaymentConfig(): {
  mode: PaymentMode;
  keyId?: string;
} {
  const mode = getPaymentMode();
  if (mode === "sandbox") {
    return { mode: "sandbox" };
  }

  const { keyId } = getRazorpayServerConfig();
  return {
    mode,
    keyId,
  };
}
