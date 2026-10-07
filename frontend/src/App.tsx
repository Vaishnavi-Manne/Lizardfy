"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Flame,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { ALL_PRODUCTS, Product } from "@/lib/products";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UpiPaymentModal } from "./components/UpiPaymentModal";
import {
  getAllIndianStates,
  getCitiesForState,
  validateIndianPhone,
  validateIndianPin,
  validateIndianStreetAddress,
} from "@/lib/indiaGeo";

type CartLine = {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image?: string;
};

const products: Product[] = ALL_PRODUCTS;
const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const readSavedIds = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(
      localStorage.getItem("lizardfy-saved-candles") ?? "[]",
    ) as unknown;
    return Array.isArray(saved) &&
      saved.every((item) => typeof item === "string")
      ? saved
      : [];
  } catch {
    return [];
  }
};

function App() {
  const router = useRouter();
  const [category, setCategory] = useState("All candles");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [jar, setJar] = useState("Amber glass");
  const [size, setSize] = useState("200g");
  const [scent, setScent] = useState("Santal & smoke");
  const [wax, setWax] = useState("#d8ad78");
  const [label, setLabel] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [complete, setComplete] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [sort, setSort] = useState("Featured");

  // Checkout form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+91 ");
  const [formStreet, setFormStreet] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formPin, setFormPin] = useState("");
  const [formPayment, setFormPayment] = useState("Pay by UPI");

  const allIndianStates = useMemo(() => getAllIndianStates(), []);
  const indianCitiesForState = useMemo(() => {
    if (!formState) return [];
    return getCitiesForState(formState);
  }, [formState]);

  // Production-Safe UPI Payment States
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [upiOrderData, setUpiOrderData] = useState<{
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
    paymentExpiresAt: string;
    customerName: string;
  } | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  const handlePaymentSuccess = (order: any) => {
    setConfirmedOrder(order);
    setCart([]);
    setUpiModalOpen(false);
    setCheckoutStep(false);
    setComplete(true);
    setCartOpen(true);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setFormName(data.user.name || "");
          setFormEmail(data.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("lizardfy-cart") ?? "[]",
      ) as unknown;
      if (Array.isArray(savedCart)) setCart(savedCart as CartLine[]);
      setFavorites(readSavedIds());
    } catch {
      setCart([]);
      setFavorites([]);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("lizardfy-cart", JSON.stringify(cart));
  }, [cart, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("lizardfy-saved-candles", JSON.stringify(favorites));
  }, [favorites, storageReady]);

  const visibleProducts = useMemo(() => {
    const matches = products.filter(
      (product) =>
        (category === "All candles" || product.category === category) &&
        `${product.name} ${product.scent}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    return sort === "Price: low to high"
      ? [...matches].sort((a, b) => a.price - b.price)
      : matches;
  }, [category, search, sort]);
  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce(
    (total, line) => total + line.price * line.quantity,
    0,
  );
  const hasCustomLabel = label.trim().length > 0;
  const customPrice =
    790 +
    (size === "300g" ? 300 : size === "200g" ? 100 : 0) +
    (extras.includes("Gift box") ? 70 : 0) +
    (hasCustomLabel ? 70 : 0);
  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const addToCart = (line: Omit<CartLine, "quantity">) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === line.id);
      return existing
        ? current.map((item) =>
            item.id === line.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { ...line, quantity: 1 }];
    });
    setComplete(false);
    setCartOpen(true);
  };
  const changeQuantity = (id: string, delta: number) =>
    setCart((current) =>
      current.flatMap((line) => {
        if (line.id !== id) return [line];
        const quantity = line.quantity + delta;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      }),
    );

  return (
    <>
      <Navbar
        cartCount={count}
        onOpenCart={() => setCartOpen(true)}
        favoritesCount={favorites.length}
        activePath="/"
        onSelectFavoriteFilter={() => {
          goTo("shop");
        }}
      />

      <main>
        <section className="hero">
          <img
            src="/assets/hero-candle.jpg"
            alt="Handcrafted luxury candles glowing softly in a warm, cozy room"
            className="hero-image"
            loading="eager"
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <span className="eyebrow light-eyebrow">
              <i /> Small flames, slower days
            </span>
            <h1>
              Make room
              <br />
              for <em>your moment.</em>
            </h1>
            <p>
              Made to feel like they were always yours. Create a custom candle
              with Lizardfy.
            </p>
            <div className="hero-actions">
              <button
                className="button button-cream"
                onClick={() => goTo("shop")}
              >
                Find your fragrance <ArrowRight size={17} />
              </button>
              <button
                className="text-link light-link"
                onClick={() => goTo("customize")}
              >
                Create a custom candle <ArrowDown size={15} />
              </button>
            </div>
            <div className="hero-pills">
              <span className="hero-pill">
                <Sparkles size={13} /> 100% Soy Wax
              </span>
              <span className="hero-pill">
                <Heart size={13} /> Poured by Hand in India
              </span>
              <span className="hero-pill">
                <Flame size={13} /> Non-Toxic Clean Burn
              </span>
            </div>
          </div>
          <span className="hero-side-note">LIGHT A LITTLE LIGHT</span>
        </section>
        <section className="intro-strip">
          <span>Made for the in-between</span>
          <i>✦</i>
          <span>100% Soy-based soy wax</span>
          <i>✦</i>
          <span>Poured by hand in India</span>
          <i>✦</i>
          <span>Clean burns & phthalate-free</span>
        </section>

        <section className="shop-section section-wrap" id="shop">
          <div className="section-heading shop-heading">
            <div>
              <span className="eyebrow">Scent for every sort of day</span>
              <h2>
                Find your <em>favourite.</em>
              </h2>
            </div>
            <Link href="/products" className="text-link">
              Explore all candles <ArrowRight size={16} />
            </Link>
          </div>
          <div className="shop-controls">
            <div
              className="category-tabs"
              role="group"
              aria-label="Filter candles by mood"
            >
              {[
                "All candles",
                "For unwinding",
                "For the home",
                "For gifting",
              ].map((item) => (
                <button
                  key={item}
                  className={
                    category === item ? "category-tab active" : "category-tab"
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={15} />
              <input
                id="product-search"
                placeholder="Find a scent"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <SlidersHorizontal size={15} />
            </label>
            <label className="sort-field">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option>Featured</option>
                <option>Price: low to high</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <div className="product-grid">
            {visibleProducts.slice(0, 4).map((product, index) => (
              <article
                className="product-card"
                key={product.id}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="product-image-wrap">
                  <img
                    src={product.image}
                    alt={`${product.name} candle`}
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <button
                    className={
                      favorites.includes(product.id)
                        ? "save-button saved"
                        : "save-button"
                    }
                    aria-label={
                      favorites.includes(product.id)
                        ? `Remove ${product.name} from saved candles`
                        : `Save ${product.name}`
                    }
                    onClick={() =>
                      setFavorites((current) =>
                        current.includes(product.id)
                          ? current.filter((id) => id !== product.id)
                          : [...current, product.id],
                      )
                    }
                  >
                    <Heart
                      size={17}
                      fill={
                        favorites.includes(product.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                  <button
                    className="quick-add"
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        details: `${product.scent} · 200g`,
                        price: product.price,
                        image: product.image,
                      })
                    }
                  >
                    Add to bag <Plus size={15} />
                  </button>
                </div>
                <div className="product-info">
                  <div>
                    <h3>
                      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {product.name}
                      </Link>
                    </h3>
                    <p>{product.scent}</p>
                  </div>
                  <span>₹{product.price.toLocaleString("en-IN")}</span>
                </div>
                <div className="product-bottom">
                  <i style={{ backgroundColor: product.color }} /> Soy wax{" "}
                  <span>·</span> 40 hr burn
                </div>
              </article>
            ))}
            {visibleProducts.length === 0 && (
              <div className="empty-results">
                <Sparkles />
                <p>No candles found. Try another scent or mood.</p>
                <button
                  className="text-link"
                  onClick={() => {
                    setSearch("");
                    setCategory("All candles");
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <div className="explore-more-wrap">
            <Link href="/products" className="explore-more-btn">
              <span>Explore More Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="custom-section" id="customize">
          <div className="custom-intro">
            <span className="eyebrow">The candle, your way</span>
            <h2>
              A little more
              <br />
              <em>you in it.</em>
            </h2>
            <p>
              Pick a vessel, find your fragrance, leave a note. We’ll pour it
              just for you, one at a time.
            </p>
            <div className="custom-steps">
              <span>
                <b>01</b> Choose your vessel
              </span>
              <span>
                <b>02</b> Find your scent
              </span>
              <span>
                <b>03</b> Make it personal
              </span>
            </div>
            <span className="custom-handnote">
              Poured to order <i>↗</i>
            </span>
          </div>
          <div className="customizer">
            <div className="customizer-top">
              <div>
                <span className="eyebrow">The candle studio</span>
                <h3>Build your candle</h3>
              </div>
              <span className="live-dot">Live preview</span>
            </div>
            <div className="customizer-body">
              <div className="custom-options">
                <fieldset>
                  <legend>
                    <span>01</span> Choose a vessel
                  </legend>
                  <div className="choice-row">
                    {["Amber glass", "Ceramic"].map((item) => (
                      <button
                        key={item}
                        className={jar === item ? "choice selected" : "choice"}
                        onClick={() => setJar(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>02</span> Choose your scent
                  </legend>
                  <select
                    className="full-select"
                    value={scent}
                    onChange={(event) => setScent(event.target.value)}
                  >
                    <option>Santal & smoke</option>
                    <option>Rosewater & fig</option>
                    <option>Vanilla bean</option>
                    <option>Rain on cedar</option>
                    <option>Make it a surprise</option>
                  </select>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>03</span> Pick a wax colour
                  </legend>
                  <div className="swatch-row">
                    {[
                      { color: "#d8ad78", name: "Honey" },
                      { color: "#d9b9ae", name: "Rose" },
                      { color: "#82907a", name: "Sage" },
                      { color: "#eee8dc", name: "Oat" },
                      { color: "#c7c5bd", name: "Stone" },
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        className={wax === color ? "swatch selected" : "swatch"}
                        style={{ backgroundColor: color }}
                        aria-label={`${name} wax`}
                        onClick={() => setWax(color)}
                      />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>04</span> Add a little extra
                  </legend>
                  <div className="extra-row">
                    {["Gift box"].map((extra) => (
                      <label key={extra} className="extra-choice">
                        <input
                          type="checkbox"
                          checked={extras.includes(extra)}
                          onChange={() =>
                            setExtras((current) =>
                              current.includes(extra)
                                ? current.filter((item) => item !== extra)
                                : [...current, extra],
                            )
                          }
                        />
                        <span>{extra}</span>
                        <b>+₹70</b>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>05</span> Your label, your words
                  </legend>
                  <input
                    className="label-input"
                    maxLength={28}
                    value={label}
                    placeholder="Write a short message (e.g. your little moment)"
                    onChange={(event) => setLabel(event.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span className="input-hint">Up to 28 characters</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: hasCustomLabel ? "var(--gold-hover, #b4832f)" : "var(--muted, #5e6b5a)" }}>
                      {hasCustomLabel ? "Personalized label (+₹70)" : "Custom text (+₹70)"}
                    </span>
                  </div>
                </fieldset>
                <label className="upload-reference">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setReference(event.target.files?.[0]?.name ?? "")
                    }
                  />
                  <span className="upload-plus">+</span>
                  <span>
                    {reference || "Add a reference image"}
                    <small>
                      {reference
                        ? "Ready to add with your candle"
                        : "Optional · JPG or PNG"}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </label>
              </div>
              <div className="preview-pane">
                <span className="preview-caption">YOUR ONE-OF-A-KIND</span>
                <div className="candle-stage">
                  <span className="stage-orbit orbit-one" />
                  <span className="stage-orbit orbit-two" />
                  <div
                    className={
                      jar === "Ceramic"
                        ? "preview-jar ceramic-jar"
                        : "preview-jar"
                    }
                  >
                    <span className="preview-wick" />
                    <span className="preview-flame" />
                    <div
                      className="preview-wax"
                      style={{ backgroundColor: wax }}
                    />
                    <div className="preview-label">
                      <small>LIZARDFY · HAND POURED</small>
                      <span>{label || "your little moment"}</span>
                      <i>{scent}</i>
                    </div>
                  </div>
                  <span className="preview-shadow" />
                </div>
                <div className="preview-summary">
                  <div>
                    <span>ESTIMATED TOTAL</span>
                    <strong>₹{customPrice.toLocaleString("en-IN")}</strong>
                  </div>
                  <span>
                    {size} <i>·</i> {jar} <i>·</i> {scent}
                  </span>
                </div>
                <button
                  className="button button-dark preview-add"
                  onClick={() =>
                    addToCart({
                      id: `custom-${jar}-${size}-${scent}-${wax}-${label.trim()}-${extras.join(",")}`,
                      name: "Your custom candle",
                      details: `${size} ${jar} · ${scent}${label.trim() ? ` · “${label.trim()}” (+₹70)` : ""}${extras.includes("Gift box") ? " · Gift box (+₹70)" : ""}`,
                      price: customPrice,
                    })
                  }
                >
                  Add your candle <ArrowRight size={17} />
                </button>
                <p className="preview-footnote">
                  Made by hand, especially for you. Ships in 3–5 days.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="process-section section-wrap">
          <div className="process-heading">
            <span className="eyebrow">Good things take a little time</span>
            <h2>
              From our hands
              <br />
              to <em>your home.</em>
            </h2>
            <p>
              Thoughtful at every step. Never hurried, always made with care.
            </p>
          </div>
          <div className="process-list">
            {[
              {
                n: "01",
                title: "Choose your mood",
                desc: "Find a fragrance that feels like you.",
              },
              {
                n: "02",
                title: "We pour slowly",
                desc: "Small batches, clean-burning soy wax.",
              },
              {
                n: "03",
                title: "Made personal",
                desc: "Your label, your vessel, your little details.",
              },
              {
                n: "04",
                title: "Light the moment",
                desc: "Wrapped with care and on its way to you.",
              },
            ].map((step) => (
              <div className="process-item" key={step.n}>
                <span>{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
        </section>
        <section className="story-section" id="story">
          <div className="story-image">
            <img
              src={photo("photo-1602523961358-f9f03dd557db", 1000)}
              alt="Hand-poured candle and natural botanicals on a studio table"
              loading="lazy"
            />
            <span className="story-stamp">
              POURED
              <br />
              WITH CARE
            </span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">A slower kind of making</span>
            <h2>
              Made by hand.
              <br />
              <em>Meant to be felt.</em>
            </h2>
            <p>
              We started with a simple thought: the things we bring into our
              homes should make us feel a little more at home. So we began
              pouring small-batch candles with Soy wax, considered fragrances
              and room for your own story.
            </p>
            <p>
              Every candle is made to order in our little studio. No rush, no
              factory line. Just good ingredients, warm hands and a reason to
              pause.
            </p>
            <button className="text-link" onClick={() => goTo("bulk")}>
              A little more about us <ArrowRight size={16} />
            </button>
            <span className="signature">
              With warmth, <em>Team Lizardfy</em>
            </span>
          </div>
        </section>
        <section className="bulk-section" id="bulk">
          <div>
            <span className="eyebrow">A little light goes a long way</span>
            <h2>
              Gatherings, made <em>personal.</em>
            </h2>
            <p>
              Wedding favours, thoughtful team gifts or a table full of your
              favourite people. Tell us what you’re imagining.
            </p>
          </div>
          <button
            className="button button-cream"
            onClick={() =>
              document
                .getElementById("bulk-form")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            Plan a custom order <ArrowRight size={17} />
          </button>
          <form
            id="bulk-form"
            className="bulk-form"
            onSubmit={(event) => {
              event.preventDefault();
              window.alert(
                "Thank you. Our studio will be in touch about your gathering.",
              );
            }}
          >
            <input required placeholder="Your name" aria-label="Your name" />
            <input
              required
              type="email"
              placeholder="Email address"
              aria-label="Email address"
            />
            <select aria-label="What are you planning?">
              <option>Wedding or celebration</option>
              <option>Corporate gifting</option>
              <option>Something else</option>
            </select>
            <button type="submit" aria-label="Send inquiry">
              <ArrowRight size={18} />
            </button>
          </form>
        </section>
        <section className="newsletter-section">
          <div>
            <span className="eyebrow">A note from the studio</span>
            <h2>
              Good things, <em>occasionally.</em>
            </h2>
            <p>
              New pours, small rituals and the odd little surprise. No noise.
            </p>
          </div>
          <form
            className="newsletter-form"
            onSubmit={(event) => {
              event.preventDefault();
              window.alert(
                "You’re on the list. Look out for a little note from us.",
              );
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Your email address"
            />
            <button type="submit">
              Count me in <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </main>

      <Footer />
      <div className="mobile-bottom-bar">
        <button onClick={() => goTo("shop")}>
          <Search size={18} />
          Explore
        </button>
        <button onClick={() => goTo("customize")}>
          <Sparkles size={18} />
          Make yours
        </button>
        <button onClick={() => setCartOpen(true)}>
          <ShoppingBag size={18} />
          Bag ({count})
        </button>
      </div>

      {cartOpen && (
        <div
          className="drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCartOpen(false);
          }}
        >
          <aside
            className={
              checkoutStep && !complete
                ? "cart-drawer checkout-mode"
                : "cart-drawer"
            }
            aria-label="Shopping bag"
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">A little something for you</span>
                <h2>
                  {complete
                    ? "Order received"
                    : checkoutStep
                      ? "Checkout"
                      : "Your bag"}{" "}
                  <span>({count})</span>
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close bag"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutStep(false);
                }}
              >
                <X />
              </button>
            </div>
            {complete ? (
              <div className="checkout-success">
                <div className="success-check">
                  <Check />
                </div>
                <span className="eyebrow">
                  {confirmedOrder?.paymentProvider === "SANDBOX"
                    ? "Verified Sandbox Order"
                    : "Order Confirmed & Paid"}
                </span>
                <h3>
                  {confirmedOrder?.orderNumber
                    ? `Order ${confirmedOrder.orderNumber}`
                    : "Your order"}
                  <br />
                  <em>is verified & confirmed.</em>
                </h3>

                {confirmedOrder && (
                  <div
                    style={{
                      margin: "1rem 0",
                      padding: "0.85rem 1.25rem",
                      background: "rgba(200, 151, 62, 0.12)",
                      border: "1px solid rgba(200, 151, 62, 0.35)",
                      borderRadius: "14px",
                      textAlign: "left",
                      fontSize: "0.86rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ color: "#eed699", fontWeight: 600 }}>Payment Method:</span>
                      <strong style={{ color: "#ffffff" }}>
                        {confirmedOrder.paymentMethod || "UPI (Verified)"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ color: "#eed699", fontWeight: 600 }}>Total Paid:</span>
                      <strong style={{ color: "#ffffff" }}>
                        ₹{Number(confirmedOrder.totalAmount).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#eed699", fontWeight: 600 }}>Status:</span>
                      <strong style={{ color: "#4ade80" }}>
                        {confirmedOrder.status} · {confirmedOrder.paymentStatus}
                      </strong>
                    </div>
                  </div>
                )}

                <p>
                  Thank you for your order. We’ve recorded this order to your account
                  and you can monitor fulfillment live in your Studio Dashboard.
                </p>

                <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column", width: "100%", marginTop: "1rem" }}>
                  <Link
                    href="/dashboard"
                    className="button button-dark"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    View Studio Dashboard <ArrowRight size={16} />
                  </Link>
                  <button
                    className="button button-outline"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setCartOpen(false);
                      setCart([]);
                      setComplete(false);
                      setConfirmedOrder(null);
                    }}
                  >
                    Back to the good stuff
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={28} />
                <h3>Your bag is taking a little pause.</h3>
                <p>Find a candle that feels like you.</p>
                <button
                  className="button button-dark"
                  onClick={() => {
                    setCartOpen(false);
                    goTo("shop");
                  }}
                >
                  Explore candles <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="cart-lines">
                  {cart.map((line) => (
                    <div className="cart-line" key={line.id}>
                      {line.image ? (
                        <img src={line.image} alt="" />
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
                          ₹
                          {(line.price * line.quantity).toLocaleString("en-IN")}
                        </strong>
                        <button
                          aria-label={`Remove ${line.name}`}
                          onClick={() =>
                            setCart((current) =>
                              current.filter((item) => item.id !== line.id),
                            )
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
                      ? "You’ve got free shipping."
                      : `Add ₹${(1800 - subtotal).toLocaleString("en-IN")} for free shipping.`}
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
                    <span>Shipping</span>
                    <span>{subtotal >= 1800 ? "On us" : "₹80"}</span>
                  </div>
                  <div className="cart-total">
                    <span>Estimated total</span>
                    <strong>
                      ₹
                      {(subtotal + (subtotal >= 1800 ? 0 : 80)).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </div>
                  <p>Taxes included. Shipping calculated at checkout.</p>
                  <button
                    className="button button-dark checkout-button"
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/checkout");
                    }}
                  >
                    Continue to checkout <ArrowRight size={17} />
                  </button>
                  <button
                    className="continue-shopping"
                    onClick={() => {
                      setCartOpen(false);
                      goTo("shop");
                    }}
                  >
                    <ArrowLeft size={14} /> Keep wandering
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
      {checkoutStep && !complete && (
        <div
          className="checkout-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCheckoutStep(false);
          }}
        >
          <form
            className="checkout-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            onSubmit={async (event) => {
              event.preventDefault();
              setCheckoutError(null);
              setIsProcessingPayment(true);

              const phoneVal = validateIndianPhone(formPhone);
              if (!phoneVal.valid) {
                setCheckoutError(phoneVal.error || "Please enter a valid 10-digit Indian mobile number.");
                setIsProcessingPayment(false);
                return;
              }
              if (!formState) {
                setCheckoutError("Please select your State / Union Territory.");
                setIsProcessingPayment(false);
                return;
              }
              if (!formCity) {
                setCheckoutError("Please select your City / District.");
                setIsProcessingPayment(false);
                return;
              }
              const pinVal = validateIndianPin(formPin, formState);
              if (!pinVal.valid) {
                setCheckoutError(pinVal.error || "Please enter a valid 6-digit Indian PIN code.");
                setIsProcessingPayment(false);
                return;
              }
              const addrVal = validateIndianStreetAddress(formStreet);
              if (!addrVal.valid) {
                setCheckoutError(addrVal.error || "Please provide a complete delivery street address.");
                setIsProcessingPayment(false);
                return;
              }

              const shippingAddress = `${formStreet}, ${formCity}, ${formState} - ${formPin}`;

              try {
                if (formPayment === "Cash on Delivery" || formPayment === "COD") {
                  const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      customerName: formName || "Guest",
                      customerEmail: formEmail || "guest@example.com",
                      customerPhone: formPhone || "+91",
                      shippingAddress,
                      paymentMethod: "Cash on Delivery",
                      paymentStatus: "PENDING",
                      totalAmount: subtotal + (subtotal >= 1800 ? 0 : 80),
                      items: cart.map((c) => ({
                        productId: c.id,
                        name: c.name,
                        details: c.details,
                        quantity: c.quantity,
                        price: c.price,
                        image: c.image,
                      })),
                    }),
                  });

                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to place Cash on Delivery order.");
                  }

                  handlePaymentSuccess(data.order);
                  return;
                }

                const res = await fetch("/api/payments/razorpay/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customerName: formName || "Guest",
                    customerEmail: formEmail || "guest@example.com",
                    customerPhone: formPhone || "+91",
                    shippingAddress,
                    items: cart.map((c) => ({
                      productId: c.id,
                      id: c.id,
                      name: c.name,
                      details: c.details,
                      quantity: c.quantity,
                      image: c.image,
                    })),
                  }),
                });

                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.error || "Failed to create order.");
                }

                if (data.mode === "sandbox") {
                  setUpiOrderData({
                    orderNumber: data.orderNumber,
                    razorpayOrderId: data.razorpayOrderId,
                    amount: data.amount,
                    paymentExpiresAt: data.paymentExpiresAt,
                    customerName: formName || "Guest",
                  });
                  setCheckoutStep(false);
                  setUpiModalOpen(true);
                } else {
                  // Official Razorpay Checkout Flow (Live / Test)
                  const loaded = await loadRazorpayScript();
                  if (!loaded) {
                    throw new Error("Could not load Razorpay payment SDK.");
                  }

                  const options = {
                    key: data.keyId,
                    amount: data.amountInPaise,
                    currency: "INR",
                    name: "Lizardfy Atelier",
                    description: `Order ${data.orderNumber}`,
                    order_id: data.razorpayOrderId,
                    prefill: {
                      name: formName || "Guest",
                      email: formEmail || "guest@example.com",
                      contact: formPhone || "+91",
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
                          throw new Error(verifyData.error || "Payment verification failed.");
                        }
                        handlePaymentSuccess(verifyData.order);
                      } catch (vErr: any) {
                        alert(vErr.message || "Payment verification failed.");
                      }
                    },
                    modal: {
                      ondismiss: () => {
                        setIsProcessingPayment(false);
                      },
                    },
                  };

                  const rzp = new (window as any).Razorpay(options);
                  rzp.open();
                }
              } catch (err: any) {
                console.error("Order payment error:", err);
                setCheckoutError(err.message || "Could not process order.");
              } finally {
                setIsProcessingPayment(false);
              }
            }}
          >
            <button
              type="button"
              className="continue-shopping"
              onClick={() => {
                setCheckoutStep(false);
                setCartOpen(true);
              }}
            >
              <ArrowLeft size={14} /> Back to your bag
            </button>
            <span className="eyebrow">Almost a little more you</span>
            <h3 id="checkout-title">Where should we send it?</h3>
            <div className="checkout-grid">
              <label>
                Full name
                <input
                  autoComplete="name"
                  required
                  placeholder="Your name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </label>
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  type="tel"
                  required
                  placeholder="+91"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </label>
              <label>
                PIN code
                <input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit PIN"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value)}
                />
              </label>
              <label>
                State / Union Territory *
                <select
                  required
                  value={formState}
                  onChange={(e) => {
                    setFormState(e.target.value);
                    setFormCity("");
                  }}
                  style={{
                    width: "100%",
                    height: "37px",
                    padding: "0 9px",
                    border: "1px solid #d8dbd1",
                    background: "#fffef9",
                    color: "var(--ink)",
                    fontSize: "9px",
                  }}
                >
                  <option value="">Select State (All 36 in India)</option>
                  {allIndianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                City / District *
                <select
                  required
                  disabled={!formState}
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  style={{
                    width: "100%",
                    height: "37px",
                    padding: "0 9px",
                    border: "1px solid #d8dbd1",
                    background: formState ? "#fffef9" : "#f4f3ec",
                    color: "var(--ink)",
                    fontSize: "9px",
                  }}
                >
                  <option value="">{formState ? "Select City / District" : "Select State first"}</option>
                  {indianCitiesForState.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkout-wide">
                Delivery address (House/Flat, street & area) *
                <input
                  autoComplete="street-address"
                  required
                  placeholder="House/Flat number, building, street, and area"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                />
              </label>
            </div>
            <label className="payment-choice">
              Payment preference
              <select
                value={formPayment}
                onChange={(e) => setFormPayment(e.target.value)}
              >
                <option value="Pay by UPI">Pay by UPI (Instant QR / Apps)</option>
                <option value="Cash on Delivery">Cash on Delivery (Pay at Doorstep)</option>
              </select>
            </label>
            <div style={{ marginTop: "0.8rem", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep(false);
                  router.push("/checkout");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#eed699",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Or open dedicated full-page checkout &rarr;
              </button>
            </div>
            <p className="checkout-demo-note">
              Order will be recorded to your account and displayed in your
              Studio Dashboard.
            </p>
            {checkoutError && (
              <p style={{ color: "#ff8585", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                {checkoutError}
              </p>
            )}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="button button-dark checkout-button"
            >
              {isProcessingPayment ? (
                "Processing order..."
              ) : formPayment === "Cash on Delivery" ? (
                <>
                  Place Order (Cash on Delivery) · ₹
                  {(subtotal + (subtotal >= 1800 ? 0 : 80)).toLocaleString("en-IN")}{" "}
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Pay by UPI · ₹
                  {(subtotal + (subtotal >= 1800 ? 0 : 80)).toLocaleString("en-IN")}{" "}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Luxury UPI Payment Simulator Modal */}
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
    </>
  );
}

export default App;
