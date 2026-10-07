"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Smartphone,
  QrCode,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface UpiPaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  paymentExpiresAt: string;
  customerName: string;
  onSuccess: (order: any) => void;
  onClose: () => void;
}

export function UpiPaymentModal({
  isOpen,
  orderNumber,
  razorpayOrderId,
  amount,
  paymentExpiresAt,
  customerName,
  onSuccess,
  onClose,
}: UpiPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins default
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string>("gpay");
  const [status, setStatus] = useState<
    "idle" | "authorizing" | "verifying" | "success" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const virtualVpa = "lizardfy.atelier@okhdfcbank";

  // Countdown timer logic
  useEffect(() => {
    if (!isOpen || !paymentExpiresAt) return;

    const expiryTime = new Date(paymentExpiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(difference);

      if (difference <= 0) {
        setIsExpired(true);
        setStatus("failed");
        setErrorMessage("Payment session has expired. Please initiate a new order.");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentExpiresAt]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const copyVpa = () => {
    navigator.clipboard.writeText(virtualVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (isExpired) return;

    try {
      setStatus("authorizing");
      setErrorMessage(null);

      // Simulate network hop to UPI Switch
      await new Promise((res) => setTimeout(res, 600));

      const simulatedPaymentId = `pay_sbx_${Math.random()
        .toString(36)
        .substring(2, 12)}`;

      // Step 1: Request authoritative sandbox signature from server
      const signRes = await fetch("/api/payments/razorpay/sandbox-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
        }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || "Sandbox signing rejected by server.");
      }

      const { razorpay_signature } = await signRes.json();

      setStatus("verifying");
      // Simulate dual-layer cryptographic verification hop
      await new Promise((res) => setTimeout(res, 500));

      // Step 2: Submit to server-authoritative /verify route
      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      setStatus("success");
      await new Promise((res) => setTimeout(res, 600));
      onSuccess(verifyData.order);
    } catch (err: any) {
      console.error("Simulation error:", err);
      setStatus("failed");
      setErrorMessage(err.message || "An unexpected simulation error occurred.");
    }
  };

  const handleSimulateFailure = () => {
    setStatus("failed");
    setErrorMessage("Payment was declined by customer bank (Simulated Test Failure).");
  };

  return (
    <div className="upi-modal-overlay">
      <div className="upi-modal-card" role="dialog" aria-modal="true">
        {/* Sandbox Indicator Header */}
        <div className="upi-sandbox-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>SANDBOX SIMULATOR · Offline Test Mode</span>
          <span className="sandbox-tag">Zero Real Charges</span>
        </div>

        {/* Modal Main Header */}
        <div className="upi-modal-header">
          <div className="upi-order-meta">
            <span className="order-brand">Lizardfy Atelier</span>
            <h2 className="order-number">Order {orderNumber}</h2>
            <p className="customer-ref">For {customerName}</p>
          </div>
          <div className="upi-amount-pill">
            <span className="currency">₹</span>
            <span className="amount">{amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Expiration Timer Bar */}
        <div className={`upi-timer-bar ${timeLeft < 120 ? "timer-warning" : ""}`}>
          <div className="timer-info">
            <Clock size={14} />
            <span>UPI Session Validity:</span>
            <strong className="timer-countdown">{formattedTime}</strong>
          </div>
          <div className="security-notice">
            <ShieldCheck size={14} />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {status === "authorizing" || status === "verifying" ? (
          <div className="upi-modal-loading">
            <RefreshCw size={40} className="spinning-icon" />
            <h3>
              {status === "authorizing"
                ? "Connecting to UPI Switch..."
                : "Verifying Cryptographic HMAC Signature..."}
            </h3>
            <p>Simulating secure authorization for {selectedApp.toUpperCase()}</p>
          </div>
        ) : status === "success" ? (
          <div className="upi-modal-success">
            <CheckCircle2 size={52} className="success-icon" />
            <h3>Payment Confirmed!</h3>
            <p>Your order is secured and verified via server-side HMAC.</p>
          </div>
        ) : (
          <div className="upi-modal-body">
            {errorMessage && (
              <div className="upi-error-banner">
                <AlertTriangle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Split View: QR code on Left, UPI Apps on Right */}
            <div className="upi-interactive-grid">
              {/* Dynamic QR Frame */}
              <div className="upi-qr-section">
                <div className="qr-wrapper">
                  <div className="qr-glow-border">
                    <svg
                      viewBox="0 0 100 100"
                      className="qr-visual"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="100" height="100" fill="#ffffff" rx="6" />
                      {/* Top-left position pattern */}
                      <rect x="10" y="10" width="22" height="22" fill="#1b241c" />
                      <rect x="14" y="14" width="14" height="14" fill="#ffffff" />
                      <rect x="17" y="17" width="8" height="8" fill="#1b241c" />
                      {/* Top-right position pattern */}
                      <rect x="68" y="10" width="22" height="22" fill="#1b241c" />
                      <rect x="72" y="14" width="14" height="14" fill="#ffffff" />
                      <rect x="75" y="17" width="8" height="8" fill="#1b241c" />
                      {/* Bottom-left position pattern */}
                      <rect x="10" y="68" width="22" height="22" fill="#1b241c" />
                      <rect x="14" y="72" width="14" height="14" fill="#ffffff" />
                      <rect x="17" y="75" width="8" height="8" fill="#1b241c" />
                      {/* Stylized Data Pixels */}
                      <rect x="36" y="12" width="6" height="6" fill="#1b241c" />
                      <rect x="46" y="16" width="6" height="6" fill="#1b241c" />
                      <rect x="56" y="12" width="6" height="6" fill="#1b241c" />
                      <rect x="36" y="24" width="8" height="8" fill="#1b241c" />
                      <rect x="48" y="26" width="6" height="6" fill="#1b241c" />
                      <rect x="12" y="38" width="8" height="8" fill="#1b241c" />
                      <rect x="24" y="42" width="6" height="6" fill="#1b241c" />
                      <rect x="34" y="38" width="12" height="12" fill="#1b241c" />
                      <rect x="52" y="40" width="8" height="8" fill="#1b241c" />
                      <rect x="66" y="38" width="8" height="8" fill="#1b241c" />
                      <rect x="80" y="42" width="8" height="8" fill="#1b241c" />
                      <rect x="38" y="56" width="8" height="8" fill="#1b241c" />
                      <rect x="50" y="54" width="12" height="8" fill="#1b241c" />
                      <rect x="66" y="54" width="8" height="8" fill="#1b241c" />
                      <rect x="78" y="56" width="10" height="8" fill="#1b241c" />
                      <rect x="38" y="70" width="6" height="6" fill="#1b241c" />
                      <rect x="48" y="68" width="8" height="8" fill="#1b241c" />
                      <rect x="60" y="72" width="8" height="8" fill="#1b241c" />
                      <rect x="74" y="70" width="12" height="12" fill="#1b241c" />
                      <rect x="40" y="82" width="10" height="8" fill="#1b241c" />
                      <rect x="56" y="82" width="12" height="6" fill="#1b241c" />
                      {/* Center Atelier Emblem Badge */}
                      <circle cx="50" cy="50" r="11" fill="#182319" />
                      <circle cx="50" cy="50" r="9" fill="#d4af37" />
                      <text
                        x="50"
                        y="54"
                        textAnchor="middle"
                        fill="#182319"
                        fontSize="8"
                        fontWeight="900"
                        fontFamily="serif"
                      >
                        L
                      </text>
                    </svg>
                  </div>
                  <span className="qr-caption">
                    <QrCode size={13} /> Scan with any UPI app
                  </span>
                </div>

                <div className="vpa-copy-pill" onClick={copyVpa}>
                  <span className="vpa-text">{virtualVpa}</span>
                  <button type="button" className="copy-btn">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* UPI App Selection */}
              <div className="upi-apps-section">
                <span className="section-label">Choose preferred UPI app:</span>
                <div className="upi-app-grid">
                  {[
                    { id: "gpay", name: "Google Pay", color: "#4285F4" },
                    { id: "phonepe", name: "PhonePe", color: "#5f259f" },
                    { id: "paytm", name: "Paytm UPI", color: "#00BAF2" },
                    { id: "cred", name: "CRED UPI", color: "#1a1a1a" },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`upi-app-button ${
                        selectedApp === app.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedApp(app.id)}
                    >
                      <Smartphone size={16} />
                      <span>{app.name}</span>
                    </button>
                  ))}
                </div>

                <div className="simulator-actions">
                  <button
                    type="button"
                    disabled={isExpired}
                    className="button button-dark upi-approve-btn"
                    onClick={handleSimulatePayment}
                  >
                    <span>⚡ Approve Test Payment</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="secondary-actions">
                    <button
                      type="button"
                      disabled={isExpired}
                      className="button button-outline fail-test-btn"
                      onClick={handleSimulateFailure}
                    >
                      <XCircle size={14} /> Simulate Failure
                    </button>
                    <button
                      type="button"
                      className="button button-text cancel-btn"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
