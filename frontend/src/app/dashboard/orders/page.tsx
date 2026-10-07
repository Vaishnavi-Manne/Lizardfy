"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
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
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error("Orders load error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleReorder = (order: Order) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("lizardfy-cart") ?? "[]");
      const updatedCart = [...existingCart];

      order.items.forEach((item) => {
        const idx = updatedCart.findIndex((c: any) => c.name === item.name);
        if (idx >= 0) {
          updatedCart[idx].quantity += item.quantity;
        } else {
          updatedCart.push({
            id: item.id || `reorder-${Date.now()}`,
            name: item.name,
            details: item.details,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "/assets/candles1.png",
          });
        }
      });

      localStorage.setItem("lizardfy-cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));

      showToast({
        type: "success",
        title: "Added to Shopping Bag",
        description: `Successfully re-added ${order.items.length} candle items to your bag.`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Could not add items",
        description: "Please visit the shop page to select candles.",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      order.items.some(
        (i) =>
          i.name.toLowerCase().includes(q) || i.details.toLowerCase().includes(q),
      );

    const matchesStatus =
      statusFilter === "ALL" ||
      order.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard" className="text-link back-link">
            <ArrowLeft size={14} /> Back to studio overview
          </Link>
          <span className="eyebrow">Studio Purchase Ledger</span>
          <h1>My Candle Orders</h1>
        </div>
        <Link href="/#shop" className="button button-dark">
          Order New Pours
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="admin-controls-bar" style={{ marginTop: "16px", marginBottom: "24px" }}>
        <div className="search-field admin-search">
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by order #, fragrance notes, vessel..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter-tabs">
          {["ALL", "CONFIRMED", "SHIPPED", "DELIVERED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "filter-tab active" : "filter-tab"}
            >
              {status === "ALL" ? "All Orders" : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <p>Retrieving your order ledger...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingBag size={32} />
          </div>
          <h3>No matching orders found</h3>
          <p>Try clearing your search query or switching the status filter.</p>
          <Link href="/#shop" className="button button-dark">
            Browse Botanical Collection
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-card-top">
                <div>
                  <div className="order-num-pill">
                    <Package size={15} />
                    <strong>{order.orderNumber}</strong>
                  </div>
                  <span className="order-timestamp">
                    <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="order-card-right">
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>
                    <span className="status-indicator-dot" />
                    {order.status}
                  </span>
                  <strong className="order-total-amount">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {/* Carrier Logistics Tag */}
              <div className="order-tracking-strip">
                <Truck size={14} />
                <span>Express Courier: <strong>Blue Dart Air #BD-882194</strong></span>
                <span className="shipping-bubble-status">Handcrafted in Bengaluru Studio</span>
              </div>

              <div className="order-card-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-card-item">
                    <div className="order-item-left">
                      <div className="item-candle-thumb">
                        <img
                          src={item.image || "/assets/candles1.png"}
                          alt={item.name}
                        />
                      </div>
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.details}</p>
                      </div>
                    </div>
                    <div className="card-item-qty-price">
                      <span className="qty-tag">Qty: {item.quantity}</span>
                      <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="shipping-info">
                  <small>Delivery Address:</small>
                  <p>{order.shippingAddress}</p>
                </div>
                <div className="payment-info">
                  <small>Payment Method:</small>
                  <span>{order.paymentMethod || "UPI"} (Verified Payment)</span>
                </div>
                <div className="order-card-actions-row">
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(order)}
                    className="button button-sm button-outline"
                  >
                    <Printer size={13} /> View Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="button button-sm button-dark"
                  >
                    <RefreshCw size={13} /> Reorder Batch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedReceipt && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedReceipt(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card receipt-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="receipt-modal-header">
              <div className="receipt-brand-row">
                <img
                  src="/assets/app_logo_cutout.png"
                  alt="Lizardfy"
                  className="brand-logo"
                />
                <div>
                  <h3>Lizardfy Chandlery Studio</h3>
                  <small>Bengaluru, Karnataka · GSTIN: 29AABCL8421Q1Z0</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="icon-button"
                aria-label="Close receipt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="receipt-body">
              <div className="receipt-meta-grid">
                <div>
                  <label>Order Number</label>
                  <strong>{selectedReceipt.orderNumber}</strong>
                </div>
                <div>
                  <label>Date Placed</label>
                  <span>
                    {new Date(selectedReceipt.createdAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                <div>
                  <label>Payment Method</label>
                  <span>{selectedReceipt.paymentMethod || "UPI"} (Verified)</span>
                </div>
                <div>
                  <label>Status</label>
                  <span className="status-pill status-confirmed">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="receipt-address-box">
                <label>Shipping Destination</label>
                <p>{selectedReceipt.shippingAddress}</p>
              </div>

              <div className="receipt-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Vessel & Fragrance</th>
                      <th style={{ textAlign: "center" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Price</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <p>{item.details}</p>
                        </td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>₹{item.price}</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>Subtotal</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{selectedReceipt.totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>Eco-Friendly Honeycomb Packaging</td>
                      <td style={{ textAlign: "right", color: "#2e6d2b" }}>Complimentary</td>
                    </tr>
                    <tr className="receipt-total-row">
                      <td colSpan={3}>Grand Total (Incl. Taxes)</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{selectedReceipt.totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-actions receipt-actions">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="button button-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="button button-dark"
              >
                <Printer size={15} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
