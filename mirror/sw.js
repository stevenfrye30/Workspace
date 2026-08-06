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
 * fresh is nothing next to the cost of silently running stale code.
 *
 * Every other asset is stale-while-revalidate: served from the cache at once,
 * so the offline win is unchanged, but refreshed in the background so an
 * edited asset can actually reach a device that already cached it. Both
 * fetches use `cache: 'no-cache'`, because a request the HTTP cache can answer
 * is not a check — see the note in the fetch handler.
 *
 * Data is never cached. It lives in localStorage and (once sync lands)
 * syncs to a private repo — a stale day served from a cache would be
 * worse than an honest failure to reach it.
 */

const CACHE = 'mirror-shell-v5';
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
    // `no-cache` is load-bearing — see the note on revalidation below. Without
    // it "network-first" can be satisfied from the HTTP cache, which is the
    // exact failure this branch exists to prevent.
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        // `caches.match()` returns a promise, so it is always truthy — the
        // chain has to be awaited step by step or later fallbacks never run.
        .catch(() => caches.match(req)
          .then((hit) => hit || caches.match('./index.html'))
          .then((hit) => hit || caches.match('./')))
    );
    return;
  }

  /* Everything else — including the 1.2 MB food library — is
     stale-while-revalidate: the cached copy is served instantly, and a fresh
     one is fetched in the background for next time.

     It used to be plain cache-first, which had no way back. The food library
     is the only large asset here and it does get edited: foods.json gained
     spices and household staples in 6eb922f, and any device that had already
     cached it would have served the old library forever — nothing revalidated
     it and the cache name had not been bumped. Correcting a food is supposed
     to fix history retroactively (SCHEMA.md), which it cannot do if the
     correction never arrives.

     `cache: 'no-cache'` on the revalidation is the other half, and the half
     that is easy to miss: without it the refresh is circular and silent.
     Chrome answers the worker's own fetch from the HTTP cache, the worker
     writes that same stale body back into Cache Storage, and nothing ever
     reaches the server — the access log showed no request for foods.json at
     all after it had changed on disk. A 304 costs nothing when it has not. */
  const revalidate = fetch(req, { cache: 'no-cache' }).then((res) => {
    if (!res || !res.ok || res.type !== 'basic') return res;
    // Cache the clone and only then hand the response on, so the write is
    // inside the promise waitUntil is holding the worker open for.
    const copy = res.clone();
    return caches.open(CACHE).then((c) => c.put(req, copy)).then(() => res);
  });

  /* Both of these are called synchronously, while the event is still active.
     waitUntil() from inside a .then() throws InvalidStateError once the event
     has gone inactive, which strands respondWith and hangs the request — the
     food library sat on "loading…" forever. */
  event.waitUntil(revalidate.catch(() => null));
  event.respondWith(caches.match(req).then((hit) => hit || revalidate));
});
