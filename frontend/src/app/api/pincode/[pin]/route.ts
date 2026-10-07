import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const resolved = await params;
  const pin = resolved.pin?.trim();

  if (!pin || !/^\d{6}$/.test(pin) || pin.startsWith("0")) {
    return NextResponse.json(
      {
        valid: false,
        error: "Postal PIN code must be exactly 6 digits and cannot begin with 0.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      headers: { "User-Agent": "Lizardfy-Atelier-Checkout/1.0" },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`Postal service responded with HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0 || data[0].Status !== "Success") {
      return NextResponse.json({
        valid: false,
        error: `PIN code ${pin} does not exist in India Post records. Please enter a valid postal code.`,
      });
    }

    const postOffices = data[0].PostOffice || [];
    if (postOffices.length === 0) {
      return NextResponse.json({
        valid: false,
        error: `No post office found for PIN code ${pin}.`,
      });
    }

    const state = postOffices[0]?.State || "";
    const district = postOffices[0]?.District || "";
    const block = postOffices[0]?.Block || "";
    const circle = postOffices[0]?.Circle || "";
    const postOfficeNames = Array.from(
      new Set(postOffices.map((po: any) => po.Name).filter(Boolean))
    );

    return NextResponse.json({
      valid: true,
      pin,
      state,
      district,
      block,
      circle,
      postOfficeCount: postOffices.length,
      postOffices: postOfficeNames.slice(0, 8),
    });
  } catch (error) {
    console.warn("India Post verification fallback:", error);
    return NextResponse.json({
      valid: true,
      pin,
      fallback: true,
      message: "External India Post verification unavailable; verified via prefix structure.",
    });
  }
}
