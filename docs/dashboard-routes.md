# Dashboard routes and API calls

What the dashboard has today: every page, who can open it, and the API calls
it makes. Written 23 Sep 2026 from `src/main.tsx` and the page code, as the
input for the dashboard rework. It says nothing about design on purpose.

- `{biz}` stands for `/api/businesses/{business_id}`.
- The last column is the wrapper in `src/api/` (or the hook that calls it).
- **Load** means the call fires when the page opens; any other row fires on
  the action it names.

## Access

- Every page here needs a signed-in user (otherwise → `/login`) and a
  business: when `GET /api/businesses/me` answers 404, the user is sent to
  `/onboarding`.
- Three ranked roles: **staff** < **manager** < **owner**, from
  `viewer_role` on the business. The nav shows only the pages the viewer's
  role can open. Typing the URL of a higher page shows a "not for your role"
  panel instead of redirecting. The API is the real check and answers 403
  `insufficient_role`.
- Two plans, **free** and **Pro** (`business.plan`). Free can design and
  preview but has no real customers, so the Pro-only reads below don't run
  on free.
- One card per business: every page takes the first template from
  `GET {biz}/templates`.

## Every dashboard page (the shell)

| When | Call | Wrapper |
|---|---|---|
| App start | `GET /api/auth/me` | `getCurrentUser` |
| Load | `GET /api/businesses/me`: the business, its plan and the viewer's role | `getMyBusiness` |
| Load | `GET {biz}/templates`: card colours for the business chip | `listTemplates` |
| Sign out | `POST /api/auth/logout` `{refresh}` | `revokeRefreshToken` |
| Any 401 | `POST /api/auth/refresh`, then the request is retried once | `apiFetch` |

The account menu links to `/admin` for PunchMe staff (`user.is_staff`).

## Staff and up: the counter

### `/dashboard`: Overview

Takes `?activated=1`, which `/billing/success` adds after a checkout.

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates` | `listTemplates` |
| Load | `GET {biz}/templates/{template_id}/design` | `getTemplateDesign` |
| Load, Pro | `GET {biz}/customers`, every page | `listAllCustomers` |
| Load, Pro | `GET {biz}/activity`, paged back 60 days | `listActivity`, paged by `fetchActivityWindow` |
| Load, manager+ | `POST {biz}/templates/{template_id}/preview`: the owner's own demo pass | `previewCard` |
| Until that pass is ready | `GET /api/cards/{serial}` every 3 s, at most 20 times | `useWalletPass` |

The join QR and the copy-link button make no call: both are
`/join/{template_id}`, built in the browser.

### `/dashboard/scan`: Scan

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates` | `listTemplates` |
| A code is scanned or typed | `POST /api/scan` `{serial}` | `scanCode` |
| The scan answers 409 | `GET /api/cards/{code}`: says whether the card is full or void | `getPublicCard` |
| Redeem a full card | `POST /api/cards/{code}/redeem` | `redeemCard` |

Scan refusals: 404 unknown card, 429 scanned too soon, 409 full or void.

### `/dashboard/customers`: Customers

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/customers?page_size=200`, every page (at most 25) | `listAllCustomers` |
| Load, manager+ | `GET {biz}/messaging/summary`: `can_send` decides whether a row offers a message | `getMessagingSummary` |
| +1 / −1 stamp | `POST {biz}/cards/{card_id}/stamps` `{delta, expected_stamp_count}` | `adjustCardStamps` |
| Message one customer (manager+, when `can_send`) | `POST {biz}/customers/{card_id}/message` `{body}` | `sendCustomerMessage` |
| Remove a customer (manager+) | `DELETE {biz}/customers/{card_id}` | `deleteCustomer` |

Search, filters, sort and the CSV export run in the browser over the whole
list. The endpoint also accepts `?search=` (name or phone), which no page uses
yet. The stamp buttons are disabled unless the build sets
`VITE_STAMP_ADJUST_ENABLED=true`.

### `/dashboard/activity`: Activity

| When | Call | Wrapper |
|---|---|---|
| Load, Pro, and again when the period changes (7, 14 or 30 days) | `GET {biz}/activity`, 100 a page, back to the period's start (at most 15 pages) | `listActivity`, paged by `fetchActivityWindow` |

The endpoint has no date filter, so the page walks back a page at a time.
Search and filters run in the browser.

## Manager and up: what customers see

### `/dashboard/design`: Card design

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates` | `listTemplates` |
| Load | `GET {biz}/templates/{template_id}/design` | `getTemplateDesign` |
| Load | `POST {biz}/templates/{template_id}/preview`, then `GET /api/cards/{serial}` every 3 s until ready: the owner's own pass for "add to my wallet" | `previewCard`, `useWalletPass` |
| 400 ms after each edit | `POST {biz}/templates/{template_id}/design/preview`: checks the draft, saves nothing | `previewTemplateDesign` |
| Save | `PATCH {biz}/templates/{template_id}`, then the design is read again | `patchTemplate` |
| Upload a picture | `POST {biz}/templates/{template_id}/images` (multipart `use`, `file`), then the design is read again | `uploadTemplateImage` |

