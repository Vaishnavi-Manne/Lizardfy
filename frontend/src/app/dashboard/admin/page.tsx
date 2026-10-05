"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

interface Metrics {
  grossRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  totalCustomers: number;
  totalProducts: number;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    grossRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.recentOrders) setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error("Failed to load admin metrics", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRecentOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      }
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-view admin-view">
      <div className="view-header admin-header-wrap">
        <div>
          <div className="admin-status-strip">
            <span className="live-pulse-dot" />
            <span className="live-tag">Studio Executive Live Feed</span>
          </div>
          <h1>Commerce Analytics & Control</h1>
          <p className="admin-header-subtitle">
            Real-time storefront checkout activity, automated fulfillment queues, and inventory sync.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link href="/dashboard/admin/orders" className="button button-dark">
            Fulfillment Queue <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="dashboard-stats-grid admin-stats-grid">
        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap admin-icon gold-accent">
              <IndianRupee size={20} />
            </div>
            <span className="stat-trend-badge positive">
              <TrendingUp size={11} /> +18.4%
            </span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Gross Revenue</span>
            <strong className="stat-value">
              ₹{metrics.grossRevenue.toLocaleString("en-IN")}
            </strong>
            <span className="stat-helper">Pre-paid UPI & card payments</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap admin-icon">
              <Package size={20} />
            </div>
            <span className="stat-badge">Total</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Store Orders</span>
            <strong className="stat-value">{metrics.totalOrders}</strong>
            <span className="stat-helper">All-time lifetime orders</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap admin-icon warning-icon">
              <Clock size={20} />
            </div>
            {metrics.pendingOrdersCount > 0 ? (
              <span className="stat-trend-badge attention">Action needed</span>
            ) : (
              <span className="stat-trend-badge positive">Queue clear</span>
            )}
          </div>
          <div className="stat-body">
            <span className="stat-label">Pending Pours</span>
            <strong className="stat-value">{metrics.pendingOrdersCount}</strong>
            <span className="stat-helper">Orders waiting for dispatch</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap admin-icon">
              <Users size={20} />
            </div>
            <span className="stat-badge">Members</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Registered Collectors</span>
            <strong className="stat-value">{metrics.totalCustomers}</strong>
            <span className="stat-helper">Active customer accounts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section-panel admin-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow-row">
              <span className="eyebrow">Real-Time Checkout Feed</span>
              <span className="live-status-pill">
                <span className="live-pulse-dot" /> Auto-sync
              </span>
            </div>
            <h2>Recent Storefront Orders</h2>
            <p>Direct orders streaming from customer bag completions.</p>
          </div>
          <Link href="/dashboard/admin/orders" className="view-all-link">
            <span>Open fulfillment queue</span> <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="panel-loading">
            <div className="loading-spinner" />
            <p>Loading studio metrics...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingBag size={34} />
            </div>
            <h3>No orders received yet</h3>
            <p>Orders will stream in as customers check out on the storefront.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Vessels</th>
                  <th>Total Amount</th>
                  <th>Current Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className={updatingId === order.id ? "row-updating" : ""}>
                    <td>
                      <div className="order-cell-id">
                        <span className="table-order-num">{order.orderNumber}</span>
                        <small className="table-order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="table-customer-cell">
                        <div className="customer-avatar-dot">
                          {order.customerName ? order.customerName.charAt(0) : "C"}
                        </div>
                        <div>
                          <strong>{order.customerName}</strong>
                          <span>{order.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="items-count-badge">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} candles
                      </span>
                    </td>
                    <td>
                      <strong className="order-price-num">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${order.status.toLowerCase()}`}>
                        <span className="status-indicator-dot" />
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="status-select-wrap">
                        <select
                          className="status-select"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {updatingId === order.id && <span className="updating-spinner" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operational Fast Links */}
      <div className="admin-quick-actions-bar">
        <div className="admin-action-card">
          <div className="action-icon-pill">
            <Flame size={22} />
          </div>
          <div className="action-card-text">
            <h3>Candle Catalog Manager</h3>
            <p>Update pricing, adjust wax vessel stock, and introduce limited seasonal scents.</p>
          </div>
          <Link href="/dashboard/admin/products" className="button button-cream button-sm">
            Catalog Manager <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-action-card">
          <div className="action-icon-pill green">
            <CheckCircle2 size={22} />
          </div>
          <div className="action-card-text">
            <h3>Fulfillment & Dispatch Queue</h3>
            <p>Batch dispatch poured orders, manage delivery addresses, and mark shipments complete.</p>
          </div>
          <Link href="/dashboard/admin/orders" className="button button-dark button-sm">
            Fulfillment Queue <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
