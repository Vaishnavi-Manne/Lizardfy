"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Plus, Trash2 } from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAddresses() {
    try {
      const res = await fetch("/api/user/addresses");
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (err) {
      console.error("Addresses load error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          street,
          city,
          state,
          pinCode,
          isDefault,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFullName("");
        setStreet("");
        setCity("");
        setState("");
        setPinCode("");
        setIsDefault(false);
        loadAddresses();
      }
    } catch (err) {
      console.error("Failed to add address", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <Link href="/dashboard" className="text-link back-link">
            <ArrowLeft size={14} /> Back to overview
          </Link>
          <span className="eyebrow">Shipping Preferences</span>
          <h1>Saved Addresses</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="button button-dark">
          <Plus size={16} /> Add new address
        </button>
      </div>

      {loading ? (
        <div className="panel-loading">Loading saved addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="empty-state">
          <MapPin size={32} />
          <h3>No addresses saved yet</h3>
          <p>Add your default delivery address to speed up candle checkouts.</p>
          <button onClick={() => setShowModal(true)} className="button button-dark">
            <Plus size={16} /> Add address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              <div className="address-card-header">
                <div>
                  <h3>{address.fullName}</h3>
                  <span className="address-phone">{address.phone}</span>
                </div>
                {address.isDefault && (
                  <span className="default-address-pill">
                    <Check size={12} /> Default
                  </span>
                )}
              </div>
              <p className="address-body">
                {address.street}
                <br />
                {address.city}, {address.state} - {address.pinCode}
              </p>
              <div className="address-card-actions">
                <button
                  onClick={() => handleDelete(address.id)}
                  className="address-delete-btn"
                  title="Remove address"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Delivery Address</h2>
              <button onClick={() => setShowModal(false)} className="icon-button">
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <label>
                <span>Full Name</span>
                <input
                  required
                  value={fullName}
                  placeholder="Maya Sharma"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>

              <label>
                <span>Phone Number</span>
                <input
                  required
                  value={phone}
                  placeholder="+91 98765 43210"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="grid-span-2">
                <span>Street Address</span>
                <input
                  required
                  value={street}
                  placeholder="Flat/House number, building name, road"
                  onChange={(e) => setStreet(e.target.value)}
                />
              </label>

              <div className="form-row-3">
                <label>
                  <span>City</span>
                  <input
                    required
                    value={city}
                    placeholder="Bengaluru"
                    onChange={(e) => setCity(e.target.value)}
                  />
                </label>
                <label>
                  <span>State</span>
                  <input
                    required
                    value={state}
                    placeholder="Karnataka"
                    onChange={(e) => setState(e.target.value)}
                  />
                </label>
                <label>
                  <span>PIN Code</span>
                  <input
                    required
                    pattern="[0-9]{6}"
                    value={pinCode}
                    placeholder="560038"
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </label>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span>Set as default shipping address</span>
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
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
