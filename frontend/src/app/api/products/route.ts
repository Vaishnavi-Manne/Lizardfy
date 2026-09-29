import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products error:", error);
    // Return standard fallback products if DB not yet migrated
    return NextResponse.json({
      products: [
        {
          id: "slow-morning",
          name: "Slow Morning",
          scent: "Oat milk · honey · cedar",
          price: 890,
          category: "For unwinding",
          image: "/assets/candles1.png",
          color: "#d8a46d",
          badge: "Bestseller",
        },
        {
          id: "fig-and-fern",
          name: "Fig & Fern",
          scent: "Green fig · moss · vetiver",
          price: 990,
          category: "For the home",
          image: "/assets/candles2.png",
          color: "#66755a",
          badge: "New",
        },
        {
          id: "rose-hour",
          name: "Rose Hour",
          scent: "Damask rose · pink pepper",
          price: 890,
          category: "For gifting",
          image: "/assets/candles3.png",
          color: "#bc7169",
        },
        {
          id: "after-rain",
          name: "After Rain",
          scent: "Petrichor · eucalyptus · oak",
          price: 1090,
          category: "For unwinding",
          image: "/assets/candles4.png",
          color: "#799493",
          badge: "Small batch",
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, scent, price, category, image, color, badge, stock } = body;

    if (!name || !scent || !price || !category) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        scent,
        price: Number(price),
        category,
        image: image || "/assets/candles1.png",
        color: color || "#d8a46d",
        badge: badge || null,
        stock: Number(stock) || 30,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
