"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  Lock,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import Footer from "@/components/Footer";
import { UpiPaymentModal } from "@/components/UpiPaymentModal";
import {
  getAllIndianStates,
  getCitiesForState,
  validateIndianPhone,
  validateIndianPin,
  validateIndianStreetAddress,
  verifyIndiaPostPinOnline,
} from "@/lib/indiaGeo";

interface CartLine {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image?: string;
}

type CheckoutStep = "address" | "payment" | "confirmation";
type PaymentMethodChoice = "COD" | "UPI";

export default function CheckoutPage() {
  const router = useRouter();

  // Cart & session state
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Stepper state
  const [step, setStep] = useState<CheckoutStep>("address");

  // Shipping form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // India Post PIN Verification status
  const [pinChecking, setPinChecking] = useState(false);
  const [pinVerifiedInfo, setPinVerifiedInfo] = useState<{
    state: string;
    district: string;
    block: string;
  } | null>(null);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Payment choice
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodChoice>("UPI");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // UPI Modal & Confirmation data
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [upiOrderData, setUpiOrderData] = useState<{
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
    paymentExpiresAt: string;
    customerName: string;
  } | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // All 36 Indian states & UTs
  const allStates = useMemo(() => getAllIndianStates(), []);

  // Cities for the currently selected state
  const citiesForState = useMemo(() => {
    if (!selectedState) return [];
    return getCitiesForState(selectedState);
  }, [selectedState]);

  // Load cart and authenticated user
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("lizardfy-cart") ?? "[]");
      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      }
    } catch {
      setCart([]);
    }
    setCartLoaded(true);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.name) setFullName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 1800 ? 0 : 80;
  const grandTotal = subtotal + shippingFee;

  // Handle state change (resets city selection)
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity("");
    setCustomCity("");

    // Clear state error if any
    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated.state;
      delete updated.city;
      return updated;
    });

    // Re-validate PIN code against new state if already typed
    if (pinCode.length === 6) {
      const pinVal = validateIndianPin(pinCode, newState);
      if (!pinVal.valid) {
        setFormErrors((prev) => ({ ...prev, pinCode: pinVal.error || "Invalid PIN code for this state." }));
      } else {
        setFormErrors((prev) => {
          const updated = { ...prev };
          delete updated.pinCode;
          return updated;
        });
      }
    }
  };

  const effectiveCity = selectedCity === "OTHER" ? customCity.trim() : selectedCity;

  // Real-time India Post Verification whenever PIN code reaches 6 digits
  useEffect(() => {
    if (pinCode.length === 6) {
      setPinChecking(true);
      verifyIndiaPostPinOnline(pinCode, selectedState, effectiveCity)
        .then((res) => {
          if (!res.valid) {
            setFormErrors((prev) => ({
              ...prev,
              pinCode: res.error || `Postal PIN code ${pinCode} does not exist in India Post records.`,
            }));
            setPinVerifiedInfo(null);
          } else {
            setFormErrors((prev) => {
              const u = { ...prev };
              delete u.pinCode;
              return u;
            });
            if (res.data) {
              setPinVerifiedInfo({
                state: res.data.state,
                district: res.data.district,
                block: res.data.block,
              });
              // Auto-set state if not yet picked
              if (!selectedState && res.data.state) {
                setSelectedState(res.data.state);
              }
            }
          }
        })
        .finally(() => {
          setPinChecking(false);
        });
    } else {
      setPinVerifiedInfo(null);
    }
  }, [pinCode, selectedState, effectiveCity]);

  // Comprehensive Indian Address Validator
  const validateDeliveryForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Full name
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter the recipient's full name (at least 2 characters).";
    }

    // 2. Email
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address for order tracking.";
    }

    // 3. Indian Mobile Number (10 digits starting with 6, 7, 8, or 9)
    const phoneVal = validateIndianPhone(phone);
    if (!phoneVal.valid) {
      errors.phone = phoneVal.error || "Please enter a valid 10-digit Indian mobile number.";
    }

    // 4. State
    if (!selectedState) {
      errors.state = "Please select your State / Union Territory.";
    }

    // 5. City
    if (!selectedCity) {
      errors.city = "Please select your City / District.";
    } else if (selectedCity === "OTHER" && (!customCity.trim() || customCity.trim().length < 2)) {
      errors.city = "Please type your city or town name.";
    }

    // 6. Indian Postal PIN Code (6 digits, check state prefix)
    const pinVal = validateIndianPin(pinCode, selectedState);
    if (!pinVal.valid) {
      errors.pinCode = pinVal.error || "Please enter a valid 6-digit Indian PIN code.";
    }

    // 7. Street address (must be meaningful street/house info)
    const addressVal = validateIndianStreetAddress(streetAddress);
    if (!addressVal.valid) {
      errors.streetAddress = addressVal.error || "Please provide a valid street address.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setGeneralError("Please correct the highlighted delivery fields before proceeding.");
      return false;
    }

    setGeneralError(null);
    return true;
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDeliveryForm()) {
      return;
    }

    // Live verification with India Post database
    setPinChecking(true);
    const pinVerification = await verifyIndiaPostPinOnline(pinCode, selectedState, effectiveCity);
    setPinChecking(false);

    if (!pinVerification.valid) {
      setFormErrors((prev) => ({
        ...prev,
        pinCode: pinVerification.error || `Postal PIN code ${pinCode} does not exist in India Post records.`,
      }));
      setGeneralError(pinVerification.error || "Postal PIN code does not exist in India Post records.");
      return;
    }

    // Advance to Payment step
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fullShippingAddress = `${streetAddress.trim()}, ${effectiveCity}, ${selectedState} - ${pinCode.trim()}`;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Cash on Delivery Order Placement
  const handlePlaceCodOrder = async () => {
    try {
      setIsSubmittingOrder(true);
      setPaymentError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim() || "Guest Customer",
          customerEmail: email.trim().toLowerCase() || "guest@example.com",
          customerPhone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
          shippingAddress: fullShippingAddress,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "PENDING",
          totalAmount: grandTotal,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            details: item.details,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not place Cash on Delivery order.");
      }

      localStorage.removeItem("lizardfy-cart");
      setCart([]);
      setConfirmedOrder(data.order);
      setStep("confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("COD Order Placement error:", err);
      setPaymentError(err.message || "Failed to confirm Cash on Delivery order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // UPI Payment Initiation
  const handleInitiateUpiPayment = async () => {
    try {
      setIsSubmittingOrder(true);
      setPaymentError(null);

      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim() || "Guest Customer",
          customerEmail: email.trim().toLowerCase() || "guest@example.com",
          customerPhone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
          shippingAddress: fullShippingAddress,
          items: cart.map((item) => ({
            productId: item.id,
            id: item.id,
            name: item.name,
            details: item.details,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate UPI payment session.");
      }

      if (data.mode === "sandbox") {
        setUpiOrderData({
          orderNumber: data.orderNumber,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          paymentExpiresAt: data.paymentExpiresAt,
          customerName: fullName.trim() || "Guest Customer",
        });
        setUpiModalOpen(true);
      } else {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Unable to load Razorpay secure checkout script.");
        }

        const options = {
          key: data.keyId,
          amount: data.amountInPaise,
          currency: "INR",
          name: "Lizardfy Atelier",
          description: `Order ${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: fullName.trim() || "Guest Customer",
            email: email.trim().toLowerCase() || "guest@example.com",
            contact: phone.trim(),
          },
          theme: {
            color: "#182319",
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || "UPI verification failed.");
              }
              handlePaymentSuccess(verifyData.order);
            } catch (vErr: any) {
              setPaymentError(vErr.message || "Payment verification failed.");
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmittingOrder(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error("UPI order error:", err);
      setPaymentError(err.message || "Could not process UPI payment.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePaymentSuccess = (order: any) => {
    localStorage.removeItem("lizardfy-cart");
    setCart([]);
    setUpiModalOpen(false);
    setConfirmedOrder(order);
    setStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--paper, #faf9f5)", color: "var(--ink, #1f2c1d)" }}>
      {/* Top Studio Announcement Bar */}
      <div className="announcement">
        <span className="announcement-star">✦</span>
        <span className="announcement-text">
          Complimentary studio shipping across all Indian States & UTs on orders over ₹1,800
        </span>
        <span className="announcement-star">✦</span>
      </div>

      {/* Main Studio Header */}
      <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <Link href="/" className="wordmark" aria-label="Lizardfy Home">
          <img src="/assets/app_logo.jpg" alt="Lizardfy Candle Studio" className="brand-logo" />
          <div className="brand-text-block">
            <span className="brand-name">lizardfy</span>
            <span className="brand-sub">STUDIO ATELIER</span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill, 9999px)",
              background: "rgba(72, 92, 62, 0.08)",
              border: "1px solid rgba(72, 92, 62, 0.18)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--olive, #485c3e)",
            }}
          >
            <Lock size={13} style={{ color: "var(--gold, #c8973e)" }} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <Link
            href="/"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--ink, #1f2c1d)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <ArrowLeft size={14} /> Back to shop
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
        {/* Stepper Progress Bar */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            {/* Step 1: Delivery */}
            <div
              onClick={() => {
                if (step === "payment") setStep("address");
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                cursor: step === "payment" ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: step === "address" ? "var(--deep, #1b271a)" : "#e2e8df",
                  color: step === "address" ? "#ffffff" : "var(--olive, #485c3e)",
                  border: step === "address" ? "2px solid var(--gold, #c8973e)" : "1px solid #d4ddd0",
                  transition: "all 0.25s ease",
                }}
              >
                {step === "payment" || step === "confirmation" ? <Check size={18} /> : "1"}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: step === "address" ? 700 : 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: step === "address" ? "var(--ink, #1f2c1d)" : "var(--muted, #5e6b5a)",
                }}
              >
                Delivery Address
              </span>
            </div>

            {/* Connecting Line 1 */}
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: step === "payment" || step === "confirmation" ? "var(--gold, #c8973e)" : "var(--line, #e3e7de)",
                margin: "0 0.8rem",
                marginTop: "-1.2rem",
                transition: "background-color 0.3s ease",
              }}
            />

            {/* Step 2: Payment */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    step === "payment"
                      ? "var(--deep, #1b271a)"
                      : step === "confirmation"
                      ? "#e2e8df"
                      : "var(--paper-cream, #f4f3ec)",
                  color:
                    step === "payment"
                      ? "#ffffff"
                      : step === "confirmation"
                      ? "var(--olive, #485c3e)"
                      : "var(--muted-light, #8e9b8b)",
                  border:
                    step === "payment"
                      ? "2px solid var(--gold, #c8973e)"
                      : "1px solid var(--line, #e3e7de)",
                  transition: "all 0.25s ease",
                }}
              >
                {step === "confirmation" ? <Check size={18} /> : "2"}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: step === "payment" ? 700 : 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: step === "payment" ? "var(--ink, #1f2c1d)" : "var(--muted, #5e6b5a)",
                }}
              >
                Payment Method
              </span>
            </div>

            {/* Connecting Line 2 */}
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: step === "confirmation" ? "var(--gold, #c8973e)" : "var(--line, #e3e7de)",
                margin: "0 0.8rem",
                marginTop: "-1.2rem",
                transition: "background-color 0.3s ease",
              }}
            />

            {/* Step 3: Confirmation */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: step === "confirmation" ? "var(--deep, #1b271a)" : "var(--paper-cream, #f4f3ec)",
                  color: step === "confirmation" ? "#ffffff" : "var(--muted-light, #8e9b8b)",
                  border:
                    step === "confirmation"
                      ? "2px solid var(--gold, #c8973e)"
                      : "1px solid var(--line, #e3e7de)",
                  transition: "all 0.25s ease",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: step === "confirmation" ? 700 : 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: step === "confirmation" ? "var(--ink, #1f2c1d)" : "var(--muted, #5e6b5a)",
                }}
              >
                Confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Empty Bag State */}
        {cartLoaded && cart.length === 0 && step !== "confirmation" ? (
          <div
            style={{
              textAlign: "center",
              padding: "4.5rem 2rem",
              background: "var(--white, #ffffff)",
              borderRadius: "var(--radius-lg, 20px)",
              border: "1px solid var(--line, #e3e7de)",
              maxWidth: "540px",
              margin: "2rem auto",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <ShoppingBag size={48} style={{ color: "var(--olive, #485c3e)", margin: "0 auto 1.2rem", opacity: 0.8 }} />
            <h2 style={{ fontFamily: "var(--serif, serif)", fontSize: "1.9rem", color: "var(--ink, #1f2c1d)", marginBottom: "0.6rem" }}>
              Your shopping bag is empty
            </h2>
            <p style={{ color: "var(--muted, #5e6b5a)", fontSize: "15px", marginBottom: "2rem" }}>
              Discover our botanical formulations, signature scents, and custom vessels.
            </p>
            <Link
              href="/"
              className="button button-dark"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.8rem",
                borderRadius: "var(--radius-pill, 9999px)",
                textDecoration: "none",
              }}
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: step === "confirmation" ? "1fr" : "1.25fr 0.75fr",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* Left Column: Flow Forms */}
            <div>
              {/* STEP 1: DELIVERY ADDRESS FORM */}
              {step === "address" && (
                <div
                  style={{
                    backgroundColor: "var(--white, #ffffff)",
                    border: "1px solid var(--line, #e3e7de)",
                    borderRadius: "var(--radius-lg, 20px)",
                    padding: "2.4rem",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <div style={{ marginBottom: "1.8rem" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "var(--gold, #c8973e)",
                        fontWeight: 700,
                      }}
                    >
                      Step 1 of 2 · Delivery Address
                    </span>
                    <h2
                      style={{
                        fontFamily: "var(--serif, 'Playfair Display', serif)",
                        fontSize: "2rem",
                        color: "var(--ink, #1f2c1d)",
                        marginTop: "0.3rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Where should we send your package?
                    </h2>
                    <p style={{ color: "var(--muted, #5e6b5a)", fontSize: "14px" }}>
                      We ship across all 28 States and 8 Union Territories in India using protected luxury packaging.
                    </p>
                  </div>

                  {generalError && (
                    <div
                      style={{
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "10px",
                        padding: "0.85rem 1.1rem",
                        color: "#b91c1c",
                        fontSize: "13.5px",
                        marginBottom: "1.6rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={17} style={{ flexShrink: 0 }} />
                      <span>{generalError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddressSubmit}>
                    {/* Row 1: Full Name & Email */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          Recipient Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Sharma"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.fullName) {
                              setFormErrors((prev) => {
                                const u = { ...prev };
                                delete u.fullName;
                                return u;
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 0.95rem",
                            borderRadius: "10px",
                            border: formErrors.fullName ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                            backgroundColor: "#ffffff",
                            color: "var(--ink, #1f2c1d)",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                        {formErrors.fullName && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                            {formErrors.fullName}
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          Email Address (for dispatch updates) *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="maya@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) {
                              setFormErrors((prev) => {
                                const u = { ...prev };
                                delete u.email;
                                return u;
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 0.95rem",
                            borderRadius: "10px",
                            border: formErrors.email ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                            backgroundColor: "#ffffff",
                            color: "var(--ink, #1f2c1d)",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                        {formErrors.email && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                            {formErrors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Mobile Number & Postal PIN Code */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          Mobile Number (10-digit Indian mobile) *
                        </label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span
                            style={{
                              padding: "0.75rem 0.8rem",
                              backgroundColor: "var(--paper-cream, #f4f3ec)",
                              border: "1px solid #d8dbd1",
                              borderRadius: "10px",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--muted, #5e6b5a)",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="98765 43210"
                            value={phone.replace(/^\+91\s*/, "")}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setPhone(val);
                              if (formErrors.phone) {
                                setFormErrors((prev) => {
                                  const u = { ...prev };
                                  delete u.phone;
                                  return u;
                                });
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: "0.75rem 0.95rem",
                              borderRadius: "10px",
                              border: formErrors.phone ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                              backgroundColor: "#ffffff",
                              color: "var(--ink, #1f2c1d)",
                              fontSize: "14px",
                              outline: "none",
                            }}
                          />
                        </div>
                        {formErrors.phone && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                            {formErrors.phone}
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          Postal PIN Code (6 digits) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 560038"
                          value={pinCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPinCode(val);
                            if (val.length === 6) {
                              const pinVal = validateIndianPin(val, selectedState);
                              if (!pinVal.valid) {
                                setFormErrors((prev) => ({ ...prev, pinCode: pinVal.error || "Invalid PIN code for this state." }));
                              } else {
                                setFormErrors((prev) => {
                                  const u = { ...prev };
                                  delete u.pinCode;
                                  return u;
                                });
                              }
                            } else {
                              setPinVerifiedInfo(null);
                              if (val.length > 0 && formErrors.pinCode && !formErrors.pinCode.includes("6 digits")) {
                                setFormErrors((prev) => {
                                  const u = { ...prev };
                                  delete u.pinCode;
                                  return u;
                                });
                              }
                            }
                          }}
                          onBlur={() => {
                            if (pinCode.length === 6) {
                              const pinVal = validateIndianPin(pinCode, selectedState);
                              if (!pinVal.valid) {
                                setFormErrors((prev) => ({ ...prev, pinCode: pinVal.error || "Invalid PIN code." }));
                              }
                            } else if (pinCode.length > 0 && pinCode.length < 6) {
                              setFormErrors((prev) => ({ ...prev, pinCode: "Postal PIN code must be exactly 6 digits." }));
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 0.95rem",
                            borderRadius: "10px",
                            border: formErrors.pinCode ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                            backgroundColor: "#ffffff",
                            color: "var(--ink, #1f2c1d)",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                        {pinChecking && (
                          <span style={{ fontSize: "11.5px", color: "var(--olive, #485c3e)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ display: "inline-block", width: "10px", height: "10px", border: "2px solid #485c3e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            Verifying with India Post records...
                          </span>
                        )}
                        {!pinChecking && pinVerifiedInfo && !formErrors.pinCode && (
                          <span style={{ fontSize: "11.5px", color: "#15803d", marginTop: "4px", display: "block", fontWeight: 500 }}>
                            ✓ India Post Verified: {pinVerifiedInfo.district || pinVerifiedInfo.block || "District"}, {pinVerifiedInfo.state}
                          </span>
                        )}
                        {formErrors.pinCode && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block", fontWeight: 500 }}>
                            {formErrors.pinCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 3: STATE FIRST, THEN CITY (DROPDOWNS) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                      {/* STATE DROPDOWN FIRST */}
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          State / Union Territory *
                        </label>
                        <div style={{ position: "relative" }}>
                          <select
                            required
                            value={selectedState}
                            onChange={handleStateChange}
                            style={{
                              width: "100%",
                              padding: "0.75rem 2.2rem 0.75rem 0.95rem",
                              borderRadius: "10px",
                              border: formErrors.state ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                              backgroundColor: "#ffffff",
                              color: selectedState ? "var(--ink, #1f2c1d)" : "var(--muted-light, #8e9b8b)",
                              fontSize: "14px",
                              outline: "none",
                              appearance: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">Select State / UT (All 36 in India)</option>
                            {allStates.map((st) => (
                              <option key={st} value={st} style={{ color: "#1f2c1d" }}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              color: "var(--muted, #5e6b5a)",
                            }}
                          />
                        </div>
                        {formErrors.state && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                            {formErrors.state}
                          </span>
                        )}
                      </div>

                      {/* CITY DROPDOWN SECOND */}
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                          City / District *
                        </label>
                        <div style={{ position: "relative" }}>
                          <select
                            required
                            disabled={!selectedState}
                            value={selectedCity}
                            onChange={(e) => {
                              setSelectedCity(e.target.value);
                              if (formErrors.city) {
                                setFormErrors((prev) => {
                                  const u = { ...prev };
                                  delete u.city;
                                  return u;
                                });
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "0.75rem 2.2rem 0.75rem 0.95rem",
                              borderRadius: "10px",
                              border: formErrors.city ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                              backgroundColor: selectedState ? "#ffffff" : "var(--paper-cream, #f4f3ec)",
                              color: selectedCity ? "var(--ink, #1f2c1d)" : "var(--muted-light, #8e9b8b)",
                              fontSize: "14px",
                              outline: "none",
                              appearance: "none",
                              cursor: selectedState ? "pointer" : "not-allowed",
                            }}
                          >
                            <option value="">
                              {selectedState ? "Select City / District" : "Select State first"}
                            </option>
                            {citiesForState.map((ct) => (
                              <option key={ct} value={ct} style={{ color: "#1f2c1d" }}>
                                {ct}
                              </option>
                            ))}
                            {selectedState && (
                              <option value="OTHER" style={{ color: "var(--olive, #485c3e)", fontWeight: 600 }}>
                                + Other City / Town (Specify below)
                              </option>
                            )}
                          </select>
                          <ChevronDown
                            size={16}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              color: "var(--muted, #5e6b5a)",
                            }}
                          />
                        </div>
                        {formErrors.city && (
                          <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                            {formErrors.city}
                          </span>
                        )}

                        {/* Custom city input if 'OTHER' is picked */}
                        {selectedCity === "OTHER" && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <input
                              type="text"
                              required
                              placeholder="Type your city or town name"
                              value={customCity}
                              onChange={(e) => setCustomCity(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "0.65rem 0.9rem",
                                borderRadius: "8px",
                                border: "1px solid #d8dbd1",
                                backgroundColor: "#ffffff",
                                color: "var(--ink, #1f2c1d)",
                                fontSize: "13.5px",
                                outline: "none",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Street / House Address */}
                    <div style={{ marginBottom: "1.8rem" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginBottom: "0.4rem" }}>
                        Delivery Address (Apartment, House/Flat No., Building & Locality) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 402, Lotus Bloom Apartments, 100ft Road, Indiranagar"
                        value={streetAddress}
                        onChange={(e) => {
                          setStreetAddress(e.target.value);
                          if (formErrors.streetAddress) {
                            setFormErrors((prev) => {
                              const u = { ...prev };
                              delete u.streetAddress;
                              return u;
                            });
                          }
                        }}
                        onBlur={() => {
                          if (streetAddress.trim()) {
                            const val = validateIndianStreetAddress(streetAddress);
                            if (!val.valid) {
                              setFormErrors((prev) => ({ ...prev, streetAddress: val.error || "Please enter a valid street address." }));
                            }
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.85rem 0.95rem",
                          borderRadius: "10px",
                          border: formErrors.streetAddress ? "1.5px solid #ef4444" : "1px solid #d8dbd1",
                          backgroundColor: "#ffffff",
                          color: "var(--ink, #1f2c1d)",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                      {formErrors.streetAddress && (
                        <span style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                          {formErrors.streetAddress}
                        </span>
                      )}
                    </div>

                    {/* Submit Button to Advance to Payment */}
                    <button
                      type="submit"
                      className="button button-dark"
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "var(--radius-pill, 9999px)",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.6rem",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Continue to Payment Selection <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD SELECTION (CASH ON DELIVERY OR UPI) */}
              {step === "payment" && (
                <div
                  style={{
                    backgroundColor: "var(--white, #ffffff)",
                    border: "1px solid var(--line, #e3e7de)",
                    borderRadius: "var(--radius-lg, 20px)",
                    padding: "2.4rem",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <div style={{ marginBottom: "1.8rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--gold, #c8973e)",
                          fontWeight: 700,
                        }}
                      >
                        Step 2 of 2 · Payment Method
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep("address")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--olive, #485c3e)",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ArrowLeft size={13} /> Edit address
                      </button>
                    </div>

                    <h2
                      style={{
                        fontFamily: "var(--serif, 'Playfair Display', serif)",
                        fontSize: "2rem",
                        color: "var(--ink, #1f2c1d)",
                        marginTop: "0.3rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Choose your payment method
                    </h2>
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "var(--paper-cream, #f4f3ec)",
                        borderRadius: "10px",
                        fontSize: "13px",
                        color: "var(--muted, #5e6b5a)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <MapPin size={16} style={{ color: "var(--olive, #485c3e)", flexShrink: 0 }} />
                      <span>
                        Delivering to: <strong style={{ color: "var(--ink, #1f2c1d)" }}>{fullName}</strong> ({fullShippingAddress})
                      </span>
                    </div>
                  </div>

                  {paymentError && (
                    <div
                      style={{
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "10px",
                        padding: "0.85rem 1.1rem",
                        color: "#b91c1c",
                        fontSize: "13.5px",
                        marginBottom: "1.6rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={17} style={{ flexShrink: 0 }} />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Payment Methods Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2rem" }}>
                    {/* OPTION 1: UPI */}
                    <div
                      onClick={() => setSelectedPayment("UPI")}
                      style={{
                        border:
                          selectedPayment === "UPI"
                            ? "2px solid var(--gold, #c8973e)"
                            : "1px solid var(--line, #e3e7de)",
                        backgroundColor:
                          selectedPayment === "UPI" ? "var(--gold-soft, #fcf7ed)" : "#ffffff",
                        borderRadius: "16px",
                        padding: "1.4rem",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        boxShadow: selectedPayment === "UPI" ? "0 4px 16px rgba(200, 151, 62, 0.12)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1rem" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              backgroundColor: selectedPayment === "UPI" ? "var(--deep, #1b271a)" : "var(--paper-cream, #f4f3ec)",
                              color: selectedPayment === "UPI" ? "#ffffff" : "var(--olive, #485c3e)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <QrCode size={22} />
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink, #1f2c1d)", margin: 0 }}>
                                Pay with UPI
                              </h3>
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "0.2rem 0.6rem",
                                  borderRadius: "12px",
                                  backgroundColor: "rgba(74, 222, 128, 0.2)",
                                  color: "#166534",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Instant & Verified
                              </span>
                            </div>
                            <p style={{ color: "var(--muted, #5e6b5a)", fontSize: "13.5px", margin: "0.35rem 0 0.5rem" }}>
                              Google Pay, PhonePe, Paytm, CRED or any BHIM UPI QR Code scanner.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px", color: "var(--olive, #485c3e)" }}>
                              <Sparkles size={14} style={{ color: "var(--gold, #c8973e)" }} />
                              <span>Direct bank-to-bank transfer · Zero convenience surcharges</span>
                            </div>
                          </div>
                        </div>

                        {/* Custom Radio Indicator */}
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            border:
                              selectedPayment === "UPI"
                                ? "6px solid var(--gold, #c8973e)"
                                : "2px solid #d4ddd0",
                            backgroundColor: selectedPayment === "UPI" ? "#ffffff" : "transparent",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>

                    {/* OPTION 2: CASH ON DELIVERY (COD) */}
                    <div
                      onClick={() => setSelectedPayment("COD")}
                      style={{
                        border:
                          selectedPayment === "COD"
                            ? "2px solid var(--gold, #c8973e)"
                            : "1px solid var(--line, #e3e7de)",
                        backgroundColor:
                          selectedPayment === "COD" ? "var(--gold-soft, #fcf7ed)" : "#ffffff",
                        borderRadius: "16px",
                        padding: "1.4rem",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        boxShadow: selectedPayment === "COD" ? "0 4px 16px rgba(200, 151, 62, 0.12)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1rem" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              backgroundColor: selectedPayment === "COD" ? "var(--deep, #1b271a)" : "var(--paper-cream, #f4f3ec)",
                              color: selectedPayment === "COD" ? "#ffffff" : "var(--olive, #485c3e)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Banknote size={22} />
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink, #1f2c1d)", margin: 0 }}>
                                Cash on Delivery (COD)
                              </h3>
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "0.2rem 0.6rem",
                                  borderRadius: "12px",
                                  backgroundColor: "rgba(200, 151, 62, 0.18)",
                                  color: "var(--gold-hover, #b4832f)",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Pay on Arrival
                              </span>
                            </div>
                            <p style={{ color: "var(--muted, #5e6b5a)", fontSize: "13.5px", margin: "0.35rem 0 0.5rem" }}>
                              Pay with cash or scan UPI QR directly to the delivery partner at your doorstep.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px", color: "var(--olive, #485c3e)" }}>
                              <ShieldCheck size={14} style={{ color: "#16a34a" }} />
                              <span>Zero advance payment · Inspect package upon delivery</span>
                            </div>
                          </div>
                        </div>

                        {/* Custom Radio Indicator */}
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            border:
                              selectedPayment === "COD"
                                ? "6px solid var(--gold, #c8973e)"
                                : "2px solid #d4ddd0",
                            backgroundColor: selectedPayment === "COD" ? "#ffffff" : "transparent",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Action */}
                  {selectedPayment === "COD" ? (
                    <div>
                      <div
                        style={{
                          marginBottom: "1.2rem",
                          padding: "0.95rem 1.1rem",
                          borderRadius: "12px",
                          backgroundColor: "var(--paper-cream, #f4f3ec)",
                          border: "1px dashed var(--line, #e3e7de)",
                          fontSize: "13px",
                          color: "var(--muted, #5e6b5a)",
                          lineHeight: 1.5,
                        }}
                      >
                        🚚 <strong>Delivery Partner Notice:</strong> Please keep exact amount of ₹
                        {grandTotal.toLocaleString("en-IN")} or request the delivery executive's UPI QR code upon arrival.
                      </div>
                      <button
                        type="button"
                        onClick={handlePlaceCodOrder}
                        disabled={isSubmittingOrder}
                        className="button button-dark"
                        style={{
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "var(--radius-pill, 9999px)",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "15px",
                          cursor: isSubmittingOrder ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.6rem",
                          opacity: isSubmittingOrder ? 0.7 : 1,
                        }}
                      >
                        {isSubmittingOrder ? (
                          "Confirming COD Order..."
                        ) : (
                          <>
                            Place Order with Cash on Delivery · ₹{grandTotal.toLocaleString("en-IN")}{" "}
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          marginBottom: "1.2rem",
                          padding: "0.95rem 1.1rem",
                          borderRadius: "12px",
                          backgroundColor: "rgba(74, 222, 128, 0.08)",
                          border: "1px dashed rgba(74, 222, 128, 0.35)",
                          fontSize: "13px",
                          color: "#166534",
                          lineHeight: 1.5,
                        }}
                      >
                        🔒 <strong>Secure UPI Payment:</strong> You will be routed to the authenticated UPI simulator /
                        Razorpay interface to authorize your payment directly.
                      </div>
                      <button
                        type="button"
                        onClick={handleInitiateUpiPayment}
                        disabled={isSubmittingOrder}
                        className="button button-dark"
                        style={{
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "var(--radius-pill, 9999px)",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "15px",
                          cursor: isSubmittingOrder ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.6rem",
                          opacity: isSubmittingOrder ? 0.7 : 1,
                        }}
                      >
                        {isSubmittingOrder ? (
                          "Connecting to UPI..."
                        ) : (
                          <>
                            Pay via UPI · ₹{grandTotal.toLocaleString("en-IN")} <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: ORDER CONFIRMATION RECEIPT */}
              {step === "confirmation" && confirmedOrder && (
                <div
                  style={{
                    backgroundColor: "var(--white, #ffffff)",
                    border: "1px solid var(--line, #e3e7de)",
                    borderRadius: "var(--radius-lg, 20px)",
                    padding: "3.5rem 2.5rem",
                    textAlign: "center",
                    boxShadow: "var(--shadow-lg)",
                    maxWidth: "760px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(74, 222, 128, 0.15)",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      border: "2px solid #86efac",
                      boxShadow: "0 0 24px rgba(74, 222, 128, 0.25)",
                    }}
                  >
                    <Check size={38} />
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--gold, #c8973e)",
                      fontWeight: 700,
                    }}
                  >
                    Order Successfully Confirmed
                  </span>
                  <h1
                    style={{
                      fontFamily: "var(--serif, 'Playfair Display', serif)",
                      fontSize: "2.4rem",
                      color: "var(--ink, #1f2c1d)",
                      marginTop: "0.5rem",
                      marginBottom: "0.8rem",
                    }}
                  >
                    Thank you, {confirmedOrder.customerName || fullName}!
                  </h1>
                  <p style={{ color: "var(--muted, #5e6b5a)", fontSize: "15px", maxWidth: "480px", margin: "0 auto 2.2rem" }}>
                    Your handcrafted candle order has been received. Our studio artisans are preparing your shipment.
                  </p>

                  {/* Order Details Card */}
                  <div
                    style={{
                      backgroundColor: "var(--paper-cream, #f4f3ec)",
                      border: "1px solid var(--line, #e3e7de)",
                      borderRadius: "16px",
                      padding: "1.6rem",
                      textAlign: "left",
                      marginBottom: "2.5rem",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #e2e8df", paddingBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted-light, #8e9b8b)", textTransform: "uppercase", fontWeight: 600 }}>
                          Order Number
                        </span>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--ink, #1f2c1d)", marginTop: "0.2rem" }}>
                          {confirmedOrder.orderNumber}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted-light, #8e9b8b)", textTransform: "uppercase", fontWeight: 600 }}>
                          Payment Method
                        </span>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink, #1f2c1d)", marginTop: "0.2rem" }}>
                          {confirmedOrder.paymentMethod === "Cash on Delivery"
                            ? "Cash on Delivery (Pay on arrival)"
                            : "UPI (Verified & Paid)"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #e2e8df", paddingBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted-light, #8e9b8b)", textTransform: "uppercase", fontWeight: 600 }}>
                          Order Total
                        </span>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--gold-hover, #b4832f)", marginTop: "0.2rem" }}>
                          ₹{Number(confirmedOrder.totalAmount).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted-light, #8e9b8b)", textTransform: "uppercase", fontWeight: 600 }}>
                          Status
                        </span>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#16a34a", marginTop: "0.2rem" }}>
                          {confirmedOrder.status} · {confirmedOrder.paymentStatus}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", color: "var(--muted-light, #8e9b8b)", textTransform: "uppercase", fontWeight: 600 }}>
                        Shipping Address
                      </span>
                      <div style={{ fontSize: "14px", color: "var(--ink, #1f2c1d)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                        {confirmedOrder.shippingAddress || fullShippingAddress}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", flexWrap: "wrap" }}>
                    <Link
                      href="/dashboard"
                      className="button button-dark"
                      style={{
                        padding: "0.9rem 1.8rem",
                        borderRadius: "var(--radius-pill, 9999px)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      View in Studio Dashboard <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/"
                      className="button button-cream"
                      style={{
                        padding: "0.9rem 1.8rem",
                        borderRadius: "var(--radius-pill, 9999px)",
                        textDecoration: "none",
                      }}
                    >
                      Return to Shop
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary (Visible on Address & Payment steps) */}
            {step !== "confirmation" && (
              <aside
                style={{
                  backgroundColor: "var(--white, #ffffff)",
                  border: "1px solid var(--line, #e3e7de)",
                  borderRadius: "var(--radius-lg, 20px)",
                  padding: "2rem",
                  position: "sticky",
                  top: "6rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", borderBottom: "1px solid var(--line, #e3e7de)", paddingBottom: "0.8rem" }}>
                  <h3 style={{ fontFamily: "var(--serif, serif)", fontSize: "1.25rem", color: "var(--ink, #1f2c1d)", margin: 0 }}>
                    Order Summary
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--muted, #5e6b5a)", fontWeight: 500 }}>
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.4rem", marginBottom: "1.5rem" }}>
                  {cart.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
                      <img
                        src={item.image || "/assets/candles1.png"}
                        alt={item.name}
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          border: "1px solid var(--line, #e3e7de)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "var(--ink, #1f2c1d)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink, #1f2c1d)", marginLeft: "0.5rem" }}>
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--muted, #5e6b5a)", margin: "0.2rem 0 0" }}>
                          Qty: {item.quantity} · {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: "1px solid var(--line, #e3e7de)", paddingTop: "1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted, #5e6b5a)" }}>
                    <span>Bag Subtotal</span>
                    <span style={{ fontWeight: 600, color: "var(--ink, #1f2c1d)" }}>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted, #5e6b5a)" }}>
                    <span>Studio Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>Complimentary</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <div style={{ fontSize: "12px", color: "var(--gold-hover, #b4832f)", fontWeight: 500 }}>
                      Add ₹{(1800 - subtotal).toLocaleString("en-IN")} more for free studio shipping.
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: "1px solid var(--line, #e3e7de)",
                      marginTop: "0.6rem",
                      paddingTop: "0.8rem",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "var(--ink, #1f2c1d)",
                    }}
                  >
                    <span>Total Amount</span>
                    <span style={{ color: "var(--gold-hover, #b4832f)" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Guarantees Box */}
                <div
                  style={{
                    marginTop: "1.8rem",
                    padding: "1.1rem",
                    borderRadius: "14px",
                    backgroundColor: "var(--paper-cream, #f4f3ec)",
                    border: "1px solid var(--line, #e3e7de)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.7rem",
                    fontSize: "12.5px",
                    color: "var(--muted, #5e6b5a)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <ShieldCheck size={16} style={{ color: "var(--gold, #c8973e)" }} />
                    <span>Pure Soy-Coconut Wax & Phthalate-free Oils</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Truck size={16} style={{ color: "var(--gold, #c8973e)" }} />
                    <span>Express dispatch across India within 24 hours</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Clock size={16} style={{ color: "var(--gold, #c8973e)" }} />
                    <span>Hassle-free replacement for any transit damage</span>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </main>

      {/* UPI Simulation / Live Modal */}
      {upiOrderData && (
        <UpiPaymentModal
          isOpen={upiModalOpen}
          orderNumber={upiOrderData.orderNumber}
          razorpayOrderId={upiOrderData.razorpayOrderId}
          amount={upiOrderData.amount}
          paymentExpiresAt={upiOrderData.paymentExpiresAt}
          customerName={upiOrderData.customerName}
          onSuccess={handlePaymentSuccess}
          onClose={() => setUpiModalOpen(false)}
        />
      )}

      {/* Studio Footer */}
      <Footer />
    </div>
  );
}
