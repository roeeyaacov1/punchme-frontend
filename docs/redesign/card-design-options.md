# Card design options: what passbox v0.1.1 can draw, and how PunchMe can offer it

This guide is for planning PunchMe's side: what a business can now do with its card, the exact rules
behind each option, what real phones showed, and a proposal for making it native in Card Studio and in
onboarding. It was written from passbox-api on 2026-11-04.

## Status

| | Where it stands |
|---|---|
| passbox v0.1.1 (`f7eb03a`) | On passbox's `main`, CI green |
| passbox staging | Runs v0.1.1 since 2026-11-03 |
| passbox production | Still v0.1.0 (`f6fdbe8`). It refuses every new option with a 400. The release needs Roee's OK (passbox GUIDE §12.1, "Releasing") |
| Phone checks | Passed on 2026-11-04 on staging, on the iPhone (Hebrew) and the Galaxy S25 (passbox `docs/SPIKE_RESULTS.md`, "The v0.1.1 card design options") |
| PunchMe backend | roeeyaacov1/punchme-backend#17, open: the design doc keys, the sticker list, styled cards drawn by passbox, 12 draft catalog looks |
| PunchMe frontend | roeeyaacov1/punchme-frontend#40, open: every option in Card Studio and the catalog editor |

**Rollout order:** first release passbox production, then merge PunchMe. Merging first is safe, because the studio
offers nothing until passbox's sticker list answers. **No passbox rollback past v0.1.1** is possible once any
business uses an option.

## 1. What a business can do now

Every option is off by default. A card that uses none looks exactly as it did, pixel for pixel.

| Option | What the customer sees | iPhone | Android |
|---|---|---|---|
| **Stamp style: circle or icon** | "Circle" is v0.1's filled circle with the art inside. "Icon" is the art on its own, with empty stamps as the same art faded to about 30% | yes | yes (in the hero picture) |
| **Built-in sticker** | One of 65 3D emoji (Microsoft Fluent Emoji, MIT) as the stamp, in its own colours. In a circle it fills 72% of it | yes | yes |
| **Tint** (icon style) | The sticker, or the business's own uploaded stamp picture, recoloured in shades of the brand colour, keeping its 3D shading (the orange bakery's croissants) | yes | yes |
| **Check mark** (icon style) | A small disc with a check over each stamped stamp. **Roee prefers cards without it** (2026-11-04), so default it off | yes | yes |
| **Inset panel** | A rounded panel in its own colour inside the stamp area (the cream panel on the orange card, the white one on the latte card) | yes | yes |
| **Wallpaper** | A sticker's silhouette repeated faintly behind the stamps, in the stamp colour (the wheat behind the croissants). It replaces the texture | yes | yes |
| **Count in the header, as "6/8"** | The count moves to the top of the card, beside the logo, and reads "6/8" instead of "6". Apple shows the header on stacked cards too (not yet checked on a phone) | yes | **no**: Google always shows a plain number |
| **Name beside the logo** | iOS writes the business's name beside an uploaded logo mark | yes | **no** (Google has its own layout) |

What Android shows: Google's card shows the stamp area as its hero picture. So the panel, stickers, tint, check
and wallpaper all reach Android, while the header count and the name beside the logo are Apple-only.

### Roee's four reference cards, as options

| Reference | Options |
|---|---|
| Orange bakery ("Sunny Bakes") | icon style, `croissant` sticker, tint on, cream panel, `sheaf-of-rice` wallpaper, count in the header as "6/8". The reference also had check marks; leave them off, per Roee |
| Dark bubble-tea ("caffeinate") | icon style, `bubble-tea` sticker in its own colours, no panel, dark card |
| Latte ("brew") | icon style, `hot-beverage` sticker, white panel |
| Hebrew café ("8/8" at the top) | count in the header as a fraction, on any stamp look |

## 2. The rules: what needs what, and what hides what

