# PunchMe copy deck — real product strings (EN + HE)

Generated from `src/i18n/locales/{en,he}/common.json` on 2026-08-23.
Attach this file to the Figma Make chat. **Use these strings verbatim in designs — never invent
Hebrew, never use lorem ipsum.** `{{x}}` are runtime placeholders — substitute realistic values
(counts, names, dates) in mockups. Keys with `_one/_two/_many/_other` are plural forms — pick
the form matching the number shown.

## Shell & navigation

| key | English | Hebrew |
|---|---|---|
| `language.switch` | עברית | English |
| `auth.loadingSession` | Loading... | טוען... |
| `dashboard.nav.overview` | Overview | סקירה |
| `dashboard.nav.design` | Card Studio | סטודיו הכרטיסיות |
| `dashboard.nav.customers` | Customers | לקוחות |
| `dashboard.nav.activity` | Activity | פעילות |
| `dashboard.nav.scan` | Scan | סריקה |
| `dashboard.nav.standee` | Standee | שילוט |
| `dashboard.nav.team` | Team | צוות |
| `dashboard.nav.billing` | Billing | חיוב |
| `dashboard.nav.signOut` | Sign out | התנתקות |
| `dashboard.nav.label` | Dashboard sections | מדורי לוח הבקרה |
| `dashboard.nav.more` | More | עוד |
| `dashboard.nav.messages` | Customer messages | הודעות ללקוחות |
| `dashboard.plan.free` | Free | חינמי |
| `dashboard.plan.pro` | Pro | פרו |
| `dashboard.groups.counter` | Counter | דלפק |
| `dashboard.groups.setup` | Setup | הגדרה |
| `dashboard.groups.account` | Account | חשבון |
| `dashboard.groups.marketing` | Marketing | שיווק |
| `dashboard.theme.label` | Appearance | מראה |
| `dashboard.theme.light` | Light | בהיר |
| `dashboard.theme.dark` | Dark | כהה |
| `dashboard.theme.system` | System | מערכת |
| `team.denied.title` | This page isn't yours to open | הדף הזה לא פתוח בשבילך |
| `team.denied.manager` | Only a manager or the owner can change the card, the poster and the messages. | רק מנהל/ת או הבעלים יכולים לשנות את הכרטיס, את השלט ואת ההודעות. |
| `team.denied.owner` | Only the owner can open billing and the team. | רק הבעלים יכול/ה לפתוח חיוב וצוות. |
| `team.denied.back` | Back to the dashboard | חזרה ללוח |

## Common words

| key | English | Hebrew |
|---|---|---|
| `common.save` | Save | שמירה |
| `common.next` | Next | הבא |
| `common.back` | Back | חזרה |
| `common.loading` | Loading... | טוען... |
| `common.retry` | Try again | נסו שוב |
| `common.copyLink` | Copy link | העתקת קישור |
| `common.copied` | Copied! | הועתק! |
| `common.remove` | Remove | הסרה |
| `common.edit` | Edit | עריכה |
| `common.cancel` | Cancel | ביטול |

## Overview

| key | English | Hebrew |
|---|---|---|
| `dashboard.brief.title` | The last {{days}} days | {{days}} הימים האחרונים |
| `dashboard.brief.hint` | Someone who came back — stamped on two or more separate days. | מי שחזר — קיבל חותמת בשני ימים שונים או יותר. |
| `dashboard.brief.verdict_one` | person came back | לקוח חזר |
| `dashboard.brief.verdict_other` | people came back | לקוחות חזרו |
| `dashboard.brief.verdictNone` | Nobody came back | אף אחד לא חזר |
| `dashboard.brief.moreThanBefore_one` | 1 more than the {{days}} days before | אחד יותר מ־{{days}} הימים שלפני |
| `dashboard.brief.moreThanBefore_other` | {{count}} more than the {{days}} days before | {{count}} יותר מ־{{days}} הימים שלפני |
| `dashboard.brief.fewerThanBefore_one` | 1 fewer than the {{days}} days before | אחד פחות מ־{{days}} הימים שלפני |
| `dashboard.brief.fewerThanBefore_other` | {{count}} fewer than the {{days}} days before | {{count}} פחות מ־{{days}} הימים שלפני |
| `dashboard.brief.sameAsBefore` | Same as the {{days}} days before | כמו {{days}} הימים שלפני |
| `dashboard.brief.capped` | Busier than this page can load, so these are the least it can prove. | עמוס יותר ממה שהדף יכול לטעון, אז אלה המספרים הנמוכים ביותר שאפשר להוכיח. |
| `dashboard.brief.stats.joined` | New customers | לקוחות חדשים |
| `dashboard.brief.stats.visits` | Visits | ביקורים |
| `dashboard.today.title` | Worth doing | כדאי לעשות |
| `dashboard.today.clear` | Nothing needs you right now. | אין כרגע משהו שדורש אותך. |
| `dashboard.today.inactive_one` | 1 customer hasn't been back in {{days}} days. | לקוח אחד לא חזר כבר {{days}} ימים. |
| `dashboard.today.inactive_other` | {{count}} customers haven't been back in {{days}} days. | {{count}} לקוחות לא חזרו כבר {{days}} ימים. |
| `dashboard.today.inactiveCta` | Win them back | להחזיר אותם |
| `dashboard.today.birthday_one` | 1 birthday this month. | יום הולדת אחד החודש. |
| `dashboard.today.birthday_other` | {{count}} birthdays this month. | {{count}} ימי הולדת החודש. |
| `dashboard.today.birthdayCta` | Send a greeting | לשלוח ברכה |
| `dashboard.today.quiet_one` | Nothing has been scanned for a day. | לא נסרק כלום כבר יום. |
| `dashboard.today.quiet_other` | Nothing has been scanned for {{count}} days. | לא נסרק כלום כבר {{count}} ימים. |
| `dashboard.today.quietCta` | Open the scanner | לפתוח את הסורק |
| `dashboard.qr.title` | Your enrollment QR | קוד ה-QR להרשמה |
| `dashboard.qr.activateCta` | Activate to get your QR code | הפעילו כדי לקבל קוד QR |
| `dashboard.preview.title` | Try your card yourself | נסו את הכרטיסייה בעצמכם |
| `dashboard.preview.body` | Add your own card to your wallet — free, no activation needed. | הוסיפו את הכרטיסייה שלכם לארנק — בחינם, בלי צורך בהפעלה. |
| `dashboard.install.title` | Put PunchMe on your phone | התקינו את PunchMe בטלפון |
| `dashboard.install.body` | A home-screen icon that opens straight to your counter — full screen, no browser bars. | אייקון במסך הבית שנפתח ישר לדלפק — מסך מלא, בלי סרגלי דפדפן. |
| `dashboard.install.cta` | Install | התקנה |
| `dashboard.install.iosCta` | Show me how | איך עושים את זה |
| `dashboard.install.notNow` | Not now | לא עכשיו |
| `dashboard.install.collapsed` | Put PunchMe on your phone | התקינו את PunchMe בטלפון |
| `dashboard.install.step1` | Tap the Share button in Safari's toolbar | הקישו על כפתור השיתוף בסרגל של ספארי |
| `dashboard.install.step2` | Choose “Add to Home Screen” | בחרו ב״הוספה למסך הבית״ |
| `dashboard.install.step3` | Tap Add — the icon lands on your home screen | הקישו על הוספה — האייקון יופיע במסך הבית |
| `dashboard.install.iosCaveat` | Two things iPhone does that we can't change: you will sign in once more inside the app, and the scanner may ask for the camera again each time you open it. | שני דברים שהאייפון עושה ואי אפשר לשנות: תצטרכו להתחבר עוד פעם אחת בתוך האפליקציה, והסורק עשוי לבקש גישה למצלמה בכל פתיחה. |
| `dashboard.week.title` | This week | השבוע |
| `dashboard.week.stamps_one` | stamp | ניקוב |
| `dashboard.week.stamps_other` | stamps | ניקובים |
| `dashboard.week.moreThanLast_one` | 1 more than last week | אחד יותר משבוע שעבר |
| `dashboard.week.moreThanLast_other` | {{count}} more than last week | {{count}} יותר משבוע שעבר |
| `dashboard.week.fewerThanLast_one` | 1 fewer than last week | אחד פחות משבוע שעבר |
| `dashboard.week.fewerThanLast_other` | {{count}} fewer than last week | {{count}} פחות משבוע שעבר |
| `dashboard.week.sameAsLast` | Same as last week | כמו שבוע שעבר |
| `dashboard.near.title` | Close to a reward | קרובים לפרס |
| `dashboard.near.empty` | Nobody's close yet — this fills up as people collect. | עדיין אף אחד לא קרוב — זה יתמלא ככל שיאספו ניקובים. |
| `dashboard.near.all` | All customers | כל הלקוחות |
| `dashboard.near.toGo_one` | 1 to go | נשאר ניקוב אחד |
| `dashboard.near.toGo_other` | {{count}} to go | נשארו {{count}} ניקובים |
| `dashboard.start.title` | Get your first customer | להביא את הלקוח הראשון |
| `dashboard.start.designed` | Your card is designed. Change anything, any time. | הכרטיסייה שלכם מעוצבת. אפשר לשנות הכול, בכל רגע. |
| `dashboard.start.print` | Print a standee so people at the counter can scan it. | הדפיסו שילוט כדי שאנשים ליד הדלפק יוכלו לסרוק. |
| `dashboard.start.activate` | Activate to let real customers join and start collecting. | הפעילו כדי שלקוחות אמיתיים יוכלו להצטרף ולהתחיל לאסוף. |

