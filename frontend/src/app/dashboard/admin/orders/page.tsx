"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Package, Search } from "lucide-react";

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
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      }
    } catch (err) {
      console.error("Status update error", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-view admin-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard/admin" className="text-link back-link">
            <ArrowLeft size={14} /> Back to analytics
          </Link>
          <span className="eyebrow">Studio Fulfillment Desk</span>
          <h1>Order Management & Dispatch</h1>
        </div>
      </div>

      <div className="admin-controls-bar">
        <div className="search-field admin-search">
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by order #, customer, or email..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter-tabs">
          {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? "filter-tab active" : "filter-tab"}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {loading ? (
        <div className="panel-loading">Loading fulfillment orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Package size={32} />
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
                      <span className="customer-sub">{order.customerEmail} · {order.customerPhone}</span>
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
                    <small>{order.items.length} unique items</small>
                  </div>

                  <div className="order-pricing">
                    <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                    <span className="payment-tag">{order.paymentMethod}</span>
                  </div>

                  <div className="order-status-action">
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
                      <h4>Shipping Address</h4>
                      <p className="address-text">{order.shippingAddress}</p>
                    </div>

                    <div className="details-col">
                      <h4>Candle Items in Batch</h4>
                      <div className="items-list">
                        {order.items.map((item) => (
                          <div key={item.id} className="drawer-item">
                            <div>
                              <strong>{item.name}</strong>
                              <p>{item.details}</p>
                            </div>
                            <div className="drawer-item-price">
                              <span>Qty: {item.quantity}</span>
                              <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
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
