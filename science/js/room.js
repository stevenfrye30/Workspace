/* Science Lab room renderer.

   Each room's content lives in js/rooms/<key>.js and each interactive
   instrument in js/widgets/. Both are loaded on demand, so a room only
   downloads the data it actually renders — opening Chemistry no longer
   pulls in the 118-element table or the unit-conversion tables.

   Field trust: name / kind / blurb / status / topics / link name / link desc
   are escaped. body / note / callout / example q, steps and ans are authored
   HTML and injected raw. Keep new content on the correct side of that line. */

import { esc } from './format.js';
import { MANIFEST, ALIAS } from './rooms/_manifest.js';

/* Instruments per room, in render order. */
const WIDGETS = {
  'periodic-table': ['./widgets/periodic-table.js'],
  'reference': ['./widgets/reference-tables.js'],
  'data-analysis': ['./widgets/units.js', './widgets/calculator.js'],
  'chemistry': ['./widgets/chemistry.js'],
  'notes': ['./widgets/notes-library.js']
};

const TAGLABEL = { room: 'room', math: 'math lab', soon: 'soon' };

const main = document.getElementById('main');

function notFound(msg) {
  document.title = 'Room not found — Science Lab';
  main.innerHTML = '<p class="notfound" style="margin-top:1.5rem;">' + msg +
    ' <a href="./">← Back to the Science Lab</a></p>';
}

/* Resolve the room key from the URL. Validated against MANIFEST before it is
   ever used in an import path. */
const params = new URLSearchParams(location.search);
let key = (params.get('room') || '').toLowerCase();
if (ALIAS[key]) key = ALIAS[key];

if (!Object.prototype.hasOwnProperty.call(MANIFEST, key)) {
  notFound('That room doesn’t exist yet.');
} else {
  render(key).catch(function (err) {
    console.error(err);
    notFound('That room could not be loaded.');
  });
}

async function render(key) {
  const room = (await import('./rooms/' + key + '.js')).default;
  const widgets = await Promise.all(
    (WIDGETS[key] || []).map(function (path) { return import(path); })
  );

  document.title = room.name + ' — Science Lab';
  document.documentElement.style.setProperty('--c', room.color);

  let h = '';
  h += '<nav class="crumb"><a href="./">Science Lab</a><span class="sep">/</span>' +
       '<span class="here">' + esc(room.name) + '</span></nav>';
  h += '<header class="r-head"><span class="r-glyph">' + room.glyph + '</span>' +
       '<div class="r-kicker">' + esc(room.kind) + '</div>' +
       '<h1 class="r-title">' + esc(room.name) + '</h1>' +
       '<p class="r-blurb">' + esc(room.blurb) + '</p>' +
       '<div class="r-status"><span class="dot"></span>' +
       esc(room.status || 'Scaffold ready') + '</div></header>';

  if (room.callout) h += '<div class="callout">' + room.callout + '</div>';

  widgets.forEach(function (w) { h += w.block(); });

  if (room.topics) {
    h += '<section class="block"><div class="block-head"><h2>Core Topics</h2>' +
      '<span class="tag">Map</span><p>The territory this room covers.</p></div>' +
      '<div class="topic-grid">' + room.topics.map(function (t) {
        return '<span class="topic">' + esc(t) + '</span>';
      }).join('') + '</div></section>';
  }

  if (room.cards) {
    h += '<section class="block"><div class="block-head"><h2>Reference Cards</h2>' +
      '<span class="tag">Bench notes</span><p>Compact reminders for the bench.</p></div>' +
      '<div class="card-grid">' + room.cards.map(function (c) {
        return '<div class="card"><div class="c-name">' + esc(c.name) + '</div>' +
          '<div class="c-body">' + c.body + '</div>' +
          (c.note ? '<div class="c-note">' + c.note + '</div>' : '') + '</div>';
      }).join('') + '</div></section>';
  }

  if (room.examples) {
    h += '<section class="block"><div class="block-head"><h2>Worked Examples</h2>' +
      '<span class="tag">Practice</span><p>Click to reveal each solution.</p></div>' +
      '<div class="examples">' + room.examples.map(function (ex) {
        return '<details class="ex"><summary><span class="ex-q">' + ex.q + '</span></summary>' +
          '<ul class="ex-steps">' + ex.steps.map(function (s) {
            return '<li>' + s + '</li>';
          }).join('') + '</ul>' +
          '<div class="ex-ans">= ' + ex.ans + '</div></details>';
      }).join('') + '</div></section>';
  }

  if (room.links && room.links.length) {
    h += '<section class="block"><div class="block-head"><h2>Tools &amp; Connections</h2>' +
      '<span class="tag">Links</span><p>Where this room connects across the labs.</p></div>' +
      '<div class="links">' + room.links.map(function (l) {
        const cls = l.href ? 'lnk live' : 'lnk soon';
        const inner = '<span class="l-badge">' + esc(TAGLABEL[l.tag] || 'soon') + '</span>' +
          '<div class="l-name">' + esc(l.name) + '</div>' +
          '<div class="l-desc">' + esc(l.desc) + '</div>';
        return l.href
          ? '<a class="' + cls + '" href="' + l.href + '">' + inner + '</a>'
          : '<div class="' + cls + '">' + inner + '</div>';
      }).join('') + '</div></section>';
  }

  /* Per-room notebook, saved locally as scilab.notes.<room> */
  const notesPh = room.notesPlaceholder || 'Notes, definitions, reminders…';
  const notesCls = 'sci-notes' + (room.notesTall ? ' tall' : '');
  h += '<section class="block"><div class="block-head"><h2>Notes</h2>' +
    '<span class="tag">Saved locally</span>' +
    '<p>Private to this browser — autosaves as you type.</p></div>' +
    '<textarea class="' + notesCls + '" id="sciNotes" placeholder="' + notesPh +
    '" spellcheck="false"></textarea>' +
    '<div class="notes-status" id="sciNotesStatus">Notes are stored only in this browser.</div></section>';

  main.innerHTML = h;

  initNotes(key);
  widgets.forEach(function (w) { w.init(); });
}

function initNotes(roomKey) {
  const ta = document.getElementById('sciNotes');
  const status = document.getElementById('sciNotesStatus');
  if (!ta) return;
  const storeKey = 'scilab.notes.' + roomKey;
  let ok = true;
  try { const p = '__t'; window.localStorage.setItem(p, '1'); window.localStorage.removeItem(p); }
  catch (e) { ok = false; }
  if (!ok) { status.textContent = 'Saving unavailable in this browser context.'; return; }
  try { ta.value = window.localStorage.getItem(storeKey) || ''; } catch (e) {}
  let t;
  ta.addEventListener('input', function () {
    status.textContent = 'Saving…';
    clearTimeout(t);
    t = setTimeout(function () {
      try { window.localStorage.setItem(storeKey, ta.value); status.textContent = 'Saved locally ✓'; }
      catch (e) { status.textContent = 'Could not save (storage full?).'; }
    }, 350);
  });
}
