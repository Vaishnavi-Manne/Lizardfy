"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Search,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function fetchOrders() {
    try {
      const url = statusFilter === "ALL" ? "/api/orders" : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("Orders load error", err);
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
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      showToast({
        type: "success",
        title: "Fulfillment Status Updated",
        description: `Order successfully updated to ${newStatus}.`,
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

  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Status",
      "Total (INR)",
      "Shipping Address",
      "Items Count",
    ];

    const rows = filteredOrders.map((o) => [
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
    link.setAttribute("download", `lizardfy_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: "success",
      title: "Orders CSV Exported",
      description: `Exported ${filteredOrders.length} records to CSV.`,
    });
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dashboard-view admin-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard/admin" className="text-link back-link">
            <ArrowLeft size={14} /> Back to executive analytics
          </Link>
          <span className="eyebrow">Studio Fulfillment Operations</span>
          <h1>Order Management & Dispatch</h1>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="button button-outline"
            disabled={filteredOrders.length === 0}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="button button-dark"
          >
            <Printer size={14} /> Print Slips
          </button>
        </div>
      </div>

      <div className="admin-controls-bar">
        <div className="search-field admin-search">
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by order #, customer, email, address..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="loading-spinner admin-spinner" />
          <p>Retrieving studio fulfillment orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={32} />
          </div>
          <h3>No matching orders found</h3>
          <p>Try clearing your search query or switching status filters.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="admin-order-card">
                <div className="admin-order-summary">
                  <div className="order-main-info">
                    <span className="order-number">{order.orderNumber}</span>
                    <div>
                      <strong>{order.customerName}</strong>
                      <span className="customer-sub">
                        {order.customerEmail} · {order.customerPhone}
                      </span>
                    </div>
                  </div>

                  <div className="order-timing">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <small>{order.items.length} vessel formulas</small>
                  </div>

                  <div className="order-pricing">
                    <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                    <span className="payment-tag">{order.paymentMethod || "UPI"}</span>
                  </div>

                  <div className="order-status-action">
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

                  <button
                    className="toggle-expand-btn"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="admin-order-details-drawer">
                    <div className="details-col">
                      <div className="drawer-subhead">
                        <MapPin size={15} />
                        <h4>Shipping Destination</h4>
                      </div>
                      <p className="address-text">{order.shippingAddress}</p>

                      <div className="customer-quick-contact">
                        <a
                          href={`mailto:${order.customerEmail}?subject=Your%20Lizardfy%20Order%20${order.orderNumber}`}
                          className="contact-pill-btn"
                        >
                          <Mail size={13} /> Email Customer
                        </a>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="contact-pill-btn"
                        >
                          <Phone size={13} /> Call Recipient
                        </a>
                      </div>
                    </div>

                    <div className="details-col">
                      <div className="drawer-subhead">
                        <Package size={15} />
                        <h4>Candle Items in Batch</h4>
                      </div>
                      <div className="items-list">
                        {order.items.map((item) => (
                          <div key={item.id} className="drawer-item">
                            <div>
                              <strong>{item.name}</strong>
                              <p>{item.details}</p>
                            </div>
                            <div className="drawer-item-price">
                              <span>Qty: {item.quantity}</span>
                              <strong>
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </strong>
                            </div>
                          </div>
                        ))}
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
