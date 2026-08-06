/* The home board, generated from the manifest.

   These nine tiles used to be hand-written HTML with the name, glyph and
   accent hex typed in again beside the copies in _manifest.js and in each
   room module. That is how the Math tile came to claim nine rooms: someone
   counted the hub's buttons, one of which is an outbound link to Desmos.
   A tile now states nothing a room does not already declare — the subtitle
   for a hub is its child count, so it cannot be wrong. */

import { MANIFEST, HOME } from './rooms/_manifest.js';
import { esc } from './format.js';
import { mountBox } from './search.js';

function tileHTML(key) {
  const m = MANIFEST[key], home = m.home;
  /* A hub says how many rooms are behind it, counted rather than asserted.
     Anything else carries the subtitle written in the manifest, which is
     authored HTML so it can hold markup like K<sub>a</sub>. */
  const sub = m.children
    ? m.children.length + (key === 'chemistry' ? ' topic rooms' : ' rooms')
    : (home.sub || '');

  let h = '<a class="tile' + (home.center ? ' tile-center' : '') + '" style="--c:' + m.color + '" ' +
    'href="room.html?room=' + encodeURIComponent(key) + '">' +
    '<span class="t-glyph" aria-hidden="true">' + m.glyph + '</span>' +
    '<span class="t-name">' + esc(m.name) + '</span>' +
    (sub ? '<span class="t-sub">' + sub + '</span>' : '') +
    '</a>';

  /* The second destination is a sibling of the tile, never a child of it.
     It used to be a <span role="link"> nested inside the tile's anchor:
     invalid HTML, and it swallowed middle-click and open-in-new-tab, so the
     one room reachable only from here could not be opened in a new tab. */
  if (home.also && MANIFEST[home.also]) {
    const a = MANIFEST[home.also];
    h += '<a class="t-also" href="room.html?room=' + encodeURIComponent(home.also) + '">' +
      esc(a.name) + ' →</a>';
  }
  return '<div class="cell" style="--c:' + m.color + '">' + h + '</div>';
}

const board = document.getElementById('board');
if (board) board.innerHTML = HOME.map(tileHTML).join('');

const search = document.getElementById('boardSearch');
if (search) mountBox(search);
