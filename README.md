# Lizardfy

Lizardfy is a candle storefront made for moment

## Stack

- Next.js 15 App Router, React 19, and TypeScript
- Responsive CSS styling and Lucide React icons
- Native Node.js HTTP API
- Local candle images and hero video assets
- Browser localStorage for demo cart and saved-candle state

## Project layout

- `frontend/` contains the Next.js storefront.
- `backend/` contains the Node.js API server.
- `Images/` contains the source candle images and videos.

## Run locally

Start the API in one terminal from the project root:

```sh
cd backend
npm run dev
```

The API listens on `http://127.0.0.1:3001` and provides:

- `GET /api/health`
- `GET /api/products`

Start the frontend in a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the URL printed by Next.js, usually `http://localhost:3000`.

## Checks

From `frontend/`, run:

```sh
npm run build
npm run lint
```

The backend uses only Node.js built-in modules and has no dependency installation step.

## Current limitations

The product list and checkout are demo functionality. Payments, order persistence, authentication, file storage, fulfillment, and production database integrations are not connected yet.
