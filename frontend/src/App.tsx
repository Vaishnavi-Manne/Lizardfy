"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  scent: string;
  price: number;
  category: string;
  image: string;
  color: string;
  badge?: string;
};
type CartLine = {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  image?: string;
};

const products: Product[] = [
  {
    id: "slow-morning",
    name: "Slow Morning",
    scent: "Oat milk · honey · cedar",
    price: 890,
    category: "For unwinding",
    image: "/assets/candles1.png",
    color: "#d8a46d",
    badge: "Bestseller",
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
  },
  {
    id: "rose-hour",
    name: "Rose Hour",
    scent: "Damask rose · pink pepper",
    price: 890,
    category: "For gifting",
    image: "/assets/candles3.png",
    color: "#bc7169",
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
  },
];
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
  const [category, setCategory] = useState("All candles");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [jar, setJar] = useState("Amber glass");
  const [size, setSize] = useState("200g");
  const [scent, setScent] = useState("Santal & smoke");
  const [wax, setWax] = useState("#d8ad78");
  const [label, setLabel] = useState("a little moment");
  const [extras, setExtras] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [complete, setComplete] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [sort, setSort] = useState("Featured");

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
  const customPrice =
    790 +
    (size === "300g" ? 300 : size === "200g" ? 100 : 0) +
    extras.length * 90;
  const goTo = (id: string) => {
    setMobileOpen(false);
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
      <div className="announcement">
        A little light, made by hand <span>·</span> Free shipping on orders over
        ₹1,800
      </div>
      <header className="site-header">
        <button
          className="icon-button mobile-menu"
          aria-label="Open menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <button
          className="wordmark"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lizardfy home"
        >
          <span className="brand-mark">
            L<span>.</span>
          </span>
          <span className="brand-name">lizardfy</span>
        </button>
        <nav
          className={mobileOpen ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
        >
          <button onClick={() => goTo("shop")}>Shop</button>
          <button onClick={() => goTo("customize")}>Make it yours</button>
          <button onClick={() => goTo("story")}>Our story</button>
          <button onClick={() => goTo("bulk")}>Gatherings & gifts</button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button search-trigger"
            aria-label="Search candles"
            onClick={() => {
              goTo("shop");
              document.getElementById("product-search")?.focus();
            }}
          >
            <Search />
          </button>
          <button
            className="icon-button favorite-trigger"
            aria-label="Saved candles"
            onClick={() => goTo("shop")}
          >
            <Heart />
          </button>
          <button
            className="bag-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag, ${count} items`}
          >
            <ShoppingBag />
            <span>Bag</span>
            <b>{count}</b>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <video
            className="hero-image"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/hero.png"
            aria-label="Candle glowing softly in an intimate, warm room"
          >
            <source src="/candleVideo.mp4" type="video/mp4" />
          </video>
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
          </div>
          <span className="hero-side-note">LIGHT A LITTLE LIGHT</span>
        </section>
        <section className="intro-strip">
          <span>Made for the in-between</span>
          <i>✳</i>
          <span>100% plant-based wax</span>
          <i>✳</i>
          <span>Poured by hand in India</span>
        </section>

        <section className="shop-section section-wrap" id="shop">
          <div className="section-heading shop-heading">
            <div>
              <span className="eyebrow">Scent for every sort of day</span>
              <h2>
                Find your <em>favourite.</em>
              </h2>
            </div>
            <button
              className="text-link"
              onClick={() => {
                setCategory("All candles");
                setSearch("");
              }}
            >
              Explore all candles <ArrowRight size={16} />
            </button>
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
            {visibleProducts.map((product, index) => (
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
                    <h3>{product.name}</h3>
                    <p>{product.scent}</p>
                  </div>
                  <span>₹{product.price.toLocaleString("en-IN")}</span>
                </div>
                <div className="product-bottom">
                  <i style={{ backgroundColor: product.color }} /> Plant wax{" "}
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
                    <span>02</span> Pick a size
                  </legend>
                  <div className="choice-row">
                    {["100g", "200g", "300g"].map((item) => (
                      <button
                        key={item}
                        className={size === item ? "choice selected" : "choice"}
                        onClick={() => setSize(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>03</span> Choose your scent
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
                    <span>04</span> Pick a wax colour
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
                    <span>05</span> Add a little extra
                  </legend>
                  <div className="extra-row">
                    {["Dried flowers", "Cotton ribbon", "Gift box"].map(
                      (extra) => (
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
                          <b>+₹90</b>
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>
                    <span>06</span> Your label, your words
                  </legend>
                  <input
                    className="label-input"
                    maxLength={28}
                    value={label}
                    placeholder="Write a short message"
                    onChange={(event) => setLabel(event.target.value)}
                  />
                  <span className="input-hint">Up to 28 characters</span>
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
                      id: `custom-${jar}-${size}-${scent}-${wax}-${label}-${extras.join(",")}`,
                      name: "Your custom candle",
                      details: `${size} ${jar} · ${scent}${label ? ` · “${label}”` : ""}${extras.length ? ` · ${extras.join(", ")}` : ""}`,
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
                desc: "Small batches, clean-burning plant wax.",
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
              pouring small-batch candles with plant wax, considered fragrances
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

      <footer className="site-footer">
        <div className="footer-top">
          <button
            className="wordmark footer-wordmark"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="brand-mark">
              L<span>.</span>
            </span>
            <span className="brand-name">lizardfy</span>
          </button>
          <p>
            Light a little light.
            <br />
            Make room for your moment.
          </p>
          <div className="footer-links">
            <button onClick={() => goTo("shop")}>Shop all</button>
            <button onClick={() => goTo("customize")}>Custom candles</button>
            <button onClick={() => goTo("bulk")}>Bulk & gifting</button>
            <a href="mailto:hello@lizardfy.in">Get in touch</a>
          </div>
          <div className="footer-links">
            <a href="mailto:hello@lizardfy.in">Instagram ↗</a>
            <button onClick={() => goTo("story")}>Our story</button>
            <button onClick={() => goTo("shop")}>Shipping & returns</button>
            <button onClick={() => goTo("shop")}>FAQs</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Lizardfy Studio</span>
          <span>
            Poured slowly in India <i>✳</i>
          </span>
          <span>Plant wax · Thoughtful fragrance · Made by hand</span>
        </div>
      </footer>
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
                <span className="eyebrow">Order received</span>
                <h3>
                  Your next little moment
                  <br />
                  <em>is on its way.</em>
                </h3>
                <p>
                  Thank you for choosing a slower kind of light. We’ve saved
                  this as a demo order.
                </p>
                <button
                  className="button button-dark"
                  onClick={() => {
                    setCartOpen(false);
                    setCart([]);
                    setComplete(false);
                  }}
                >
                  Back to the good stuff <ArrowRight size={16} />
                </button>
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
                    onClick={() => setCheckoutStep(true)}
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
            onSubmit={(event) => {
              event.preventDefault();
              setComplete(true);
              setCheckoutStep(false);
              setCartOpen(true);
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
                <input autoComplete="name" required placeholder="Your name" />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  type="tel"
                  required
                  placeholder="+91"
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
                />
              </label>
              <label className="checkout-wide">
                Delivery address
                <input
                  autoComplete="street-address"
                  required
                  placeholder="House, street and area"
                />
              </label>
              <label>
                City
                <input
                  autoComplete="address-level2"
                  required
                  placeholder="City"
                />
              </label>
              <label>
                State
                <input
                  autoComplete="address-level1"
                  required
                  placeholder="State"
                />
              </label>
            </div>
            <label className="payment-choice">
              Payment preference
              <select>
                <option>Pay by UPI</option>
                <option>Credit or debit card</option>
                <option>Net banking</option>
              </select>
            </label>
            <p className="checkout-demo-note">
              Demo checkout only. No payment is collected and no order is sent
              to a fulfilment service.
            </p>
            <button
              type="submit"
              className="button button-dark checkout-button"
            >
              Place demo order · ₹
              {(subtotal + (subtotal >= 1800 ? 0 : 80)).toLocaleString("en-IN")}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
