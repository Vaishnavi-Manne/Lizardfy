"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Flame,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface Product {
  id: string;
  name: string;
  scent: string;
  price: number;
  category: string;
  image: string;
  color: string;
  badge?: string;
  stock?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form state for adding candle
  const [name, setName] = useState("");
  const [scent, setScent] = useState("");
  const [price, setPrice] = useState("990");
  const [category, setCategory] = useState("For unwinding");
  const [color, setColor] = useState("#d8a46d");
  const [badge, setBadge] = useState("");
  const [stock, setStock] = useState("45");
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  async function loadProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      } else {
        // Fallback default catalog
        setProducts([
          {
            id: "slow-morning",
            name: "Slow Morning",
            scent: "Oat milk · honey · cedar",
            price: 890,
            category: "For unwinding",
            image: "/assets/candles1.png",
            color: "#d8a46d",
            badge: "Bestseller",
            stock: 45,
          },
          {
            id: "fig-and-fern",
            name: "Fig & Fern",
            scent: "Green fig · moss · vetiver",
            price: 990,
            category: "For the home",
            image: "/assets/candles2.png",
            color: "#66755a",
            badge: "New",
            stock: 30,
          },
          {
            id: "rose-hour",
            name: "Rose Hour",
            scent: "Damask rose · pink pepper",
            price: 890,
            category: "For gifting",
            image: "/assets/candles3.png",
            color: "#bc7169",
            stock: 24,
          },
          {
            id: "after-rain",
            name: "After Rain",
            scent: "Petrichor · eucalyptus · oak",
            price: 1090,
            category: "For unwinding",
            image: "/assets/candles4.png",
            color: "#799493",
            badge: "Small batch",
            stock: 18,
          },
        ]);
      }
    } catch (err) {
      console.error("Products load error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockAdjust = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stock ?? 30;
          const updated = Math.max(0, current + delta);
          return { ...p, stock: updated };
        }
        return p;
      }),
    );

    showToast({
      type: "success",
      title: "Inventory Adjusted",
      description: `Stock quantity updated for selected candle.`,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      scent,
      price: Number(price),
      category,
      color,
      badge: badge || undefined,
      stock: Number(stock),
      image: "/assets/candles1.png",
    };

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      }).catch(() => null);

      setProducts((prev) => [...prev, newProd]);
      setShowModal(false);
      setName("");
      setScent("");
      setPrice("990");
      setBadge("");
      setStock("45");

      showToast({
        type: "success",
        title: "Candle Blend Added to Catalog",
        description: `"${newProd.name}" is now live in the studio inventory.`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Failed to add product",
        description: "Please check your parameters and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) || p.scent.toLowerCase().includes(q);

    if (categoryFilter === "ALL") return matchesSearch;
    if (categoryFilter === "LOW_STOCK") {
      return matchesSearch && (p.stock ?? 30) < 25;
    }
    return matchesSearch && p.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="dashboard-view admin-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard/admin" className="text-link back-link">
            <ArrowLeft size={14} /> Back to executive analytics
          </Link>
          <span className="eyebrow">Studio Inventory & Scent Formulas</span>
          <h1>Candle Catalog Management</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="button button-dark">
          <Plus size={16} /> Add new candle blend
        </button>
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar" style={{ marginTop: "16px", marginBottom: "26px" }}>
        <div className="search-field admin-search">
          <Search size={16} />
          <input
            value={search}
            placeholder="Search by candle blend, scent notes..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter-tabs">
          {[
            { label: "All Candles", val: "ALL" },
            { label: "For unwinding", val: "For unwinding" },
            { label: "For the home", val: "For the home" },
            { label: "For gifting", val: "For gifting" },
            { label: "Low Stock (< 25)", val: "LOW_STOCK" },
          ].map((cat) => (
            <button
              key={cat.val}
              type="button"
              onClick={() => setCategoryFilter(cat.val)}
              className={categoryFilter === cat.val ? "filter-tab active" : "filter-tab"}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="loading-spinner admin-spinner" />
          <p>Loading studio catalog formulas...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Flame size={32} />
          </div>
          <h3>No matching candle blends found</h3>
          <p>Try searching for a different botanical note or resetting the category filter.</p>
        </div>
      ) : (
        <div className="admin-product-grid">
          {filteredProducts.map((product) => {
            const stockNum = product.stock ?? 35;
            const isLowStock = stockNum < 25;
            return (
              <div key={product.id} className="admin-product-card">
                <div className="admin-product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <span
                    className="color-swatch-pip"
                    style={{ backgroundColor: product.color }}
                    title={`Wax tone: ${product.color}`}
                  />
                </div>
                <div className="admin-product-body">
                  <div className="product-card-top-row">
                    <span className="category-tag">{product.category}</span>
                    <span className={`stock-badge ${isLowStock ? "low" : "ok"}`}>
                      {isLowStock ? <AlertTriangle size={11} /> : <Check size={11} />}
                      {stockNum} left
                    </span>
                  </div>

                  <h3>{product.name}</h3>
                  <p>{product.scent}</p>

                  <div className="admin-product-foot">
                    <strong className="product-price-label">
                      ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                    <div className="quick-stock-controls">
                      <span className="stock-control-label">Inventory:</span>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(product.id, -5)}
                        className="stock-btn"
                        title="Deduct 5 jars"
                      >
                        <Minus size={12} />
                      </button>
                      <strong className="stock-counter">{stockNum}</strong>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(product.id, 10)}
                        className="stock-btn"
                        title="Add 10 jars"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Candle Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card product-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Formulate New Candle Blend</h2>
                <p>Register a new botanical scent recipe into the studio inventory.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="icon-button"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <label>
                <span>Candle Blend Title</span>
                <input
                  required
                  value={name}
                  placeholder="e.g. Velvet Evening"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                <span>Scent Formula & Botanical Notes</span>
                <input
                  required
                  value={scent}
                  placeholder="e.g. Cardamom · tonka · amber · smoked cedar"
                  onChange={(e) => setScent(e.target.value)}
                />
              </label>

              <div className="form-row-2">
                <label>
                  <span>Retail Price (₹)</span>
                  <input
                    required
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <label>
                  <span>Initial Batch Stock</span>
                  <input
                    required
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Collection Category</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>For unwinding</option>
                    <option>For the home</option>
                    <option>For gifting</option>
                  </select>
                </label>
                <label>
                  <span>Artisan Badge (Optional)</span>
                  <input
                    value={badge}
                    placeholder="e.g. Limited Edition"
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Wax Tint / Vessel Tone</span>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <div
                    className="swatch-preview-square"
                    style={{ backgroundColor: color }}
                  />
                  <span>{color} (Simulated wax tone)</span>
                </div>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="button button-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="button button-dark">
                  {saving ? "Saving Formula..." : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
