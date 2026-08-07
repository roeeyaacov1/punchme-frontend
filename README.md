# PunchMe — Frontend

The business-owner web app for **PunchMe**, a digital loyalty-card SaaS for small Israeli
businesses. Owners sign up, design a loyalty card, and manage it here. Customers never use
this app — they only ever scan a QR code and get a pass in their Apple/Google Wallet.

This is the frontend only. The backend (Django + Django Ninja) lives in a separate repo,
`punchme-backend`, and this app is built directly against its real API — see
[`src/api/generated/schema.d.ts`](src/api/generated/schema.d.ts), generated from the
backend's live OpenAPI schema (never hand-edit that file).

## Stack

React 18 + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, `react-i18next`
(Hebrew + English, full RTL), `qrcode.react`.

## Prerequisites

- Node 18+
- The backend running locally (see `punchme-backend`'s own README/CLAUDE.md):
  ```bash
  # in the backend repo
  docker compose up -d          # Postgres + Redis
  uv run python manage.py migrate
  uv run python manage.py runserver 127.0.0.1:8000
  ```

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_GOOGLE_CLIENT_ID at minimum
npm run dev
```

`.env` variables:
- `VITE_API_ORIGIN` — the backend's origin. Use `127.0.0.1`, not `localhost` — Node/some
  browser configs resolve `localhost` to `::1` first, which the backend's dev server (bound
  to `127.0.0.1`) won't answer.
- `VITE_GOOGLE_CLIENT_ID` — Google Sign-In client ID.
- `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` — optional, for the card
  designer's logo upload. Leave empty to use the "paste an image URL instead" fallback.

## Scripts

- `npm run dev` — start the dev server (port 5173).
- `npm run build` — typecheck (`tsc -b`) + production build.
- `npm run lint` — ESLint.
- `npm run gen:api` — regenerate `src/api/generated/schema.d.ts` from the backend's live
  OpenAPI schema. Run this after pulling backend changes that touch the API contract; the
  backend evolves independently of this repo.

## Project structure

```
src/
  api/            typed API client (client.ts + one module per backend app) + generated types
  auth/           Google/Apple sign-in, token storage, ProtectedRoute
  business/       "current business" context + plan-gating helpers
  components/     shared UI kit + WalletCardPreview
  i18n/           en/he locale files, RTL direction handling
  lib/            small framework-agnostic helpers (Cloudinary upload, phone validation, ...)
  routes/         one folder per screen area (marketing, auth, onboarding, dashboard, public)
```

## Notes

- Auth is JWT (`Authorization: Bearer <token>`), not cookies — the backend has CORS wide
  open in dev, locked down via env var in prod.
- Business owners only; there's no customer login anywhere in this app by design.