## Customers

| key | English | Hebrew |
|---|---|---|
| `dashboard.customers.title` | Customers | לקוחות |
| `dashboard.customers.emptyFree` | Activate to start enrolling real customers | הפעילו כדי להתחיל לרשום לקוחות אמיתיים |
| `dashboard.customers.emptyPro` | Share your QR or standee to get your first one | שתפו את קוד ה-QR או השילוט כדי לקבל את הלקוח הראשון |
| `dashboard.customers.searchLabel` | Search customers | חיפוש לקוחות |
| `dashboard.customers.searchPlaceholder` | Search by name, phone, or card | חיפוש לפי שם, טלפון או כרטיסייה |
| `dashboard.customers.noMatches` | No customers match that search. | לא נמצאו לקוחות שמתאימים לחיפוש. |
| `dashboard.customers.clearFilters` | Clear filters | ניקוי הסינון |
| `dashboard.customers.showing` | {{total}} customers | {{total}} לקוחות |
| `dashboard.customers.showingFiltered` | {{shown}} of {{total}} customers | {{shown}} מתוך {{total}} לקוחות |
| `dashboard.customers.truncated` | Showing the first {{shown}} customers — search and export cover only these until the API gains a search parameter. | מוצגים {{shown}} הלקוחות הראשונים — החיפוש והייצוא מכסים רק אותם עד שה-API יתמוך בפרמטר חיפוש. |
| `dashboard.customers.columns.customer` | Customer | לקוח |
| `dashboard.customers.columns.name` | Name | שם |
| `dashboard.customers.columns.phone` | Phone | טלפון |
| `dashboard.customers.columns.progress` | Progress | התקדמות |
| `dashboard.customers.columns.status` | Status | סטטוס |
| `dashboard.customers.columns.card` | Card | כרטיסייה |
| `dashboard.customers.columns.stamps` | Stamps | ניקובים |
| `dashboard.customers.columns.required` | Stamps required | ניקובים לפרס |
| `dashboard.customers.columns.joined` | Joined | תאריך הצטרפות |
| `dashboard.customers.columns.actions` | Actions | פעולות |
| `dashboard.customers.stats.total` | Customers | לקוחות |
| `dashboard.customers.stats.ready` | Reward ready | מוכנים לפרס |
| `dashboard.customers.stats.recent` | Joined in {{days}} days | הצטרפו ב-{{days}} הימים האחרונים |
| `dashboard.customers.filter.label` | Show | הצגה |
| `dashboard.customers.filter.all` | Everyone | כולם |
| `dashboard.customers.filter.ready` | Reward ready | מוכנים לפרס |
| `dashboard.customers.filter.oneAway` | One stamp away | ניקוב אחד לפרס |
| `dashboard.customers.filter.progress` | In progress | באמצע הדרך |
| `dashboard.customers.filter.new` | No stamps yet | ללא ניקובים |
| `dashboard.customers.filter.void` | Void | מבוטלות |
| `dashboard.customers.sort.label` | Sort by | מיון לפי |
| `dashboard.customers.sort.progress` | Most stamps | הכי הרבה ניקובים |
| `dashboard.customers.sort.recent` | Recently joined | הצטרפו לאחרונה |
| `dashboard.customers.sort.name` | Name | שם |
| `dashboard.customers.status.ready` | Reward ready | מוכן לפרס |
| `dashboard.customers.status.progress` | In progress | באמצע הדרך |
| `dashboard.customers.status.new` | No stamps yet | אין ניקובים עדיין |
| `dashboard.customers.status.void` | Void | מבוטלת |
| `dashboard.customers.stamps.add` | Add a stamp | הוספת ניקוב |
| `dashboard.customers.stamps.remove` | Remove a stamp | הסרת ניקוב |
| `dashboard.customers.stamps.atMax` | This card is already full | הכרטיסייה כבר מלאה |
| `dashboard.customers.stamps.atZero` | No stamps to remove | אין ניקובים להסרה |
| `dashboard.customers.stamps.pendingBackend` | Adding and removing stamps needs a backend endpoint that isn't deployed yet — see docs/customers-backend-issues.md | הוספה והסרה של ניקובים דורשות נקודת קצה בשרת שעדיין לא עלתה — ראו docs/customers-backend-issues.md |
| `dashboard.customers.stamps.voided` | This card has been voided | הכרטיסייה בוטלה |
| `dashboard.customers.stamps.conflict` | Someone else changed this card first — we've refreshed it to the current count, so check it and try again. | מישהו אחר עדכן את הכרטיסייה לפניכם — רועננו אותה למספר הנוכחי, בדקו ונסו שוב. |
| `dashboard.customers.stamps.failed` | Couldn't update that card: {{reason}} | עדכון הכרטיסייה נכשל: {{reason}} |
| `dashboard.customers.menu.label` | More for {{name}} | עוד פעולות עבור {{name}} |
| `dashboard.customers.menu.copyPhone` | Copy phone number | העתקת מספר הטלפון |
| `dashboard.customers.menu.copied` | Phone number copied | מספר הטלפון הועתק |
| `dashboard.customers.menu.remove` | Remove from list | הסרה מהרשימה |
| `dashboard.customers.menu.unnamed` | this customer | הלקוח הזה |
| `dashboard.customers.menu.message` | Send a message | שליחת הודעה |
| `dashboard.customers.message.title` | Message {{name}} | הודעה אל {{name}} |
| `dashboard.customers.message.placeholder` | Your order is ready — see you today! | ההזמנה שלך מוכנה — נתראה היום! |
| `dashboard.customers.message.hint` | Arrives as a notification on her wallet pass. Only she sees it. | מגיעה כהתראה על הכרטיס בארנק. רק הוא רואה אותה. |
| `dashboard.customers.message.send` | Send | לשלוח |
| `dashboard.customers.message.sent` | Message sent to {{name}}. | ההודעה נשלחה אל {{name}}. |
| `dashboard.customers.message.remaining` | {{n}} characters left | נותרו {{n}} תווים |
| `dashboard.customers.message.failed` | Couldn't send that message: {{reason}} | שליחת ההודעה נכשלה: {{reason}} |
| `dashboard.customers.remove.title` | Remove {{name}}? | להסיר את {{name}}? |
| `dashboard.customers.remove.body` | Their card, the stamps on it and their whole visit history are deleted permanently. This can't be undone. | הכרטיסייה, הניקובים שנצברו וכל היסטוריית הביקורים יימחקו לצמיתות. אי אפשר לבטל את הפעולה. |
| `dashboard.customers.remove.wallet` | The pass already in their wallet stops working, but stays on their phone until they delete it themselves — no business can remove it for them. | הכרטיס שכבר נמצא בארנק בטלפון יפסיק לעבוד, אבל יישאר שם עד שהלקוח ימחק אותו בעצמו — לאף עסק אין דרך להסיר אותו מרחוק. |
| `dashboard.customers.remove.rejoin` | They can sign up again from your QR code or standee, as a new customer starting from zero. | הלקוח יוכל להצטרף שוב דרך קוד ה-QR או השילוט שלכם, כלקוח חדש שמתחיל מאפס. |
| `dashboard.customers.remove.confirm` | Remove | להסיר |
| `dashboard.customers.remove.failed` | Couldn't remove that customer: {{reason}} | הסרת הלקוח נכשלה: {{reason}} |
| `dashboard.customers.export.cta` | Export CSV | ייצוא ל-CSV |
| `dashboard.customers.export.filename` | punchme-customers | punchme-customers |

## Activity

