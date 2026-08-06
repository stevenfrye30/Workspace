/* Lab-wide search.

   There are ~320 reference cards, ~180 worked examples and a few hundred
   copyable symbols in this app, and until now the only way to reach any of
   them was to guess which of nine tiles it lived behind. A student who has
   been told to look up half-life has no way to find it.

   The index is built by importing every room module named in the manifest —
   which is already the canonical room list — and reading the fields the room
   renderer itself renders. It is built once, on first use, and cached: no
   room downloads 26 modules just to display itself.

   One builder, two entry points: an inline box on the board and a ⌘K palette
   in the dock. They differ only in where the markup is mounted. */

import { MANIFEST } from './rooms/_manifest.js';
import { esc, plain, slug, anchorsFor } from './format.js';

let indexPromise = null;

/* Build on demand, once. Callers await this; the second caller gets the same
   promise rather than a second sweep of the room modules. */
export function ensureIndex() {
  if (!indexPromise) indexPromise = build();
  return indexPromise;
}

async function build() {
  const keys = Object.keys(MANIFEST);
  const mods = await Promise.all(keys.map(function (k) {
    /* A room that fails to import must cost its own entries, not the index. */
    return import('./rooms/' + k + '.js')
      .then(function (m) { return m.default; })
      .catch(function (err) { console.error('Search: could not index ' + k, err); return null; });
  }));

  const items = [];
  keys.forEach(function (k, i) {
    const room = mods[i];
    if (!room) return;
    const meta = MANIFEST[k];
    const where = { room: k, roomName: meta.name, glyph: meta.glyph, color: meta.color };

    const cards = room.cards || [];
    const cardIds = anchorsFor('c', cards, function (c) { return c.name; });
    cards.forEach(function (c, n) {
      items.push(Object.assign({
        kind: 'card', title: plain(c.name), anchor: cardIds[n],
        snippet: plain(c.body).slice(0, 120),
        hay: (plain(c.name) + ' ' + plain(c.body) + ' ' + plain(c.note)).toLowerCase()
      }, where));
    });

    const exs = room.examples || [];
    const exIds = anchorsFor('x', exs, function (e) { return e.q; });
    exs.forEach(function (e, n) {
      items.push(Object.assign({
        kind: 'example', title: plain(e.q), anchor: exIds[n],
        snippet: plain(e.ans),
        hay: (plain(e.q) + ' ' + (e.steps || []).map(plain).join(' ') + ' ' + plain(e.ans)).toLowerCase()
      }, where));
    });

    (room.groups || []).forEach(function (g) {
      const gid = 'g-' + slug(g.title);
      (g.symbols || []).forEach(function (s) {
        items.push(Object.assign({
          kind: 'symbol', title: plain(s.n), anchor: gid, sym: s.g,
          snippet: g.title,
          hay: (plain(s.n) + ' ' + g.title).toLowerCase()
        }, where));
      });
    });
  });
  return items;
}

/* Rank: a title that starts with the query beats one that merely contains it,
   which beats a hit in the body. Room names match too, so "titration" finds
   the room's own contents rather than nothing. */
export async function query(q, limit) {
  const s = String(q || '').trim().toLowerCase();
  if (s.length < 2) return [];
  const items = await ensureIndex();
  const hits = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const t = it.title.toLowerCase();
    let score = 0;
    if (t === s) score = 100;
    else if (t.indexOf(s) === 0) score = 80;
    else if (t.indexOf(s) >= 0) score = 60;
    else if (it.roomName.toLowerCase().indexOf(s) >= 0) score = 30;
    else if (it.hay.indexOf(s) >= 0) score = 20;
    if (!score) continue;
    if (it.kind === 'card') score += 4;          /* a card is the likelier target */
    hits.push({ it: it, score: score });
  }
  hits.sort(function (a, b) { return b.score - a.score || a.it.title.localeCompare(b.it.title); });
  return hits.slice(0, limit || 40).map(function (h) { return h.it; });
}

function href(it) {
  return 'room.html?room=' + encodeURIComponent(it.room) + '#' + it.anchor;
}

const KINDLABEL = { card: 'card', example: 'example', symbol: 'symbol' };

