import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALL_PRODUCTS } from "@/lib/products";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ products: products.length > 0 ? products : ALL_PRODUCTS });
  } catch (error) {
    console.error("Products error:", error);
    // Return standard fallback products if DB not yet migrated
    return NextResponse.json({
      products: ALL_PRODUCTS,
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