| key | English | Hebrew |
|---|---|---|
| `dashboard.activity.title` | Activity | פעילות |
| `dashboard.activity.emptyFree` | Activate to start enrolling real customers | הפעילו כדי להתחיל לרשום לקוחות אמיתיים |
| `dashboard.activity.emptyPro` | Activity will show up here once customers start collecting stamps | הפעילות תופיע כאן ברגע שלקוחות יתחילו לאסוף ניקובים |
| `dashboard.activity.today` | Today | היום |
| `dashboard.activity.yesterday` | Yesterday | אתמול |
| `dashboard.activity.by` | by {{who}} | על ידי {{who}} |
| `dashboard.activity.cardSerial` | Card | כרטיס |
| `dashboard.activity.body` | Pick a day on the chart, or filter below, to find an event. | בחרו יום בגרף, או סננו למטה, כדי למצוא אירוע. |
| `dashboard.activity.chartTitle` | Stamps per day | ניקובים ליום |
| `dashboard.activity.columns.date` | Date | תאריך |
| `dashboard.activity.columns.customer` | Customer | לקוח |
| `dashboard.activity.columns.action` | Action | פעולה |
| `dashboard.activity.columns.by` | By | בוצע על ידי |
| `dashboard.activity.action.stamp_one` | Stamp | ניקוב |
| `dashboard.activity.action.stamp_other` | {{count}} stamps | {{count}} ניקובים |
| `dashboard.activity.action.gift` | Gift | מתנה |
| `dashboard.activity.action.manual` | Added by hand | נוסף ידנית |
| `dashboard.activity.action.removed_one` | Removed | ניקוב הוסר |
| `dashboard.activity.action.removed_other` | {{count}} removed | {{count}} ניקובים הוסרו |
| `dashboard.activity.action.import` | Import | ייבוא |
| `dashboard.activity.chartTitleRemoved` | Stamps removed per day | ניקובים שהוסרו ליום |
| `dashboard.activity.chartHint` | Tap a day to show only its events. | הקישו על יום כדי לראות רק את האירועים שלו. |
| `dashboard.activity.period.label` | Period | תקופה |
| `dashboard.activity.period.days_one` | 1 day | יום |
| `dashboard.activity.period.days_other` | {{count}} days | {{count}} ימים |
| `dashboard.activity.searchLabel` | Search activity | חיפוש בפעילות |
| `dashboard.activity.searchPlaceholder` | Customer, card or staff | לקוח, כרטיס או עובד |
| `dashboard.activity.allActions` | Any action | כל הפעולות |
| `dashboard.activity.allPeople` | Anyone | כולם |
| `dashboard.activity.automatic` | Automatic | אוטומטי |
| `dashboard.activity.clearDay` | Clear the {{day}} filter | ביטול הסינון של {{day}} |
| `dashboard.activity.noMatches` | No events match these filters | אין אירועים שמתאימים לסינון |
| `dashboard.activity.emptyPeriod_one` | Nothing was stamped today | לא נרשם ניקוב היום |
| `dashboard.activity.emptyPeriod_other` | Nothing was stamped in the last {{count}} days | לא נרשמו ניקובים ב-{{count}} הימים האחרונים |
| `dashboard.activity.showing` | Showing {{shown}} of {{total}} | מוצגים {{shown}} מתוך {{total}} |
| `dashboard.activity.truncated` | Showing the {{shown}} most recent events — the period holds more than this page can load. | מוצגים {{shown}} האירועים האחרונים — בתקופה הזו יש יותר ממה שאפשר לטעון בבת אחת. |

## Scan

| key | English | Hebrew |
|---|---|---|
| `dashboard.scan.title` | Scan a card | סריקת כרטיסייה |
| `dashboard.scan.lead` | Hold the customer's pass up to the camera. It punches the moment it reads — there is no button to press. | הצמידו את הכרטיס של הלקוח למצלמה. הניקוב נרשם ברגע שהקוד נקרא — בלי ללחוץ על כלום. |
| `dashboard.scan.aim` | Hold the pass in the frame | החזיקו את הכרטיס בתוך המסגרת |
| `dashboard.scan.starting` | Opening the camera… | פותחים את המצלמה… |
| `dashboard.scan.working` | Reading… | קורא… |
| `dashboard.scan.retry` | Try again | נסו שוב |
| `dashboard.scan.torch` | Light | פנס |
| `dashboard.scan.sound` | Sound | צליל |
| `dashboard.scan.freePlan` | Your card isn't live yet, so there is nobody to scan. | הכרטיסייה עדיין לא פעילה, אז אין את מי לסרוק. |
| `dashboard.scan.freePlanCta` | Activate it | הפעילו אותה |
| `dashboard.scan.denied.title` | The camera is blocked | המצלמה חסומה |
| `dashboard.scan.denied.body` | Allow camera access for this site in your browser settings, then try again. You can also type a code by hand below. | אפשרו לאתר גישה למצלמה בהגדרות הדפדפן ונסו שוב. אפשר גם להקליד את הקוד ידנית למטה. |
| `dashboard.scan.noCamera.title` | No camera found | לא נמצאה מצלמה |
| `dashboard.scan.noCamera.body` | There's no camera here the browser can open. Type the code by hand below, or open this page on your phone. | אין כאן מצלמה שהדפדפן יכול לפתוח. הקלידו את הקוד ידנית למטה, או פתחו את הדף בטלפון. |
| `dashboard.scan.unsupported.title` | The camera can't open here | אי אפשר לפתוח כאן מצלמה |
| `dashboard.scan.unsupported.body` | Browsers only hand over the camera on a secure (https) page. Type the code by hand below. | דפדפנים מוסרים את המצלמה רק בעמוד מאובטח (https). הקלידו את הקוד ידנית למטה. |
| `dashboard.scan.failed.title` | The camera didn't start | המצלמה לא נפתחה |
| `dashboard.scan.failed.body` | Something else may be using it. Close other camera apps and try again. | ייתכן שמשהו אחר משתמש בה. סגרו אפליקציות מצלמה אחרות ונסו שוב. |
| `dashboard.scan.manual.toggle` | Type the code instead | הקלדת קוד במקום |
| `dashboard.scan.manual.label` | Card code | קוד הכרטיסייה |
| `dashboard.scan.manual.submit` | Punch | ניקוב |
| `dashboard.scan.manual.hint` | The code on the customer's pass, under the barcode. | הקוד שעל הכרטיס של הלקוח, מתחת לברקוד. |
| `dashboard.scan.tally.punches_one` | 1 punch so far | ניקוב אחד עד כה |
| `dashboard.scan.tally.punches_other` | {{count}} punches so far | {{count}} ניקובים עד כה |
| `dashboard.scan.tally.rewards_one` | 1 reward given | פרס אחד ניתן |
| `dashboard.scan.tally.rewards_other` | {{count}} rewards given | {{count}} פרסים ניתנו |
| `dashboard.scan.tally.seeAll` | See all activity | לכל הפעילות |
| `dashboard.scan.result.stamped` | Punched | ניקוב נוסף |
| `dashboard.scan.result.toGo_one` | 1 more to the reward | עוד ניקוב אחד לפרס |
| `dashboard.scan.result.toGo_other` | {{count}} more to the reward | עוד {{count}} ניקובים לפרס |
| `dashboard.scan.result.rewardReady` | Card full! | הכרטיסייה מלאה! |
| `dashboard.scan.result.alreadyFull` | This card is already full | הכרטיסייה כבר מלאה |
| `dashboard.scan.result.redeem` | Reward given | הפרס ניתן |
| `dashboard.scan.result.redeeming` | Saving… | שומרים… |
| `dashboard.scan.result.notNow` | Not now | לא עכשיו |
| `dashboard.scan.result.redeemed` | Reward given | הפרס ניתן |
| `dashboard.scan.result.redeemedHint` | The card is back to zero, and their pass has already updated. | הכרטיסייה אופסה, והכרטיס בארנק כבר התעדכן. |
| `dashboard.scan.result.tooSoon` | Already punched | כבר נוקבה |
| `dashboard.scan.result.tooSoonHint` | It was punched moments ago, so this scan wasn't counted. Wait a minute if this really is a second visit. | הכרטיסייה נוקבה לפני רגע, אז הסריקה הזו לא נספרה. אם זה באמת ביקור נוסף, המתינו דקה. |
| `dashboard.scan.result.unknownCard` | Not one of your cards | לא אחת הכרטיסיות שלכם |
| `dashboard.scan.result.unknownCardHint` | This code doesn't belong to a card at this business. Ask them to open their PunchMe pass. | הקוד הזה לא שייך לכרטיסייה בעסק הזה. בקשו מהלקוח לפתוח את כרטיס ה-PunchMe שלו. |
| `dashboard.scan.result.enrollLink` | That's your sign-up poster | זה השילוט להרשמה שלכם |
| `dashboard.scan.result.enrollLinkHint` | That QR is for customers to join with. Scan the pass in their wallet instead. | קוד ה-QR הזה נועד ללקוחות שנרשמים. סרקו במקומו את הכרטיס שבארנק שלהם. |
| `dashboard.scan.result.foreign` | Not a PunchMe code | זה לא קוד של PunchMe |
| `dashboard.scan.result.foreignHint` | Nothing was changed. Point the camera at the customer's pass. | שום דבר לא השתנה. כוונו את המצלמה לכרטיס של הלקוח. |
| `dashboard.scan.result.voided` | This card was cancelled | הכרטיסייה בוטלה |
| `dashboard.scan.result.voidedHint` | It can't take punches any more. They'll need to join again. | אי אפשר להוסיף לה ניקובים. הלקוח יצטרך להירשם מחדש. |
| `dashboard.scan.result.failed` | The punch didn't go through | הניקוב לא נרשם |
| `dashboard.scan.result.offline` | No connection. Check the network and scan again. | אין חיבור. בדקו את הרשת וסרקו שוב. |
| `dashboard.scan.result.dismiss` | Close | סגירה |

## Messages (hub, composer, automations)

