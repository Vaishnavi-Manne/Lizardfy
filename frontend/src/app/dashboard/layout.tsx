"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LogOut,
  MapPin,
  Menu,
  Package,
  Settings,
  ShieldAlert,
  Sparkles,
  Store,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  avatar?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Compass },
    { label: "My Orders", href: "/dashboard/orders", icon: Package },
    { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
    { label: "Account", href: "/dashboard/settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Opening your studio dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {/* Top Navigation Bar */}
      <header className="dashboard-topbar">
        <div className="dashboard-brand-wrap">
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="wordmark">
            <img
              src="/assets/app_logo.jpg"
              alt="Lizardfy"
              className="brand-logo"
            />
            <span className="brand-name">lizardfy</span>
          </Link>
          <span className="dashboard-tag">Studio Member</span>
        </div>

        <div className="dashboard-top-actions">
          {user?.role === "ADMIN" && (
            <Link href="/dashboard/admin" className="admin-switch-pill">
              <ShieldAlert size={14} /> Admin Studio
            </Link>
          )}

          <Link href="/" className="topbar-store-link">
            <Store size={15} /> <span>Storefront</span>
          </Link>

          <div className="user-badge">
            <div className="user-avatar-wrap">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar-img" />
              ) : (
                <div className="user-avatar">{user?.name ? user.name.charAt(0) : "U"}</div>
              )}
              <span className="user-status-dot" title="Active session" />
            </div>
            <div className="user-details">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <button onClick={handleLogout} className="dashboard-logout-btn" title="Sign out">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="dashboard-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className={`dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-profile-card">
            <div className="user-avatar-wrap">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar-img"
                  style={{ width: "44px", height: "44px" }}
                />
              ) : (
                <div className="profile-initial">{user?.name?.charAt(0) || "L"}</div>
              )}
              <span className="user-status-dot" />
            </div>
            <div className="profile-meta">
              <h3>{user?.name}</h3>
              <span className="profile-role">
                {user?.role === "ADMIN" ? "Studio Administrator" : "Candle Enthusiast"}
              </span>
            </div>
          </div>

          <nav className="dashboard-nav">
            <span className="nav-group-title">Studio Menu</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "dashboard-nav-item active" : "dashboard-nav-item"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span>{item.label}</span>
                  {isActive && <span className="nav-active-pill" />}
                </Link>
              );
            })}

            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard/admin"
                className="dashboard-nav-item admin-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldAlert size={18} className="nav-icon" />
                <span>Switch to Admin</span>
              </Link>
            )}
          </nav>

          <div className="sidebar-studio-cta">
            <div className="studio-cta-glow" />
            <div className="studio-cta-icon">
              <Sparkles size={18} />
            </div>
            <h4>Need a bespoke scent?</h4>
            <p>Blend your own custom notes and custom foil-stamped label.</p>
            <Link href="/#customize" className="button button-gold-glow">
              Open Customizer
            </Link>
          </div>
        </aside>

        <main className="dashboard-main-content">{children}</main>
      </div>
    </div>
  );
}
