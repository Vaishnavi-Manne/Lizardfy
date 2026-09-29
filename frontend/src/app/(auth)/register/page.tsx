"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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

        {error && <div className="auth-alert error">{error}</div>}

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
    </div>
  );
}