| key | English | Hebrew |
|---|---|---|
| `messaging.title` | Customer messages | הודעות ללקוחות |
| `messaging.lead` | A message that pops up in the customer's wallet — no app, no SMS. Set a rule once and it runs on its own. | הודעה שצצה בארנק של הלקוח — בלי אפליקציה ובלי SMS. מגדירים פעם אחת, והכללים רצים לבד. |
| `messaging.nav` | Customer messages | הודעות ללקוחות |
| `messaging.guard.pro` | Messaging real customers is a Pro feature. You can write rules and send yourself a sample right now. | שליחת הודעות ללקוחות אמיתיים זמינה במסלול Pro. אפשר להגדיר כללים ולשלוח דוגמה לכרטיסייה שלכם כבר עכשיו. |
| `messaging.guard.proLink` | Go Pro | לשדרוג ל-Pro |
| `messaging.guard.notEnabled` | Messaging isn't open for your business yet — we're rolling it out gradually. | שליחת הודעות עדיין לא פתוחה לעסק שלכם — אנחנו פותחים אותה בהדרגה. |
| `messaging.guard.schedulerStale` | The rules haven't run in the last hour. If this keeps up, write to us. | הכללים לא פעלו בשעה האחרונה. אם זה נמשך, כתבו לנו. |
| `messaging.guard.dispatchOff` | Sending is paused on our side for a moment. Rules pick up where they stopped. | השליחה מושהית זמנית מצידנו. הכללים ימשיכו מהמקום שבו עצרו. |
| `messaging.guard.personalOnHold` | More than one customer holds your card design. The wallet publishes a message to a whole design at once, so a rule meant for one person would reach all of them — these rules stay saved, but they won't send. They work again when a wallet can address a single card. | יותר מלקוח אחד מחזיק את עיצוב הכרטיסייה שלך. הארנק מפרסם הודעה לעיצוב שלם בבת אחת, ולכן כלל שנכתב עבור אדם אחד היה מגיע לכולם — כללים כאלה נשמרים, אבל לא יישלחו. הם יחזרו לפעול כשארנק יידע לפנות לכרטיס בודד. |
| `messaging.summary.title` | Who you can reach | למי אפשר להגיע |
| `messaging.summary.audienceNone` | Nobody has your card yet | עדיין אף אחד לא מחזיק בכרטיסייה |
| `messaging.summary.audience_one` | customer has your card | לקוח מחזיק בכרטיסייה |
| `messaging.summary.audience_other` | customers have your card | לקוחות מחזיקים בכרטיסייה |
| `messaging.summary.inactive30` | No visit in 30 days | לא ביקרו 30 יום |
| `messaging.summary.rewardWaiting` | Reward waiting | הפרס מחכה להם |
| `messaging.summary.sentMonth` | Messages this month | הודעות החודש |
| `messaging.broadcast.title` | Message everyone | הודעה לכולם |
| `messaging.broadcast.hint` | A slow day? A special? One message to all your customers, now. | יום שקט? מבצע? הודעה אחת לכל הלקוחות, עכשיו. |
| `messaging.broadcast.cta` | Message everyone | שליחת הודעה לכולם |
| `messaging.broadcast.left_one` | {{count}} send left this week | נותרה לכם שליחה אחת השבוע |
| `messaging.broadcast.left_other` | {{count}} sends left this week | נותרו לכם {{count}} שליחות השבוע |
| `messaging.broadcast.nextAllowed` | Next send possible at {{when}} | השליחה הבאה אפשרית ב-{{when}} |
| `messaging.broadcast.composerTitle` | Message all customers | הודעה לכל הלקוחות |
| `messaging.broadcast.composerLead` | Goes out now to every customer with a card. You can add a gift stamp. | נשלח עכשיו לכל הלקוחות עם כרטיסייה. אפשר לצרף ניקוב במתנה. |
| `messaging.broadcast.send_one` | Send to {{count}} customer | שליחה ללקוח אחד |
| `messaging.broadcast.send_other` | Send to {{count}} customers | שליחה ל-{{count}} לקוחות |
| `messaging.broadcast.sendZero` | Nobody to send to right now | אין כרגע למי לשלוח |
| `messaging.broadcast.confirmTitle` | Send now? | לשלוח עכשיו? |
| `messaging.broadcast.confirmBody_one` | The message goes out now to {{count}} customer and cannot be undone. | ההודעה תישלח עכשיו ללקוח אחד ואי אפשר לבטל אותה. |
| `messaging.broadcast.confirmBody_other` | The message goes out now to {{count}} customers and cannot be undone. | ההודעה תישלח עכשיו ל-{{count}} לקוחות ואי אפשר לבטל אותה. |
| `messaging.broadcast.confirmYes` | Yes, send now | כן, לשלוח עכשיו |
| `messaging.broadcast.sent` | Your message is on its way. Progress shows below. | ההודעה יצאה לדרך. ההתקדמות מופיעה למטה. |
| `messaging.broadcast.quota` | To keep from flooding customers you can send up to {{max}} broadcasts a week. {{next}} | כדי לא להציף את הלקוחות אפשר לשלוח עד {{max}} הודעות לכולם בשבוע. {{next}} |
| `messaging.automations.title` | Automatic rules | כללים אוטומטיים |
| `messaging.automations.hint` | Set once, they run on their own — every day at the hour you pick. | מגדירים פעם אחת, והם רצים לבד — כל יום בשעה שבחרתם. |
| `messaging.automations.new` | New rule | כלל חדש |
| `messaging.automations.empty` | No rules yet. Start from a ready one: | עוד אין כללים. התחילו מאחד המוכנים: |
| `messaging.automations.pickRecipe` | Which rule to add? | איזה כלל להוסיף? |
| `messaging.automations.start` | Start | התחלה |
| `messaging.automations.sentMonth_one` | Sent to {{count}} customer this month | נשלח ללקוח אחד החודש |
| `messaging.automations.sentMonth_other` | Sent to {{count}} customers this month | נשלח ל-{{count}} לקוחות החודש |
| `messaging.automations.nextRun` | Next: {{when}} | הפעם הבאה: {{when}} |
| `messaging.automations.off` | Off | כבוי |
| `messaging.automations.on` | On | פעיל |
| `messaging.automations.switchLabel` | Rule is on | הכלל פעיל |
| `messaging.automations.deleted` | Rule removed. | הכלל הוסר. |
| `messaging.automations.onHold` | On hold | בהמתנה |
| `messaging.automations.onHoldWhy` | Won't send while more than one customer holds the card design. | לא יישלח כל עוד יותר מלקוח אחד מחזיק את עיצוב הכרטיסייה. |
| `messaging.kinds.inactive` | Win-back | החזרת לקוחות |
| `messaging.kinds.birthday` | Birthday | יום הולדת |
| `messaging.kinds.reward_waiting` | Reward waiting | הפרס מחכה |
| `messaging.kinds.broadcast` | Message everyone | הודעה לכולם |
| `messaging.describe.birthdayToday` | On the birthday | ביום ההולדת |
| `messaging.describe.gift_one` | {{count}} gift stamp | ניקוב במתנה |
| `messaging.describe.gift_other` | {{count}} gift stamps | {{count}} ניקובים במתנה |
| `messaging.describe.giftFull` | Full card as a gift | כרטיסייה מלאה במתנה |
| `messaging.describe.at` | at {{hour}} | בשעה {{hour}} |
| `messaging.describe.optIn` | opted-in customers only | רק למי שאישר הודעות |
| `messaging.describe.inactive` | Customer away {{days}} | לקוח שלא ביקר {{days}} |
| `messaging.describe.repeat` | and again every {{days}} | ושוב כל {{days}} |
| `messaging.describe.birthdayBefore` | {{days}} before the birthday | {{days}} לפני יום ההולדת |
| `messaging.describe.rewardWaiting` | Reward waiting {{days}} | פרס שמחכה {{days}} |
| `messaging.editor.newTitle` | New rule | כלל חדש |
| `messaging.editor.editTitle` | Edit rule | עריכת כלל |
| `messaging.editor.name` | Rule name | שם הכלל |
| `messaging.editor.namePlaceholder` | e.g. Win back customers who drifted away | למשל: להחזיר לקוחות שנעלמו |
| `messaging.editor.when` | When | מתי |
| `messaging.editor.inactiveDays` | Customers who haven't visited in | לקוחות שלא ביקרו |
| `messaging.editor.customDays` | Other | אחר |
| `messaging.editor.customDaysLabel` | Number of days | מספר ימים |
| `messaging.editor.repeat` | Remind again every few days while they stay away | להזכיר שוב כל כמה ימים, כל עוד לא חזרו |
| `messaging.editor.repeatEvery` | Every how many days | כל כמה ימים |
| `messaging.editor.birthdayWhen` | When to send | מתי לשלוח |
| `messaging.editor.onTheDay` | On the birthday | ביום ההולדת |
| `messaging.editor.rewardWaitingDays` | Days after the card filled up | כמה ימים אחרי שהכרטיסייה התמלאה |
| `messaging.editor.sendHour` | Send at | שעת שליחה |
| `messaging.editor.what` | What to say | מה לכתוב |
| `messaging.editor.titleLabel` | Title (optional) | כותרת (רשות) |
| `messaging.editor.titlePlaceholder` | Default: your business name | ברירת מחדל: שם העסק |
| `messaging.editor.body` | Message | תוכן ההודעה |
| `messaging.editor.bodyPlaceholder` | Write your message here… | כתבו כאן את ההודעה… |
| `messaging.editor.chars` | {{used}}/{{max}} | {{used}}/{{max}} |
| `messaging.editor.insert` | Insert: | להוסיף לטקסט: |
| `messaging.editor.chip.name` | Customer name | שם הלקוח |
| `messaging.editor.chip.business` | Business name | שם העסק |
| `messaging.editor.chip.reward` | The reward | הפרס |
| `messaging.editor.chip.days` | Number of days | מספר הימים |
| `messaging.editor.unknownPlaceholder` | Unknown keyword: {{token}} | מילת מפתח לא מוכרת: {{token}} |
| `messaging.editor.unsupportedPlaceholder` | {{token}} can't be used in a message to everyone. One message goes out to every customer holding this card, so it can't greet each of them by name — remove it to send. | אי אפשר להשתמש ב-{{token}} בהודעה לכולם. אותה הודעה נשלחת לכל מי שמחזיק את הכרטיסייה הזו, ולכן היא לא יכולה לפנות לכל אחד בשמו — צריך להסיר כדי לשלוח. |
| `messaging.editor.previewLabel` | Roughly how it looks on the lock screen | בערך כך זה ייראה על מסך הנעילה |
| `messaging.editor.previewNow` | now | עכשיו |
| `messaging.editor.languageHint` | The message is sent in the card's language ({{language}}). | ההודעה תישלח בשפת הכרטיסייה ({{language}}). |
| `messaging.editor.languageHE` | Hebrew | עברית |
| `messaging.editor.languageEN` | English | אנגלית |
| `messaging.editor.gift` | Gift | מתנה |
| `messaging.editor.giftToggle` | Add gift stamps | להוסיף ניקובים במתנה |
| `messaging.editor.giftCount` | How many stamps | כמה ניקובים |
| `messaging.editor.giftFull` | Fill the card (reward ready to redeem) | למלא את הכרטיסייה (הפרס מוכן למימוש) |
| `messaging.editor.giftExplain` | The gift lands on the card together with the message. A full card waiting to be redeemed gets no more, and a gift doesn't count as a visit. | המתנה נוספת לכרטיסייה יחד עם ההודעה. כרטיסייה מלאה שמחכה למימוש לא מקבלת עוד, והמתנה לא נספרת כביקור. |
| `messaging.editor.optInUnavailable` | Not while more than one customer holds the card design — the message goes to the whole design, so it can't be narrowed to the people who opted in. | לא כל עוד יותר מלקוח אחד מחזיק את עיצוב הכרטיסייה — ההודעה מגיעה לעיצוב כולו, ולכן אי אפשר לצמצם אותה למי שאישרו קבלת הודעות. |
| `messaging.editor.giftMismatch` | The text promises a gift, but the gift is off. | ההודעה מבטיחה מתנה, אבל המתנה כבויה. |
| `messaging.editor.who` | Who | למי |
| `messaging.editor.audience_one` | Will reach {{count}} customer | יישלח ללקוח אחד |
| `messaging.editor.audience_other` | Will reach about {{count}} customers | יישלח לכ-{{count}} לקוחות |
| `messaging.editor.audienceZero` | No customer matches right now — it sends when someone does. | כרגע אין לקוחות שמתאימים — ההודעה תישלח כשיהיו. |
| `messaging.editor.audienceToday` | Matching right now: {{matching}} | כרגע מתאימים לכלל: {{matching}} |
| `messaging.editor.audienceNote` | Sent to every customer with an active card. | נשלח לכל הלקוחות עם כרטיסייה פעילה. |
| `messaging.editor.optInOnly` | Only customers who agreed to receive messages | רק ללקוחות שאישרו קבלת הודעות |
| `messaging.editor.scopeAll` | All cards | כל הכרטיסיות |
| `messaging.editor.scopeLabel` | Which card | לאיזו כרטיסייה |
| `messaging.editor.test` | Send me a sample | שלחו לי דוגמה |
| `messaging.editor.tested` | Sent to your own card. If it isn't on your phone yet, add it from the Overview page. | נשלח לכרטיסייה שלכם. אם עוד לא הוספתם אותה לטלפון, אפשר לעשות זאת בדף הסקירה. |
| `messaging.editor.saveOn` | Save and turn on | שמירה והפעלה |
| `messaging.editor.saveChanges` | Save changes | שמירת שינויים |
| `messaging.editor.saveOff` | Save as off | שמירה בלי להפעיל |
| `messaging.editor.delete` | Remove rule | הסרת הכלל |
| `messaging.editor.deleteConfirm` | Remove this rule? Its history is kept. | להסיר את הכלל? ההיסטוריה נשמרת. |
| `messaging.editor.deleteYes` | Yes, remove | כן, להסיר |
| `messaging.editor.cancel` | Cancel | ביטול |
| `messaging.editor.back` | Back to messages | חזרה להודעות |
| `messaging.editor.saved` | Rule saved. | הכלל נשמר. |
| `messaging.editor.daysBefore` | {{days}} before | {{days}} לפני |
| `messaging.editor.audienceZeroNow` | No customers with a card to send to right now. | כרגע אין לקוחות עם כרטיסייה לשלוח אליהם. |
| `messaging.history.title` | Messages sent to everyone | הודעות שנשלחו לכולם |
| `messaging.history.empty` | Nothing sent yet. A quiet day at the shop is a good moment for the first one. | עוד לא נשלחו הודעות. יום שקט בעסק? זו הזדמנות טובה להודעה הראשונה. |
| `messaging.history.sentOf` | {{sent}} of {{total}} | {{sent}} מתוך {{total}} |
| `messaging.history.failed_one` | {{count}} failed | אחת נכשלה |
| `messaging.history.failed_other` | {{count}} failed | {{count}} נכשלו |
| `messaging.history.status.sending` | Sending… | בשליחה… |
| `messaging.history.status.sent` | Sent | נשלח |
| `messaging.errors.name_required` | Give the rule a name. | תנו לכלל שם. |
| `messaging.errors.name_too_long` | The name is too long (60 characters max). | השם ארוך מדי (עד 60 תווים). |
| `messaging.errors.title_too_long` | The title is too long ({{max}} characters max). | הכותרת ארוכה מדי (עד {{max}} תווים). |
| `messaging.errors.body_required` | Write the message. | כתבו את תוכן ההודעה. |
| `messaging.errors.body_too_long` | The message is too long ({{max}} characters max). | ההודעה ארוכה מדי (עד {{max}} תווים). |
| `messaging.errors.gift_range` | That number of gift stamps isn't allowed. | מספר הניקובים במתנה לא תקין. |
| `messaging.errors.inactive_days_range` | Days must be between 7 and 365. | מספר הימים חייב להיות בין 7 ל-365. |
| `messaging.errors.repeat_days_range` | The repeat must be between 7 and 365 days. | התזכורת החוזרת חייבת להיות בין 7 ל-365 ימים. |
| `messaging.errors.send_hour_range` | Send time must be between 8:00 and 21:00. | שעת השליחה חייבת להיות בין 8:00 ל-21:00. |
| `messaging.errors.birthday_days_before_range` | You can send up to 14 days before the birthday. | אפשר לשלוח עד 14 ימים לפני יום ההולדת. |
| `messaging.errors.reward_waiting_days_range` | Days must be between 1 and 90. | מספר הימים חייב להיות בין 1 ל-90. |
| `messaging.errors.missing_param` | A number of days is missing. | חסר מספר ימים. |
| `messaging.errors.too_many_automations` | You've reached the maximum number of rules. Remove an old one to add another. | הגעתם למספר הכללים המרבי. הסירו כלל ישן כדי להוסיף חדש. |
| `messaging.errors.unknown_placeholder` | Unknown keyword: {{token}} | מילת מפתח לא מוכרת: {{token}} |
| `messaging.errors.placeholder_unsupported` | "{{token}}" can't be used in a message to everyone. The same message goes to every customer holding this card, so it can't greet each of them by name — remove it and send again. | אי אפשר להשתמש ב"{{token}}" בהודעה לכולם. אותה הודעה נשלחת לכל מי שמחזיק את הכרטיסייה הזו, ולכן היא לא יכולה לפנות לכל אחד בשמו — הסירו ושלחו שוב. |
| `messaging.errors.kind_unsupported` | This rule can't be switched on while more than one customer holds your card design. The wallet publishes a message to a whole design at once, so a message meant for one person would reach all of them. You can keep writing and saving rules in the meantime. | אי אפשר להפעיל את הכלל הזה כל עוד יותר מלקוח אחד מחזיק את עיצוב הכרטיסייה. הארנק מפרסם הודעה לעיצוב שלם בבת אחת, ולכן הודעה שנועדה לאדם אחד הייתה מגיעה לכולם. בינתיים אפשר להמשיך לכתוב ולשמור כללים. |
| `messaging.errors.gift_unsupported_for_kind` | A reward-waiting reminder can't carry a gift stamp: the cards it goes to are already full, so there is nowhere to put one. Save it without the gift and the reminder will go out. | תזכורת על פרס שמחכה לא יכולה לכלול ניקוב במתנה: הכרטיסיות שהיא נשלחת אליהן כבר מלאות, אין לאן להוסיף. שמרו בלי המתנה והתזכורת תצא. |
| `messaging.errors.opt_in_only_unsupported` | A message goes to every customer holding this card, so it can't be limited to those who opted in. Turn that off to send. | הודעה נשלחת לכל מי שמחזיק את הכרטיסייה הזו, ולכן אי אפשר להגביל אותה רק למי שאישרו קבלת דיוור. כבו את האפשרות כדי לשלוח. |
| `messaging.errors.test_send_would_reach_customers` | A test would reach every customer holding this card, not just you — so it's only available while nobody else has it. | בדיקה תגיע לכל מי שמחזיק את הכרטיסייה הזו, לא רק אליכם — לכן היא זמינה רק כל עוד אף אחד אחר לא מחזיק אותה. |
| `messaging.errors.previewMissing` | We couldn't prepare your own card just now — try again in a moment. | לא הצלחנו להכין את הכרטיסייה שלכם כרגע — נסו שוב בעוד רגע. |
| `messaging.errors.unavailable` | Sending isn't available right now, try again in a few minutes. | השליחה לא זמינה כרגע, נסו שוב בעוד כמה דקות. |
| `messaging.errors.quota` | You've reached this week's broadcast limit. {{next}} | הגעתם למכסת ההודעות השבועית. {{next}} |
| `messaging.errors.upgrade` | Turning rules on and messaging real customers is a Pro feature. | הפעלת כלל ושליחה ללקוחות אמיתיים זמינות במסלול Pro. |
| `messaging.errors.notEnabled` | Messaging isn't open for your business yet. | שליחת הודעות עדיין לא פתוחה לעסק שלכם. |
| `messaging.errors.generic` | Something went wrong. Try again. | משהו השתבש. נסו שוב. |
| `messaging.errors.kind_unsupported_direct` | This customer can't be messaged on her own right now: the wallet publishes to a whole card design at once, and more than one customer holds hers — so a message meant for her would reach them too. | אי אפשר לשלוח ללקוח הזה הודעה אישית כרגע: הארנק מפרסם הודעה לעיצוב כרטיסייה שלם בבת אחת, ויותר מלקוח אחד מחזיק בעיצוב שלו — כך שהודעה שמיועדת לו הייתה מגיעה גם אליהם. |
| `messaging.errors.design_outdated` | This customer can't be messaged on her own until your card design is re-published to the wallet. Open your card design and save it — that pushes the update to every pass — then try again. | אי אפשר לשלוח ללקוח הזה הודעה אישית עד שעיצוב הכרטיסייה יפורסם מחדש לארנק. פתחו את עיצוב הכרטיסייה ושמרו אותו — הפעולה דוחפת את העדכון לכל הכרטיסים — ואז נסו שוב. |
| `messaging.errors.card_void` | This card has been voided, so there's nothing to send a message to. | הכרטיסייה בוטלה, אז אין למי לשלוח את ההודעה. |
| `messaging.errors.card_has_no_pass` | This customer's wallet pass hasn't been issued yet, so there's nowhere for the message to arrive. | הכרטיס בארנק של הלקוח הזה עדיין לא הונפק, אז אין לאן שההודעה תגיע. |
| `messaging.overview.title` | Customer messages | הודעות ללקוחות |
| `messaging.overview.none` | No automatic rules yet. | עוד אין כללים אוטומטיים. |
| `messaging.overview.active_one` | {{count}} rule on | כלל אחד פעיל |
| `messaging.overview.active_other` | {{count}} rules on | {{count}} כללים פעילים |
| `messaging.overview.sentMonth_one` | {{count}} message this month | הודעה אחת החודש |
| `messaging.overview.sentMonth_other` | {{count}} messages this month | {{count}} הודעות החודש |
| `messaging.overview.all` | All messages | לכל ההודעות |
| `messaging.activity.gift` | gift | מתנה |

