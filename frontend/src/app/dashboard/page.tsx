"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Compass,
  Flame,
  Gift,
  HelpCircle,
  MapPin,
  Package,
  Printer,
  RefreshCw,
  ShoppingBag,
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
  createdAt: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items: OrderItem[];
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("Artisan Friend");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, meRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/auth/me"),
        ]);
        const ordersData = await ordersRes.json();
        const meData = await meRes.json();

        if (ordersData.orders) setOrders(ordersData.orders);
        if (meData.user?.name) setUserName(meData.user.name);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const recentOrder = orders[0];
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED",
  );

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
        title: "Candles added to your bag",
        description: `Added ${order.items.length} candle pour${order.items.length > 1 ? "s" : ""} to your shopping cart.`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Could not add to cart",
        description: "Please visit the storefront to order candles directly.",
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="dashboard-view">
      {/* Welcome Banner */}
      <section className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-badge-row">
            <span className="live-status-pill">
              <span className="live-pulse-dot" /> Bengaluru Studio Pours Active
            </span>
            <span className="member-tier-pill">
              <Sparkles size={13} /> Artisan Tier Collector
            </span>
          </div>

          <h1>
            {getGreeting()}, <em>{userName.split(" ")[0]}.</em>
          </h1>
          <p>
            Welcome back to your fragrance sanctuary. Track your slow-cured botanical candle
            batches, manage deliveries, or craft bespoke vessels in our interactive studio.
          </p>

          <div className="tier-progress-wrap">
            <div className="tier-progress-header">
              <span>Studio Collector Milestone</span>
              <strong>780 / 1,000 Points</strong>
            </div>
            <div className="tier-progress-bar">
              <div className="tier-progress-fill" style={{ width: "78%" }} />
            </div>
            <small className="tier-helper-text">
              220 points until your next complimentary hand-cast ceramic match striker.
            </small>
          </div>

          <div className="hero-actions-row">
            <Link href="/#shop" className="button button-dark hero-btn">
              Explore Botanical Drops <ArrowRight size={15} />
            </Link>
            <Link href="/#customize" className="button button-cream hero-btn">
              <Flame size={15} /> Blend Bespoke Scent
            </Link>
          </div>
        </div>

        <div className="hero-banner-decor" aria-hidden="true">
          <div className="candle-ambient-glow" />
          <div className="decor-icon-emblem">
            <Flame size={34} />
          </div>
        </div>
      </section>

      {/* Metrics & Highlights Grid */}
      <section className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap package-icon">
              <Package size={20} />
            </div>
            <span className="stat-badge">Lifetime</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Shipments</span>
            <strong className="stat-value">{orders.length}</strong>
            <span className="stat-helper">
              {orders.length === 1 ? "1 artisan pour" : `${orders.length} studio shipments`}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap clock-icon">
              <Clock size={20} />
            </div>
            <span className="stat-badge live">Curing</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Active Studio Pours</span>
            <strong className="stat-value">{pendingOrders.length}</strong>
            <span className="stat-helper">
              {pendingOrders.length > 0 ? "Currently hand-curing" : "All orders dispatched"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap pin-icon">
              <MapPin size={20} />
            </div>
            <span className="stat-badge">Default</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Saved Delivery</span>
            <strong className="stat-value" style={{ fontSize: "20px", lineHeight: "1.2" }}>
              Indiranagar
            </strong>
            <span className="stat-helper">Bengaluru · Verified PIN</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap sparkles-icon">
              <Sparkles size={20} />
            </div>
            <span className="stat-badge gold">Scent Persona</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Preferred Notes</span>
            <strong className="stat-value" style={{ fontSize: "18px", lineHeight: "1.2" }}>
              Amber & Fig
            </strong>
            <span className="stat-helper">100% natural botanical soy</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Hub */}
      <section className="dashboard-quick-hub">
        <div className="quick-hub-header">
          <span className="eyebrow">Studio Shortcuts</span>
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-hub-grid">
          <Link href="/#customize" className="quick-hub-card">
            <div className="hub-card-icon gold">
              <Flame size={20} />
            </div>
            <div className="hub-card-text">
              <strong>Custom Candle Studio</strong>
              <span>Pick ceramic vessel, blend top & heart notes</span>
            </div>
            <ArrowRight size={16} className="hub-arrow" />
          </Link>

          <Link href="/dashboard/orders" className="quick-hub-card">
            <div className="hub-card-icon green">
              <RefreshCw size={20} />
            </div>
            <div className="hub-card-text">
              <strong>Re-order Past Favorites</strong>
              <span>Instantly re-pour your previously loved scents</span>
            </div>
            <ArrowRight size={16} className="hub-arrow" />
          </Link>

          <Link href="/dashboard/addresses" className="quick-hub-card">
            <div className="hub-card-icon coral">
              <MapPin size={20} />
            </div>
            <div className="hub-card-text">
              <strong>Address Preferences</strong>
              <span>Update default delivery destination & PIN</span>
            </div>
            <ArrowRight size={16} className="hub-arrow" />
          </Link>

          <a
            href="https://wa.me/919876543210?text=Hi%20Lizardfy%20Studio%2C%20I%20have%20a%20question%20about%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-hub-card"
          >
            <div className="hub-card-icon forest">
              <HelpCircle size={20} />
            </div>
            <div className="hub-card-text">
              <strong>Studio Concierge</strong>
              <span>Message our chandlers for custom blends & advice</span>
            </div>
            <ArrowRight size={16} className="hub-arrow" />
          </a>
        </div>
      </section>

      {/* Latest Order Live Tracker */}
      <section className="dashboard-section-panel latest-order-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow-row">
              <span className="eyebrow">Real-Time Fulfillment</span>
              {recentOrder && (
                <span className={`status-pill status-${recentOrder.status.toLowerCase()}`}>
                  <span className="status-indicator-dot" />
                  {recentOrder.status}
                </span>
              )}
            </div>
            <h2>Latest Studio Order</h2>
            <p>Live progress of your slow-burning, botanical candle shipment.</p>
          </div>

          <Link href="/dashboard/orders" className="view-all-link">
            <span>View all orders ({orders.length})</span> <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="panel-loading">
            <div className="loading-spinner" />
            <p>Retrieving your candle pours...</p>
          </div>
        ) : recentOrder ? (
          <div className="latest-order-card">
            <div className="order-meta-header">
              <div className="order-identity">
                <span className="order-number">{recentOrder.orderNumber}</span>
                <span className="order-date">
                  Placed on{" "}
                  {new Date(recentOrder.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="order-header-right">
                <span className="carrier-badge">
                  <Truck size={13} /> Blue Dart Air Express #BD-882194
                </span>
                <span className="order-total-badge">
                  ₹{recentOrder.totalAmount.toLocaleString("en-IN")} Total
                </span>
              </div>
            </div>

            {/* Stepped Timeline */}
            <div className="order-timeline-wrap">
              <div className="order-timeline">
                <div
                  className={`step-node ${
                    ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(
                      recentOrder.status,
                    )
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">
                    <span>01</span>
                  </div>
                  <label>Order Received</label>
                  <small>Payment verified</small>
                </div>

                <div
                  className={`step-connector ${
                    ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(recentOrder.status)
                      ? "active"
                      : ""
                  }`}
                />

                <div
                  className={`step-node ${
                    recentOrder.status === "CONFIRMED"
                      ? "in-progress"
                      : ["SHIPPED", "DELIVERED"].includes(recentOrder.status)
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">
                    <span>02</span>
                  </div>
                  <label>In the Studio</label>
                  <small>Hand pouring wax</small>
                </div>

                <div
                  className={`step-connector ${
                    ["SHIPPED", "DELIVERED"].includes(recentOrder.status) ? "active" : ""
                  }`}
                />

                <div
                  className={`step-node ${
                    recentOrder.status === "SHIPPED"
                      ? "in-progress"
                      : recentOrder.status === "DELIVERED"
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">
                    <span>03</span>
                  </div>
                  <label>Cured & Dispatched</label>
                  <small>Blue Dart Air assigned</small>
                </div>

                <div
                  className={`step-connector ${
                    recentOrder.status === "DELIVERED" ? "active" : ""
                  }`}
                />

                <div
                  className={`step-node ${
                    recentOrder.status === "DELIVERED" ? "completed" : ""
                  }`}
                >
                  <div className="step-circle">
                    <span>04</span>
                  </div>
                  <label>Delivered</label>
                  <small>Enjoy your light</small>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="order-items-preview">
              <span className="items-preview-title">Vessels in this shipment:</span>
              <div className="items-list-grid">
                {recentOrder.items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-info-wrap">
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
                    <div className="item-price-qty">
                      <span className="qty-tag">Qty: {item.quantity}</span>
                      <strong className="item-amount">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-card-footer-strip">
              <div className="shipping-dispatch-note">
                <Truck size={15} />
                <span>
                  Carefully wrapped in recycled corrugated sleeves & biodegradable honeycomb wrap.
                </span>
              </div>
              <div className="order-action-links">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(true)}
                  className="button button-sm button-outline"
                >
                  <Compass size={14} /> Track Transit
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(recentOrder)}
                  className="button button-sm button-outline"
                >
                  <Printer size={14} /> View Receipt
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(recentOrder)}
                  className="button button-sm button-dark"
                >
                  <RefreshCw size={13} /> 1-Click Reorder
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingBag size={34} />
            </div>
            <h3>No orders placed yet</h3>
            <p>Ready to bring calm, slow-burning light and custom scents into your home?</p>
            <Link href="/#shop" className="button button-dark">
              Explore Our Candle Collection <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* Bespoke Studio Promos */}
      <section className="dashboard-promo-grid">
        <div className="promo-card custom-candle-promo">
          <div className="promo-inner">
            <span className="promo-tag">
              <Sparkles size={12} /> Interactive 3D Studio
            </span>
            <h3>Design your bespoke scent ritual</h3>
            <p>
              Select your hand-thrown ceramic vessel, layer top and heart botanical notes,
              and emboss your personal sentiment onto an artisan linen label.
            </p>
            <Link href="/#customize" className="button button-gold-glow">
              Launch Candle Customizer <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="promo-card gathering-promo">
          <div className="promo-inner">
            <span className="promo-tag sage">
              <Gift size={12} /> Gatherings & Celebrations
            </span>
            <h3>Custom batches for weddings & gifting</h3>
            <p>
              Planning an intimate wedding, anniversary, or curated corporate gift? Let our
              Bengaluru studio pour bespoke batches with personalized fragrances.
            </p>
            <Link href="/#bulk" className="button button-dark">
              Inquire for Events <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Invoice / Receipt Modal */}
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
                  <small>Bengaluru, KA · GSTIN: 29AABCL8421Q1Z0</small>
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
                  <label>Fulfillment Status</label>
                  <span className="status-pill status-confirmed">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="receipt-address-box">
                <label>Shipping Destination</label>
                <p>
                  {selectedReceipt.shippingAddress ||
                    "Flat 402, Lotus Bloom Apartments, Indiranagar, Bengaluru, KA - 560038"}
                </p>
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
                      <td colSpan={3}>Eco-Friendly Packaging & Shipping</td>
                      <td style={{ textAlign: "right", color: "#2e6d2b" }}>Complimentary</td>
                    </tr>
                    <tr className="receipt-total-row">
                      <td colSpan={3}>Grand Total (Incl. GST)</td>
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
                onClick={handlePrintReceipt}
                className="button button-dark"
              >
                <Printer size={15} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOpen && recentOrder && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setTrackingModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card tracking-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Package Transit Log</h2>
                <p>Tracking: <strong>BD-882194</strong> · Blue Dart Air</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="icon-button"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="transit-log-list">
              <div className="transit-step done">
                <span className="transit-dot" />
                <div className="transit-content">
                  <strong>Studio Order Hand-Cured & Packed</strong>
                  <p>Hand-poured at Lizardfy Indiranagar Chandlery. Safe honeycomb wrapped.</p>
                  <small>Today, 10:15 AM</small>
                </div>
              </div>

              <div className="transit-step done">
                <span className="transit-dot" />
                <div className="transit-content">
                  <strong>Handed over to Blue Dart Logistics</strong>
                  <p>Dispatched from Bengaluru Central Hub for local express transit.</p>
                  <small>Today, 2:40 PM</small>
                </div>
              </div>

              <div className="transit-step current">
                <span className="transit-dot pulse" />
                <div className="transit-content">
                  <strong>In Transit to Local Delivery Facility</strong>
                  <p>Expected arrival at your address tomorrow before 6:00 PM.</p>
                  <small>In Progress</small>
                </div>
              </div>

              <div className="transit-step pending">
                <span className="transit-dot" />
                <div className="transit-content">
                  <strong>Out for Delivery & Handover</strong>
                  <p>Recipient will be contacted via SMS & WhatsApp upon arrival.</p>
                  <small>Pending</small>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="button button-dark"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
