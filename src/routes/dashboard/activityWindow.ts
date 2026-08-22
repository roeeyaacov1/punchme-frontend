import { listActivity, type ActivityItem } from "../../api/loyalty";

/** django-ninja's `PageNumberPagination` caps `page_size` at 100 and says
 * nothing about it — asking for more is silently answered with a hundred. So
 * a window is paged rather than requested in one lump, the same way
 * `listAllCustomers` does it.
 *
 * This lived inside `ActivityPage` until the overview needed the same window
 * and got it wrong: it asked for 200 rows in one request and then read
 * `items.length < 200` as "I saw the whole week", which a hundred rows always
 * satisfies. Any shop past about seven stamps a day was shown an
 * under-reported total with no `+` on it. One implementation, so that cannot
 * drift apart again. */
const FETCH_PAGE_SIZE = 100;

/** Safety stop, so a shop with an unexpectedly busy month cannot turn one
 * screen into a hundred sequential requests. Hitting it sets `truncated`,
 * which every caller says out loud rather than quietly filtering half a
 * window. */
const MAX_FETCH_PAGES = 15;

export interface ActivityWindow {
  /** Everything from `since` to now, newest first. */
  items: ActivityItem[];
  /** The page guard stopped the walk before it reached `since`, so `items`
   * is a floor and not the whole window. */
  truncated: boolean;
}

/**
 * Everything from `since` to now.
 *
 * The endpoint has no date parameter, so "since" is done by walking back from
 * the newest event and stopping at the first page that reaches past the
 * window — two or three requests for a fortnight, not a download of the
 * shop's whole history.
 */
export async function fetchActivityWindow(
  businessId: string,
  since: number,
): Promise<ActivityWindow> {
  const items: ActivityItem[] = [];
  let count = 0;
  let truncated = false;
  let page = 1;

  for (;;) {
    const res = await listActivity(businessId, page, FETCH_PAGE_SIZE);
    count = res.count;
    items.push(...res.items);

    // Nothing came back, or we hold every row the server says exists.
    // Checked against `count` rather than the page length so a server that
    // caps `page_size` below what we asked for still terminates on the right
    // row instead of stopping after the first short page.
    if (res.items.length === 0 || items.length >= count) break;
    // This page's oldest row is already past the edge we care about.
    const oldest = Date.parse(res.items[res.items.length - 1].created_at);
    if (oldest < since) break;

    if (page >= MAX_FETCH_PAGES) {
      truncated = true;
      break;
    }
    page += 1;
  }

  return {
    items: items.filter((e) => Date.parse(e.created_at) >= since),
    truncated,
  };
}