## Card Studio

| key | English | Hebrew |
|---|---|---|
| `studio.title` | Card Studio | סטודיו הכרטיסיות |
| `studio.subtitle` | Design your loyalty card and watch it update live on both wallets. Saving pushes the new design to every installed pass. | עצבו את הכרטיסייה וראו אותה מתעדכנת בזמן אמת בשני הארנקים. שמירה דוחפת את העיצוב החדש לכל הכרטיסים המותקנים. |
| `studio.groups.card` | The deal | העסקה |
| `studio.groups.look` | Color and texture | צבע ומרקם |
| `studio.groups.stamp` | The stamp | הניקוב |
| `studio.groups.logo` | Your logo | הלוגו שלכם |
| `studio.groups.advanced` | Wallet details | פרטי הארנק |
| `studio.groups.advancedHint` | Field labels, card language, barcode, custom artwork. | תוויות שדות, שפת הכרטיס, ברקוד, גרפיקה מותאמת. |
| `studio.save` | Save design | שמירת עיצוב |
| `studio.saved` | Saved ✓ | נשמר ✓ |
| `studio.syncError` | The last wallet sync failed — your changes are safe and will be retried automatically. | הסנכרון האחרון לארנק נכשל — השינויים שמורים ויסונכרנו שוב אוטומטית. |
| `studio.uploadError` | Upload failed — try a different image. | ההעלאה נכשלה — נסו תמונה אחרת. |
| `studio.nameLabel` | Card name | שם הכרטיסייה |
| `studio.stampsLabel` | Stamps to reward | ניקובים עד הפרס |
| `studio.stampsHint` | {{count}} stamps | {{count}} ניקובים |
| `studio.rewardLabel` | Reward | הפרס |
| `studio.glyphLabel` | Stamp icon | אייקון הניקוב |
| `studio.uploadStampArt` | Upload your own stamp image | העלאת תמונת ניקוב משלכם |
| `studio.paletteLabel` | Color palettes | ערכות צבעים |
| `studio.palettes.espresso` | Espresso | אספרסו |
| `studio.palettes.cream` | Cream | שמנת |
| `studio.palettes.midnight` | Midnight | חצות |
| `studio.palettes.olive` | Olive | זית |
| `studio.palettes.blush` | Blush | ורוד עדין |
| `studio.palettes.ocean` | Ocean | אוקיינוס |
| `studio.colorsLabel` | Colors | צבעים |
| `studio.labelsLabel` | Field labels | תוויות השדות |
| `studio.labelsHint` | What the card calls the customer's name and their stamp count. Leave empty for the defaults. | איך הכרטיס קורא לשם הלקוח/ה ולמספר הניקובים. השאירו ריק לברירת המחדל. |
| `studio.backgroundColor` | Card background | רקע הכרטיס |
| `studio.stampColor` | Stamp color | צבע הניקוב |
| `studio.textColor` | Text color | צבע הטקסט |
| `studio.labelColor` | Label color | צבע התוויות |
| `studio.patternLabel` | Background pattern | דוגמת רקע |
| `studio.patterns.none` | None | ללא |
| `studio.patterns.waves` | Waves | גלים |
| `studio.patterns.dots` | Dots | נקודות |
| `studio.patterns.stripes` | Stripes | פסים |
| `studio.logoLabel` | Logo | לוגו |
| `studio.logoHint` | One upload becomes all three wallet assets (wide Apple logo, round Google badge, icon). No logo? We'll render your business name. | העלאה אחת הופכת לכל נכסי הארנק (לוגו רחב לאפל, עיגול לגוגל, אייקון). אין לוגו? נציג את שם העסק. |
| `studio.uploadLogo` | Upload logo | העלאת לוגו |
| `studio.languageLabel` | Card language | שפת הכרטיס |
| `studio.languages.HE` | Hebrew | עברית |
| `studio.languages.EN` | English | אנגלית |
| `studio.barcodeLabel` | Barcode format | סוג הברקוד |
| `studio.orgNameLabel` | Organization name | שם הארגון |
| `studio.orgNameHint` | Shown on the pass instead of your business name (optional). | יוצג על הכרטיס במקום שם העסק (לא חובה). |
| `studio.artworkLabel` | Custom artwork | גרפיקה מותאמת |
| `studio.artworkHint` | A full strip background, or separate before/after punch images. | רקע מלא לפס הניקובים, או תמונות נפרדות לניקוב מלא וריק. |
| `studio.uploadStripBase` | Upload strip background (min 1125×432) | העלאת רקע לפס הניקובים (מינימום 1125×432) |
| `studio.uploadStampedArt` | Upload punched-stamp artwork | העלאת גרפיקה לניקוב מלא |
| `studio.uploadUnstampedArt` | Upload empty-stamp artwork | העלאת גרפיקה לניקוב ריק |
| `studio.fieldsLabel` | Card fields | שדות הכרטיס |
| `studio.sampleStampsLabel` | Preview stamps | ניקובים בתצוגה |
| `studio.sampleStampsHint` | {{count}} punched | {{count}} נוקבו |
| `studio.lintClean` | Ready to publish — this card renders fully on both wallets. | מוכן לפרסום — הכרטיס מוצג במלואו בשני הארנקים. |
| `studio.lintTitle` | Not publish-ready yet: | עוד לא מוכן לפרסום: |
| `studio.preview.apple` | Apple Wallet | אפל ווליט |
| `studio.preview.google` | Google Wallet | גוגל ווליט |
| `studio.preview.nameLabel` | Name | שם |
| `studio.preview.pointsLabel` | Visits | ביקורים |
| `studio.fields.bindingLabel` | Shows | מציג |
| `studio.fields.label` | Label | תווית |
| `studio.fields.section` | Position (Apple) | מיקום (אפל) |
| `studio.fields.alignment` | Alignment | יישור |
| `studio.fields.changeMessage` | Update notification | הודעת עדכון |
| `studio.fields.changeMessageHint` | %@ is replaced with the new value. | %@ יוחלף בערך החדש. |
| `studio.fields.add` | Add field | הוספת שדה |
| `studio.fields.binding.person.displayName` | Customer name | שם הלקוח/ה |
| `studio.fields.binding.members.member.points` | Stamp count | מספר ניקובים |
| `studio.fields.binding.members.tier.name` | Tier name | שם דרגה |
| `studio.fields.binding.universal.info` | Info text | טקסט מידע |
| `studio.fields.binding.meta.custom` | Custom text | טקסט חופשי |
| `studio.fields.sections.HEADER_FIELDS` | Header | כותרת |
| `studio.fields.sections.PRIMARY_FIELDS` | Primary | ראשי |
| `studio.fields.sections.SECONDARY_FIELDS` | Secondary | משני |
| `studio.fields.sections.AUXILIARY_FIELDS` | Auxiliary | נלווה |
| `studio.fields.sections.BACK_FIELDS` | Back of card | גב הכרטיס |
| `studio.fields.alignments.NATURAL` | Automatic | אוטומטי |
| `studio.fields.alignments.LEFT` | Left | שמאל |
| `studio.fields.alignments.CENTER` | Center | מרכז |
| `studio.fields.alignments.RIGHT` | Right | ימין |

