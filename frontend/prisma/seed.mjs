import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@lizardfy.com" },
    update: {},
    create: {
      email: "admin@lizardfy.com",
      name: "Studio Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Upsert Demo Customer User
  const customer = await prisma.user.upsert({
    where: { email: "maya@example.com" },
    update: {},
    create: {
      email: "maya@example.com",
      name: "Maya Sharma",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // Default address for customer
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: "Maya Sharma",
      phone: "+91 98765 43210",
      street: "Flat 402, Lotus Bloom Apartments, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560038",
      isDefault: true,
    },
  });

  // Seed Products
  const products = [
    {
      id: "slow-morning",
      slug: "slow-morning",
      name: "Slow Morning",
      scent: "Oat milk · honey · cedar",
      price: 890,
      category: "For unwinding",
      image: "/assets/candles1.png",
      color: "#d8a46d",
      badge: "Bestseller",
      stock: 45,
    },
    {
      id: "fig-and-fern",
      slug: "fig-and-fern",
      name: "Fig & Fern",
      scent: "Green fig · moss · vetiver",
      price: 990,
      category: "For the home",
      image: "/assets/candles2.png",
      color: "#66755a",
      badge: "New",
      stock: 30,
    },
    {
      id: "rose-hour",
      slug: "rose-hour",
      name: "Rose Hour",
      scent: "Damask rose · pink pepper",
      price: 890,
      category: "For gifting",
      image: "/assets/candles3.png",
      color: "#bc7169",
      stock: 25,
    },
    {
      id: "after-rain",
      slug: "after-rain",
      name: "After Rain",
      scent: "Petrichor · eucalyptus · oak",
      price: 1090,
      category: "For unwinding",
      image: "/assets/candles4.png",
      color: "#799493",
      badge: "Small batch",
      stock: 18,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // Seed Sample Customer Order
  const existingOrder = await prisma.order.findFirst({
    where: { userId: customer.id },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        orderNumber: "LZD-8421",
        userId: customer.id,
        totalAmount: 1880,
        status: "CONFIRMED",
        paymentMethod: "UPI",
        paymentStatus: "PAID",
        customerName: "Maya Sharma",
        customerEmail: "maya@example.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: "Flat 402, Lotus Bloom Apartments, Indiranagar, Bengaluru, Karnataka - 560038",
        items: {
          create: [
            {
              productId: "slow-morning",
              name: "Slow Morning",
              details: "Oat milk · honey · cedar · 200g",
              price: 890,
              quantity: 1,
              image: "/assets/candles1.png",
            },
            {
              name: "Your custom candle",
              details: "200g Amber glass · Rosewater & fig · “quiet evenings” · Dried flowers",
              price: 990,
              quantity: 1,
            },
          ],
        },
      },
    });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
