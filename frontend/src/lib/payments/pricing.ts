import { ALL_PRODUCTS, Product } from "@/lib/products";

export interface RawCartItem {
  id?: string;
  productId?: string;
  name?: string;
  details?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

export interface ValidatedOrderItem {
  productId: string | null;
  name: string;
  details: string;
  price: number; // authoritative price in INR
  quantity: number;
  image: string | null;
}

export interface AuthoritativePricingResult {
  subtotal: number;
  shipping: number;
  totalAmount: number;
  items: ValidatedOrderItem[];
}

/**
 * Derives authoritative order pricing purely from server-side catalog data.
 * Completely ignores and discards any client-supplied unit prices or totals.
 */
export function calculateAuthoritativePricing(
  rawItems: RawCartItem[]
): AuthoritativePricingResult {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const catalogMap = new Map<string, Product>();
  for (const prod of ALL_PRODUCTS) {
    catalogMap.set(prod.id, prod);
  }

  let subtotal = 0;
  const items: ValidatedOrderItem[] = [];

  for (const raw of rawItems) {
    const candidateId = raw.productId || raw.id;
    const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));

    let canonicalPrice: number;
    let canonicalName: string;
    let canonicalDetails: string;
    let canonicalImage: string | null = null;
    let canonicalProductId: string | null = null;

    if (candidateId && catalogMap.has(candidateId)) {
      const catalogItem = catalogMap.get(candidateId)!;
      canonicalProductId = catalogItem.id;
      canonicalName = catalogItem.name;
      canonicalPrice = catalogItem.price;
      canonicalDetails = `${catalogItem.scent} · ${catalogItem.weight} ${catalogItem.vessel}`;
      canonicalImage = catalogItem.image || null;
    } else if (
      candidateId === "custom-candle" ||
      (raw.name && raw.name.toLowerCase().includes("custom candle"))
    ) {
      // Authoritative pricing for bespoke custom hand-poured candles: ₹990 base
      canonicalProductId = null;
      canonicalName = raw.name || "Your custom candle";
      canonicalPrice = 990;
      canonicalDetails = raw.details || "Custom hand-poured formulation";
      canonicalImage = raw.image || "/assets/custom_candle_showcase.png";
    } else {
      // Look for fuzzy match by name in catalog
      const matchByName = ALL_PRODUCTS.find(
        (p) => raw.name && p.name.toLowerCase() === raw.name.toLowerCase()
      );
      if (matchByName) {
        canonicalProductId = matchByName.id;
        canonicalName = matchByName.name;
        canonicalPrice = matchByName.price;
        canonicalDetails = `${matchByName.scent} · ${matchByName.weight} ${matchByName.vessel}`;
        canonicalImage = matchByName.image || null;
      } else {
        throw new Error(
          `Unrecognized product item "${raw.name || candidateId}". Cannot calculate authoritative price.`
        );
      }
    }

    subtotal += canonicalPrice * quantity;
    items.push({
      productId: canonicalProductId,
      name: canonicalName,
      details: canonicalDetails,
      price: canonicalPrice,
      quantity,
      image: canonicalImage,
    });
  }

  // Free shipping threshold: orders ₹1800 and above qualify for complimentary luxury shipping.
  // Standard shipping is ₹80.
  const shipping = subtotal >= 1800 ? 0 : 80;
  const totalAmount = subtotal + shipping;

  return {
    subtotal,
    shipping,
    totalAmount,
    items,
  };
}
