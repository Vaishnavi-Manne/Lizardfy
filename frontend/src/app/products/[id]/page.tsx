"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Flame,
  Heart,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ALL_PRODUCTS, Product } from "@/lib/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type CartLine = {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("lizardfy-cart") ?? "[]");
      if (Array.isArray(savedCart)) setCart(savedCart);

      const savedFavs = JSON.parse(localStorage.getItem("lizardfy-saved-candles") ?? "[]");
      if (Array.isArray(savedFavs)) setFavorites(savedFavs);
    } catch {
      // ignore parsing error
    }

    // Find in static list or fetch from API
    const match = ALL_PRODUCTS.find((p) => p.id === productId);
    if (match) {
      setProduct(match);
      setLoading(false);
    } else {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            const found = data.products.find((p: Product) => p.id === productId);
            if (found) setProduct(found);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  useEffect(() => {
    localStorage.setItem("lizardfy-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("lizardfy-saved-candles", JSON.stringify(favorites));
  }, [favorites]);

  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce((total, line) => total + line.price * line.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToBag = (prod: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.id === prod.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          details: `${prod.scent} · 220g`,
          price: prod.price,
          quantity: qty,
          image: prod.image,
        },
      ];
    });
    setAddedAlert(`${prod.name} added to your bag`);
    setTimeout(() => setAddedAlert(null), 3200);
    setCartOpen(true);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  if (loading) {
    return (
      <div className="single-product-loading">
        <Flame size={32} className="spin-flame" />
        <p>Retrieving vessel details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="single-product-not-found section-wrap">
        <h2>Candle not found</h2>
        <p>The fragrance you are looking for may have retired into our seasonal archive.</p>
        <Link href="/products" className="button button-dark">
          Explore all candles
        </Link>
      </div>
    );
  }

  const related = ALL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="single-product-wrapper">
      <Navbar
        cartCount={count}
        onOpenCart={() => setCartOpen(true)}
        favoritesCount={favorites.length}
        activePath="/products"
      />

      {/* Toast Alert */}
      {addedAlert && (
        <div className="toast-notification">
          <Sparkles size={15} /> {addedAlert}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-strip section-wrap">
        <Link href="/" className="breadcrumb-link">Home</Link>
        <span>/</span>
        <Link href="/products" className="breadcrumb-link">All Candles</Link>
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* Product Detail Stage */}
      <main className="product-detail-stage section-wrap">
        <div className="detail-media-column">
          <div className="detail-hero-image-wrap">
            <img src={product.image} alt={product.name} />
            {product.badge && <span className="product-badge detail-badge">{product.badge}</span>}
            <button
              className={favorites.includes(product.id) ? "save-button saved" : "save-button"}
              onClick={() => toggleFavorite(product.id)}
              aria-label="Save to favorites"
            >
              <Heart size={18} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="detail-highlights-grid">
            <div className="highlight-item">
              <Sparkles size={16} />
              <div>
                <strong>100% Soy Wax</strong>
                <span>Clean, non-toxic burn</span>
              </div>
            </div>
            <div className="highlight-item">
              <Flame size={16} />
              <div>
                <strong>{product.burnTime}</strong>
                <span>Slow aromatic diffusion</span>
              </div>
            </div>
            <div className="highlight-item">
              <Package size={16} />
              <div>
                <strong>Eco Packaging</strong>
                <span>Recycled honeycomb wrap</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-info-column">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-scent-lead">{product.scent}</p>

          <div className="detail-price-row">
            <strong className="detail-price">₹{product.price.toLocaleString("en-IN")}</strong>
            <span className="detail-tax-note">Taxes included · Free shipping over ₹1,800</span>
          </div>

          <p className="detail-description">{product.description}</p>

          {/* Fragrance Architecture Pyramid */}
          {product.notes && (
            <div className="fragrance-pyramid">
              <h4>Fragrance Architecture</h4>
              <div className="notes-grid">
                <div className="note-card">
                  <span className="note-tier">Top Notes</span>
                  <p>{product.notes.top}</p>
                </div>
                <div className="note-card">
                  <span className="note-tier">Heart Notes</span>
                  <p>{product.notes.heart}</p>
                </div>
                <div className="note-card">
                  <span className="note-tier">Base Notes</span>
                  <p>{product.notes.base}</p>
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="detail-specs-table">
            <div className="spec-row">
              <span>Approx. Burn Time</span>
              <strong>{product.burnTime}</strong>
            </div>
            <div className="spec-row">
              <span>Net Wax Weight</span>
              <strong>{product.weight}</strong>
            </div>
            <div className="spec-row">
              <span>Vessel Type</span>
              <strong>{product.vessel}</strong>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="detail-purchase-row">
            <div className="detail-qty-control">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className="button button-dark detail-add-button"
              onClick={() => addToBag(product, quantity)}
            >
              <span>Add to Bag · ₹{(product.price * quantity).toLocaleString("en-IN")}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Bespoke customization link */}
          <div className="customize-promo-box">
            <div>
              <strong>Looking for a personalized touch?</strong>
              <p>Add a custom engraved message or select bespoke wax shades in our Studio.</p>
            </div>
            <Link href="/#customize" className="button button-cream button-sm">
              Custom Studio ↗
            </Link>
          </div>
        </div>
      </main>

      {/* Related candles section */}
      <section className="related-candles-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Complementary Aromas</span>
            <h2>You might also <em>enjoy.</em></h2>
          </div>
          <Link href="/products" className="text-link">
            Explore all candles <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid" style={{ marginTop: "32px" }}>
          {related.map((rel) => (
            <article className="product-card" key={rel.id}>
              <div className="product-image-wrap">
                <img src={rel.image} alt={rel.name} />
                {rel.badge && <span className="product-badge">{rel.badge}</span>}
                <button
                  className="quick-add"
                  onClick={() => addToBag(rel, 1)}
                >
                  <span>Add to Bag</span>
                  <strong>₹{rel.price.toLocaleString("en-IN")}</strong>
                </button>
              </div>
              <div className="product-info">
                <div>
                  <h3>{rel.name}</h3>
                  <p className="product-scent">{rel.scent}</p>
                </div>
                <strong>₹{rel.price.toLocaleString("en-IN")}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cart Drawer */}
      {cartOpen && (
        <div
          className="drawer-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCartOpen(false);
          }}
        >
          <aside className="cart-drawer" aria-label="Shopping bag">
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">A little something for you</span>
                <h2>Your bag <span>({count})</span></h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close bag"
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={28} />
                <h3>Your bag is taking a pause.</h3>
                <button className="button button-dark" onClick={() => setCartOpen(false)}>
                  Explore candles <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="cart-lines">
                  {cart.map((line) => (
                    <div className="cart-line" key={line.id}>
                      {line.image ? (
                        <img src={line.image} alt={line.name} />
                      ) : (
                        <div className="cart-mini-candle">
                          <span />
                        </div>
                      )}
                      <div className="cart-line-info">
                        <h3>{line.name}</h3>
                        <p>{line.details}</p>
                        <div className="quantity-control">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => changeQuantity(line.id, -1)}
                          >
                            <Minus size={13} />
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => changeQuantity(line.id, 1)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-price">
                        <strong>₹{(line.price * line.quantity).toLocaleString("en-IN")}</strong>
                        <button
                          aria-label={`Remove ${line.name}`}
                          onClick={() => setCart((prev) => prev.filter((item) => item.id !== line.id))}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shipping-note">
                  <span>
                    <Check size={14} />{" "}
                    {subtotal >= 1800
                      ? "You've earned complimentary studio shipping!"
                      : `Add ₹${(1800 - subtotal).toLocaleString("en-IN")} more for free shipping.`}
                  </span>
                  <div>
                    <i
                      style={{
                        width: `${Math.min((subtotal / 1800) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span>Studio Shipping</span>
                    <span>{subtotal >= 1800 ? "Free" : "₹120"}</span>
                  </div>
                  <div className="cart-total">
                    <span>Estimated total</span>
                    <strong>
                      ₹{(subtotal + (subtotal >= 1800 ? 0 : 120)).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="button button-dark checkout-button"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