Picture `use` values: `logo`, `icon`, `strip_base`, `stamp_art`,
`stamped_art`, `unstamped_art`.

### `/dashboard/standee`: Standee

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates` | `listTemplates` |
| Load | `GET {biz}/templates/{template_id}/design` | `getTemplateDesign` |

Printing uses the browser's print dialog and is Pro only. The QR is
`/join/{template_id}`, built in the browser.

### `/dashboard/messages`: Messages

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/messaging/summary` | `getMessagingSummary` |
| Load | `GET {biz}/automations` | `listAutomations` |
| Load, then every 3 s while a broadcast is sending | `GET {biz}/broadcasts?page=N&page_size=10` | `listBroadcasts` |
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design` for the card's language | `listTemplates`, `useCardLanguage` |
| Load | `GET {biz}/messaging/recipes?language=HE` (or `EN`): starter rules | `listRecipes` |
| Turn a rule on or off | `POST {biz}/automations/{id}/activate` or `…/pause` | `activateAutomation`, `pauseAutomation` |

Links to `/dashboard/messages/new`, `/dashboard/messages/automations/{id}`
and `/dashboard/messages/automations/new?recipe={key}`.

### `/dashboard/messages/new`: New broadcast

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design` | `listTemplates`, `useCardLanguage` |
| Load | `GET {biz}/messaging/recipes?language=` | `listRecipes` |
| Load | `GET {biz}/messaging/summary` | `getMessagingSummary` |
| Load, and 350 ms after the audience options change | `GET {biz}/messaging/audience?kind=broadcast&opt_in_only=&template_id=`: how many it will reach | `getAudienceCount` |
| Send a test to my own card | `POST {biz}/messaging/test` | `sendTestMessage` |
| Send | `POST {biz}/broadcasts`; 429 `messaging_quota` with `next_allowed_at` when over the cap | `createBroadcast` |

After sending, it returns to `/dashboard/messages` with a confirmation.

### `/dashboard/messages/automations/new` and `/dashboard/messages/automations/:automationId`: Automation editor

`new` takes `?recipe={key}` and defaults to `winback`.

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design` | `listTemplates`, `useCardLanguage` |
| Load, new rule | `GET {biz}/messaging/recipes?language=` | `listRecipes` |
| Load, existing rule | `GET {biz}/automations/{id}` | `getAutomation` |
| Load | `GET {biz}/messaging/summary` | `getMessagingSummary` |
| 350 ms after the trigger changes, when it is valid | `GET {biz}/messaging/audience?kind=&inactive_days=&reward_waiting_days=&birthday_days_before=&opt_in_only=&template_id=` | `getAudienceCount` |
| Save a new rule | `POST {biz}/automations` (with `is_active` when saved switched on) | `createAutomation` |
| Save an existing rule | `PATCH {biz}/automations/{id}` | `patchAutomation` |
| On or off, existing rule | `PATCH {biz}/automations/{id}` `{is_active}` | `patchAutomation` |
| Send a test to my own card | `POST {biz}/messaging/test` | `sendTestMessage` |
| Delete | `DELETE {biz}/automations/{id}` | `deleteAutomation` |

Rule kinds: `inactive` (win-back), `birthday`, `reward_waiting`. Switching a
rule on needs Pro (403 `upgrade_required`).

### `/dashboard/referrals`: Referrals

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/referrals/program` | `getReferralProgram` |
| Load | `GET {biz}/referrals/rules`: the four sentences | `listReferralRules` |
| Load | `GET {biz}/referrals` | `listReferrals` |
| Load | `GET {biz}/templates` | `listTemplates` |
| Program on/off, reward cap, cap period, how the referrer is shown | `PATCH {biz}/referrals/program` (`enabled`, `max_rewarded_per_referrer`, `cap_period`, `referrer_display_mode`) | `patchReferralProgram` |
| Edit one sentence (on/off, title, body) | `PATCH {biz}/referrals/rules/{event}/{recipient}` | `putReferralRule` |
| Approve or reject a flagged referral | `POST {biz}/referrals/{id}/review` `{decision}` | `reviewReferral` |

