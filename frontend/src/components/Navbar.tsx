"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  ArrowRight,
  Flame,
} from "lucide-react";
import { ALL_PRODUCTS, Product } from "../lib/products";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount?: number;
  activePath?: string;
  onSelectFavoriteFilter?: () => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  favoritesCount = 0,
  activePath = "/",
  onSelectFavoriteFilter,
}: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Announcement bar carousel
  const announcements = [
    "Complimentary studio shipping on orders over $75",
    "Hand-poured with 100% clean coconut-soy wax & cotton wicks",
    "Seasonal Release: Spiced Blood Orange & Fireside Hearth",
  ];
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Check scroll state for glassmorphism elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logged in user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Filtered search results
  const searchResults: Product[] = searchQuery.trim()
    ? ALL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.scent.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.notes?.top.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.notes?.heart.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_PRODUCTS.slice(0, 4);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#") && window.location.pathname === "/") {
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement">
        <span className="announcement-star">✦</span>
        <span className="announcement-text" key={announcementIdx}>
          {announcements[announcementIdx]}
        </span>
        <span className="announcement-star">✦</span>
      </div>

      {/* Main Luxury Navigation Bar */}
      <header className={`site-header ${isScrolled ? "header-scrolled" : ""}`}>
        {/* Mobile Hamburger */}
        <button
          className="icon-button mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand Wordmark & Logo */}
        <Link href="/" className="wordmark" aria-label="Lizardfy Home">
          <img
            src="/assets/app_logo_cutout.png"
            alt="Lizardfy Candle Studio"
            className="brand-logo"
          />
          <div className="brand-text-block">
            <span className="brand-name">lizardfy</span>
            <span className="brand-sub">STUDIO</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="main-nav desktop-only" aria-label="Main navigation">
          <Link
            href="/products"
            className={`nav-link ${activePath === "/products" ? "active-nav" : ""}`}
          >
            <span>Shop All</span>
            <span className="nav-badge">7 Vessels</span>
          </Link>
          <a
            href="/#customize"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                handleNavClick("/#customize");
              }
            }}
            className="nav-link"
          >
            <span>Make It Yours</span>
          </a>
          <Link href="/our-story" className="nav-link">
            <span>Our Story</span>
          </Link>
          <a
            href="/#bulk"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                handleNavClick("/#bulk");
              }
            }}
            className="nav-link"
          >
            <span>Gatherings & Gifts</span>
          </a>
        </nav>

        {/* Action Suite (Search, Favorites, Account, Bag) */}
        <div className="header-actions">
          {/* Spotlight Search Trigger */}
          <button
            className="icon-button search-trigger"
            aria-label="Search collection (Ctrl+K)"
            title="Search fragrances (Ctrl+K)"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} />
          </button>

          {/* Favorites Heart */}
          <button
            className="icon-button favorite-trigger"
            aria-label={`Saved candles (${favoritesCount})`}
            title={
              favoritesCount > 0
                ? `${favoritesCount} candle${favoritesCount > 1 ? "s" : ""} saved`
                : "Saved candles"
            }
            onClick={() => {
              if (onSelectFavoriteFilter) {
                onSelectFavoriteFilter();
              } else {
                router.push("/products");
              }
            }}
          >
            <Heart
              size={18}
              className={favoritesCount > 0 ? "heart-active" : ""}
            />
            {favoritesCount > 0 && (
              <span className="favorite-badge">{favoritesCount}</span>
            )}
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <Link
              href={
                currentUser.role === "ADMIN"
                  ? "/dashboard/admin"
                  : "/dashboard"
              }
              className="user-auth-btn"
              title="Open your studio account"
            >
              <User size={13} />
              <span>
                {currentUser.role === "ADMIN"
                  ? "Admin"
                  : currentUser.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="user-auth-btn"
              title="Sign in or register"
            >
              <User size={13} />
              <span>Sign in</span>
            </Link>
          )}

          {/* Shopping Bag Button */}
          <button
            className="bag-button"
            onClick={onOpenCart}
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag size={17} />
            <span className="bag-label">Bag</span>
            <b className={`bag-count-pill ${cartCount > 0 ? "has-items" : ""}`}>
              {cartCount}
            </b>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className="mobile-nav-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-nav-header">
            <div className="wordmark">
              <img
                src="/assets/app_logo_cutout.png"
                alt="Lizardfy"
                className="brand-logo"
              />
              <span className="brand-name">lizardfy</span>
            </div>
            <button
              className="icon-button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-search-strip">
            <button
              className="mobile-search-btn"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={16} />
              <span>Search scents, notes, burn times...</span>
              <kbd>⌘K</kbd>
            </button>
          </div>

          <nav className="mobile-nav-links">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`mobile-link ${activePath === "/" ? "active" : ""}`}
            >
              <span>Home</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className={`mobile-link ${activePath === "/products" ? "active" : ""}`}
            >
              <div>
                <span>Shop All Candles</span>
                <small className="mobile-link-desc">All 7 handcrafted clean-burning vessels</small>
              </div>
              <ArrowRight size={15} />
            </Link>
            <a
              href="/#customize"
              onClick={() => handleNavClick("/#customize")}
              className="mobile-link"
            >
              <div>
                <span>Bespoke Candle Studio</span>
                <small className="mobile-link-desc">Choose your vessel, wax color & custom label</small>
              </div>
              <ArrowRight size={15} />
            </a>
            <Link
              href="/our-story"
              onClick={() => setMobileOpen(false)}
              className="mobile-link"
            >
              <span>Our Story</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href="/#bulk"
              onClick={() => handleNavClick("/#bulk")}
              className="mobile-link"
            >
              <span>Gatherings & Gifts</span>
              <ArrowRight size={15} />
            </a>
          </nav>

          <div className="mobile-nav-footer">
            {currentUser ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="button button-dark mobile-auth-action"
              >
                <User size={16} /> My Studio Account ({currentUser.name})
              </Link>
            ) : (
              <div className="mobile-auth-grid">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="button button-cream"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="button button-dark"
                >
                  Create Account
                </Link>
              </div>
            )}
            <div className="mobile-nav-meta">
              <span>✦ Clean coconut-soy wax</span>
              <span>✦ Poured to order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      {searchOpen && (
        <div
          className="search-modal-backdrop"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="search-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-modal-input-wrap">
              <Search size={20} className="search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by scent (cedar, rose, vanilla) or candle name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-modal-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear query"
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="search-esc-badge" onClick={() => setSearchOpen(false)}>
                ESC
              </kbd>
            </div>

            <div className="search-results-list">
              <div className="search-results-header">
                <span>
                  {searchQuery ? `Matching Candles (${searchResults.length})` : "Featured Fragrances"}
                </span>
                <Link
                  href="/products"
                  onClick={() => setSearchOpen(false)}
                  className="search-view-all"
                >
                  View full catalog <ArrowRight size={13} />
                </Link>
              </div>

              {searchResults.length === 0 ? (
                <div className="search-empty-state">
                  <Flame size={28} />
                  <p>No candles matching &ldquo;{searchQuery}&rdquo;</p>
                  <small>Try searching for notes like <em>fig</em>, <em>amber</em>, <em>citrus</em>, or <em>linen</em>.</small>
                </div>
              ) : (
                searchResults.map((candle) => (
                  <Link
                    key={candle.id}
                    href={`/products/${candle.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="search-result-item"
                  >
                    <img
                      src={candle.image}
                      alt={candle.name}
                      className="search-result-thumb"
                    />
                    <div className="search-result-info">
                      <div className="search-result-title-row">
                        <h4>{candle.name}</h4>
                        <span className="search-result-price">₹{candle.price}</span>
                      </div>
                      <p className="search-result-scent">{candle.scent}</p>
                      <div className="search-result-tags">
                        <span className="search-tag">{candle.category}</span>
                        <span className="search-tag">{candle.burnTime}</span>
                        {candle.badge && (
                          <span className="search-tag highlight">{candle.badge}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={16} className="search-result-arrow" />
                  </Link>
                ))
              )}
            </div>

            <div className="search-modal-footer">
              <span>Pro Tip: Press <kbd>ESC</kbd> to close anytime</span>
              <Link
                href="/products"
                onClick={() => setSearchOpen(false)}
                className="search-catalog-link"
              >
                Browse all 7 candles →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
