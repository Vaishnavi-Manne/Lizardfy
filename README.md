# Lizardfy

Lizardfy is a modern, artisanal candle storefront and studio dashboard built with Next.js.

## Stack

- **Framework**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Vanilla responsive CSS & Lucide React icons
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JWT session tokens via `jose`, bcrypt password hashing, and Google OAuth 2.0
- **Assets**: Local candle images and video assets

## Project Layout

- `frontend/`: The full-stack Next.js web application (storefront, dashboard, admin panel, Prisma ORM, and API routes).
- `Images/`: Source candle images and videos.

## Run Locally

Navigate into `frontend`:

```sh
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Google OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Set the Authorized Redirect URI to:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
3. Add your credentials to `frontend/.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## Checks & Verification

From `frontend/`:

```sh
npm run build
npm run lint
```
