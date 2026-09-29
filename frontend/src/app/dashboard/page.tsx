"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Package, ShoppingBag, Sparkles } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const recentOrder = orders[0];

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Your Personal Studio</span>
          <h1>Welcome back to your candle journey.</h1>
        </div>
        <Link href="/#shop" className="button button-dark">
          Explore catalog <ArrowRight size={15} />
        </Link>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Package size={20} />
          </div>
          <div>
            <span className="stat-label">Orders Placed</span>
            <strong className="stat-value">{orders.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Clock size={20} />
          </div>
          <div>
            <span className="stat-label">Active Pours</span>
            <strong className="stat-value">
              {orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <MapPin size={20} />
          </div>
          <div>
            <span className="stat-label">Saved Addresses</span>
            <strong className="stat-value">Active</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="stat-label">Member Tier</span>
            <strong className="stat-value">Artisan</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section-panel">
        <div className="panel-header">
          <div>
            <h2>Latest Order</h2>
            <p>Real-time updates on your handcrafted candle shipment.</p>
          </div>
          <Link href="/dashboard/orders" className="text-link">
            View all orders <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="panel-loading">Loading order status...</div>
        ) : recentOrder ? (
          <div className="latest-order-card">
            <div className="order-meta-header">
              <div>
                <span className="order-number">{recentOrder.orderNumber}</span>
                <span className="order-date">
                  Placed on {new Date(recentOrder.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className={`status-pill status-${recentOrder.status.toLowerCase()}`}>
                {recentOrder.status}
              </span>
            </div>

            <div className="order-timeline">
              <div className={`step-dot ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(recentOrder.status) ? "active" : ""}`}>
                <span>01</span>
                <label>Order Received</label>
              </div>
              <div className={`step-line ${["SHIPPED", "DELIVERED"].includes(recentOrder.status) ? "active" : ""}`} />
              <div className={`step-dot ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(recentOrder.status) ? "active" : ""}`}>
                <span>02</span>
                <label>In the Studio</label>
              </div>
              <div className={`step-line ${recentOrder.status === "DELIVERED" ? "active" : ""}`} />
              <div className={`step-dot ${recentOrder.status === "SHIPPED" || recentOrder.status === "DELIVERED" ? "active" : ""}`}>
                <span>03</span>
                <label>Hand Poured & Shipped</label>
              </div>
              <div className={`step-line ${recentOrder.status === "DELIVERED" ? "active" : ""}`} />
              <div className={`step-dot ${recentOrder.status === "DELIVERED" ? "active" : ""}`}>
                <span>04</span>
                <label>Delivered</label>
              </div>
            </div>

            <div className="order-items-preview">
              {recentOrder.items.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.details}</p>
                  </div>
                  <div className="item-price-qty">
                    <span>Qty: {item.quantity}</span>
                    <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-row">
              <span>Total Paid</span>
              <strong>₹{recentOrder.totalAmount.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={32} />
            <h3>No orders placed yet</h3>
            <p>Ready to bring a little slow-burning light into your space?</p>
            <Link href="/#shop" className="button button-dark">
              Shop Candles
            </Link>
          </div>
        )}
      </div>

      <div className="dashboard-promo-grid">
        <div className="promo-card custom-candle-promo">
          <span className="eyebrow">Interactive Studio</span>
          <h3>Design your custom candle</h3>
          <p>Choose your vessel, hand-pick fragrance notes, and emboss a personal sentiment on the label.</p>
          <Link href="/#customize" className="button button-cream">
            Open Studio <ArrowRight size={15} />
          </Link>
        </div>

        <div className="promo-card gathering-promo">
          <span className="eyebrow">Gatherings & Events</span>
          <h3>Personalized wedding & team gifts</h3>
          <p>Planning something special? Let our studio prepare custom batches for your celebration.</p>
          <Link href="/#bulk" className="button button-dark">
            Plan a gathering <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
