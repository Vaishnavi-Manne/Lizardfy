import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentMode } from "@/lib/payments/config";
import {
  verifyRazorpaySignature,
  verifySandboxSignature,
} from "@/lib/payments/crypto";
import { getRazorpayPayment } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const mode = getPaymentMode();
    const isSandbox = mode === "sandbox";

    // Step 1: Cryptographic HMAC Signature Verification
    let isSignatureValid = false;
    if (isSandbox) {
      isSignatureValid = verifySandboxSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    } else {
      isSignatureValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    }

    if (!isSignatureValid) {
      console.warn(
        `[SECURITY ALERT] Invalid payment signature received for order "${razorpay_order_id}" in mode "${mode}".`
      );
      // Invariant: Leave order PENDING, reject request with HTTP 400
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature." },
        { status: 400 }
      );
    }

    // Step 2: Internal Order Lookup
    const internalOrder = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true },
    });

    if (!internalOrder) {
      return NextResponse.json(
        { error: "Order not found for the provided payment session." },
        { status: 404 }
      );
    }

    // Step 3: Check Expiration
    if (
      internalOrder.paymentExpiresAt &&
      new Date() > internalOrder.paymentExpiresAt &&
      internalOrder.paymentStatus !== "PAID"
    ) {
      await prisma.order.update({
        where: { id: internalOrder.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "CANCELLED",
        },
      });

      return NextResponse.json(
        {
          error:
            "Payment session has expired (10-minute limit exceeded). Please initiate checkout again.",
        },
        { status: 410 }
      );
    }

    // Step 4: Dual-Layer Server-Side Gateway Verification (Live / Test Modes)
    if (!isSandbox) {
      const payment = await getRazorpayPayment(razorpay_payment_id);

      // Validate payment matches internal order's Razorpay order ID
      if (payment.order_id !== internalOrder.razorpayOrderId) {
        console.warn(
          `[SECURITY ALERT] Payment order mismatch. Gateway order: ${payment.order_id}, Internal order: ${internalOrder.razorpayOrderId}`
        );
        return NextResponse.json(
          { error: "Payment verification failed: Order reference mismatch." },
          { status: 400 }
        );
      }

      // Validate exact amount in paise
      const expectedAmountInPaise = internalOrder.totalAmount * 100;
      if (payment.amount !== expectedAmountInPaise) {
        console.warn(
          `[SECURITY ALERT] Payment amount mismatch. Gateway: ${payment.amount}, Expected: ${expectedAmountInPaise}`
        );
        return NextResponse.json(
          { error: "Payment verification failed: Amount mismatch." },
          { status: 400 }
        );
      }

      // Validate currency
      if (payment.currency !== "INR") {
        console.warn(
          `[SECURITY ALERT] Payment currency mismatch: ${payment.currency}`
        );
        return NextResponse.json(
          { error: "Payment verification failed: Currency mismatch." },
          { status: 400 }
        );
      }

      // Validate strict captured status: ONLY "captured" is considered PAID
      if (payment.status !== "captured") {
        console.warn(
          `[PAYMENT PENDING] Payment ${razorpay_payment_id} status is "${payment.status}" (captured only required).`
        );
        return NextResponse.json(
          {
            error:
              payment.status === "authorized"
                ? "Payment is authorized but not yet captured by gateway. Please await capture."
                : `Payment has not been captured (Status: ${payment.status}).`,
          },
          { status: 400 }
        );
      }
    }

    // Step 5: Idempotent Database Transaction
    const verifiedOrder = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: internalOrder.id },
        include: { items: true },
      });

      if (!current) throw new Error("Order not found during transaction.");

      // If already paid (e.g. concurrent webhook or user retry), return idempotently
      if (current.paymentStatus === "PAID") {
        return current;
      }

      return await tx.order.update({
        where: { id: current.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentProvider: isSandbox ? "SANDBOX" : "RAZORPAY",
          paymentEnvironment: isSandbox
            ? "SANDBOX"
            : mode === "razorpay_live"
            ? "LIVE"
            : "TEST",
          paymentMethod: isSandbox
            ? "UPI (Sandbox Simulation)"
            : "UPI (Razorpay Verified)",
        },
        include: { items: true },
      });
    });

    return NextResponse.json({
      success: true,
      order: verifiedOrder,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Payment verification encountered an internal error.",
      },
      { status: 500 }
    );
  }
}
