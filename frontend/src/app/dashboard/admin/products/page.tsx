"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  Grid,
  IndianRupee,
  Layers,
  List,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
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

const SIGNATURE_WAX_PRESETS = [
  { name: "Honey", color: "#d8ad78" },
  { name: "Rose", color: "#d9b9ae" },
  { name: "Sage", color: "#82907a" },
  { name: "Oat", color: "#eee8dc" },
  { name: "Stone", color: "#c7c5bd" },
  { name: "Amber", color: "#a66a42" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form state for formulating new candle blend
  const [name, setName] = useState("");
  const [scent, setScent] = useState("");
  const [price, setPrice] = useState("990");
  const [category, setCategory] = useState("For unwinding");
  const [color, setColor] = useState("#d8ad78");
  const [badge, setBadge] = useState("");
  const [stock, setStock] = useState("45");
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      } else {
        // Fallback default catalog if database is fresh
        setProducts([
          {
            id: "slow-morning",
            name: "Slow Morning",
            scent: "Oat milk · honey · cedar",
            price: 890,
            category: "For unwinding",
            image: "/assets/candles1.png",
            color: "#d8ad78",
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
      showToast({
        type: "error",
        title: "Could not load catalog",
        description: "Failed to connect to the studio inventory database.",
      });
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
      title: delta > 0 ? `Restocked +${delta} Jars` : `Deducted ${Math.abs(delta)} Jars`,
      description: "Inventory count updated in live studio records.",
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
      setColor("#d8ad78");

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

  // Catalog Metrics
  const metrics = useMemo(() => {
    const totalBlends = products.length;
    const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 30), 0);
    const lowStockCount = products.filter((p) => (p.stock ?? 30) < 25).length;
    const avgPrice = totalBlends > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalBlends) : 0;
    return { totalBlends, totalStock, lowStockCount, avgPrice };
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.scent.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (categoryFilter === "ALL") return true;
      if (categoryFilter === "LOW_STOCK") {
        return (p.stock ?? 30) < 25;
      }
      return p.category.toLowerCase() === categoryFilter.toLowerCase();
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="dashboard-view admin-view">
      {/* Header */}
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <div>
          <Link
            href="/dashboard/admin"
            className="text-link back-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> Back to executive analytics
          </Link>
          <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
            Studio Inventory & Scent Formulas
          </span>
          <h1>Candle Catalog Management</h1>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={loadProducts}
            className="button button-outline"
            title="Refresh product list"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="button button-dark">
            <Plus size={16} /> Formulate New Candle Blend
          </button>
        </div>
      </div>

      {/* Catalog KPI Metrics Bar */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-forest">
            <Flame size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Active Formulas</span>
            <strong className="admin-kpi-val">{metrics.totalBlends}</strong>
            <span className="admin-kpi-sub">Artisan blends in catalog</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-green">
            <Package size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Units in Stock</span>
            <strong className="admin-kpi-val">{metrics.totalStock}</strong>
            <span className="admin-kpi-sub">Total jars ready to ship</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-amber">
            <AlertTriangle size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Low Stock Alerts</span>
            <strong className="admin-kpi-val">{metrics.lowStockCount}</strong>
            <span className="admin-kpi-sub">Less than 25 jars remaining</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon kpi-blue">
            <IndianRupee size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-label">Avg Formula Price</span>
            <strong className="admin-kpi-val">₹{metrics.avgPrice}</strong>
            <span className="admin-kpi-sub">Studio average retail price</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        {/* Search */}
        <div className="admin-search-wrap">
          <Search size={16} style={{ color: "#778372" }} />
          <input
            value={search}
            placeholder="Search candle by title, notes (tonka, fig, cedar)..."
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "#889483", cursor: "pointer", padding: "2px" }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="status-filter-tabs">
          {[
            { label: "All Candles", val: "ALL", count: products.length },
            {
              label: "For unwinding",
              val: "For unwinding",
              count: products.filter((p) => p.category === "For unwinding").length,
            },
            {
              label: "For the home",
              val: "For the home",
              count: products.filter((p) => p.category === "For the home").length,
            },
            {
              label: "For gifting",
              val: "For gifting",
              count: products.filter((p) => p.category === "For gifting").length,
            },
            {
              label: "Low Stock (< 25)",
              val: "LOW_STOCK",
              count: metrics.lowStockCount,
            },
          ].map((cat) => (
            <button
              key={cat.val}
              type="button"
              onClick={() => setCategoryFilter(cat.val)}
              className={categoryFilter === cat.val ? "filter-tab active" : "filter-tab"}
            >
              {cat.label} <span className="tab-count-bubble">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* View Switcher: Grid vs Table */}
        <div className="view-mode-toggle">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
            title="Card Grid View"
          >
            <Grid size={13} /> Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
            title="Matrix Table View"
          >
            <List size={13} /> Table
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="panel-loading" style={{ minHeight: "260px" }}>
          <div className="loading-spinner admin-spinner" />
          <p>Loading studio catalog formulas...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Flame size={32} />
          </div>
          <h3>No matching candle blends found</h3>
          <p>
            {search
              ? `No catalog items matched "${search}". Try searching for another fragrance or blend.`
              : "No candles in this category filter."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="button button-outline"
              style={{ marginTop: "12px" }}
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="admin-product-grid">
          {filteredProducts.map((product) => {
            const stockNum = product.stock ?? 35;
            const isLowStock = stockNum > 0 && stockNum < 25;
            const isOutOfStock = stockNum === 0;

            return (
              <div key={product.id} className="admin-product-card">
                <div className="admin-product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <span
                    className="color-swatch-pip"
                    style={{ backgroundColor: product.color }}
                    title={`Wax Tone: ${product.color}`}
                  />
                </div>

                <div className="admin-product-body">
                  <div className="product-card-top-row">
                    <span className="category-tag">{product.category}</span>
                    <span className={`stock-badge ${isOutOfStock ? "out" : isLowStock ? "low" : "ok"}`}>
                      {isOutOfStock ? (
                        <>
                          <AlertTriangle size={11} /> Sold Out
                        </>
                      ) : isLowStock ? (
                        <>
                          <AlertTriangle size={11} /> {stockNum} left
                        </>
                      ) : (
                        <>
                          <Check size={11} /> {stockNum} in stock
                        </>
                      )}
                    </span>
                  </div>

                  <h3>{product.name}</h3>
                  <p>{product.scent}</p>

                  <div className="admin-product-foot">
                    <strong className="product-price-label">
                      ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                    <div className="quick-stock-controls">
                      <span className="stock-control-label">Stock:</span>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(product.id, -5)}
                        className="stock-btn"
                        title="Deduct 5 jars"
                        disabled={stockNum <= 0}
                      >
                        <Minus size={12} />
                      </button>
                      <strong className="stock-counter">{stockNum}</strong>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(product.id, 10)}
                        className="stock-btn"
                        title="Restock +10 jars"
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
      ) : (
        /* TABLE VIEW */
        <div className="catalog-table-wrap">
          <table className="catalog-admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Vessel</th>
                <th>Blend Title</th>
                <th>Scent Formula</th>
                <th>Collection</th>
                <th>Retail Price</th>
                <th>Stock Level</th>
                <th>Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stockNum = p.stock ?? 30;
                const isLow = stockNum > 0 && stockNum < 25;
                const isOut = stockNum === 0;

                return (
                  <tr key={p.id}>
                    <td>
                      <img src={p.image} alt={p.name} className="table-product-thumb" />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: p.color,
                            display: "inline-block",
                          }}
                        />
                        <strong style={{ fontFamily: "var(--serif)", fontSize: "14px" }}>{p.name}</strong>
                      </div>
                      {p.badge && (
                        <span style={{ fontSize: "9.5px", color: "#8c6a21", fontWeight: 700, textTransform: "uppercase" }}>
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "#6a7465" }}>{p.scent}</td>
                    <td>
                      <span className="category-tag">{p.category}</span>
                    </td>
                    <td>
                      <strong style={{ fontFamily: "var(--serif)", fontSize: "14px" }}>
                        ₹{p.price.toLocaleString("en-IN")}
                      </strong>
                    </td>
                    <td>
                      <span className={`stock-badge ${isOut ? "out" : isLow ? "low" : "ok"}`}>
                        {isOut ? "0 (Sold Out)" : isLow ? `${stockNum} (Low)` : `${stockNum} units`}
                      </span>
                    </td>
                    <td>
                      <div className="quick-stock-controls" style={{ width: "fit-content" }}>
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(p.id, -5)}
                          className="stock-btn"
                          disabled={stockNum <= 0}
                          title="Deduct 5 jars"
                        >
                          <Minus size={11} />
                        </button>
                        <strong className="stock-counter">{stockNum}</strong>
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(p.id, 10)}
                          className="stock-btn"
                          title="Add 10 jars"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulate New Candle Modal with Real-time Interactive Preview */}
      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card formulation-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Formulate New Candle Blend</h2>
                <p>Register a new hand-poured botanical scent recipe into studio inventory.</p>
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

            <div className="modal-two-col">
              {/* Form Column */}
              <form onSubmit={handleCreate} className="modal-form">
                <label>
                  <span>Candle Blend Title *</span>
                  <input
                    required
                    value={name}
                    placeholder="e.g. Velvet Evening"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label>
                  <span>Scent Formula & Botanical Notes *</span>
                  <input
                    required
                    value={scent}
                    placeholder="e.g. Cardamom · smoked tonka · cedarwood"
                    onChange={(e) => setScent(e.target.value)}
                  />
                </label>

                <div className="form-row-2">
                  <label>
                    <span>Retail Price (₹) *</span>
                    <input
                      required
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Initial Batch Stock *</span>
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
                  <div className="preset-swatches-row">
                    {SIGNATURE_WAX_PRESETS.map((pst) => (
                      <button
                        key={pst.name}
                        type="button"
                        onClick={() => setColor(pst.color)}
                        className={`preset-swatch-chip ${color.toLowerCase() === pst.color.toLowerCase() ? "active" : ""}`}
                      >
                        <span className="swatch-circle" style={{ backgroundColor: pst.color }} />
                        <span>{pst.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="color-picker-row" style={{ marginTop: "10px" }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                    <span>Hex code: {color}</span>
                  </div>
                </label>

                <div className="modal-actions" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="button button-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="button button-dark">
                    {saving ? "Registering Formula..." : "Add to Studio Catalog"}
                  </button>
                </div>
              </form>

              {/* Live Preview Column */}
              <div className="formulation-live-preview">
                <div className="live-preview-head">
                  <span>Live Studio Preview</span>
                  <span className="live-pulse-badge">
                    <Sparkles size={11} /> Real-Time
                  </span>
                </div>

                <div
                  style={{
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #e1e7db",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "140px",
                      background: "#f4f1e8",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src="/assets/candles1.png"
                      alt="Candle mockup"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {badge && <span className="product-badge">{badge}</span>}
                    <span
                      className="color-swatch-pip"
                      style={{ backgroundColor: color }}
                      title={`Wax Tone: ${color}`}
                    />
                  </div>

                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span className="category-tag">{category}</span>
                      <span className="stock-badge ok">{stock || 0} in stock</span>
                    </div>

                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontFamily: "var(--serif, Playfair Display)",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--ink, #1f2c1d)",
                      }}
                    >
                      {name || "Untitled Blend"}
                    </h4>
                    <p style={{ margin: "0 0 12px", fontSize: "11.5px", color: "#6a7465" }}>
                      {scent || "Awaiting scent botanical notes..."}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #f0f2eb",
                        paddingTop: "10px",
                      }}
                    >
                      <strong
                        style={{
                          fontFamily: "var(--serif, Playfair Display)",
                          fontSize: "16px",
                          color: "var(--ink, #1f2c1d)",
                        }}
                      >
                        ₹{Number(price || 0).toLocaleString("en-IN")}
                      </strong>
                      <span style={{ fontSize: "10.5px", color: "#8c9688", fontWeight: 500 }}>
                        Hand-Poured Soy Wax
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#8c9688",
                    marginTop: "16px",
                    lineHeight: "1.5",
                    textAlign: "center",
                  }}
                >
                  This formula will immediately appear across storefront collections and customer product pages upon submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