## Standee / signage

| key | English | Hebrew |
|---|---|---|
| `standee.title` | Print signage | שילוט לבית העסק |
| `standee.subtitle` | Pick a design, print it, and put it where people already stand still. The code never changes, so one print lasts. | בוחרים עיצוב, מדפיסים ותולים במקום שבו הלקוחות ממילא עומדים. הקוד לא משתנה, אז הדפסה אחת מספיקה. |
| `standee.print` | Print | הדפסה |
| `standee.designLabel` | Design | עיצוב |
| `standee.designHint` | Same code, same colours — four ways to say it. | אותו קוד, אותם צבעים — ארבע דרכים להגיד את זה. |
| `standee.paperLabel` | Paper | נייר |
| `standee.designs.poster.name` | Poster | פוסטר |
| `standee.designs.poster.hint` | Full colour, for a wall or a window | צבע מלא, לקיר או לחלון ראווה |
| `standee.designs.counter.name` | Counter | דלפק |
| `standee.designs.counter.hint` | Code first, read from across the room | הקוד קודם, נקרא מכל מקום בחדר |
| `standee.designs.card.name` | The deal | ההטבה |
| `standee.designs.card.hint` | Shows what they collect, and for what | מראה מה אוספים ובשביל מה |
| `standee.designs.plain.name` | Plain | פשוט |
| `standee.designs.plain.hint` | White paper, barely any ink | נייר לבן, כמעט בלי דיו |
| `standee.formats.a4` | A4 | A4 |
| `standee.formats.a5` | A5 | A5 |
| `standee.formats.tent` | Table tent | אוהל שולחן |
| `standee.formatHints.a4` | A full page, for a wall or a window. | עמוד שלם, לקיר או לחלון. |
| `standee.formatHints.a5` | Half a page, for the counter. | חצי עמוד, לדלפק. |
| `standee.formatHints.tent` | One page, folded in half — it stands on a table. | עמוד אחד, מקפלים לשניים והוא עומד על השולחן. |
| `standee.activateFirst` | Your card is ready, but the code isn’t live yet — activate your subscription and customers can join. | הכרטיסייה מוכנה, אבל הקוד עדיין לא פעיל — הפעילו את המנוי ולקוחות יוכלו להצטרף. |
| `standee.inactiveCode` | Code not live yet | הקוד עדיין לא פעיל |
| `standee.printLocked` | Printing opens when you activate — until then there is no code to print. | ההדפסה נפתחת עם ההפעלה — עד אז אין קוד להדפיס. |
| `standee.downloadHint` | To download a file: Print → Save as PDF. | להורדת קובץ: הדפסה ← שמירה כ-PDF. |
| `standee.previewTitle` | What comes out of the printer | מה שיוצא מהמדפסת |
| `standee.previewNote` | Printed at actual size, edge to edge. Set your printer to colour and to 100% — not “fit to page”. | מודפס בגודל מלא, מקצה לקצה. כדאי להגדיר במדפסת צבע ו-100% — לא ״התאמה לעמוד״. |
| `standee.steps.scan` | Scan the code | סורקים את הקוד |
| `standee.steps.join` | Join in half a minute | מצטרפים בחצי דקה |
| `standee.steps.collect` | Get a stamp every visit | מקבלים חותמת בכל ביקור |
| `standee.scanCta` | Scan to join — no app, straight to your phone's wallet | סרקו להצטרפות — בלי אפליקציה, ישר לארנק בטלפון |
| `standee.scanToJoin` | Scan to join | סרקו והצטרפו |
| `standee.noApp` | No app. No sign-up. | בלי אפליקציה. בלי הרשמה. |
| `standee.stampsLine_one` | {{count}} stamp | חותמת אחת |
| `standee.stampsLine_other` | {{count}} stamps | {{count}} חותמות |
| `standee.fold` | fold | קיפול |

