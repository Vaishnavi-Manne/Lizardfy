import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    if (session.role === "ADMIN") {
      const orders = await prisma.order.findMany({
        where: status && status !== "ALL" ? { status: status as any } : undefined,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    } else {
      const orders = await prisma.order.findMany({
        where: { userId: session.userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    }
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod = "UPI",
      items,
      totalAmount,
    } = body;

    if (!customerName || !customerEmail || !shippingAddress || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required order information." },
        { status: 400 },
      );
    }

    // Generate readable order number: LZD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LZD-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session ? session.userId : null,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "+91",
        shippingAddress,
        paymentMethod,
        paymentStatus: "PAID",
        totalAmount: Number(totalAmount),
        status: "CONFIRMED",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            details: item.details || "",
            price: Number(item.price),
            quantity: Number(item.quantity) || 1,
            image: item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Could not create order. Please verify database connection." },
      { status: 500 },
    );
  }
}