**Which art a stamp uses**, most specific first:
1. the uploaded stamped/unstamped artwork
2. the uploaded stamp photo
3. the sticker
4. the glyph (the 16 built-in line icons)

passbox's lint returns a warning when an option draws nothing. The studio is better off never letting
such a combination happen: hide or disable the control instead of saving it and warning.

| Option | Takes effect only when | Lint warns (path) |
|---|---|---|
| `mark: "check"` | the style is `icon` | `kind.art.mark` |
| `tint: true` | the style is `icon`, **and** there is a sticker or uploaded art to tint (the glyph is already in the stamp colour) | `kind.art.tint` |
| `sticker` | no stamp photo is uploaded; in icon style, no stamped artwork either; in a circle, not both stamped and unstamped artwork | `kind.art.sticker` |
| `wallpaper` | no strip background image is uploaded (it covers the wallpaper) | `kind.art.wallpaper` |
| `panel_color` | it differs from the card's background by at least 1.1:1 contrast, or it won't show | `kind.art.panel_color` |
| `logo_text` | a logo is uploaded (the generated text logo already shows the name), and the logo is a mark, not a wordmark: wider than 2:1 warns | `branding.logo_text` |
| The header | at most 2 fields: the count in the header takes one, and the name beside the logo takes one | `fields` |

**Other rules worth building around:**
- **Stamp colour contrast:**
  - It's judged against the panel when there is one, and against the card otherwise.
  - Untinted stickers and photos keep their own colours, so they aren't judged.
- **"6/8" has no spaces, on purpose:**
  - In a right-to-left paragraph, "6 / 8" displays as "8 / 6", while "6/8" stays one number.
  - A gift stamp past a full card reads "9/8".
- **The panel's geometry is fixed** (its inset, corner radius and padding), not a setting.
- **Stamp layout:**
  - A card has 1 to 12 stamps.
  - Up to 6 go in one row; more split into two balanced rows (10 is 5+5, not 6+4).
- **Sticker names:**
  - Names only grow, and a shipped sticker's picture never changes.
  - Read the list from passbox (`GET /v1/stickers`) rather than hard-coding it. passbox-client's
    `KNOWN_STICKERS` is for tests and mocks.

## 3. The API (passbox-client 0.1.1)

All of it lives on `PUT /v1/programs/{external_id}`, inside `design`. Here is the orange bakery card:

```json
{
  "merchant": "sunny-bakes",
  "kind": "stamp_card",
  "name": "כרטיס מאפים",
  "language": "he",
  "design": {
    "stamps_required": 8,
    "reward": "המאפה התשיעי חינם",
    "labels": {"stamps": "התקדמות", "holder": "שם"},
    "stamps_change_message": "עודכן הכרטיס שלך: %@",
    "colors": {"background": "#C65D3B", "foreground": "#FFFFFF", "label": "#FFFFFF"},
    "art": {
      "style": "icon",
      "sticker": "croissant",
      "tint": true,
      "stamp_color": "#C65D3B",
      "panel_color": "#F6E7CB",
      "wallpaper": "sheaf-of-rice"
    },
    "stamps_place": "header",
    "stamps_format": "fraction",
    "logo_text": false
  }
}
```

| Field | Type, default |
|---|---|
| `design.art.style` | `"badge"` (circle) or `"icon"`; default `"badge"` |
| `design.art.mark` | `"none"` or `"check"`; default `"none"` |
| `design.art.panel_color` | `"#RRGGBB"` or null; default null |
| `design.art.sticker` | a sticker name or null; default null |
| `design.art.tint` | bool; default false |
| `design.art.wallpaper` | a sticker name or null; default null |
| `design.stamps_place` | `"secondary"` (under the stamps) or `"header"`; default `"secondary"` |
| `design.stamps_format` | `"count"` ("6") or `"fraction"` ("6/8"); default `"count"` |
| `design.logo_text` | bool; default false |