## Team

| key | English | Hebrew |
|---|---|---|
| `team.title` | Team | צוות |
| `team.notReady` | Nothing to set up here yet — the owner activates the card. | אין כאן עדיין מה להגדיר — הבעלים מפעיל את הכרטיס. |
| `team.role.owner` | Owner | בעלים |
| `team.role.manager` | Manager | מנהל/ת |
| `team.role.staff` | Staff | עובד/ת |
| `team.roleBody.manager` | Scans cards and looks customers up, and can change the card, the poster and the messages that go out. Not billing, and not the team. | סורק/ת כרטיסים ורואה לקוחות, ויכול/ה לשנות את הכרטיס, את השלט ואת ההודעות שיוצאות. בלי חיוב ובלי ניהול הצוות. |
| `team.roleBody.staff` | Scans cards, hands over rewards, and looks customers up. Nothing else changes. | סורק/ת כרטיסים, מוסר/ת הטבות ומחפש/ת לקוחות. שום דבר אחר לא משתנה. |
| `team.invite.title` | Invite someone | הזמנה לצוות |
| `team.invite.body` | Make a link and send it however you already talk to them. No email involved. | יוצרים קישור ושולחים אותו איך שאתם כבר מדברים איתם. בלי מיילים. |
| `team.invite.roleLabel` | What they can do | מה מותר להם |
| `team.invite.emailLabel` | Their email (optional) | האימייל שלהם (לא חובה) |
| `team.invite.emailPlaceholder` | dana@example.com | dana@example.com |
| `team.invite.emailNamed` | Only this address can use the link, so forwarding it does nothing. | רק הכתובת הזו תוכל להשתמש בקישור, אז העברה שלו הלאה לא תעשה כלום. |
| `team.invite.emailBlank` | Anyone who opens this link can join. Add an address to tie it to one person. | כל מי שיפתח את הקישור יוכל להצטרף. הוסיפו כתובת כדי לקשור אותו לאדם אחד. |
| `team.invite.cta` | Create invite link | יצירת קישור הזמנה |
| `team.members.title` | On your team | מי בצוות |
| `team.members.roleFor` | Role for {{email}} | התפקיד של {{email}} |
| `team.members.remove` | Remove {{email}} | הסרה של {{email}} |
| `team.members.confirmRemove` | Remove | להסיר |
| `team.pending.title` | Open invites | הזמנות פתוחות |
| `team.pending.body` | Each link works once and expires after two weeks. | כל קישור עובד פעם אחת ופג אחרי שבועיים. |
| `team.pending.anyone` | Anyone with the link | כל מי שיש לו את הקישור |
| `team.pending.expires` | Expires {{date}} | פג ב-{{date}} |
| `team.pending.expired` | Expired | פג |
| `team.pending.copy` | Copy link | העתקת קישור |
| `team.pending.revoke` | Cancel this invite | ביטול ההזמנה |
| `team.error.alreadyMember` | That person is already on your team. | האדם הזה כבר בצוות. |
| `team.error.capReached` | That's as many people as one business can hold. | זה מספר האנשים המרבי לעסק אחד. |
| `team.error.notOwner` | Only the owner can manage the team. | רק הבעלים יכול/ה לנהל את הצוות. |
| `team.error.badEmail` | That email doesn't look right. | האימייל הזה לא נראה תקין. |
| `team.error.generic` | That didn't go through. Try again. | זה לא עבר. נסו שוב. |

