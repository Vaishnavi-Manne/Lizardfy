"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  IndianRupee,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useToast } from "@/components/Toast";

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
    grossRevenue: 48950,
    totalOrders: 28,
    pendingOrdersCount: 6,
    totalCustomers: 22,
    totalProducts: 4,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState("30D");
  const [searchTable, setSearchTable] = useState("");
  const { showToast } = useToast();

  async function loadData() {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.recentOrders && data.recentOrders.length > 0) {
        setRecentOrders(data.recentOrders);
      } else {
        // Fallback realistic orders for demo
        setRecentOrders([
          {
            id: "ord-1",
            orderNumber: "LZD-8421",
            totalAmount: 1880,
            status: "CONFIRMED",
            customerName: "Maya Sharma",
            customerEmail: "maya@example.com",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            items: [
              { id: "i1", name: "Slow Morning", quantity: 1, price: 890 },
              { id: "i2", name: "Custom Ritual Pour", quantity: 1, price: 990 },
            ],
          },
          {
            id: "ord-2",
            orderNumber: "LZD-7910",
            totalAmount: 2670,
            status: "SHIPPED",
            customerName: "Rohan Varma",
            customerEmail: "rohan.v@example.com",
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
            items: [
              { id: "i3", name: "Fig & Fern", quantity: 2, price: 990 },
              { id: "i4", name: "Rose Hour", quantity: 1, price: 890 },
            ],
          },
          {
            id: "ord-3",
            orderNumber: "LZD-6842",
            totalAmount: 3270,
            status: "DELIVERED",
            customerName: "Ananya Iyer",
            customerEmail: "ananya.iyer@example.com",
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            items: [
              { id: "i5", name: "After Rain", quantity: 3, price: 1090 },
            ],
          },
          {
            id: "ord-4",
            orderNumber: "LZD-5931",
            totalAmount: 890,
            status: "PENDING",
            customerName: "Vikram Das",
            customerEmail: "vikram.das@example.com",
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            items: [
              { id: "i6", name: "Slow Morning", quantity: 1, price: 890 },
            ],
          },
        ]);
      }
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
    // Optimistic UI update
    setRecentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      showToast({
        type: "success",
        title: "Order Status Updated",
        description: `Order #${recentOrders.find((o) => o.id === orderId)?.orderNumber || orderId} transitioned to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = recentOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTable.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTable.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTable.toLowerCase()),
  );

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
          <div className="time-filter-pills">
            {["Today", "7D", "30D", "All"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeWindow(t)}
                className={`time-pill ${timeWindow === t ? "active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="button button-outline"
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Refresh
          </button>

          <Link href="/dashboard/admin/orders" className="button button-dark">
            Fulfillment Queue <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* 5-Card Analytics Grid */}
      <div className="dashboard-stats-grid admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
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
            <span className="stat-helper">Across all online checkouts</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap package-icon">
              <Package size={20} />
            </div>
            <span className="stat-badge">Orders</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Shipments</span>
            <strong className="stat-value">{metrics.totalOrders}</strong>
            <span className="stat-helper">
              {metrics.totalOrders - metrics.pendingOrdersCount} fulfilled & delivered
            </span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap clock-icon">
              <Clock size={20} />
            </div>
            <span className="stat-trend-badge attention">Needs Dispatch</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Studio Pour Queue</span>
            <strong className="stat-value">{metrics.pendingOrdersCount}</strong>
            <span className="stat-helper">Pending hand pour or packing</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap pin-icon">
              <Users size={20} />
            </div>
            <span className="stat-badge">Collectors</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Active Customers</span>
            <strong className="stat-value">{metrics.totalCustomers}</strong>
            <span className="stat-helper">Registered candle lovers</span>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap sparkles-icon">
              <Flame size={20} />
            </div>
            <span className="stat-badge gold">Catalog</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Active Formulas</span>
            <strong className="stat-value">{metrics.totalProducts}</strong>
            <span className="stat-helper">All recipes in stock</span>
          </div>
        </div>
      </div>

      {/* Low-Stock & Fulfillment Pulse Row */}
      <div className="admin-quick-actions-bar" style={{ marginTop: "0", marginBottom: "32px" }}>
        <div className="admin-action-card">
          <div className="action-icon-pill green">
            <CheckCircle2 size={24} />
          </div>
          <div className="action-card-text">
            <h3>Fulfillment Velocity (94.2%)</h3>
            <p>Average studio pour to doorstep dispatch is currently <strong>18 hours</strong> in Bengaluru metro area.</p>
          </div>
          <Link href="/dashboard/admin/orders" className="button button-sm button-outline">
            Review Orders
          </Link>
        </div>

        <div className="admin-action-card">
          <div className="action-icon-pill" style={{ background: "#faede9", color: "#ba4d36" }}>
            <AlertTriangle size={24} />
          </div>
          <div className="action-card-text">
            <h3>Inventory Radar: &apos;After Rain&apos; low</h3>
            <p>18 jars remaining. Consider pouring a fresh 50-vessel batch of petrichor & eucalyptus.</p>
          </div>
          <Link href="/dashboard/admin/products" className="button button-sm button-dark">
            Manage Catalog
          </Link>
        </div>
      </div>

      {/* Recent Orders Live Table Panel */}
      <section className="dashboard-section-panel admin-orders-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow-row">
              <span className="eyebrow">Real-Time Ledger</span>
              <span className="status-pill status-confirmed">
                <span className="status-indicator-dot" /> Live Webhooks
              </span>
            </div>
            <h2>Recent Storefront Checkouts</h2>
            <p>Click any status dropdown to immediately progress orders across fulfillment stages.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search table..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="admin-mini-search"
            />
            <Link href="/dashboard/admin/orders" className="view-all-link">
              <span>All Orders ({metrics.totalOrders})</span> <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="panel-loading">
            <div className="loading-spinner admin-spinner" />
            <p>Synchronizing studio transactions...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={32} />
            <h3>No orders found</h3>
            <p>Storefront is awaiting its next customer checkout.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order # & Placed</th>
                  <th>Customer</th>
                  <th>Candle Vessels</th>
                  <th>Order Total</th>
                  <th>Fulfillment Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="order-cell-id">
                        <strong className="table-order-num">{order.orderNumber}</strong>
                        <span className="table-order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="table-customer-cell">
                        <div className="customer-avatar-dot">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <strong>{order.customerName}</strong>
                          <span>{order.customerEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="items-count-badge">
                        {order.items.reduce((s, i) => s + (i.quantity || 1), 0)} candle
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </td>

                    <td>
                      <strong className="order-price-num">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <div className="status-select-wrap">
                        <select
                          className={`status-select status-color-${order.status.toLowerCase()}`}
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
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/dashboard/admin/orders`}
                        className="button button-sm button-outline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
