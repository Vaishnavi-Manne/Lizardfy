import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentMode, getClientPaymentConfig } from "@/lib/payments/config";
import { calculateAuthoritativePricing } from "@/lib/payments/pricing";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
    } = body;

    if (
      !customerName ||
      !customerEmail ||
      !shippingAddress ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required delivery information or order items." },
        { status: 400 }
      );
    }

    // 1. Authoritative price calculation (ignoring any client-supplied totals)
    const { totalAmount, items: validatedItems } =
      calculateAuthoritativePricing(items);

    // 2. Set 10-minute validity for payment session
    const paymentExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Generate readable order number: LZD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LZD-${randomSuffix}`;

    const mode = getPaymentMode();

    if (mode === "sandbox") {
      // Sandbox Order Creation
      const sandboxOrderId = `order_sbx_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: session?.userId || null,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : "+91",
          shippingAddress: shippingAddress.trim(),
          paymentMethod: "UPI",
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          paymentProvider: "SANDBOX",
          paymentEnvironment: "SANDBOX",
          razorpayOrderId: sandboxOrderId,
          paymentExpiresAt,
          totalAmount,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              details: item.details,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
      });

      return NextResponse.json({
        success: true,
        mode: "sandbox",
        razorpayOrderId: sandboxOrderId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: totalAmount,
        currency: "INR",
        paymentExpiresAt: paymentExpiresAt.toISOString(),
      });
    }

    // Live or Test Razorpay Order Creation (Fail-closed if keys missing)
    const clientConfig = getClientPaymentConfig();
    const amountInPaise = totalAmount * 100;

    const rzpOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderNumber,
      notes: {
        orderNumber,
        customerEmail: customerEmail.trim(),
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.userId || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone ? customerPhone.trim() : "+91",
        shippingAddress: shippingAddress.trim(),
        paymentMethod: "UPI",
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        paymentProvider: "RAZORPAY",
        paymentEnvironment: mode === "razorpay_live" ? "LIVE" : "TEST",
        razorpayOrderId: rzpOrder.id,
        paymentExpiresAt,
        totalAmount,
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            details: item.details,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      mode,
      keyId: clientConfig.keyId,
      razorpayOrderId: rzpOrder.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      amountInPaise,
      currency: "INR",
      paymentExpiresAt: paymentExpiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Payment order creation error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Could not initialize payment order. Please check system configuration.",
      },
      { status: 500 }
    );
  }
}