**The sticker list:**
- `GET /v1/stickers` (API key) answers `{"stickers": [{"name": "croissant", "image": "data:image/png;base64,…"}]}`.
- That's 65 stickers with 96 px thumbnails, about 760 KB in all, so cache it.
- PR #17 caches it for an hour and exposes it as `available`.
- A v0.1.0 server answers 404, which is how the studio knows the options aren't there yet.

**Drawing a card without saving it:**
- `POST /v1/programs/preview` takes the same program body and returns PNG data URLs by role.
- Ask only for what you show, through `roles`: `"strip@2x"` for an iPhone-sized strip, `"hero"` for Android.
- Pass `state: {"stamps": n}` for the count the preview shows.
- The answer also carries the lint `problems`.

**Sending options safely:**
- Send an option only when it draws something. PR #17's `_art_options` already does this.
- An option that draws nothing still counts as a design change, which re-pushes every pass.

**What a design save does:**
- passbox rebuilds every pass of the program and pushes it to every phone, **silently**: no notification.
  This is safe to let owners experiment with, but save on an explicit button, not on every slider move, since
  each save reaches every holder's phone.

**Alerts:**
- A stamp alerts on the iPhone only if the design has a `stamps_change_message`. Without one, the count
  updates silently.
- Make sure every PunchMe design sends one; the latte card in the phone checks had none and never alerted.

## 4. What real phones showed (2026-11-04)

- **The strips** look on the iPhone exactly as passbox's renders: panels, faded empties, tint, wallpaper and
  stickers in circles. The S25 showed all six test cards too.
- **"6/8" in the header**, Hebrew iPhone:
  - It read 7/8, 5/8, 4/10 and 6/10, never reversed.
  - The next stamp alerted, with the change message ending "7/8".
- **The name beside the logo**, Hebrew iPhone:
  - iOS keeps the card's layout left to right: the logo at the left, the header at the right.
  - It writes the name right to left between them.
  - A 29-character name cut off with "…" before the count, which stayed readable.
  - Google shows about 20 characters of a business name, and lint warns past that.
- **Design changes** (moving the count to the header, removing the checks) updated the cards on both phones
  with **no** notification. The next stamp alerted as usual.
- **Dark cards with no panel:** the faded empty stickers are the least distinct of the looks, though
  still readable. A panel, or the circle style (empty circles turn light grey), should separate full from empty more clearly.
- **Not checked yet:**
  - the stacked view
  - where the S25 cuts a long name
  - two header fields beside a generated logo

**Test cards:** six of them are live on passbox staging, on the "PunchMe staging check" account:
- merchants and programs `looks-bakery`, `looks-latte`, `looks-dark-cups`, `looks-barber`, `looks-glyph-icons`
  and `looks-logo`
- one pass each

## 5. Already in PunchMe (PRs #17 and #40)

- **Card Studio:**
  - Stamp tray: circle or icon, the sticker picker with passbox's thumbnails, the check, the tint.
  - Background tray: a panel (six grounds or any colour), a sticker wallpaper, the texture.
  - Names tray: where the count shows, and "6" or "6/8".
  - Logo tray: the name beside the logo.
  - None of it shows until the sticker list says passbox draws the options.
- **Styled cards are drawn by passbox.** PunchMe's `StampGrid` mirrors only v0.1's circles; for anything
  styled, the studio, the Overview and the card page ask passbox to draw it.
- **The catalog:**
  - Twelve styled looks, seeded as drafts: café ×4 (the references), barber, trainer, therapist and other ×2
    each.
  - Staff publish them from /admin.
  - **Four use the check mark** (`cafe-bakery-croissants`, `cafe-count-on-top`, `therapist-herbs`,
    `trainer-running-shoes`). Given Roee's preference, turn it off before publishing.
