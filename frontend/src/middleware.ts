import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "lizardfy_default_jwt_secret_key_needs_replacement_in_env_file_987",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("lizardfy_session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // If accessing admin subroutes, ensure ADMIN role
    if (pathname.startsWith("/dashboard/admin") && payload.role !== "ADMIN") {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(dashboardUrl);
    }

    // Pass authenticated user info in headers if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", (payload.userId as string) ?? "");
    requestHeaders.set("x-user-role", (payload.role as string) ?? "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("lizardfy_session");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
