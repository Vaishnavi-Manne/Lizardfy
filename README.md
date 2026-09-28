# Lizardfy

Lizardfy is organized as a separate frontend and backend application.

## Project layout

- `frontend/` contains the React, TypeScript, and Vite storefront.
- `backend/` contains the Node.js API server.

## Run locally

Use two terminals from the project root.

In the first terminal, start the API:

```sh
cd backend
npm run dev
```

The API listens on `http://127.0.0.1:3001` and exposes `GET /api/health` and `GET /api/products`.

In the second terminal, install and start the storefront:

```sh
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. Vite forwards `/api` requests to the backend during development.

## Checks

From `frontend/`, run `npm run build` and `npm run lint`. The backend uses only Node.js built-in modules and has no dependency installation step.

The API product list is sample data. Checkout, payments, persistence, authentication, and fulfillment are not connected to production services yet.
