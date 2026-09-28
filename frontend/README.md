# Lizardfy Candle Studio

A responsive candle storefront and customization experience built with Next.js, React, and TypeScript.

## Run locally

```sh
npm install
npm run dev
```

Next.js prints the local URL when the server starts. To create and inspect a production build, run `npm run build`, then `npm run start`. Run `npm run lint` for Oxlint checks.

## Included

- Editorial home page and candle catalog with search, mood filters, sorting, and saved candles
- Candle customizer with live vessel, wax, label, scent, size, extras, preview, and price updates
- Persistent local cart with quantity controls, shipping estimate, delivery form, and demo confirmation
- Bulk inquiry and newsletter forms
- Responsive mobile navigation and shopping controls

The cart and saved candles use this browser's local storage. Product details and prices are sample data. Product photography is served from local assets, while web fonts load from Google Fonts.

## Production integrations still needed

This is a frontend foundation, not a live payment or order system. Before accepting real orders, connect a product/order API and database, customer authentication, a payment provider such as Razorpay, file storage for custom references, and shipping and notification services. Checkout currently collects delivery details only in the browser and deliberately does not charge or submit an order. An authenticated admin dashboard and real order tracking depend on those backend services.