function renderResults(list, q) {
  if (!q || q.trim().length < 2) return '<p class="sr-hint">Type at least two letters.</p>';
  if (!list.length) return '<p class="sr-hint">Nothing matches “' + esc(q) + '”.</p>';
  /* Grouped by room, in the order the rooms first appear in the ranking, so
     the best hit's room leads. */
  const order = [], byRoom = {};
  list.forEach(function (it) {
    if (!byRoom[it.room]) { byRoom[it.room] = []; order.push(it.room); }
    byRoom[it.room].push(it);
  });
  return order.map(function (k) {
    const group = byRoom[k], head = group[0];
    return '<div class="sr-group" style="--c:' + head.color + '">' +
      '<div class="sr-room"><span aria-hidden="true">' + head.glyph + '</span>' + esc(head.roomName) + '</div>' +
      group.map(function (it) {
        return '<a class="sr-hit" href="' + href(it) + '" data-hit="1">' +
          '<span class="sr-kind">' + KINDLABEL[it.kind] + '</span>' +
          '<span class="sr-title">' + (it.sym ? '<b class="sr-sym">' + esc(it.sym) + '</b> ' : '') +
          esc(it.title) + '</span>' +
          (it.snippet ? '<span class="sr-snip">' + esc(it.snippet) + '</span>' : '') +
          '</a>';
      }).join('') + '</div>';
  }).join('');
}

/* Wire an input + results container into a working search. Both entry points
   below use this; it owns debouncing, keyboard navigation and Escape. */
function wire(input, results, opts) {
  const onClose = (opts || {}).onClose;
  let t, seq = 0, cursor = -1;

  function hits() { return Array.prototype.slice.call(results.querySelectorAll('.sr-hit')); }
  function paint() {
    hits().forEach(function (a, i) {
      a.classList.toggle('on', i === cursor);
      if (i === cursor) a.setAttribute('aria-selected', 'true');
      else a.removeAttribute('aria-selected');
    });
    if (cursor >= 0) {
      const el = hits()[cursor];
      if (el) {
        const box = results.getBoundingClientRect(), r = el.getBoundingClientRect();
        if (r.bottom > box.bottom) results.scrollTop += r.bottom - box.bottom;
        else if (r.top < box.top) results.scrollTop -= box.top - r.top;
      }
    }
  }

  async function run() {
    const q = input.value;
    const mine = ++seq;
    if (q.trim().length < 2) { results.innerHTML = renderResults([], q); cursor = -1; return; }
    results.innerHTML = '<p class="sr-hint">Searching…</p>';
    const list = await query(q, 40);
    if (mine !== seq) return;                  /* a later keystroke already won */
    results.innerHTML = renderResults(list, q);
    cursor = -1;
  }

  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(run, 120);
  });

  input.addEventListener('keydown', function (e) {
    const list = hits();
    if (e.key === 'ArrowDown') { e.preventDefault(); cursor = Math.min(cursor + 1, list.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = Math.max(cursor - 1, -1); paint(); }
    else if (e.key === 'Enter') {
      if (cursor >= 0 && list[cursor]) { e.preventDefault(); location.href = list[cursor].getAttribute('href'); }
      else if (list.length) { e.preventDefault(); location.href = list[0].getAttribute('href'); }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (input.value) { input.value = ''; run(); }
      else if (onClose) onClose();
    }
  });

  return { run: run, focus: function () { input.focus(); input.select(); } };
}

/* Entry point 1 — the inline box on the board. */
export function mountBox(host) {
  host.innerHTML =
    '<div class="sbox">' +
    '<input class="sbox-in" id="labSearch" type="search" autocomplete="off" spellcheck="false" ' +
    'placeholder="Search every room — a formula, a topic, a symbol…" aria-label="Search the Science Lab">' +
    '<div class="sbox-res" id="labSearchRes" role="listbox" aria-label="Search results"></div>' +
    '</div>';
  const input = host.querySelector('#labSearch');
  const res = host.querySelector('#labSearchRes');
  const api = wire(input, res, {});
  /* Warm the index on first focus so the first keystroke is not the one that
     pays for 26 imports. */
  input.addEventListener('focus', function () { ensureIndex(); }, { once: true });
  return api;
}

/* Entry point 2 — the dock palette. Built into whatever body the dock hands
   over, so it inherits the dock's single-panel and Escape behaviour. */
export function mountPalette(body, opts) {
  body.innerHTML =
    '<input class="sbox-in" type="search" autocomplete="off" spellcheck="false" ' +
    'placeholder="Search every room…" aria-label="Search the Science Lab">' +
    '<div class="sbox-res" role="listbox" aria-label="Search results"></div>';
  const input = body.querySelector('.sbox-in');
  const res = body.querySelector('.sbox-res');
  const api = wire(input, res, opts);
  /* Warm the index, but never inside the click that opened the panel: kicking
     26 dynamic imports off in the same task as the panel build and the focus
     call wedges the renderer, and the panel never becomes usable. A tick's
     delay is enough to let the open finish first, and the first keystroke
     would have built it anyway. */
  setTimeout(ensureIndex, 0);
  return api;
}
