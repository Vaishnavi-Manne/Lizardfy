"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Mail, User } from "lucide-react";
import GoogleAuthButton from "../GoogleAuthButton";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const getParamErrorMessage = (code: string): string => {
    switch (code) {
      case "google_not_configured":
        return "Google OAuth credentials are not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in frontend/.env.";
      case "google_cancelled":
        return "Google sign-up was cancelled.";
      case "google_auth_failed":
        return "Google sign-up could not be completed. Please try again.";
      case "token_exchange_failed":
        return "Unable to verify credentials with Google. Please check your setup.";
      case "profile_fetch_failed":
        return "Could not retrieve your profile from Google.";
      case "invalid_state":
        return "Security token validation failed. Please try again.";
      case "state_expired":
        return "Session expired. Please try again.";
      default:
        return code ? "An authentication error occurred. Please try again." : "";
    }
  };

  const displayError = formError || getParamErrorMessage(errorParam);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      const target = redirect || "/dashboard";
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
          Create your <em>account.</em>
        </h1>
        <p>Keep track of your hand-poured orders and custom candle creations.</p>
      </div>

      {displayError && <div className="auth-alert error">{displayError}</div>}

      {/* Google OAuth Quick Sign Up */}
      <div style={{ marginTop: "16px" }}>
        <GoogleAuthButton redirect={redirect} label="Sign up with Google" />
      </div>

      <div className="auth-divider">
        <span>or register with email</span>
      </div>

      <form onSubmit={handleRegister} className="auth-form">
        <label>
          <span>Your Name</span>
          <div className="input-wrap">
            <User size={16} />
            <input
              type="text"
              required
              value={name}
              placeholder="Maya Sharma"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </label>

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
              placeholder="At least 6 characters"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Confirm Password</span>
          <div className="input-wrap">
            <Lock size={16} />
            <input
              type="password"
              required
              value={confirmPassword}
              placeholder="Confirm your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </label>

        <button type="submit" disabled={loading} className="button button-dark auth-submit">
          {loading ? "Creating account..." : "Create Account"} <ArrowRight size={16} />
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{" "}
          <Link href="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-card"><p>Loading registration...</p></div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
