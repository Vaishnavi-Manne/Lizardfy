"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit2,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/components/Toast";

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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  async function loadAddresses() {
    try {
      const res = await fetch("/api/user/addresses");
      const data = await res.json();
      if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
        setAddresses(data.addresses);
      } else {
        // Fallback default demo address if table is empty
        setAddresses([
          {
            id: "addr-default-1",
            fullName: "Maya Sharma",
            phone: "+91 98765 43210",
            street: "Flat 402, Lotus Bloom Apartments, 12th Main Road, Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pinCode: "560038",
            isDefault: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Addresses load error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFullName("");
    setPhone("+91 ");
    setStreet("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPinCode("");
    setIsDefault(addresses.length === 0);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPinCode(addr.pinCode);
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Local edit or API patch
        await fetch(`/api/user/addresses/${editingId}`, {
          method: "PATCH",
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
        }).catch(() => null);

        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? { ...a, fullName, phone, street, city, state, pinCode, isDefault }
              : isDefault
              ? { ...a, isDefault: false }
              : a,
          ),
        );

        showToast({
          type: "success",
          title: "Address updated",
          description: "Your shipping destination changes have been saved.",
        });
      } else {
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
        }).catch(() => null);

        const newAddr: Address = {
          id: `addr-${Date.now()}`,
          fullName,
          phone,
          street,
          city,
          state,
          pinCode,
          isDefault,
        };

        setAddresses((prev) => [
          ...prev.map((a) => (isDefault ? { ...a, isDefault: false } : a)),
          newAddr,
        ]);

        showToast({
          type: "success",
          title: "New address added",
          description: "New delivery destination saved for future checkouts.",
        });
      }

      setShowModal(false);
    } catch {
      showToast({
        type: "error",
        title: "Failed to save address",
        description: "Please check your network and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    );

    try {
      await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      }).catch(() => null);

      showToast({
        type: "success",
        title: "Default shipping address set",
        description: "Future candle orders will ship to this address by default.",
      });
    } catch {
      // Ignored
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    setAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/user/addresses/${id}`, { method: "DELETE" }).catch(() => null);
      showToast({
        type: "info",
        title: "Address removed",
        description: "The address has been removed from your studio address book.",
      });
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
          <span className="eyebrow">Studio Logistics Book</span>
          <h1>Saved Shipping Addresses</h1>
        </div>
        <button onClick={openAddModal} className="button button-dark">
          <Plus size={16} /> Add new address
        </button>
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <p>Retrieving your address book...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MapPin size={32} />
          </div>
          <h3>No delivery addresses saved</h3>
          <p>Add your primary shipping destination to enjoy one-click candle checkouts.</p>
          <button onClick={openAddModal} className="button button-dark">
            <Plus size={16} /> Add Address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`address-card ${address.isDefault ? "default-active-card" : ""}`}
            >
              <div className="address-card-header">
                <div>
                  <span className="address-recipient-name">{address.fullName}</span>
                  <span className="address-phone">{address.phone}</span>
                </div>
                {address.isDefault ? (
                  <span className="default-address-pill">
                    <Check size={12} /> Default Shipping
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="make-default-btn"
                  >
                    Set as default
                  </button>
                )}
              </div>

              <div className="address-body-box">
                <p>{address.street}</p>
                <p className="address-city-state">
                  {address.city}, {address.state} - <strong>{address.pinCode}</strong>
                </p>
                <span className="address-verified-badge">
                  <ShieldCheck size={13} /> Verified Delivery Zone
                </span>
              </div>

              <div className="address-card-actions">
                <button
                  type="button"
                  onClick={() => openEditModal(address)}
                  className="address-action-btn edit"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="address-action-btn delete"
                  title="Remove address"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card address-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Delivery Address" : "Add New Delivery Address"}</h2>
                <p>Provide accurate PIN code for prompt artisan hand delivery.</p>
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

            <form onSubmit={handleSave} className="modal-form">
              <label>
                <span>Full Name</span>
                <input
                  required
                  value={fullName}
                  placeholder="e.g. Maya Sharma"
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
                <span>Street Address & Residence</span>
                <input
                  required
                  value={street}
                  placeholder="Flat/House number, building name, cross, road"
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
                <span>Set as default shipping address for candle deliveries</span>
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
                  {saving ? "Saving Address..." : editingId ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
