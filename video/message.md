# The message to send with the video

For Roee to send on WhatsApp with `out/punchme-promo-he.mp4` or
`out/punchme-promo-en.mp4`. Plain, like the site: who's writing, what it is,
what it costs, where to look, and the source of the one figure in the video,
since a video can't be clicked. The video has sound (made for it, nothing licensed) but says everything on screen too.

## Hebrew

```text
היי, כאן רואי יעקב. אני בונה את PunchMe: כרטיסיית נאמנות דיגיטלית לעסקים קטנים, שנכנסת לארנק בטלפון של הלקוחות, Apple Wallet או Google Wallet. בלי אפליקציה, בלי חשבון, בלי סיסמה.

מעצבים את הכרטיסייה ומנסים אותה בטלפון שלכם בחינם. ‏₪99 לחודש כולל מע״מ, רק מהרגע שלקוחות יכולים להצטרף, ואפשר לבטל בכל רגע.

punchmeapp.com

הנתון בסרטון (פי 6) מתוך Square Local Economy Report, מרץ 2026, נתונים מארה״ב. ‏Square הגדירה לקוח קבוע כמי שמגיע לפחות ארבע פעמים בשנה:
https://squareup.com/us/en/press/2026-local-economy-report

אם יש שאלות, אשמח לענות.
```

## English

```text
Hi, it's Roee Yaacov. I make PunchMe: a digital loyalty punch card for small businesses that goes into your customers' phone wallet, Apple Wallet or Google Wallet. No app, no account, no password.

Designing the card and trying it on your own phone is free. It's ₪99 a month including VAT, only once customers can join, and you can cancel any time.

punchmeapp.com

The figure in the video (6x) is from Square's Local Economy Report, March 2026, US data. Square counts a regular as someone who visits at least four times a year:
https://squareup.com/us/en/press/2026-local-economy-report

Happy to answer any questions.
```

## Notes

- The figure's link is `square` in `src/components/marketing/sources.ts`.
  The definition of a regular is the landing page's own caveat
  (`landing.proof.stats.0.context`).
- The Hebrew lines that open with "₪99" or "Square" start with a
  right-to-left mark, as the site's copy does, so WhatsApp keeps them right
  to left. Copy the block as it is.
- Nothing here promises results: no "more customers", no "they'll come back".
