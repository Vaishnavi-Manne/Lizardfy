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
    console.error("Fetch orders error, using fallback demo dataset:", error);
    const demoOrders = [
      {
        id: "demo-ord-1",
        orderNumber: "LZD-8421",
        totalAmount: 1880,
        status: "CONFIRMED",
        customerName: session.name || "Maya Sharma",
        customerEmail: session.email || "maya@example.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: "Flat 402, Lotus Bloom Apartments, Indiranagar, Bengaluru, Karnataka - 560038",
        paymentMethod: "UPI",
        paymentStatus: "PAID",
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        items: [
          {
            id: "i1",
            productId: "slow-morning",
            name: "Slow Morning",
            details: "Oat milk · honey · cedar · 200g Hand-Poured Amber Glass",
            price: 890,
            quantity: 1,
            image: "/assets/candles1.png",
          },
          {
            id: "i2",
            name: "Your custom candle",
            details: "Smoked tonka + cardamom · 250g Ceramic vessel · 'quiet evenings'",
            price: 990,
            quantity: 1,
            image: "/assets/custom_candle_showcase.png",
          },
        ],
      },
      {
        id: "demo-ord-2",
        orderNumber: "LZD-7219",
        totalAmount: 990,
        status: "DELIVERED",
        customerName: session.name || "Maya Sharma",
        customerEmail: session.email || "maya@example.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: "Flat 402, Lotus Bloom Apartments, Indiranagar, Bengaluru, Karnataka - 560038",
        paymentMethod: "Card",
        paymentStatus: "PAID",
        createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
        items: [
          {
            id: "i3",
            productId: "fig-and-fern",
            name: "Fig & Fern",
            details: "Green fig · moss · vetiver · 200g Olive glass jar",
            price: 990,
            quantity: 1,
            image: "/assets/candles2.png",
          },
        ],
      },
    ];

    if (session.role === "ADMIN" && status && status !== "ALL") {
      return NextResponse.json({
        orders: demoOrders.filter((o) => o.status === status),
      });
    }

    return NextResponse.json({ orders: demoOrders });
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
