/* Inventory — service worker.
 *
 * Only job: make the app open when there is no signal. The shell (html,
 * js, css) is cached on install and served from cache first, so the page
 * loads instantly in a supermarket basement. Data is not cached here —
 * Store keeps that in localStorage, and GitHub API calls are never
 * intercepted, because a stale inventory served from a cache would be
 * worse than an honest failure to sync.
 */

const CACHE = 'inventory-shell-v9';
const SHELL = ['./', './index.html', './app.js', './store.js', './styles.css',
               './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never touch the API — the app must know when it's truly offline.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((hit) => {
      // Cache first so it's instant, then quietly refresh for next time.
      const fresh = fetch(event.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
