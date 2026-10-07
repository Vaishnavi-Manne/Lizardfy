"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  Check,
  Flame,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [careModalOpen, setCareModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (sectionId: string, event: React.MouseEvent) => {
    if (pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        event.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      <footer className="luxury-footer" aria-label="Site Footer">
        {/* Subtle decorative gold light flare */}
        <div className="footer-glow-accent" aria-hidden="true" />

        {/* 1. Craft Pillars & Trust Strip */}
        <div className="footer-trust-strip">
          <div className="trust-pillar">
            <div className="trust-pillar-icon">
              <Sparkles size={18} />
            </div>
            <div className="trust-pillar-text">
              <strong>100% Soy Wax</strong>
              <span>Clean-burning coconut & soy</span>
            </div>
          </div>

          <div className="trust-pillar">
            <div className="trust-pillar-icon">
              <Flame size={18} />
            </div>
            <div className="trust-pillar-text">
              <strong>Small-Batch Poured</strong>
              <span>Slowly crafted by hand in India</span>
            </div>
          </div>

          <div className="trust-pillar">
            <div className="trust-pillar-icon">
              <ShieldCheck size={18} />
            </div>
            <div className="trust-pillar-text">
              <strong>Toxin-Free Fragrances</strong>
              <span>Phthalate-free botanical oils</span>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Body */}
        <div className="footer-main-container">
          {/* Brand & Studio Philosophy Column */}
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-brand-lockup">
              <img
                src="/assets/app_logo.jpg"
                alt="Lizardfy Logo"
                className="footer-brand-logo"
              />
              <div className="footer-brand-title">
                <span className="brand-name">lizardfy</span>
                <span className="brand-tag">STUDIO ATELIER</span>
              </div>
            </Link>

            <p className="footer-brand-motto">
              Light a little light.
              <br />
              <em>Make room for your moment.</em>
            </p>

            <div className="footer-studio-badge">
              <span className="pulsing-status-dot" aria-hidden="true" />
              <span>Bengaluru Studio Active · Poured to Order</span>
            </div>

            <div className="footer-social-row">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Follow Lizardfy on Instagram"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="mailto:hello@lizardfy.in"
                className="footer-social-link"
                aria-label="Email Lizardfy Studio"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://wa.me/919999999999?text=Hello%20Lizardfy%20Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="WhatsApp Studio Concierge"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Fragrances & Shop Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Fragrances</h4>
            <ul className="footer-nav-list">
              <li>
                <Link href="/products" className="footer-nav-item">
                  All Handcrafted Candles
                </Link>
              </li>
              <li>
                <Link
                  href="/#shop"
                  onClick={(e) => handleNavClick("shop", e)}
                  className="footer-nav-item"
                >
                  Featured Scents
                </Link>
              </li>
              <li>
                <Link
                  href="/#customize"
                  onClick={(e) => handleNavClick("customize", e)}
                  className="footer-nav-item footer-highlight-item"
                >
                  <Sparkles size={13} className="item-icon" />
                  Custom Candle Studio
                </Link>
              </li>
              <li>
                <Link href="/products" className="footer-nav-item">
                  Signature Amber Series
                </Link>
              </li>
              <li>
                <Link href="/products" className="footer-nav-item">
                  Ceramic Vessel Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio & Craft Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">The Atelier</h4>
            <ul className="footer-nav-list">
              <li>
                <Link
                  href="/#story"
                  onClick={(e) => handleNavClick("story", e)}
                  className="footer-nav-item"
                >
                  Our Slower Story
                </Link>
              </li>
              <li>
                <Link
                  href="/#bulk"
                  onClick={(e) => handleNavClick("bulk", e)}
                  className="footer-nav-item"
                >
                  Custom & Bulk Gifting
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCareModalOpen(true)}
                  className="footer-nav-button"
                >
                  <Flame size={13} className="item-icon" />
                  Candle Care Rituals
                </button>
              </li>
              <li>
                <Link
                  href="/#bulk"
                  onClick={(e) => handleNavClick("bulk", e)}
                  className="footer-nav-item"
                >
                  Wedding & Celebration Favours
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Client Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Concierge</h4>
            <ul className="footer-nav-list">
              <li>
                <Link href="/dashboard/orders" className="footer-nav-item">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="footer-nav-item">
                  Studio Member Portal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(true)}
                  className="footer-nav-button"
                >
                  FAQs & Delivery Times
                </button>
              </li>
              <li>
                <a href="mailto:hello@lizardfy.in" className="footer-nav-item">
                  hello@lizardfy.in
                </a>
              </li>
              <li>
                <Link href="/dashboard/admin" className="footer-nav-item footer-admin-link">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Circle Newsletter */}
          <div className="footer-col footer-col-newsletter">
            <h4 className="footer-col-title">Studio Circle</h4>
            <p className="footer-newsletter-desc">
              Subscribe for private batch releases, quiet reflections, and 10% off your inaugural pour.
            </p>

            {subscribed ? (
              <div className="footer-subscribe-success" role="alert">
                <Check size={16} />
                <span>You’re in the circle. Welcome to Lizardfy.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-subscribe-form">
                <div className="footer-input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    aria-label="Email address for Lizardfy Studio newsletter"
                  />
                  <button type="submit" aria-label="Join Studio Circle">
                    <ArrowRight size={16} />
                  </button>
                </div>
                <span className="footer-input-hint">
                  Slow emails only. No noise, unsubscribe anytime.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* 3. Bottom Legal, Payment & Locale Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <span>© 2026 Lizardfy Studio. All rights reserved.</span>
            <span className="footer-sep">·</span>
            <span>Crafted with intention in Bengaluru, India</span>
          </div>

          <div className="footer-bottom-center">
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-scroll-top-btn"
              aria-label="Scroll back to top of page"
            >
              Back to top
              <ArrowUp size={14} />
            </button>
          </div>

          <div className="footer-bottom-right">
            <div className="footer-payments-row" aria-label="Payment methods accepted">
              <span className="payment-pill">UPI</span>
              <span className="payment-pill">GPay</span>
              <span className="payment-pill">PhonePe</span>
              <span className="payment-pill">Cards</span>
              <span className="payment-pill">NetBanking</span>
            </div>
            <div className="footer-currency-tag">
              <span className="currency-flag">🇮🇳</span>
              <span>INR ₹</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Candle Care Rituals Modal */}
      {careModalOpen && (
        <div
          className="luxury-modal-backdrop"
          onClick={() => setCareModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="care-modal-title"
        >
          <div
            className="luxury-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-lockup">
                <Flame size={20} className="modal-icon" />
                <h3 id="care-modal-title">Candle Care & Burning Rituals</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCareModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="care-tip-card">
                <span className="tip-number">01</span>
                <div>
                  <h4>The Memory Burn (First Light)</h4>
                  <p>
                    On your first burn, allow the wax pool to reach the edges of the vessel (approx. 2-3 hours). This prevents tunneling and ensures an even, long burn life.
                  </p>
                </div>
              </div>
              <div className="care-tip-card">
                <span className="tip-number">02</span>
                <div>
                  <h4>Trim the Wick</h4>
                  <p>
                    Always trim your cotton wick to 1/4 inch (6mm) before lighting. This prevents carbon buildup, mushrooming, and soot.
                  </p>
                </div>
              </div>
              <div className="care-tip-card">
                <span className="tip-number">03</span>
                <div>
                  <h4>Vessel Repurposing</h4>
                  <p>
                    When 1/2 inch of wax remains, gently melt it with warm water, wipe clean, and repurpose the amber or ceramic vessel as a planter, brush holder, or keepsake.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Modal */}
      {faqModalOpen && (
        <div
          className="luxury-modal-backdrop"
          onClick={() => setFaqModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
        >
          <div
            className="luxury-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-lockup">
                <Sparkles size={20} className="modal-icon" />
                <h3 id="faq-modal-title">Frequently Asked Questions</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setFaqModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="faq-item">
                <h4>Where do you ship?</h4>
                <p>We ship safely across all pin codes in India. Metro orders typically arrive in 3-5 business days; rest of India in 5-7 business days.</p>
              </div>
              <div className="faq-item">
                <h4>What wax do you use?</h4>
                <p>100% pure coconut and soy waxes with zero paraffin or petroleum by-products. Non-toxic and safe around pets.</p>
              </div>
              <div className="faq-item">
                <h4>Can I order custom labels for weddings or events?</h4>
                <p>Yes! Explore our "Custom Candle Studio" or write to us at hello@lizardfy.in for custom branding, personalized messages, and bulk rates.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
