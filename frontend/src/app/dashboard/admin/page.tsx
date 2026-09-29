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
      <div className="view-header">
        <div>
          <span className="eyebrow">Studio Executive Operations</span>
          <h1>Commerce Analytics & Control</h1>
        </div>
        <Link href="/dashboard/admin/orders" className="button button-dark">
          Manage all orders <ArrowRight size={15} />
        </Link>
      </div>

      <div className="dashboard-stats-grid admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap admin-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="stat-label">Gross Revenue</span>
            <strong className="stat-value">
              ₹{metrics.grossRevenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap admin-icon">
            <Package size={20} />
          </div>
          <div>
            <span className="stat-label">Total Orders</span>
            <strong className="stat-value">{metrics.totalOrders}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap admin-icon warning-icon">
            <Clock size={20} />
          </div>
          <div>
            <span className="stat-label">Pending Pours</span>
            <strong className="stat-value">{metrics.pendingOrdersCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap admin-icon">
            <Users size={20} />
          </div>
          <div>
            <span className="stat-label">Registered Customers</span>
            <strong className="stat-value">{metrics.totalCustomers}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section-panel admin-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Storefront Orders</h2>
            <p>Direct order feed from customer checkouts.</p>
          </div>
          <Link href="/dashboard/admin/orders" className="text-link">
            Open fulfillment queue <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="panel-loading">Loading studio metrics...</div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={32} />
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
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="table-order-num">{order.orderNumber}</span>
                      <small className="table-order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </small>
                    </td>
                    <td>
                      <div className="table-customer-cell">
                        <strong>{order.customerName}</strong>
                        <span>{order.customerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className="items-count-badge">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                      </span>
                    </td>
                    <td>
                      <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-quick-actions-bar">
        <div className="admin-action-card">
          <Flame size={24} />
          <div>
            <h3>Candle Catalog Manager</h3>
            <p>Add new scents, seasonal collections, or update vessel prices.</p>
          </div>
          <Link href="/dashboard/admin/products" className="button button-cream">
            Manage Catalog
          </Link>
        </div>

        <div className="admin-action-card">
          <CheckCircle2 size={24} />
          <div>
            <h3>Fulfillment & Dispatch</h3>
            <p>Filter orders by shipping status and mark poured batches as dispatched.</p>
          </div>
          <Link href="/dashboard/admin/orders" className="button button-dark">
            View Fulfillment Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
