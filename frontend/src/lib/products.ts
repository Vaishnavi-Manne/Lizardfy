export interface Product {
  id: string;
  name: string;
  scent: string;
  price: number;
  category: string;
  image: string;
  color: string;
  badge?: string;
  stock?: number;
  description: string;
  burnTime: string;
  weight: string;
  vessel: string;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
}

export const ALL_PRODUCTS: Product[] = [
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
    description: "Inspired by gentle golden daylight filtering through unhurried mornings. Creamy steamed oat milk blended with golden wildflower honey and grounded by ancient cedarwood.",
    burnTime: "50+ hours",
    weight: "220g / 7.8 oz",
    vessel: "Heavyweight Amber Glass with cork seal",
    notes: {
      top: "Steamed Oat Milk, Cardamom pod",
      heart: "Wildflower Honey, Toasted Almond",
      base: "Atlas Cedarwood, Warm Vanilla Bean",
    },
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
    stock: 32,
    description: "An invigorating walk through a dew-soaked shaded garden. Crisp sunlit fig leaves, lush damp forest moss, and woody Haitian vetiver.",
    burnTime: "55+ hours",
    weight: "240g / 8.5 oz",
    vessel: "Matte Ceramic Vessel in Moss Green",
    notes: {
      top: "Crushed Fig Leaf, Bergamot rind",
      heart: "Green Fig Flesh, River Fern, Cyclamen",
      base: "Damp Moss, Earthy Vetiver, Clean Amber",
    },
  },
  {
    id: "rose-hour",
    name: "Rose Hour",
    scent: "Damask rose · pink pepper",
    price: 890,
    category: "For gifting",
    image: "/assets/candles3.png",
    color: "#bc7169",
    stock: 28,
    description: "The intoxicating romance of dusk. Velvety petals of ancient Damask roses kissed by sparkling cracked pink peppercorns and rich patchouli.",
    burnTime: "48+ hours",
    weight: "220g / 7.8 oz",
    vessel: "Blush Fluted Glass with Brass Lid",
    notes: {
      top: "Cracked Pink Peppercorn, Mandarin peel",
      heart: "Damask Rose Petals, Blackcurrant Bud",
      base: "Blonde Woods, Aged Patchouli, Soft Musk",
    },
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
    description: "The poetic fragrance of first rain falling on warm summer earth. Fresh eucalyptus breeze dancing over drenched oakwood and cool riverstones.",
    burnTime: "60+ hours",
    weight: "260g / 9.2 oz",
    vessel: "Artisanal Speckled Stoneware Jar",
    notes: {
      top: "Silver Eucalyptus, Fresh Ozone, Mint Leaf",
      heart: "Petrichor, Wet Slate, White Sage",
      base: "Weathered Oakwood, Hinoki Pine, Dry Moss",
    },
  },
  {
    id: "smoked-vanilla",
    name: "Smoked Vanilla & Amber",
    scent: "Bourbon vanilla · toasted amber · birch",
    price: 950,
    category: "For unwinding",
    image: "/assets/candle-1.jpg",
    color: "#c79658",
    badge: "Editor's Pick",
    stock: 25,
    description: "A dark, sophisticated vanilla far from sweet bakery notes. Infused with charred birchwood embers, golden amber resin, and rich aged bourbon vanilla.",
    burnTime: "52+ hours",
    weight: "220g / 7.8 oz",
    vessel: "Handmade Apothecary Jar with Jute Twine",
    notes: {
      top: "Smoked Birchwood, Cinnamon Bark",
      heart: "Bourbon Madagascar Vanilla, Tonka Bean",
      base: "Golden Amber, Labdanum, Rich Benzoin",
    },
  },
  {
    id: "spiced-orange",
    name: "Spiced Blood Orange",
    scent: "Blood orange · clove bud · ginger",
    price: 920,
    category: "For the home",
    image: "/assets/candle-3.jpg",
    color: "#c0543e",
    badge: "Limited Edition",
    stock: 20,
    description: "Zesty Sicilian blood oranges warmed with freshly crushed clove buds, candied ginger, and cinnamon bark for an uplifting hearth ambiance.",
    burnTime: "50+ hours",
    weight: "230g / 8.1 oz",
    vessel: "Gloss Terracotta Glass Tumbler",
    notes: {
      top: "Sicilian Blood Orange, Tangerine, Bergamot",
      heart: "Clove Bud, Candied Ginger, Cinnamon",
      base: "Cedar Shavings, Star Anise, Spiced Amber",
    },
  },
  {
    id: "fireside-hearth",
    name: "Fireside Hearth Duo",
    scent: "Cedarwood embers · tobacco leaf · musk",
    price: 1450,
    category: "For gifting",
    image: "/assets/candle-4.jpg",
    color: "#993b2a",
    badge: "Gift Set",
    stock: 15,
    description: "A curated pair of crackling wooden-wick candles designed for intimate gatherings. Notes of cured tobacco leaves, campfire cedar embers, and warm cashmere.",
    burnTime: "80+ hours combined",
    weight: "2 x 200g Gift Box Set",
    vessel: "Dual Terracotta & Obsidian Glass Set",
    notes: {
      top: "Campfire Smoke, Bergamot, Nutmeg",
      heart: "Cured Tobacco Leaf, Leather, Warm Clove",
      base: "Smoldering Cedar, Cashmere Musk, Vetiver",
    },
  },
];
