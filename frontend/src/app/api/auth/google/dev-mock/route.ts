import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, hashPassword, signToken } from "@/lib/auth";

export async function GET(request: Request) {
  // Only permit mock login in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Dev mock not available in production." }, { status: 403 });
  }

  const url = new URL(request.url);
  const redirectParam = url.searchParams.get("redirect") || "/dashboard";
  const safeRedirect =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";

  const mockGoogleId = "109876543210987654321";
  const mockEmail = "google.test.user@lizardfy.com";
  const mockName = "Google Studio Guest";
  const mockAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

  let userId = "dev-google-user-id";
  const role = "CUSTOMER" as const;

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: mockEmail }, { googleId: mockGoogleId }],
      },
    });

    if (existing) {
      userId = existing.id;
    } else {
      const passwordHash = await hashPassword(crypto.randomUUID());
      const created = await prisma.user.create({
        data: {
          email: mockEmail,
          name: mockName,
          role: "CUSTOMER",
          googleId: mockGoogleId,
          avatar: mockAvatar,
          passwordHash,
        },
      });
      userId = created.id;
    }
  } catch (err) {
    console.warn("Dev mock: DB operation failed, continuing with fallback mock session:", err);
  }

  const token = await signToken({
    userId,
    email: mockEmail,
    name: mockName,
    role,
    avatar: mockAvatar,
  });

  const response = NextResponse.redirect(new URL(safeRedirect, request.url));
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
