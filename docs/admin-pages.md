# Admin pages: routes and API calls

What `/admin` has today: every page, who can open it, the API calls it
makes, and what has to survive its rework. Written 6 Nov 2026 from
`src/main.tsx` and the code it imports, as the input for the rework
(`docs/redesign/guide.md` §7, "After the phases: /admin"). It says nothing
about design on purpose. It replaces the "Admin" section of
`docs/dashboard-routes.md`, which keeps a pointer here.

- Every path below `/api/admin/catalog` is staff only.
- The last column is the wrapper in `src/api/` (or the query that calls it).
- **Load** means the call fires when the page opens; any other row fires on
  the action it names.

## Access

The route tree, from `src/main.tsx`:

```text
RootLayout
└─ ProtectedRoute                     (src/auth)
   └─ RequireStaff                    (src/auth)
      └─ /admin  AdminLayout          (routes/lazy/admin.ts, one chunk)
         ├─ index            AdminCatalogListPage
         ├─ catalog          AdminCatalogListPage
         └─ catalog/:catalogId  AdminCatalogEditPage   ("new" to create)
```

- **Signed out** (`ProtectedRoute`): sent to `/login`, with the page asked
  for in `state.from`. While the start-up check runs, the opening
  (`Opening fromLoad`); when the server can't be reached to say,
  `SessionUnreachable`, never `/login`.
- **Signed in, PunchMe staff** (`user.is_staff` from `/api/auth/me`): the
  pages. `is_staff` is the account's own flag. It is not a business role:
  owner, manager and staff of a business mean nothing here.
- **Signed in, not staff** (`RequireStaff`): the refusal below, said out
  loud. Never a redirect: a silent bounce to the dashboard is how the area
  once got reported as missing.
- **The API is the real check.** Every call below answers 403
  (`StaffRequired`, from `require_staff` in the backend's
  `businesses/services.py`) to a signed-in account that isn't staff.
  `RequireStaff` is the courtesy in front of it.
- **No business.** The area sits outside `BusinessProvider` and
  `RequireBusiness`: a staff account usually owns no business, and nothing
  here reads one.
- **Getting there.** The dashboard's account sheet links to `/admin` for
  staff (`AccountSheet`). So does the wizard's frame (`OnboardingLayout`:
  "You're signed in as PunchMe staff." and "Open the template catalog"),
  since a staff account with no business never reaches the dashboard.
- **Loading the code.** The three pages are one chunk, loaded on demand. A
  cold load shows `RouteLoading`'s branch for everything that isn't the
  dashboard or the wizard: the kit's `Loading` line on the page.

## The frame: `AdminLayout`, on every page

| When | Call | Wrapper |
|---|---|---|
| App start | `GET /api/auth/me` | `getCurrentUser` (`AuthProvider`) |
| Any 401 | `POST /api/auth/refresh`, then the request is retried once | `apiFetch` |
| Sign out | `POST /api/auth/logout` `{refresh}`, not awaited; then `/login` | `revokeRefreshToken` (`AuthProvider.logout`) |

It stands on Lightbox by day only, from the first paint (`index.html` lists
`/admin` with the public pages). A bar shows PunchMe's mark (a link to
`/admin`), a "Staff" tag, and an account button that opens a sheet with the
signed-in email, the language switch (Hebrew and English, the same saved
choice as the rest of the app), "Back to app" (`/dashboard`) and sign-out.
It reads no business.

## The refusal: signed in, not staff

| When | Call | Wrapper |
|---|---|---|
| Sign in with another account | `POST /api/auth/logout` `{refresh}`, not awaited; `ProtectedRoute` then sends the page to `/login` with `state.from`, and signing in comes back to `/admin` | `revokeRefreshToken` (`AuthProvider.logout`) |

The account came with `/api/auth/me`. On Lightbox, it shows "Staff area",
that the area is for PunchMe staff, the signed-in email and that it has no
staff access, then "Sign in with another account" and "Back to app"
(`/dashboard`). It is `RequireStaff` itself, in `src/auth`, which is frozen:
its rendering moved with Roee's yes (6 Nov, the brief's §6), and its logic
stays as it is.

## `/admin` and `/admin/catalog`: the catalog

The two routes render the same page; neither redirects to the other. The
editor's back link goes to `/admin/catalog`.

