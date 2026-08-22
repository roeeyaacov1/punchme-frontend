/**
 * Registering the worker that makes the install button appear.
 *
 * Production only. In dev, Vite serves unbundled modules and a service
 * worker sitting in front of them is a well-known way to spend an afternoon
 * debugging a page that will not update. Installability needs the built
 * output anyway — check it with `npm run build && npm run preview`, which
 * counts as a secure context on localhost.
 *
 * Failure is silent on purpose. A worker that will not register costs the
 * owner an install button they may never have looked for; it must not cost
 * them a broken dashboard, and there is nothing they could do about it.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  // After load: registering during startup competes with the app's own
  // first paint and its first API calls for the same connection.
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
