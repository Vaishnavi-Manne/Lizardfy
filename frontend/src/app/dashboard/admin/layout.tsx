"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Flame,
  LogOut,
  PackageCheck,
  Shield,
  Store,
  UserCheck,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.user.role !== "ADMIN") {
            router.push("/dashboard?error=unauthorized");
            return;
          }
          setAdmin(data.user);
        } else {
          router.push("/login?redirect=/dashboard/admin");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Overview & Analytics", href: "/dashboard/admin", icon: BarChart3 },
    { label: "Fulfillment & Orders", href: "/dashboard/admin/orders", icon: PackageCheck },
    { label: "Candle Catalog", href: "/dashboard/admin/products", icon: Flame },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading admin-loading">
        <div className="loading-spinner admin-spinner" />
        <p>Verifying administrator privileges...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell admin-shell">
      <header className="dashboard-topbar admin-topbar">
        <div className="dashboard-brand-wrap">
          <Link href="/" className="wordmark">
            <span className="brand-mark admin-mark">
              L<span>.</span>
            </span>
            <span className="brand-name">lizardfy</span>
          </Link>
          <span className="dashboard-tag admin-tag">
            <Shield size={12} /> Studio Merchant Admin
          </span>
        </div>

        <div className="dashboard-top-actions">
          <Link href="/dashboard" className="topbar-store-link">
            <UserCheck size={15} /> Customer View
          </Link>

          <Link href="/" className="topbar-store-link">
            <Store size={15} /> Storefront
          </Link>

          <div className="user-badge admin-badge">
            <div className="user-avatar admin-avatar">{admin?.name?.charAt(0) || "A"}</div>
            <div className="user-details">
              <strong>{admin?.name}</strong>
              <small>Administrator</small>
            </div>
          </div>

          <button onClick={handleLogout} className="dashboard-logout-btn" title="Sign out">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar admin-sidebar">
          <div className="sidebar-profile-card admin-card">
            <div className="profile-initial admin-initial">
              <Shield size={20} />
            </div>
            <div>
              <h3>{admin?.name}</h3>
              <span>Merchant Admin</span>
            </div>
          </div>

          <nav className="dashboard-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "dashboard-nav-item active admin-active" : "dashboard-nav-item"}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-studio-cta admin-ops-box">
            <h4>Live Storefront Status</h4>
            <p>Order sync active. PostgreSQL database ready.</p>
          </div>
        </aside>

        <main className="dashboard-main-content admin-main-content">{children}</main>
      </div>
    </div>
  );
}
