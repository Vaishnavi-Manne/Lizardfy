"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, User } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard" className="text-link back-link">
            <ArrowLeft size={14} /> Back to overview
          </Link>
          <span className="eyebrow">Personal Preferences</span>
          <h1>Account & Security</h1>
        </div>
      </div>

      {loading ? (
        <div className="panel-loading">Loading account settings...</div>
      ) : (
        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-head">
              <User size={18} />
              <h2>Profile Details</h2>
            </div>
            <div className="settings-fields">
              <div className="setting-item">
                <label>Display Name</label>
                <strong>{user?.name}</strong>
              </div>
              <div className="setting-item">
                <label>Email Address</label>
                <strong>{user?.email}</strong>
              </div>
              <div className="setting-item">
                <label>Account Role</label>
                <span className="role-tag">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-head">
              <ShieldCheck size={18} />
              <h2>Security & Session</h2>
            </div>
            <div className="settings-fields">
              <div className="setting-item">
                <label>Authentication Method</label>
                <span>HTTP-Only Encrypted JWT Cookie</span>
              </div>
              <div className="setting-item">
                <label>Password Status</label>
                <span className="verified-text">
                  <Check size={14} /> Bcrypt Hash Protected
                </span>
              </div>
              <div className="setting-item">
                <label>Data Encryption</label>
                <span>PostgreSQL / SSL Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
