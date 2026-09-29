"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Plus } from "lucide-react";

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

  // Form state for adding candle
  const [name, setName] = useState("");
  const [scent, setScent] = useState("");
  const [price, setPrice] = useState("990");
  const [category, setCategory] = useState("For unwinding");
  const [color, setColor] = useState("#d8a46d");
  const [badge, setBadge] = useState("");
  const [stock, setStock] = useState("50");
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error("Products load error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          scent,
          price: Number(price),
          category,
          color,
          badge: badge || undefined,
          stock: Number(stock),
          image: "/assets/candles1.png",
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setScent("");
        setPrice("990");
        setBadge("");
        loadProducts();
      }
    } catch (err) {
      console.error("Failed to add product", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-view admin-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard/admin" className="text-link back-link">
            <ArrowLeft size={14} /> Back to analytics
          </Link>
          <span className="eyebrow">Studio Inventory & Formulas</span>
          <h1>Candle Catalog Management</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="button button-dark">
          <Plus size={16} /> Add new candle
        </button>
      </div>

      {loading ? (
        <div className="panel-loading">Loading studio catalog...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Flame size={32} />
          <h3>No candles in database</h3>
          <p>Add your first signature fragrance blend to the catalog.</p>
          <button onClick={() => setShowModal(true)} className="button button-dark">
            <Plus size={16} /> Add candle
          </button>
        </div>
      ) : (
        <div className="admin-product-grid">
          {products.map((product) => (
            <div key={product.id} className="admin-product-card">
              <div className="admin-product-image">
                <img src={product.image} alt={product.name} />
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <span className="color-swatch-pip" style={{ backgroundColor: product.color }} />
              </div>
              <div className="admin-product-body">
                <span className="category-tag">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.scent}</p>
                <div className="admin-product-foot">
                  <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                  <span className="stock-pill">{product.stock ?? 40} in stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Candle Scent</h2>
              <button onClick={() => setShowModal(false)} className="icon-button">
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <label>
                <span>Candle Name</span>
                <input
                  required
                  value={name}
                  placeholder="e.g. Velvet Evening"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                <span>Scent Notes</span>
                <input
                  required
                  value={scent}
                  placeholder="e.g. Cardamom · amber · vanilla"
                  onChange={(e) => setScent(e.target.value)}
                />
              </label>

              <div className="form-row-2">
                <label>
                  <span>Price (₹)</span>
                  <input
                    required
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <label>
                  <span>Stock Quantity</span>
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
                  <span>Category</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>For unwinding</option>
                    <option>For the home</option>
                    <option>For gifting</option>
                  </select>
                </label>
                <label>
                  <span>Badge (Optional)</span>
                  <input
                    value={badge}
                    placeholder="e.g. Limited Edition"
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Wax Tone Color (Hex)</span>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span>{color}</span>
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
                  {saving ? "Saving..." : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
