"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  IndianRupee,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface OrderItem {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/api/orders" : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Orders load error", err);
      showToast({
        type: "error",
        title: "Could not fetch orders",
        description: "Failed to retrieve the latest dispatch records.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      showToast({
        type: "success",
        title: `Order Updated: ${newStatus}`,
        description: `Order dispatch status has been updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Status update error", err);
      showToast({
        type: "error",
        title: "Status Update Failed",
        description: "Please check your network and retry.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case "PENDING":
        return "CONFIRMED";
      case "CONFIRMED":
        return "SHIPPED";
      case "SHIPPED":
        return "DELIVERED";
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    switch (currentStatus) {
      case "PENDING":
        return "Confirm Order";
      case "CONFIRMED":
        return "Mark Shipped";
      case "SHIPPED":
        return "Mark Delivered";
      default:
        return "Complete";
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    showToast({
      type: "info",
      title: "Copied to Clipboard",
      description: `${label} copied successfully.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Status",
      "Total Amount (INR)",
      "Shipping Address",
      "Items Count",
    ];

    const rows = sortedOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.status}"`,
      o.totalAmount,
      `"${(o.shippingAddress || "").replace(/"/g, '""')}"`,
      o.items.length,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lizardfy_fulfillment_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: "success",
      title: "Orders CSV Exported",
      description: `Exported ${sortedOrders.length} fulfillment records.`,
    });
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const shipped = orders.filter((o) => o.status === "SHIPPED").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  // Filtering & Sorting
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;

    return orders.filter((o) => {
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      const matchPhone = o.customerPhone && o.customerPhone.toLowerCase().includes(q);
      const matchAddress = o.shippingAddress && o.shippingAddress.toLowerCase().includes(q);
      const matchItems = o.items.some((item) =>
        item.name.toLowerCase().includes(q) || item.details.toLowerCase().includes(q),
      );
      return matchNum || matchName || matchEmail || matchPhone || matchAddress || matchItems;
    });
  }, [orders, search]);

  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    switch (sortBy) {
      case "oldest":
        return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "amount_desc":
        return list.sort((a, b) => b.totalAmount - a.totalAmount);
      case "amount_asc":
        return list.sort((a, b) => a.totalAmount - b.totalAmount);
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [filteredOrders, sortBy]);

  return (
    <div className="dashboard-view admin-view">
      {/* View Header */}
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <div>
          <Link
            href="/dashboard/admin"
            className="text-link back-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> Back to executive analytics
          </Link>
          <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
            Studio Fulfillment & Logistics
          </span>
          <h1>Order Management & Dispatch Queue</h1>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchOrders}
            className="button button-outline"
            title="Refresh order queue"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="button button-outline"
            disabled={sortedOrders.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="button button-dark"
          >
            <Printer size={14} /> Print Packing Slips
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-forest">
            <Package size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Active Orders</span>
            <strong className="admin-kpi-val">{stats.total}</strong>
            <span className="admin-kpi-sub">Total recorded in studio</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-amber">
            <Clock size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Needs Fulfillment</span>
            <strong className="admin-kpi-val">{stats.pending}</strong>
            <span className="admin-kpi-sub">Awaiting studio dispatch</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-blue">
            <Truck size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">In Transit</span>
            <strong className="admin-kpi-val">{stats.shipped}</strong>
            <span className="admin-kpi-sub">Dispatched with courier</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-green">
            <CheckCircle2 size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Delivered</span>
            <strong className="admin-kpi-val">{stats.delivered}</strong>
            <span className="admin-kpi-sub">Arrived safely at recipient</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="admin-controls-bar">
        <div className="admin-search-wrap">
          <Search size={16} style={{ color: "#778372" }} />
          <input
            value={search}
            placeholder="Search by order #, customer, formula, PIN, phone..."
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "#889483", cursor: "pointer", padding: "2px" }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="status-filter-tabs">
          {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (status) => {
              const count =
                status === "ALL"
                  ? orders.length
                  : orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? "filter-tab active" : "filter-tab"}
                >
                  {status} <span className="tab-count-bubble">{count}</span>
                </button>
              );
            },
          )}
        </div>

        {/* Sort Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted, #5e6b5a)" }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            style={{
              padding: "5px 10px",
              fontSize: "11.5px",
              borderRadius: "8px",
              border: "1px solid #dcdfd5",
              background: "#ffffff",
              color: "var(--ink, #1f2c1d)",
              fontWeight: 500,
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Orders List View */}
      {loading ? (
        <div className="panel-loading" style={{ minHeight: "260px" }}>
          <div className="loading-spinner admin-spinner" />
          <p>Retrieving studio fulfillment orders...</p>
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={32} />
          </div>
          <h3>No matching orders found</h3>
          <p>
            {search
              ? `No records found matching "${search}". Try clearing search keywords.`
              : `No orders currently found under status "${statusFilter}".`}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="button button-outline"
              style={{ marginTop: "12px" }}
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="admin-orders-list">
          {sortedOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const nextStatus = getNextStatus(order.status);
            const nextLabel = getNextStatusLabel(order.status);
            const isPending = order.status === "PENDING";
            const isShipped = order.status === "SHIPPED";
            const isDelivered = order.status === "DELIVERED";
            const isConfirmed = order.status === "CONFIRMED";

            return (
              <div key={order.id} className="admin-order-card">
                {/* Main Card Header */}
                <div className="admin-order-summary">
                  <div className="order-main-info">
                    <div className="order-avatar-chip">
                      {order.customerName.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="order-number-title">{order.orderNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(order.orderNumber, "Order #")}
                          style={{ background: "none", border: "none", color: "#8a9686", cursor: "pointer", padding: "1px" }}
                          title="Copy order number"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <span className="order-customer-sub">
                        <strong>{order.customerName}</strong> · {order.customerEmail}
                      </span>
                    </div>
                  </div>

                  {/* Timing & Item Count */}
                  <div className="order-timing-cell">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <small>
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} · {order.items.reduce((s, it) => s + it.quantity, 0)} vessels
                    </small>
                  </div>

                  {/* Price & Payment Badge */}
                  <div className="order-price-cell">
                    <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                    <span className="order-pay-pill">
                      {order.paymentMethod === "Cash on Delivery" ? "Cash on Delivery" : "UPI Verified"}
                    </span>
                  </div>

                  {/* Status Dropdown & Advance Button */}
                  <div className="order-status-actions-group">
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

                    {nextStatus && (
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                        className="quick-advance-btn"
                        title={`Advance order to ${nextStatus}`}
                      >
                        {updatingId === order.id ? (
                          "Updating..."
                        ) : (
                          <>
                            {nextLabel}
                            <Check size={12} />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      className="toggle-expand-btn"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      aria-label="Toggle details drawer"
                      title={isExpanded ? "Collapse drawer" : "Expand full details"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="admin-order-details-drawer">
                    {/* Stepper Progress Bar */}
                    <div className="order-step-progress">
                      <div className={`prog-step-node completed`}>
                        <div className="prog-step-dot">
                          <Check size={11} />
                        </div>
                        <span>1. Order Placed</span>
                      </div>
                      <div className={`prog-step-line ${isConfirmed || isShipped || isDelivered ? "done" : ""}`} />

                      <div className={`prog-step-node ${isConfirmed || isShipped || isDelivered ? "completed" : isPending ? "active" : ""}`}>
                        <div className="prog-step-dot">
                          {isConfirmed || isShipped || isDelivered ? <Check size={11} /> : "2"}
                        </div>
                        <span>2. Studio Confirmed</span>
                      </div>
                      <div className={`prog-step-line ${isShipped || isDelivered ? "done" : ""}`} />

                      <div className={`prog-step-node ${isShipped || isDelivered ? "completed" : isConfirmed ? "active" : ""}`}>
                        <div className="prog-step-dot">
                          {isDelivered ? <Check size={11} /> : <Truck size={10} />}
                        </div>
                        <span>3. Dispatched / In Transit</span>
                      </div>
                      <div className={`prog-step-line ${isDelivered ? "done" : ""}`} />

                      <div className={`prog-step-node ${isDelivered ? "completed" : isShipped ? "active" : ""}`}>
                        <div className="prog-step-dot">
                          {isDelivered ? <Check size={11} /> : "4"}
                        </div>
                        <span>4. Delivered</span>
                      </div>
                    </div>

                    {/* Column 1: Delivery Address & Customer Contact */}
                    <div>
                      <div className="drawer-subhead">
                        <MapPin size={16} style={{ color: "var(--gold-hover, #b4832f)" }} />
                        <h4>Shipping Destination & Recipient</h4>
                      </div>

                      <div className="address-box">
                        <p className="address-text">{order.shippingAddress || "No address provided."}</p>
                      </div>

                      <div className="customer-quick-contact">
                        <a
                          href={`mailto:${order.customerEmail}?subject=Regarding%20Lizardfy%20Order%20${order.orderNumber}`}
                          className="contact-pill-btn"
                        >
                          <Mail size={13} /> {order.customerEmail}
                        </a>
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} className="contact-pill-btn">
                            <Phone size={13} /> {order.customerPhone}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyText(order.shippingAddress, "Shipping address")}
                          className="contact-pill-btn"
                        >
                          <Copy size={13} /> Copy Address
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Items in Batch */}
                    <div>
                      <div className="drawer-subhead">
                        <Package size={16} style={{ color: "var(--gold-hover, #b4832f)" }} />
                        <h4>Hand-Poured Formulas in Batch ({order.items.length})</h4>
                      </div>

                      <div className="drawer-items-list">
                        {order.items.map((item) => (
                          <div key={item.id} className="drawer-item-card">
                            <div className="drawer-item-title-col">
                              <strong>{item.name}</strong>
                              <p>{item.details}</p>
                            </div>
                            <div className="drawer-item-price-col">
                              <span className="item-qty-tag">Qty: {item.quantity}</span>
                              <strong className="item-subtotal-val">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Single Order Action Strip */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="button button-outline"
                          style={{ padding: "6px 12px", fontSize: "11px" }}
                        >
                          <Printer size={12} /> Slip #{order.orderNumber}
                        </button>
                        {order.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, "CANCELLED")}
                            className="button button-outline"
                            style={{ padding: "6px 12px", fontSize: "11px", color: "#c53030", borderColor: "#feb2b2" }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
