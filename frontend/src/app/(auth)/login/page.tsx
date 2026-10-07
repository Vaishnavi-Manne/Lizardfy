"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import GoogleAuthButton from "../GoogleAuthButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const getParamErrorMessage = (code: string): string => {
    switch (code) {
      case "google_not_configured":
        return "Google OAuth credentials are not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in frontend/.env.";
      case "google_cancelled":
        return "Google sign-in was cancelled.";
      case "google_auth_failed":
        return "Google sign-in could not be completed. Please try again.";
      case "token_exchange_failed":
        return "Unable to verify credentials with Google. Please check your setup.";
      case "profile_fetch_failed":
        return "Could not retrieve your profile from Google.";
      case "invalid_state":
        return "Security token validation failed (state mismatch). Please try again.";
      case "state_expired":
        return "Google sign-in session expired. Please try again.";
      case "missing_code":
        return "Authorization code missing from Google response.";
      case "unauthorized":
        return "You need administrative privileges to view that area.";
      default:
        return code ? "Authentication error occurred. Please try again." : "";
    }
  };

  const displayError = formError || getParamErrorMessage(errorParam);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to sign in. Please check your credentials.");
        setLoading(false);
        return;
      }

      const target = redirect || data.redirectTo || "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <Link href="/" className="auth-back">
        <ArrowLeft size={15} /> Back to store
      </Link>

      <div className="auth-header">
        <div className="auth-brand">
          <span className="brand-mark">
            L<span>.</span>
          </span>
          <span className="brand-name">lizardfy</span>
        </div>
        <h1>
          Welcome back to <em>the studio.</em>
        </h1>
        <p>Sign in to view your orders, saved candles, and personal creations.</p>
      </div>

      {displayError && <div className="auth-alert error">{displayError}</div>}

      {errorParam === "google_not_configured" && (
        <div className="google-config-help">
          <strong>Configuring Google OAuth:</strong>
          <br />
          1. Create an OAuth 2.0 Client in Google Cloud Console.
          <br />
          2. Set redirect URI: <code>http://localhost:3000/api/auth/google/callback</code>
          <br />
          3. Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to <code>frontend/.env</code>.
        </div>
      )}

      {/* Google OAuth Continue Button */}
      <div style={{ marginTop: "16px" }}>
        <GoogleAuthButton redirect={redirect} label="Continue with Google" />
      </div>

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <label>
          <span>Email Address</span>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              type="email"
              required
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Password</span>
          <div className="input-wrap">
            <Lock size={16} />
            <input
              type="password"
              required
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <button type="submit" disabled={loading} className="button button-dark auth-submit">
          {loading ? "Signing in..." : "Sign in to account"} <ArrowRight size={16} />
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don&apos;t have an account yet?{" "}
          <Link href="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-card"><p>Loading studio sign in...</p></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