- **Known gaps** (from the PRs):
  - The onboarding wizard skips styled looks: it can offer a look only as its colours.
  - The public card page doesn't print the name beside the logo.
  - The admin catalog list draws styled looks as plain circles.
  - `AppleCardPreview`'s header and logo-text changes await Roee's yes.

## 6. Proposal: native in Card Studio

The controls exist; the goal is that a business owner never has to think about "style", "tint" or
"wallpaper". Suggested shape:

1. **Looks first, settings second.**
   - Open the studio on a gallery of whole looks for the business's trade, each drawn by passbox with the
     business's own name and colour.
   - Picking one sets every option at once. The trays stay for fine-tuning, under "Customise".
2. **One brand colour drives the rest.** From the brand colour, derive:
   - the card background (the brand colour)
   - the stamp colour (the brand colour)
   - the panel (a very light tint of it, or cream)
   - the text colour (white or near-black, by contrast)

   Lint's panel-contrast and stamp-contrast warnings then rarely fire. Show the derived colours; let owners
   override them.
3. **A sticker picker by trade, in Hebrew.**
   - Group the 65 stickers by the trades below.
   - Show the business's trade first and the rest under "more".
   - Search by Hebrew names (suggested labels below).
4. **Hide what draws nothing** instead of warning:
   - the check and the tint only with icon style
   - the tint only with a sticker or uploaded art
   - the wallpaper not with a strip background image
   - the name-beside-logo switch only with an uploaded logo mark, not a wide wordmark (2:1 or wider)
5. **Defaults for new cards:**
   - icon style with a sticker, tint on, a panel, and no check mark
   - the count in the header as "6/8" (Android keeps "6")
6. **Long names:**
   - Show a hint when the business name is over 20 characters (Google cuts it) and when the name beside the
     logo would be long (iOS cuts it with "…").
   - Possibly a separate short card name later (that's a product decision).
7. **Tell owners edits are quiet:** "Customers' cards update quietly; only new stamps notify". That makes
   experimenting feel safe.
8. **Keep a stamp alert message in every design**, so stamps notify on the iPhone.

## 7. Proposal: native in onboarding

Today the wizard (it reads `GET /presets`, and its tiles are `src/components/onboarding/LookTile.tsx` in
punchme-frontend) can show a look only as colours, so it leaves styled looks out. A native flow, drawn by
passbox:

1. **What kind of business?** (café, bakery, barber, beauty, wellness, fitness, pets, flowers, food,
   other.) This picks the gallery and the sticker group.
2. **Pick a look:**
   - Show 3–4 styled catalog looks for that trade as real card pictures.
   - Pre-render each published look's tile once, when staff publish it, and serve it as a static image.
     The public wizard then needs no live passbox call per visitor.
3. **Your colour:**
   - Offer a row of brand colours, plus "your own". The chosen look redraws in it, with the derived colours
     from §6.2.
   - Use one live preview, requested through PunchMe's backend (the passbox API key never reaches the
     browser), debounced, cached by design, and asking only for `strip@2x`.
4. **Your stamp:**
   - The trade's sticker row, plus "more".
   - Optionally "your own picture", an upload as `stamp_art`, which tint can recolour.
5. **Name and logo:**
   - The business name.
   - An optional logo. A mark (narrower than 2:1) turns on "name beside the logo"; a wide wordmark doesn't.
6. **Reward and number of stamps,** as today.
7. **Done:** the first card is created from the chosen look. Card Studio is the place to fine-tune later.

