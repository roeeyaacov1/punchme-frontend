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

const CACHE = "punchme-shell-v1";
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

/** Content-hashed and therefore immutable: serve from cache, fetch once. */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
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
