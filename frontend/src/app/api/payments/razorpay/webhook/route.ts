import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // Verify webhook cryptographic signature against RAZORPAY_WEBHOOK_SECRET
    let isValid = false;
    try {
      isValid = verifyRazorpayWebhookSignature({
        rawBody,
        signature,
      });
    } catch (err: any) {
      console.error("[WEBHOOK ERROR] Signature check threw error:", err.message);
      return NextResponse.json(
        { error: "Webhook configuration error: " + err.message },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn("[SECURITY ALERT] Invalid Razorpay webhook signature.");
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount;
      const currency = paymentEntity?.currency || "INR";
      const status = paymentEntity?.status;

      if (!rzpOrderId) {
        return NextResponse.json(
          { error: "Missing order_id in webhook payload." },
          { status: 400 }
        );
      }

      const internalOrder = await prisma.order.findUnique({
        where: { razorpayOrderId: rzpOrderId },
      });

      if (!internalOrder) {
        console.warn(`[WEBHOOK] Order not found for Razorpay order: ${rzpOrderId}`);
        return NextResponse.json(
          { error: "Internal order not found for this gateway order." },
          { status: 404 }
        );
      }

      // Validate exact amount
      const expectedPaise = internalOrder.totalAmount * 100;
      if (amount && amount !== expectedPaise) {
        console.warn(
          `[WEBHOOK ALERT] Webhook amount mismatch for order ${internalOrder.orderNumber}. Received: ${amount}, Expected: ${expectedPaise}`
        );
        return NextResponse.json(
          { error: "Amount mismatch detected in webhook event." },
          { status: 400 }
        );
      }

      // Validate currency
      if (currency !== "INR") {
        console.warn(
          `[WEBHOOK ALERT] Currency mismatch in webhook: ${currency}`
        );
        return NextResponse.json(
          { error: "Currency mismatch detected in webhook event." },
          { status: 400 }
        );
      }

      // Validate status: ONLY captured is marked as PAID
      if (status && status !== "captured") {
        console.warn(
          `[WEBHOOK] Non-captured status "${status}" for payment ${paymentId}. Order left unchanged.`
        );
        return NextResponse.json({
          received: true,
          message: `Payment status is ${status}; not captured. No transition to PAID.`,
        });
      }

      // Idempotent reconciliation
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: internalOrder.id },
        });

        if (!order || order.paymentStatus === "PAID") {
          return; // Already reconciled or verified
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            razorpayPaymentId: paymentId || order.razorpayPaymentId,
            paymentProvider: "RAZORPAY",
            paymentMethod: "UPI (Razorpay Verified)",
          },
        });
      });

      return NextResponse.json({ received: true, reconciled: true });
    }

    // Handle payment.failed
    if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpOrderId) {
        await prisma.order.updateMany({
          where: {
            razorpayOrderId: rzpOrderId,
            paymentStatus: { not: "PAID" },
          },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }

      return NextResponse.json({ received: true, status: "payment_failed" });
    }

    return NextResponse.json({ received: true, unhandledEvent: event });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal webhook processing failed." },
      { status: 500 }
    );
  }
}
