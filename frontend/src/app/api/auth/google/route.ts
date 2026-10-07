import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
} from "@/lib/google";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const redirectParam = url.searchParams.get("redirect") || "/dashboard";

    // Sanitize redirect URL to prevent open redirect vulnerabilities
    const safeRedirect =
      redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/dashboard";

    if (!isGoogleOAuthConfigured()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "google_not_configured");
      return NextResponse.redirect(loginUrl);
    }

    const redirectUri = getGoogleRedirectUri(request);
    const stateToken = crypto.randomUUID();

    const statePayload = JSON.stringify({
      token: stateToken,
      redirect: safeRedirect,
      ts: Date.now(),
    });

    const encodedState = Buffer.from(statePayload, "utf-8").toString("base64url");
    const googleAuthUrl = buildGoogleAuthUrl({
      redirectUri,
      state: encodedState,
    });

    const response = NextResponse.redirect(googleAuthUrl);

    // Save state in a secure, HTTP-only cookie for CSRF verification
    response.cookies.set({
      name: "google_oauth_state",
      value: stateToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "google_init_failed");
    return NextResponse.redirect(loginUrl);
  }
}
