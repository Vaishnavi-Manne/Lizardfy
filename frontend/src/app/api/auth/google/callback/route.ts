import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, hashPassword, signToken, UserRole } from "@/lib/auth";
import {
  exchangeGoogleCode,
  getGoogleRedirectUri,
  getGoogleUserInfo,
} from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const googleError = url.searchParams.get("error");

  const loginRedirect = (errorParam: string) => {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", errorParam);
    const response = NextResponse.redirect(redirectUrl);
    // Clear state cookie
    response.cookies.delete("google_oauth_state");
    return response;
  };

  // User canceled or Google encountered an error
  if (googleError) {
    console.warn("Google OAuth callback returned error:", googleError);
    return loginRedirect(
      googleError === "access_denied" ? "google_cancelled" : "google_auth_failed"
    );
  }

  if (!code || !stateParam) {
    return loginRedirect("missing_code");
  }

  // 1. Verify CSRF state token
  let targetRedirect = "/dashboard";
  try {
    const cookieStore = await cookies();
    const storedStateToken = cookieStore.get("google_oauth_state")?.value;

    const decodedRaw = Buffer.from(stateParam, "base64url").toString("utf-8");
    const parsedState = JSON.parse(decodedRaw) as {
      token: string;
      redirect?: string;
      ts?: number;
    };

    if (!storedStateToken || storedStateToken !== parsedState.token) {
      console.error("OAuth state mismatch: cookie state does not match state parameter.");
      return loginRedirect("invalid_state");
    }

    // Expiry check (15 minutes)
    if (parsedState.ts && Date.now() - parsedState.ts > 15 * 60 * 1000) {
      return loginRedirect("state_expired");
    }

    if (parsedState.redirect && parsedState.redirect.startsWith("/")) {
      targetRedirect = parsedState.redirect;
    }
  } catch (err) {
    console.error("Error parsing OAuth state:", err);
    return loginRedirect("invalid_state");
  }

  // 2. Exchange authorization code for tokens
  let tokens: { access_token: string; id_token?: string };
  try {
    const redirectUri = getGoogleRedirectUri(request);
    tokens = await exchangeGoogleCode({ code, redirectUri });
  } catch (err) {
    console.error("Error during Google code exchange:", err);
    return loginRedirect("token_exchange_failed");
  }

  // 3. Fetch Google User Profile
  let profile;
  try {
    profile = await getGoogleUserInfo(tokens.access_token);
  } catch (err) {
    console.error("Error fetching Google user profile:", err);
    return loginRedirect("profile_fetch_failed");
  }

  if (!profile.email) {
    return loginRedirect("no_email_provided");
  }

  const normalizedEmail = profile.email.toLowerCase().trim();
  const userName = profile.name?.trim() || normalizedEmail.split("@")[0];
  const userAvatar = profile.picture || null;
  const googleId = profile.sub;

  // 4. Create or update user in database
  let userId: string = "";
  let userRole: UserRole = "CUSTOMER";

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { googleId: googleId },
        ],
      },
    });

    if (existingUser) {
      userId = existingUser.id;
      userRole = existingUser.role as UserRole;

      // Update user details if not yet linked
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: existingUser.googleId || googleId,
          avatar: existingUser.avatar || userAvatar,
          name: existingUser.name || userName,
        },
      });
    } else {
      // Create new customer account with random fallback password hash
      const randomPassword = crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: userName,
          role: "CUSTOMER",
          googleId,
          avatar: userAvatar,
          passwordHash,
        },
      });

      userId = newUser.id;
      userRole = "CUSTOMER";
    }
  } catch (dbError) {
    console.warn("Prisma user lookup/create failed, using fallback session:", dbError);
    // Fallback ID if database is temporarily offline in local development
    userId = `google_${googleId.slice(0, 16)}`;
    userRole = "CUSTOMER";
  }

  // 5. Generate session JWT token
  const token = await signToken({
    userId,
    email: normalizedEmail,
    name: userName,
    role: userRole,
    avatar: userAvatar,
  });

  // If redirect wasn't specified and user is ADMIN, default to admin dashboard
  if (targetRedirect === "/dashboard" && userRole === "ADMIN") {
    targetRedirect = "/dashboard/admin";
  }

  // 6. Set session cookie and redirect to destination
  const response = NextResponse.redirect(new URL(targetRedirect, request.url));

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Clear temporary OAuth state cookie
  response.cookies.delete("google_oauth_state");

  return response;
}
