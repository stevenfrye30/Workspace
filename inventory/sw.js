/* Inventory — service worker.
 *
 * Only job: make the app open when there is no signal. The shell (html,
 * js, css) is cached on install and served from cache first, so the page
 * loads instantly in a supermarket basement. Data is not cached here —
 * Store keeps that in localStorage, and GitHub API calls are never
 * intercepted, because a stale inventory served from a cache would be
 * worse than an honest failure to sync.
 */

/* v11: the revalidation fetch gained `cache: 'no-cache'` (see the fetch
   handler). Bumped rather than reused so any device still holding a v10 entry
   that was written by the circular refresh starts from a clean shell instead of
   revalidating its way out one file at a time. */
const CACHE = 'inventory-shell-v11';
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
      /* Cache first so it's instant, then quietly refresh for next time.

         `cache: 'no-cache'` is load-bearing, and it is the easy half to miss.
         Without it the refresh is circular and silent: Chrome answers this
         worker's own fetch out of the HTTP cache, the worker writes that same
         stale body back into Cache Storage, and nothing ever reaches the
         server — so an edited app.js can never arrive on a device that already
         cached it, and the only way out is remembering to bump CACHE. Mirror
         learned this the hard way with its 1.2 MB food library (its access log
         showed no request for the file at all after it had changed on disk);
         this is the same fix, ported from mirror/sw.js. A 304 costs nothing
         when the file has not changed. */
      const fresh = fetch(event.request, { cache: 'no-cache' }).then((res) => {
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
