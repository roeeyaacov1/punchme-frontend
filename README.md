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
- `npm run dev:phone` — a second dev server, for a phone on the same Wi-Fi, over HTTPS
  (port 5180). See [Testing on a phone](#testing-on-a-phone).
- `npm run build` — typecheck (`tsc -b`) + production build.
- `npm run lint` — ESLint.
- `npm run gen:api` — regenerate `src/api/generated/schema.d.ts` from the backend's live
  OpenAPI schema. Run this after pulling backend changes that touch the API contract; the
  backend evolves independently of this repo.

## Testing on a phone

`npm run dev:phone` serves the app at `https://<this PC's LAN address>:5180` and passes
`/api` on to the backend at `127.0.0.1:8000`, so a phone on the same Wi-Fi can sign in and
use the dashboard. It's HTTPS because a LAN address over plain HTTP isn't a secure
context, and there the phone has no Share sheet and no clipboard. `PHONE_HOST` overrides
the address it picks.

The certificate comes from [mkcert](https://github.com/FiloSottile/mkcert)'s local CA.
Set it up once:

1. Install mkcert, then open a new terminal so it's on `PATH` (restart the Claude app too,
   for its `punchme-phone` launch entry):
   ```bash
   winget install FiloSottile.mkcert
   ```
   Skip `mkcert -install`: it makes this PC trust the CA, and only the phones need to.
2. Run `npm run dev:phone`. The first run creates the CA and a certificate for the PC's
   address, kept in `node_modules/.vite/phone-cert`. When the address changes, the next
   run makes a new certificate from the same CA, and the phones need nothing more.
3. Put the CA's certificate on each phone. Copy `rootCA.pem` only. `rootCA-key.pem`, next
   to it, never leaves the PC: anyone holding it can pose as any site to a phone that
   trusts the CA. Serve the copy once over plain HTTP (this works in Git Bash and
   PowerShell):
   ```bash
   mkdir -p node_modules/.vite/phone-ca
   cp "$(mkcert -CAROOT)/rootCA.pem" node_modules/.vite/phone-ca/punchme-dev-ca.crt
   npx serve node_modules/.vite/phone-ca -l 5181
   ```
   Open `http://<LAN address>:5181/punchme-dev-ca.crt` on the phone, then stop `serve`.
   - **iPhone:** Safari asks to download a configuration profile; allow it. Install it in
     Settings → General → VPN & Device Management, then turn it on in Settings → General →
     About → Certificate Trust Settings.
   - **Android:** Chrome downloads the file. Install it in Settings → Security →
     Encryption & credentials → Install a certificate → CA certificate (where it sits
     varies by phone maker; search Settings for "CA certificate"). Chrome trusts it from
     then on.
4. On the phone, open the `Network` address Vite prints: `https://<LAN address>:5180`.

On the PC itself that address shows a certificate warning, and the in-app preview pane
refuses it, because the PC doesn't trust the CA. To take the trust back, delete the
profile on the iPhone, or the certificate under Trusted credentials → User on Android.

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
