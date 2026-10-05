"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Flame,
  Gift,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

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
  items: OrderItem[];
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("Artisan Friend");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dashboard-view">
      {/* Welcome Banner */}
      <section className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-badge-row">
            <span className="live-status-pill">
              <span className="live-pulse-dot" /> Studio Pours Active
            </span>
            <span className="member-tier-pill">
              <Sparkles size={13} /> Artisan Tier Member
            </span>
          </div>

          <h1>
            {getGreeting()}, <em>{userName.split(" ")[0]}.</em>
          </h1>
          <p>
            Welcome to your slow-crafted fragrance space. Track your hand-poured batches,
            manage studio deliveries, and design custom bespoke vessels.
          </p>

          <div className="hero-actions-row">
            <Link href="/#shop" className="button button-dark hero-btn">
              Explore New Pours <ArrowRight size={15} />
            </Link>
            <Link href="/#customize" className="button button-cream hero-btn">
              <Flame size={15} /> Blend Custom Candle
            </Link>
          </div>
        </div>

        <div className="hero-banner-decor" aria-hidden="true">
          <div className="candle-ambient-glow" />
          <div className="decor-icon-emblem">
            <Flame size={32} />
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
            <span className="stat-label">Orders Placed</span>
            <strong className="stat-value">{orders.length}</strong>
            <span className="stat-helper">
              {orders.length === 1 ? "1 hand-poured order" : `${orders.length} total shipments`}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap clock-icon">
              <Clock size={20} />
            </div>
            <span className="stat-badge live">Live</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Active in Studio</span>
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
            <strong className="stat-value" style={{ fontSize: "18px", lineHeight: "1.3" }}>
              Indiranagar
            </strong>
            <span className="stat-helper">Bengaluru · Verified</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top-row">
            <div className="stat-icon-wrap sparkles-icon">
              <Sparkles size={20} />
            </div>
            <span className="stat-badge gold">VIP</span>
          </div>
          <div className="stat-body">
            <span className="stat-label">Rewards Tier</span>
            <strong className="stat-value">Artisan</strong>
            <span className="stat-helper">Complimentary custom matchboxes</span>
          </div>
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
            <span>View all orders</span> <ArrowRight size={15} />
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
                  <label>Hand Poured & Shipped</label>
                  <small>Tracking assigned</small>
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
                      <div className="item-vessel-dot" />
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
                <Link href="/dashboard/orders" className="button button-sm button-dark">
                  View Order Receipt
                </Link>
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
    </div>
  );
}
