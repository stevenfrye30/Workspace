/* Mirror — service worker.
 *
 * Only job: make the dashboard open when there is no signal.
 *
 * ---------------------------------------------------------------------
 * Why the document is network-FIRST
 *
 * The obvious build (cache-first for everything) has a nasty failure mode
 * for an app that is still being built: ship a fix, and the installed app
 * keeps serving yesterday's HTML from the cache. The user sees the old
 * version, relaunches, and *still* sees it, because the refresh only
 * lands in the cache for the launch after next. Confirmed the hard way.
 *
 * So the document goes to the network first and falls back to the cache
 * only when the network fails. The page is small; the cost of fetching it
 * fresh is nothing next to the cost of silently running stale code. Every
 * other asset stays cache-first, which is where the offline win actually
 * comes from.
 *
 * Data is never cached. It lives in localStorage and (once sync lands)
 * syncs to a private repo — a stale day served from a cache would be
 * worse than an honest failure to reach it.
 */

const CACHE = 'mirror-shell-v4';
const SHELL = ['./', './index.html', './records.html', './manifest.webmanifest'];

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

const isDocument = (req) =>
  req.mode === 'navigate' || req.destination === 'document' ||
  (req.headers.get('accept') || '').includes('text/html');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never intercept the GitHub API — the app must know when a sync truly failed.
  if (url.origin !== self.location.origin) return;
  if (req.method !== 'GET') return;

  if (isDocument(req)) {
    // Network first: always run the newest code when there is a network.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html') || caches.match('./')))
    );
    return;
  }

  // Everything else — including the 1.2 MB food library — is cache-first and
  // cached on first use, so a logged day works with no signal at all.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
