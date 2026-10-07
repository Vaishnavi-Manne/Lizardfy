"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  Flame,
  Heart,
  Minus,
  Plus,
  Search,
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [category, setCategory] = useState("All candles");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Featured");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedAlert, setAddedAlert] = useState<string | null>(null);

  // Load cart and favorites from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("lizardfy-cart") ?? "[]");
      if (Array.isArray(savedCart)) setCart(savedCart);

      const savedFavs = JSON.parse(localStorage.getItem("lizardfy-saved-candles") ?? "[]");
      if (Array.isArray(savedFavs)) setFavorites(savedFavs);
    } catch {
      // ignore parsing errors
    }

    // Fetch latest products from API
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  // Sync cart & favorites to localStorage
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

  const addToBag = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          details: `${product.scent} · 220g`,
          price: product.price,
          quantity,
          image: product.image,
        },
      ];
    });
    setAddedAlert(`${product.name} added to your bag`);
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

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = category === "All candles" || p.category === category;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.scent.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sort === "Price: low to high") return a.price - b.price;
        if (sort === "Price: high to low") return b.price - a.price;
        return 0;
      });
  }, [products, category, search, sort]);

  return (
    <div className="catalog-page-wrapper">
      <Navbar
        cartCount={count}
        onOpenCart={() => setCartOpen(true)}
        favoritesCount={favorites.length}
        activePath="/products"
        onSelectFavoriteFilter={() => {
          setCategory("All candles");
          document.querySelector(".catalog-toolbar")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Alert toast */}
      {addedAlert && (
        <div className="toast-notification">
          <Sparkles size={15} /> {addedAlert}
        </div>
      )}

      {/* Catalog Hero Banner */}
      <section className="catalog-hero">
        <div className="catalog-hero-inner section-wrap">
          <div className="catalog-hero-content">
            <span className="eyebrow light-eyebrow">
              <i /> The Fragrance Archive
            </span>
            <h1>
              Hand-poured vessels,
              <br />
              <em>enduring aromas.</em>
            </h1>
            <p>
              Formulated with 100% soy-based soy wax, organic botanical extracts, and natural cotton wicks.
              Discover fragrances tailored for unhurried evenings, quiet mornings, and warm gatherings.
            </p>
            <div className="catalog-hero-tags">
              <span className="hero-pill">
                <Sparkles size={13} /> Clean Botanical Oils
              </span>
              <span className="hero-pill">
                <Flame size={13} /> 50+ Hours Burn Time
              </span>
              <span className="hero-pill">
                <Heart size={13} /> Poured to Order
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Main Body */}
      <main className="catalog-main section-wrap">
        {/* Filter & Search Bar */}
        <div className="catalog-toolbar">
          <div className="category-tabs" role="group" aria-label="Filter candles by mood">
            {["All candles", "For unwinding", "For the home", "For gifting"].map((item) => (
              <button
                key={item}
                className={category === item ? "category-tab active" : "category-tab"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="catalog-search-sort">
            <label className="search-field">
              <Search size={15} />
              <input
                id="catalog-search"
                placeholder="Search notes or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)" }}
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <label className="sort-field">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>

        {/* Results Counter */}
        <div className="results-counter">
          <span>
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "candle" : "candles"}
          </span>
          {category !== "All candles" && (
            <button className="clear-filter-btn" onClick={() => setCategory("All candles")}>
              Reset filter ✕
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <article
              className="product-card"
              key={product.id}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="product-image-wrap">
                <img
                  src={product.image}
                  alt={`${product.name} luxury scented candle`}
                  loading="lazy"
                />

                {product.badge && <span className="product-badge">{product.badge}</span>}

                <button
                  className={favorites.includes(product.id) ? "save-button saved" : "save-button"}
                  aria-label={
                    favorites.includes(product.id)
                      ? `Remove ${product.name} from wishlist`
                      : `Save ${product.name} to wishlist`
                  }
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart size={16} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
                </button>

                <div className="card-hover-actions">
                  <button
                    className="quick-view-btn"
                    onClick={() => setSelectedProduct(product)}
                    title="Quick Details"
                  >
                    <Eye size={14} /> Quick View
                  </button>
                  <button
                    className="quick-add"
                    onClick={() => addToBag(product)}
                  >
                    <span>Add to Bag</span>
                    <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                  </button>
                </div>
              </div>

              <div className="product-info">
                <div>
                  <div className="product-title-row">
                    <span
                      className="scent-dot"
                      style={{ backgroundColor: product.color || "#c79658" }}
                      title={`Palette color: ${product.color}`}
                    />
                    <h3>{product.name}</h3>
                  </div>
                  <p className="product-scent">{product.scent}</p>
                </div>
                <div className="product-price-col">
                  <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                  <span className="product-burn">{product.burnTime || "50h burn"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-catalog-state">
            <Flame size={36} />
            <h3>No fragrances match your search</h3>
            <p>Try searching for different scent notes like "fig", "rose", "oat milk", or "vanilla".</p>
            <button
              className="button button-dark"
              onClick={() => {
                setCategory("All candles");
                setSearch("");
              }}
            >
              View all candles
            </button>
          </div>
        )}
      </main>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div
            className="quick-view-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="modal-content-grid">
              <div className="modal-image-col">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                {selectedProduct.badge && (
                  <span className="product-badge modal-badge">{selectedProduct.badge}</span>
                )}
              </div>

              <div className="modal-details-col">
                <span className="eyebrow">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <div className="modal-price-row">
                  <strong>₹{selectedProduct.price.toLocaleString("en-IN")}</strong>
                  <span className="modal-stock-badge">
                    <Check size={12} /> In stock · Poured in small batches
                  </span>
                </div>

                <p className="modal-description">{selectedProduct.description}</p>

                {selectedProduct.notes && (
                  <div className="fragrance-pyramid">
                    <h4>Fragrance Architecture</h4>
                    <div className="notes-grid">
                      <div className="note-card">
                        <span className="note-tier">Top Notes</span>
                        <p>{selectedProduct.notes.top}</p>
                      </div>
                      <div className="note-card">
                        <span className="note-tier">Heart Notes</span>
                        <p>{selectedProduct.notes.heart}</p>
                      </div>
                      <div className="note-card">
                        <span className="note-tier">Base Notes</span>
                        <p>{selectedProduct.notes.base}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-specs">
                  <div className="spec-item">
                    <span>Burn Time</span>
                    <strong>{selectedProduct.burnTime || "50+ hours"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Weight</span>
                    <strong>{selectedProduct.weight || "220g / 7.8 oz"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Vessel</span>
                    <strong>{selectedProduct.vessel || "Artisanal glass vessel"}</strong>
                  </div>
                </div>

                <div className="modal-action-row">
                  <button
                    className="button button-dark modal-add-btn"
                    onClick={() => {
                      addToBag(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    Add to Bag · ₹{selectedProduct.price.toLocaleString("en-IN")}
                  </button>
                  <button
                    className={
                      favorites.includes(selectedProduct.id)
                        ? "save-button-modal saved"
                        : "save-button-modal"
                    }
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    title="Add to Wishlist"
                  >
                    <Heart
                      size={18}
                      fill={favorites.includes(selectedProduct.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
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
                <h2>
                  Your bag <span>({count})</span>
                </h2>
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
                <p>Find a fragrance that feels like you.</p>
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
                        <strong>
                          ₹{(line.price * line.quantity).toLocaleString("en-IN")}
                        </strong>
                        <button
                          aria-label={`Remove ${line.name}`}
                          onClick={() =>
                            setCart((prev) => prev.filter((item) => item.id !== line.id))
                          }
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
                  <p>Hand-packed with sustainable honeycomb wrap & plantable paper.</p>
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
