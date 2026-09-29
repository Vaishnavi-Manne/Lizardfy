"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Mail, Sparkles, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign in. Please check your credentials.");
        setLoading(false);
        return;
      }

      const target = redirect || data.redirectTo || "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const fillDemo = (role: "admin" | "customer") => {
    if (role === "admin") {
      setEmail("admin@lizardfy.com");
      setPassword("Admin@123456");
    } else {
      setEmail("maya@example.com");
      setPassword("Customer@123456");
    }
    setError("");
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

      {error && <div className="auth-alert error">{error}</div>}

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

      <div className="demo-credentials-box">
        <span className="demo-title">
          <Sparkles size={14} /> Quick Demo Access
        </span>
        <div className="demo-buttons">
          <button
            type="button"
            onClick={() => fillDemo("customer")}
            className="demo-btn"
          >
            <UserCheck size={14} /> Fill Customer (Maya)
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="demo-btn admin-demo"
          >
            <Lock size={14} /> Fill Merchant Admin
          </button>
        </div>
      </div>

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