## Owner only: money and the team

### `/dashboard/team`: Team

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/team`: members and open invitations | `getTeam` |
| Invite a manager or staff member | `POST {biz}/team/invitations` `{role, email}`: returns the link the owner copies and sends; nothing is emailed | `createInvitation` |
| Revoke an invitation | `DELETE {biz}/team/invitations/{id}` | `revokeInvitation` |
| Change a member's role | `PATCH {biz}/team/members/{membership_id}` `{role}` | `changeMemberRole` |
| Remove a member | `DELETE {biz}/team/members/{membership_id}` | `removeMember` |

The invitation link opens `/invite/{token}`, which is public.

### `/dashboard/billing`: Billing

| When | Call | Wrapper |
|---|---|---|
| Load | `GET /api/billing/subscription?business_id=` | `getSubscription` |
| Activate (free plan) | `POST /api/billing/checkout` `{business_id}`, then the browser goes to `checkout_url` | `createCheckoutSession` |
| Manage (Pro) | `POST /api/billing/portal` `{business_id}`, then the browser goes to `portal_url` | `createPortalSession` |

## Outside `/dashboard`, same sign-in and business checks

| Route | What it does | Calls |
|---|---|---|
| `/billing/success` | Back from checkout. Waits for the plan to turn Pro, then goes to `/dashboard?activated=1`. | `GET /api/billing/subscription` every 2 s for up to 30 s, then `GET /api/businesses/me` |
| `/billing/cancel` | Back from an abandoned checkout; links to `/dashboard/billing`. | none |

## Admin: PunchMe staff only

Needs `user.is_staff`, which is not a business role. It is reached from the
dashboard's account menu, and the API answers 403 to anyone else.

| Route | When | Call | Wrapper |
|---|---|---|---|
| `/admin`, `/admin/catalog`: the catalog of ready-made looks | Load | `GET /api/admin/catalog` | `listCatalog` |
| | Reorder | `POST /api/admin/catalog/reorder` `{ids}` | `reorderCatalog` |
| | Publish or unpublish | `PATCH /api/admin/catalog/{id}` `{is_published}` | `patchCatalogEntry` |
| | Delete | `DELETE /api/admin/catalog/{id}` | `deleteCatalogEntry` |
| `/admin/catalog/:catalogId` (`new` to create): one look | Load, existing | `GET /api/admin/catalog/{id}` | `getCatalogEntry` |
| | Load, and 400 ms after each edit | `POST /api/admin/catalog/preview` | `previewCatalogDesign` |
| | Save | `POST /api/admin/catalog` when new, `PATCH /api/admin/catalog/{id}` after | `createCatalogEntry`, `patchCatalogEntry` |
| | Upload or remove a picture | `POST /api/admin/catalog/{id}/images` (multipart), `DELETE /api/admin/catalog/{id}/images/{use}` | `uploadCatalogImage`, `deleteCatalogImage` |

## Calls no page makes yet

Wrapped in `src/api/` but never called:

| Call | Wrapper |
|---|---|
| `POST {biz}/automations/{id}/test`: send a saved rule to the owner's own card | `testAutomation` |
| `GET {biz}/broadcasts/{id}`: one broadcast | `getBroadcast` |
| `GET {biz}/messaging/deliveries?automation_id=`: the delivery log | `listDeliveries` |
| `GET {biz}/referrals/grants?status=`: rewards that referrals granted | `listReferralGrants` |
| `POST {biz}/referrals/grants/{id}/revoke` | `revokeReferralGrant` |

In the generated schema (`src/api/generated/schema.d.ts`) with no wrapper:
`GET {biz}`, `DELETE {biz}`, `POST {biz}/templates/from-preset`,
`DELETE {biz}/templates/{template_id}` and `POST /api/auth/apple`.

## Routes outside the dashboard

Listed so links into and out of the dashboard resolve. The rework doesn't
touch them.

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/login` | Sign in and sign up |
| `/onboarding`, `/onboarding/{business,color,accent,stamp,reward,account,wallet,billing}` | Card setup before and after sign-up; a signed-in user with no business lands here |
| `/join/:templateId` | The customer join page the dashboard's QR and copy-link open |
| `/p/:token` | The page behind the wallet QR. For the shop's own signed-in team it becomes a stamp screen that calls `POST /api/scan` and `POST /api/cards/{code}/redeem` |
| `/c/:serial` | A customer's own card, where they get their pass again |
| `/invite/:token` | Accept a team invitation |
| `/style-guide`, `/debug/presets` | Internal pages |
