/**
 * The smallest service worker that makes this installable.
 *
 * Chrome will not fire `beforeinstallprompt` — and so will not let the owner
 * install anything — unless a service worker with a fetch handler is
 * registered. That, not offline support, is why this file exists, and it is
 * deliberately the least code that earns the install button.
 *
 * The one rule it must never break: **nothing under /api is ever cached.**
 * Every one of those responses is one shop's private data — its customer
 * list, its phone numbers, its takings — and a cache is shared by whoever
 * next opens the app on that device. A counter tablet is exactly the machine
 * where that matters. Requests to /api fall through to the network
 * untouched, which also means a signed-out owner can never be served the
 * previous owner's dashboard out of a cache.
 *
 * What it does cache is the shell: Vite's build output under /assets is
 * content-hashed, so a given URL's bytes can never change and cache-first is
 * safe forever. Navigations go to the network first and fall back to the
 * last good index.html, so a phone that loses signal mid-shift still opens
 * to the app rather than to the browser's dinosaur.
 */

// v2: v1 could hold the app's index.html under a chunk's name (see
// cacheFirst), and a new name is how an activation clears it.
const CACHE = "punchme-shell-v2";
const SHELL = "/index.html";

self.addEventListener("install", () => {
  // Nothing to precache: the asset names are only known at build time, and
  // they arrive on first use anyway.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("punchme-") && name !== CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/**
 * Content-hashed and therefore immutable: serve from cache, fetch once.
 *
 * Only a real file is kept. A host serving the app as a single page
 * (`serve -s`, `vite preview`) answers a file it doesn't have with
 * index.html and a 200, as it does for a chunk the new build no longer
 * has, or one asked for a moment before a deploy finishes uploading it.
 * Kept, that page would stand in for the chunk for good, cache-first,
 * and its route would fail in that browser until its data was cleared.
 * Not kept, the import fails once, `main.tsx` reloads the tab, and the
 * next request finds the file.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  const html = (response.headers.get("Content-Type") || "").includes("text/html");
  if (response.ok && !html) cache.put(request, response.clone());
  return response;
}

/** Always prefer the live app; keep the last good shell for the tunnel. */
async function networkFirstShell(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(SHELL, response.clone());
    return response;
  } catch (error) {
    const hit = await cache.match(SHELL);
    if (hit) return hit;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Private, per-tenant, and authenticated. Never ours to keep.
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstShell(request));
  }
});