| When | Call | Wrapper |
|---|---|---|
| Load | `GET /api/admin/catalog`: every entry, published and draft, by `sort_order` then name. Each carries its card (colours, count, reward, `design`), `niche`, `description`, `is_published` and `art_uses`, the picture slots that are filled (the pictures themselves only come with one entry) | `listCatalog`, query `["admin-catalog"]` |
| Load | `GET /api/presets`, public: every trade's published looks, in the wizard's order, with their pictures. Again every 5 s while a look is being drawn, for up to two minutes after its last save | `getPresets`, query `["presets"]` (the wizard's own key) |
| Load | `GET /api/admin/catalog/stickers`: whether the wallet draws the design options (`available`), so which wizard owners get. Kept for the tab, retried once. Not answered within the wizard's own patience (4 s), it reads as not answering until it does, so the list is never held | `getCatalogStickers`, query `["stickers"]` (the editor's key) |
| Publish or unpublish | `PATCH /api/admin/catalog/{id}` `{is_published}`, then the list's first two reads again | `patchCatalogEntry` |
| Move (to first, up one, down one), inside its trade | `POST /api/admin/catalog/reorder` `{ids}`: every id in the list, the trade's offered looks swapped among the places they hold and every other where it was; then the list's first two reads again | `reorderCatalog` |
| Delete, once confirmed in the page | `DELETE /api/admin/catalog/{id}`, then the list's first two reads again | `deleteCatalogEntry` |
| New, New for this trade, Edit | Links to `/admin/catalog/new` (with the trade in router state, `niche`, from a trade's panel) and `/admin/catalog/{id}` | none |

The two later reads were added for the rework, with Roee's yes (6 Nov 2026,
`docs/redesign/briefs/admin.md` §6). Both are calls the editor already
makes. A write reads the presets again as well as the catalog, because the
wizard's order and pictures come from them.

When a call fails (step D, 7 Nov):
- **A read** that never succeeded says what failed and why, by its cause
  (no network, the server, the throttle, no staff access), with "Try
  again". A read again that fails, once the list is on the page, keeps it.
- **A write the server refuses** (4xx, not 403 or 429) reads the list's
  first two reads again, since a page out of date is the likely cause. One
  on a look that is gone (404) says so in its trade, where focus goes. Any
  other failure is said on its row.

Worked out in the browser, with no call: `routes/admin/shelf.ts`, tested,
through the wizard's own `routes/onboarding/looks.ts` and nothing else
(`looksOffered`, `listedTrades`, `drawnLooks`, `looksFor`, `lookName`,
`readyLooks`, `presetLook`): which wizard owners get, each trade's looks in
the order and under the names owners meet them, and why the wizard leaves
each other look out (the brief's §7.6). A sticker list that fails reads as
the wizard reads it: the wizard without the looks.

What the server does with these, which the page relies on:
- **A delete never touches a business's card.** A card made from a look is
  a copy: `CatalogTemplate` has no link back from any card
  (`create_template_from_preset` copies its fields), and the wizard copies
  a look's values into its own draft. So the delete is a hard delete
  (`delete_catalog_template`: "nothing references back"). An owner partway
  through the wizard on that look keeps the colours they already have.
- **The order is the wizard's order.** `GET /api/presets` lists the
  published entries in the same `sort_order`, and the wizard offers them in
  it (`looksFor`, and on `looks/onboarding` `drawnLooks`). A reorder
  renumbers every entry, the ones it names first.
- **Publishing draws the look for the wizard.** A published look built
  from the wallet's design options gets its two pictures (Apple's strip,
  Google's hero) drawn by a task after the write (backend PR #20, item 1,
  `looks.refresh_look_pictures`), and loses the ones that no longer show it
  when it changes. `GET /api/presets` carries them as `pictures`.
- **What it checks.** A name of 1 to 80 characters, a description of up to
  200, one of the five trades, and a design a live card would accept
  (`validate_template_design`). The colours are strings of up to 7
  characters and aren't checked as colours.

## `/admin/catalog/:catalogId` and `/admin/catalog/new`: one look

The page is keyed by `catalogId`, so each look is its own editor: a new
look opened from an existing one starts empty.

| When | Call | Wrapper |
|---|---|---|
| Load, an existing look | `GET /api/admin/catalog/{id}`: the entry, with its pictures as data URLs (`art`) | `getCatalogEntry` |
| Load | `GET /api/admin/catalog/stickers`: the wallet's stickers, and whether it draws the design options (`available`). Kept for the tab, retried once | `getCatalogStickers`, query `["stickers"]` |
| 400 ms after the page opens and after each edit | `POST /api/admin/catalog/preview`: the server's check of the draft (`lint`), saving nothing. For a look the server draws (`isStyled`), also `images` and `stamp_state`: its pictures at the count the stage shows | `previewCatalogDesign` |
| Load, a saved and published look the server draws; again after each save, every 5 s for up to two minutes until they come | `GET /api/presets?niche={niche}`, public: the look's pictures as the wizard shows them | `getPresets`, query `["presets", niche]` |
| Save, a new look | `POST /api/admin/catalog`: the card with its trade, description and `is_published`; then the list again. The page then replaces its URL with `/admin/catalog/{new id}` (`state.created`), which loads the look afresh and says it was saved, once | `createCatalogEntry` |
| Save, an existing look | `PATCH /api/admin/catalog/{id}` with the same; then the list again and every `["presets"]` query | `patchCatalogEntry` |
| Add a picture (an existing look only) | `POST /api/admin/catalog/{id}/images` (multipart `use`, `file`): stored at once, with no Save, and echoed back as a data URL; then the list again | `uploadCatalogImage` |
| Remove a picture | `DELETE /api/admin/catalog/{id}/images/{use}`, then the list again | `deleteCatalogImage` |