**Two ways to draw the pictures:**
- **(a) Ask passbox** (what PR #40 does in the studio): exact, nothing to keep in sync, a round trip per
  change.
- **(b) Mirror the styled grid in the frontend** (like `StampGrid` mirrors the circles): instant, but a second
  renderer to keep pixel-close to passbox's.

Start with (a) plus caching. Consider (b) only if the wizard feels slow.

### Trade → look recipes (starting points for catalog looks)

| Trade | Sticker | Style | Panel | Wallpaper |
|---|---|---|---|---|
| Café | `hot-beverage`, `teacup-without-handle` | icon | white or cream | none (`beans` is legumes, not coffee) |
| Bubble tea / drinks | `bubble-tea`, `cup-with-straw` | icon, own colours | none on a dark card | none |
| Bakery | `croissant`, `bread`, `cupcake` | icon, tinted | cream | `sheaf-of-rice` |
| Barber | `scissors`, `barber-pole` | circle | navy | `sparkles` |
| Beauty / nails | `nail-polish`, `lipstick` | icon | light pink | `sparkles` |
| Wellness / therapist | `lotus`, `herb` | icon, tinted | sage or cream | `leaf-fluttering-in-wind` |
| Fitness | `running-shoe`, `flexed-biceps` | icon | none on a dark card | none |
| Pets | `paw-prints`, `dog-face` | icon | light | `bone` |
| Flowers | `tulip`, `bouquet` | icon | light | `leaf-fluttering-in-wind` |
| Food | `pizza`, `falafel`, `hamburger` | icon | light | none |
| Other | `star`, `red-heart`, `wrapped-gift` | icon, tinted | light | `sparkles` |

### The 65 stickers by trade, with suggested Hebrew labels

| Group | Stickers (suggested label) |
|---|---|
| Café and drinks | `hot-beverage` משקה חם, `teacup-without-handle` כוס תה, `bubble-tea` באבל טי, `cup-with-straw` כוס עם קש, `tropical-drink` קוקטייל, `glass-of-milk` כוס חלב, `wine-glass` כוס יין, `beer-mug` בירה |
| Bakery and sweets | `croissant` קרואסון, `bread` לחם, `baguette-bread` באגט, `pretzel` בייגלה, `bagel` בייגל, `cupcake` קאפקייק, `shortcake` עוגת תותים, `birthday-cake` עוגת יום הולדת, `doughnut` סופגנייה, `cookie` עוגייה, `pancakes` פנקייק |
| Food | `pizza` פיצה, `hamburger` המבורגר, `taco` טאקו, `sushi` סושי, `steaming-bowl` קערה חמה, `green-salad` סלט, `sandwich` כריך, `falafel` פלאפל, `stuffed-flatbread` פיתה ממולאת, `ice-cream` גלידה, `soft-ice-cream` גלידה אמריקאית |
| Barber and beauty | `barber-pole` עמוד מספרה, `scissors` מספריים, `nail-polish` לק, `lipstick` שפתון, `lotion-bottle` קרם, `soap` סבון |
| Wellness | `lotus` לוטוס, `herb` צמח תבלין, `candle` נר, `potted-plant` עציץ, `seedling` נבט |
| Fitness and sport | `running-shoe` נעל ריצה, `boxing-glove` כפפת אגרוף, `soccer-ball` כדורגל, `trophy` גביע, `flexed-biceps` שריר |
| Pets | `paw-prints` טביעות כפות, `dog-face` כלב, `bone` עצם |
| Flowers | `tulip` צבעוני, `rose` ורד, `sunflower` חמנייה, `bouquet` זר פרחים |
| Gifts and general | `wrapped-gift` מתנה, `party-popper` קונפטי, `star` כוכב, `glowing-star` כוכב נוצץ, `red-heart` לב, `gem-stone` יהלום, `crown` כתר, `shopping-bags` שקיות קניות, `sparkles` נצנצים |
| Wallpaper motifs (also stamps) | `sheaf-of-rice` שיבולים, `beans` פולים, `leaf-fluttering-in-wind` עלים ברוח |

## 8. Not built in passbox (ask if a design needs one)

- a 6+4 row split (rows are balanced)
- built-in photo textures, such as brew's foam (they need a licence decision); an owner can upload one as
  the strip background
- per-holder values such as "2 rewards waiting" or "member since"
- the panel's size and corners as settings
