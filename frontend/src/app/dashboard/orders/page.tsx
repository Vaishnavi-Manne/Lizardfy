"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";

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
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard" className="text-link back-link">
            <ArrowLeft size={14} /> Back to overview
          </Link>
          <span className="eyebrow">Purchase History</span>
          <h1>My Orders</h1>
        </div>
        <Link href="/#shop" className="button button-dark">
          Order more candles
        </Link>
      </div>

      {loading ? (
        <div className="panel-loading">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={32} />
          <h3>No orders found</h3>
          <p>You haven&apos;t placed any orders yet.</p>
          <Link href="/#shop" className="button button-dark">
            Browse our collection
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-card-top">
                <div>
                  <div className="order-num-pill">
                    <Package size={14} />
                    <strong>{order.orderNumber}</strong>
                  </div>
                  <span className="order-timestamp">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="order-card-right">
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <strong className="order-total-amount">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="order-card-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-card-item">
                    <div>
                      <h4>{item.name}</h4>
                      <p>{item.details}</p>
                    </div>
                    <div className="card-item-qty-price">
                      <span>Qty: {item.quantity}</span>
                      <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="shipping-info">
                  <small>Delivering to:</small>
                  <p>{order.shippingAddress}</p>
                </div>
                <div className="payment-info">
                  <small>Payment Method:</small>
                  <span>{order.paymentMethod} (Verified)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