Picture `use` values: `strip_base`, `stamp_art`, `stamped_art` and
`unstamped_art` (`CATALOG_ART_USES`). Never `logo` or `icon`: a look that
shipped one would print a stranger's mark on a barber's card, and the API
refuses them.

The editor is the studio's `CardStudio` with its trays, as
`docs/card-studio.md` sets them out (its notes on `/admin/catalog/:id` in
"`/dashboard/design`", and the card looks' brief §6.10). Beside them, two
trays of the catalog's own:
- **The shelf** ("מדף"): the trade, the description (staff only, up to 200
  characters), and published. On a saved, published look the server draws,
  its two pictures as the wizard shows them, or a line saying they are
  being drawn, or that drawing failed and the wizard leaves the look out.
- **The art** ("גרפיקה", `CatalogArtPanel`): the four pictures. On a new
  look it says to save once first, since pictures are stored against the
  look's id.

Its head, with no call of its own: the name owners read for a drawn look
(`lookName`, over the `["presets", niche]` read above), the name staff typed
under it, then the look's trade, whether it is published and, while the
wizard opens on the looks, its place in the trade; then its id. A new look
opened from a trade's panel starts in that trade (router state `niche`).

A look that can't be read keeps the way back to the list. If it isn't in
the catalog (404), it says so; any other failure says why, with "Try
again", which makes the same `GET /api/admin/catalog/{id}` again.

## Calls no page makes

| Call | Wrapper |
|---|---|
| `POST {biz}/templates/from-preset`: a business's card made from a catalog entry | none |

`/debug/presets`, an internal page, reads `GET /api/presets` (`getPresets`).

## What must survive

- **The routes and their calls.** `/admin`, `/admin/catalog` and
  `/admin/catalog/:catalogId` with `new`, each making the calls above. A
  rework that seems to need a route or a call changed stops and asks.
- **The gate.** `RequireStaff` inside `ProtectedRoute` and outside
  `BusinessProvider`. A staff account with no business opens every page; a
  signed-in account that isn't staff is told no out loud, with its email
  and a way back; a signed-out one goes to `/login` and comes back.
- **The frame is not `DashboardLayout`**, and it is light only: night is
  for the dashboard (CLAUDE.md).
- **Publish, reorder and delete keep their calls**, the delete confirmed
  first in the page (never `window.confirm`), and the list read again
  after each. A failed write is said on its row.
- **The order staff set is the order the wizard offers.**
- **The editor:**
  - keyed by its id;
  - a new look saved once moves to its own URL, says once that it was
    saved, and puts focus on its title;
  - pictures wait for an id, and go at once, without Save;
  - Save keeps staff on the page;
  - the check mark always on offer (`markAlways`);
  - the studio's own rules, per `docs/card-studio.md`.
- **The query keys.** `["admin-catalog"]`, which the editor refreshes after
  each save and picture, and `["presets"]`, which it refreshes after each
  save. The list reads under `["admin-catalog"]`, `["presets"]` and
  `["stickers"]`.
- **Copy that other pages read.**
  - `admin.catalog.art.uses.*` and `admin.catalog.art.removeNamed`: the
    owner's studio too (`WalletDetailsTray`, `UploadTile`).
  - `admin.staffHere` and `admin.openAdmin`: the wizard's frame. Since
    step D the link says "Open the ready-made looks", the page's own name.
  - `admin.title`: the account sheet.
  - Renaming one moves those with it.

## Found while writing this

Left for the rework (`docs/redesign/briefs/admin.md`). Step B (7 Nov) fixed
all but the last: a failed write is said on its row, a list that can't be
read says so with a way to try again, the list is the wizard's own shelf
through `shelf.ts`, each look is shown as its picture, and the id is only
in the editor.

- **A failed publish, reorder or delete says nothing.** The three mutations
  have no error handling: the row stays as it was, with no word of why.
- **A list that can't be read looks like an empty catalog.** On an error
  the page draws no rows and every trade at "0/3", the same as a catalog
  with nothing in it.
- **What the list counts isn't what the wizard shows.** It counts every
  published entry of a trade against three. Today's wizard leaves out a look
  built from the design options (`wizardOffers`), so the count includes
  looks owners never see. On `looks/onboarding` the wizard opens on every
  drawn look of a trade, with no cap, shows a trade with none drawn its
  classic look, and hides a trade with nothing published. The shelf's hint
  ("up to three per trade") says the same old rule.
- **A look built from the design options is drawn as its colours only.**
  `LookTile` sketches the card colour, the stamp colour and the glyph, so
  the bakery's croissants show as an orange card with coffee cups. The
  wizard on `looks/onboarding` shows the look's own picture.
- **The ids carry nothing staff chose.** They are slugs of the first name
  (`slugify(name)[:56]`), so a Hebrew name gets `template`, `template-2`.
  The list prints the id beside the name.
- **The `["stickers"]` query key is shared** with the owner's studio,
  which reads a business's list under the same key. Both are the same
  wallet's stickers, so nothing shows today.
