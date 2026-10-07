import { NextResponse } from "next/server";
import { getPaymentMode } from "@/lib/payments/config";
import { generateSandboxSignature } from "@/lib/payments/crypto";

export async function POST(request: Request) {
  try {
    const mode = getPaymentMode();
    if (mode !== "sandbox") {
      return NextResponse.json(
        { error: "Sandbox signature generator is disabled outside of sandbox mode." },
        { status: 403 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required parameters for sandbox signature generation." },
        { status: 400 }
      );
    }

    const signature = generateSandboxSignature(
      razorpay_order_id,
      razorpay_payment_id
    );

    return NextResponse.json({
      success: true,
      razorpay_signature: signature,
    });
  } catch (error: any) {
    console.error("Sandbox signing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate sandbox signature." },
      { status: 500 }
    );
  }
}
