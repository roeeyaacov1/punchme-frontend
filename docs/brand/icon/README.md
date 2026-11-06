# The square icon

The tab icon and the home-screen icons are a square mark of their own. The
wordmark (`public/logo.png`) is four times wider than tall, and a tab
squeezed it to a smudge. Each mark is the logo's card stack on an opaque Sign
Coral plate, so it holds on a dark tab strip as well as a light one; soft ink
on coral is 5.50:1.

| File | Mark |
| --- | --- |
| `a-three-cards-dark-back.svg` | **In use since 6 Nov 2026.** Three cards fanned like the old icon, the back one solid ink, the front one punched. |
| `b-three-cards-two-dark.svg` | Three cards, the two behind solid ink and split by a coral gap. |
| `c-three-cards-cream.svg` | Three cream cards in ink outline, closest to the old line-art icon. Busiest at 16px. |
| `two-cards.svg` | Two cards and the punch. The plainest at 16px. |

To switch, run the script with another option. It writes `favicon.svg`,
`favicon.png` and the four home-screen PNGs in `public/`:

```bash
bash docs/brand/icon/make-icons.sh docs/brand/icon/c-three-cards-cream.svg
```

The home-screen icons are full-bleed, since iOS and Android round or mask them
themselves, and draw the mark smaller (`APP=0.88`, `MASK=0.66` of the
favicon's scale). The maskable icon must keep the mark inside the middle 80%
circle: A reaches 0.29 of the width from the centre, against 0.40 allowed.
Check that again for a new mark.
