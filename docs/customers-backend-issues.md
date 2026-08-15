# Customers dashboard — backend gaps

> **Status (2026-08-15): all three items are implemented and committed in
> `punchme-backend` (32a1743), and the frontend flag is on.** #1 exists
> exactly as proposed below — `POST /api/businesses/{business_id}/cards/{card_id}/stamps`
> with signed `delta`, 0..stamps_required bounds (422 `stamp_adjust_out_of_range`),
> optional `expected_stamp_count` (409 `stamp_adjust_conflict`), 404 on
> foreign/preview cards, StampEvent audit row (signed `stamps_added`) and
> the same wallet push as scan. #2: `?search=` on `/customers` matches name
> (icontains) and phone on digits (local format finds the stored E.164).
> #3: `status` is now `Literal["active","reward_ready","void"]` in the
> OpenAPI schema; `schema.d.ts` here has been regenerated.
>
> `VITE_STAMP_ADJUST_ENABLED` now defaults to `true` in
> [.env.example](../.env.example). **Vite reads it at build time**, so every
> deploy has to set it — a Railway build without it ships the +/- control
> greyed out, which is exactly what "the buttons don't work" looks like.

Frontend context (investigated 2026-08-11): the customers tab
([src/routes/dashboard/CustomersPage.tsx](../src/routes/dashboard/CustomersPage.tsx)) was a
read-only paginated table. It now has search, filtering, sorting, reward-ready highlighting,
CSV export, and a manual add/remove-stamp control. All of it works against the API as it
exists today.

The three asks below are kept for the rationale behind each endpoint's shape — they are the
record of why the contract looks the way it does, not an open worklist.

## 1. No way to add or remove a stamp from the dashboard — DONE

An owner looking at a customer's row cannot change that customer's stamp count. Two separate
reasons, both server-side:

- **Removal has no endpoint at all.** `POST /api/scan` only ever adds. A staff member who
  double-scans, or scans the wrong customer, currently has no way to undo it — the customer
  keeps a stamp they didn't earn and the owner has no recourse in the product.
- **Adding is unreachable from this screen.** `/api/scan` is keyed by card *serial*, but
  `CustomerListItemOut` returns `card_id` and no serial. The dashboard never sees a serial,
  and it shouldn't have to start handling one just for this.

### Proposed endpoint

```
POST /api/businesses/{business_id}/cards/{card_id}/stamps
Auth:  JWTAuth, caller must own {business_id}   (same as /customers and /activity)
Body:  { "delta": int }
200:   { "card_id": str, "stamp_count": int, "stamps_required": int, "status": str }
```

The frontend already calls exactly this — see `adjustCardStamps` in
[src/api/loyalty.ts](../src/api/loyalty.ts). Shape rationale:

- **Business-scoped path.** Ownership is enforced from the path prefix like every other
  dashboard endpoint, instead of inferring it from the card.
- **Keyed by `card_id`.** It is what `/customers` already returns. Adding `card_serial` to
  `CustomerListItemOut` instead would work too, but it puts a scannable credential into a
  list response that doesn't otherwise need one — the serial is what `/api/cards/{serial}`
  and `/redeem` authenticate on.
- **Signed `delta`, not separate add/remove routes.** One code path for the audit row, and
  the activity feed's `ActivityItemOut.stamps` is already an integer that can carry `-1`.

### Expected behaviour

- Reject `delta == 0` with 422, and clamp-or-reject out-of-range moves: `stamp_count` must
  stay within `0..stamps_required`. The frontend disables the buttons at both bounds, but
  that's a UX nicety and not a validator — two staff members on two devices will race it.
- Unknown `card_id`, or a card belonging to another business, should be **404, not 403** —
  a 403 confirms the card exists to someone who shouldn't know that.
- **Write the same audit row `/api/scan` writes**, so manual corrections show up in the
  activity feed with `business_user_email` attribution. An owner silently editing stamp
  counts with no trace is worse than not having the feature.
- **Push the wallet pass update** on the same path scan uses. If the customer's phone doesn't
  reflect the correction, the feature is actively misleading.
- Apply whatever plan gate `/api/scan` applies.

### Open question — closed

Two staff members with the dashboard open could both send `delta: -1` against the same
displayed count and take off two stamps. The backend took the optional `expected_stamp_count`
route and returns 409 `stamp_adjust_conflict` on mismatch; the frontend now always sends it
(the parameter is **required** in `adjustCardStamps`, so no call site can quietly skip the
guard) and treats that 409 as its own outcome — amber "someone else changed this first"
rather than a red failure, plus a refetch, since a conflict means the count on screen is
stale too.

One trap worth keeping in mind if this code is touched again: **the endpoint returns 409 for
two unrelated reasons.** A lost race carries `code: "stamp_adjust_conflict"`; a voided card
(`CardVoided`) is also 409 but carries *no code at all*. Matching on the status alone tells an
owner their card was edited out from under them when it was really just dead. `isStampConflict`
in [CustomersPage.tsx](../src/routes/dashboard/CustomersPage.tsx) matches on the code for
exactly this reason. Voided rows now render the control disabled, since the server refuses
them whatever the counts say — but the guard still matters for a card voided between page load
and click.

## 2. `GET /api/businesses/{business_id}/customers` has no search parameter

It accepts only `page` / `page_size`. Server-side search would be:

```
GET /api/businesses/{business_id}/customers?search=<str>
```

matching display name (case-insensitive contains) and phone compared on digits alone, so
`050-123` finds a stored `0501234567`.

**Current workaround, and why it needs replacing:** `listAllCustomers` in
[src/api/loyalty.ts](../src/api/loyalty.ts) pages the whole roster into memory (200/page) and
filters client-side. It stops at 25 pages and surfaces a warning banner when it does, so
search silently covering a partial list is at least visible — but a business past that cap
gets search that quietly misses people. This is fine at current customer counts and is the
wrong shape at scale.

## 3. The `status` string on `CustomerListItemOut` is undocumented — DONE

It used to be typed as bare `str` with no enum, and nothing in the frontend consumed it. The
customers table therefore derived *all* of its status buckets from `stamp_count` vs
`stamps_required` rather than guessing at literals.

**Resolved:** `status` is now `Literal["active","reward_ready","void"]`. The table consumes it
for `void` only — a voided card previously rendered as "in progress" or (worse) counted toward
the reward-ready tile, since nothing in the two counters can express "this card is dead."
Reward-ready / in-progress / no-stamps stay count-derived on purpose, so the badge can never
contradict the `n / m` printed next to it if the server's `reward_ready` flip lags the count.

**Still open:** there is no *redeemed* state in the enum, so there is still no redeemed filter —
a card that has been redeemed and reset is indistinguishable from one that never filled up. If
redemption should be visible in the roster it needs either its own status literal or a
`redeemed_at` / `rewards_redeemed` field on `CustomerListItemOut`.
