import { NextResponse } from "next/server";
import { getClientPaymentConfig } from "@/lib/payments/config";

export async function GET() {
  try {
    const config = getClientPaymentConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load payment configuration." },
      { status: 500 }
    );
  }
}