## Billing

| key | English | Hebrew |
|---|---|---|
| `billing.title` | Billing | חיוב |
| `billing.activateCta` | Activate | הפעלה |
| `billing.managePortalCta` | Manage billing | ניהול חיוב |
| `billing.status` | Status | סטטוס |
| `billing.error` | Something went wrong. Please try again in a moment. | משהו השתבש. נסו שוב בעוד רגע. |
| `billing.success.finalizing` | Finalizing your subscription… | משלימים את המנוי שלכם… |
| `billing.success.timeout` | This is taking longer than expected — check back shortly | זה לוקח קצת יותר מהצפוי — בדקו שוב בקרוב |
| `billing.success.done` | You're live! Real customers can now join your card. | אתם פעילים! לקוחות אמיתיים יכולים עכשיו להצטרף לכרטיסייה. |
| `billing.cancel.title` | Checkout cancelled | התשלום בוטל |
| `billing.cancel.body` | No charge was made. | לא בוצע חיוב. |
| `billing.cancel.backCta` | Back to billing | חזרה לחיוב |
| `billing.plan.freeTitle` | You're on the free plan | אתם בתוכנית החינמית |
| `billing.plan.freeBody` | Designing your card, previewing it on your own phone and using this dashboard are free. Activating is what lets real customers join. | עיצוב הכרטיסייה, תצוגה מקדימה בטלפון שלכם והשימוש בלוח הבקרה — הכול בחינם. ההפעלה היא מה שמאפשר ללקוחות אמיתיים להצטרף. |
| `billing.plan.proTitle` | Your card is live | הכרטיסייה שלכם פעילה |
| `billing.plan.proBody` | Real customers can join and collect. Manage or cancel your subscription any time. | לקוחות אמיתיים יכולים להצטרף ולאסוף. אפשר לנהל או לבטל את המנוי בכל רגע. |

## First-run tour

| key | English | Hebrew |
|---|---|---|
| `tour.title` | A quick tour | סיור קצר |
| `tour.label` | A quick tour of the dashboard | סיור קצר בלוח הבקרה |
| `tour.skip` | Skip | דילוג |
| `tour.done` | Got it | הבנתי |
| `tour.replay` | Show the tour again | להציג שוב את הסיור |
| `tour.progress` | Step {{step}} of {{total}} | שלב {{step}} מתוך {{total}} |
| `tour.steps.join.title` | How customers join | ככה לקוחות מצטרפים |
| `tour.steps.join.body` | Print the standee and stand it on the counter. One scan puts your card in their wallet — no app, no signup. | הדפיסו שילוט והעמידו אותו על הדלפק. סריקה אחת מכניסה את הכרטיסייה לארנק בטלפון — בלי אפליקציה, בלי הרשמה. |
| `tour.steps.customers.title` | Your customers | הלקוחות שלכם |
| `tour.steps.customers.body` | Who joined, how many stamps each one has, and who is close to a reward. Activity lists every punch, day by day. | מי הצטרף, כמה חותמות יש לכל אחד ומי קרוב לפרס. בפעילות מופיע כל ניקוב, יום אחר יום. |
| `tour.steps.design.title` | The card stays yours | הכרטיסייה נשארת שלכם |
| `tour.steps.design.body` | Colour, stamp and reward can change any time. Every pass already in a wallet updates itself — nobody has to reinstall anything. | צבע, ניקוב ופרס אפשר לשנות בכל רגע. כל כרטיס שכבר נמצא בארנק מתעדכן מעצמו — אף אחד לא צריך להתקין שוב כלום. |
| `tour.steps.activate.title` | When you’re ready | כשתהיו מוכנים |
| `tour.steps.activate.body` | Designing and previewing is free. Real customers can only join once you activate the card. | לעצב ולראות תצוגה מקדימה זה חינם. לקוחות אמיתיים יוכלו להצטרף רק אחרי שתפעילו את הכרטיסייה. |

## Admin catalog

| key | English | Hebrew |
|---|---|---|
| `admin.title` | PunchMe Admin | ניהול PunchMe |
| `admin.badge` | Staff | צוות |
| `admin.backToApp` | Back to app | חזרה לאפליקציה |
| `admin.catalog.title` | Template catalog | קטלוג התבניות |
| `admin.catalog.subtitle` | The library businesses choose from. Instantiating COPIES an entry — editing or deleting here never touches a live business card. | הספרייה שעסקים בוחרים ממנה. שימוש בתבנית מעתיק אותה — עריכה או מחיקה כאן לעולם לא נוגעות בכרטיס חי של עסק. |
| `admin.catalog.lookCoverage` | Wizard looks per trade — built-ins fill any shortfall | מראות באשף לפי תחום — מראה מובנה משלים את החסר |
| `admin.catalog.create` | New template | תבנית חדשה |
| `admin.catalog.createTitle` | New catalog template | תבנית קטלוג חדשה |
| `admin.catalog.editTitle` | Edit catalog template | עריכת תבנית קטלוג |
| `admin.catalog.published` | Published | מפורסם |
| `admin.catalog.draft` | Draft | טיוטה |
| `admin.catalog.publish` | Publish | פרסום |
| `admin.catalog.unpublish` | Unpublish | ביטול פרסום |
| `admin.catalog.moveUp` | Move up | הזזה למעלה |
| `admin.catalog.moveDown` | Move down | הזזה למטה |
| `admin.catalog.deleteConfirm` | Delete "{{name}}" from the catalog? | למחוק את "{{name}}" מהקטלוג? |
| `admin.catalog.nicheLabel` | Niche | תחום |
| `admin.catalog.descriptionLabel` | Description | תיאור |
| `admin.catalog.publishedLabel` | Published | מפורסם |
| `admin.staffOnly` | Staff area | אזור צוות |
| `admin.staffOnlyBody` | This area is for PunchMe staff. You're signed in as {{email}}, which doesn't have staff access. | האזור הזה מיועד לצוות PunchMe. אתם מחוברים כ-{{email}}, למשתמש הזה אין הרשאות צוות. |
| `admin.staffHere` | You're signed in as PunchMe staff. | אתם מחוברים כצוות PunchMe. |
| `admin.openAdmin` | Open the template catalog | פתיחת קטלוג התבניות |

## Keys present only in Hebrew

- `onboarding.reward.stampsValue_two`
- `onboarding.reward.stampsValue_many`
- `standee.stampsLine_two`
- `standee.stampsLine_many`
- `dashboard.brief.verdict_two`
- `dashboard.brief.verdict_many`
- `dashboard.brief.moreThanBefore_two`
- `dashboard.brief.moreThanBefore_many`
- `dashboard.brief.fewerThanBefore_two`
- `dashboard.brief.fewerThanBefore_many`
- `dashboard.today.inactive_two`
- `dashboard.today.inactive_many`
- `dashboard.today.birthday_two`
- `dashboard.today.birthday_many`
- `dashboard.today.quiet_two`
- `dashboard.today.quiet_many`
- `dashboard.activity.action.stamp_two`
- `dashboard.activity.action.stamp_many`
- `dashboard.activity.action.removed_two`
- `dashboard.activity.action.removed_many`
- `dashboard.activity.period.days_two`
- `dashboard.activity.period.days_many`
- `dashboard.activity.emptyPeriod_two`
- `dashboard.activity.emptyPeriod_many`
- `dashboard.scan.tally.punches_two`
- `dashboard.scan.tally.punches_many`
- `dashboard.scan.tally.rewards_two`
- `dashboard.scan.tally.rewards_many`
- `dashboard.scan.result.toGo_two`
- `dashboard.scan.result.toGo_many`
- `dashboard.week.stamps_two`
- `dashboard.week.stamps_many`
- `dashboard.week.moreThanLast_two`
- `dashboard.week.moreThanLast_many`
- `dashboard.week.fewerThanLast_two`
- `dashboard.week.fewerThanLast_many`
- `dashboard.near.toGo_two`
- `dashboard.near.toGo_many`
- `landing.calculator.result.regularsNeeded_two`
- `landing.calculator.result.regularsNeeded_many`
- `landing.calculator.result.headline_two`
- `landing.calculator.result.headline_many`
- `landing.calculator.result.orMonthly_two`
- `landing.calculator.result.orMonthly_many`
- `landing.calculator.result.projectionLabel_two`
- `landing.calculator.result.projectionLabel_many`
- `messaging.summary.audience_two`
- `messaging.summary.audience_many`
- `messaging.broadcast.left_two`
- `messaging.broadcast.left_many`
- `messaging.broadcast.send_two`
- `messaging.broadcast.send_many`
- `messaging.broadcast.confirmBody_two`
- `messaging.broadcast.confirmBody_many`
- `messaging.automations.sentMonth_two`
- `messaging.automations.sentMonth_many`
- `messaging.describe.gift_two`
- `messaging.describe.gift_many`
- `messaging.editor.audience_two`
- `messaging.editor.audience_many`
- `messaging.history.failed_two`
- `messaging.history.failed_many`
- `messaging.overview.active_two`
- `messaging.overview.active_many`
- `messaging.overview.sentMonth_two`
- `messaging.overview.sentMonth_many`
