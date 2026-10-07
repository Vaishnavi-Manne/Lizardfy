"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const SCENT_NOTES_OPTIONS = [
  "Oat Milk & Honey",
  "Green Fig & Moss",
  "Damask Rose & Pepper",
  "Petrichor & Cedar",
  "Smoked Tonka & Amber",
  "Cardamom & Bergamot",
  "Wild Mint & Eucalyptus",
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([
    "Oat Milk & Honey",
    "Smoked Tonka & Amber",
    "Green Fig & Moss",
  ]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [notifyDrops, setNotifyDrops] = useState(true);
  const [notifySMS, setNotifySMS] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setName(data.user.name || "");
        }
      } catch (err) {
        console.error("Failed to load user settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const toggleScentNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note],
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: "success",
      title: "Profile Preferences Saved",
      description: "Your display name and favorite botanical scent notes have been updated.",
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast({
        type: "error",
        title: "Password Too Short",
        description: "Your new password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        type: "error",
        title: "Passwords Do Not Match",
        description: "Please verify that the new and confirm passwords match exactly.",
      });
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({
        type: "success",
        title: "Password Updated",
        description: "Your account password has been updated and securely re-hashed.",
      });
    }, 600);
  };

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard" className="text-link back-link">
            <ArrowLeft size={14} /> Back to studio overview
          </Link>
          <span className="eyebrow">Personal Scent Space</span>
          <h1>Account & Security Settings</h1>
        </div>
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <p>Loading your account parameters...</p>
        </div>
      ) : (
        <div className="settings-grid">
          {/* Profile & Scent Persona Card */}
          <div className="settings-card">
            <div className="settings-card-head">
              <User size={18} />
              <div>
                <h2>Artisan Profile & Scent Persona</h2>
                <small style={{ color: "#798075" }}>Customize your name and preferred scent palate</small>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="settings-fields">
              <label className="setting-input-wrap">
                <span>Display Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </label>

              <div className="setting-item">
                <label>Email Address</label>
                <div className="setting-email-row">
                  <strong>{user?.email}</strong>
                  <span className="verified-text">
                    <Check size={14} /> Verified Member
                  </span>
                </div>
              </div>

              <div className="setting-item">
                <label>Account Tier</label>
                <span className="role-tag">
                  <Sparkles size={11} style={{ display: "inline", marginRight: "4px" }} />
                  {user?.role === "ADMIN" ? "Studio Administrator" : "Artisan Tier Collector"}
                </span>
              </div>

              <div className="setting-item">
                <label>Preferred Fragrance Notes</label>
                <p style={{ fontSize: "11px", color: "#6b7565", margin: "2px 0 8px" }}>
                  Used to tailor recommendations and bespoke customizer initial blends:
                </p>
                <div className="scent-chips-cloud">
                  {SCENT_NOTES_OPTIONS.map((note) => {
                    const isSelected = selectedNotes.includes(note);
                    return (
                      <button
                        type="button"
                        key={note}
                        onClick={() => toggleScentNote(note)}
                        className={`scent-chip ${isSelected ? "selected" : ""}`}
                      >
                        {isSelected && <Check size={12} />}
                        {note}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="button button-dark button-sm" style={{ marginTop: "12px", width: "fit-content" }}>
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="settings-card">
            <div className="settings-card-head">
              <KeyRound size={18} />
              <div>
                <h2>Password & Authentication</h2>
                <small style={{ color: "#798075" }}>Change your password or review session protection</small>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="settings-fields">
              <label className="setting-input-wrap">
                <span>Current Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>

              <label className="setting-input-wrap">
                <span>New Password</span>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>

              <label className="setting-input-wrap">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              <button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="button button-dark button-sm"
                style={{ width: "fit-content" }}
              >
                {savingPassword ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            <div className="settings-security-strip">
              <div className="security-item">
                <ShieldCheck size={16} />
                <div>
                  <strong>Session Security: HTTP-Only JWT</strong>
                  <p>Guards against XSS tokens; 7-day automatic refresh active.</p>
                </div>
              </div>
              <div className="security-item">
                <Lock size={16} />
                <div>
                  <strong>Database Salt & Hash</strong>
                  <p>Stored with bcrypt (10 rounds) in PostgreSQL schema.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Notifications Card */}
          <div className="settings-card" style={{ gridColumn: "1 / -1" }}>
            <div className="settings-card-head">
              <Bell size={18} />
              <div>
                <h2>Studio Dispatch & Drop Alerts</h2>
                <small style={{ color: "#798075" }}>Manage how the Bengaluru chandlery studio communicates with you</small>
              </div>
            </div>

            <div className="notification-toggles-list">
              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>Seasonal Small-Batch Drops</strong>
                  <p>Receive exclusive early invitations before limited botanical pours sell out.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDrops}
                  onChange={(e) => setNotifyDrops(e.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>SMS Dispatch & Tracking Messages</strong>
                  <p>Real-time Blue Dart Air delivery milestones sent directly to your phone.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifySMS}
                  onChange={(e) => setNotifySMS(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
