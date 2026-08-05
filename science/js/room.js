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
import * as share from './share.js';

/* Instruments per room, in render order. An entry is either a module path or
   {path, opts}; opts is passed to that widget's block() and init(), which is
   how one calculator module serves several topic rooms with different tabs. */
const WIDGETS = {
  'periodic-table': ['./widgets/periodic-table.js'],
  'reference': ['./widgets/reference-tables.js'],
  'data-analysis': ['./widgets/units.js', './widgets/calculator.js'],
  'notes': ['./widgets/notes-library.js'],

  /* Chemistry is a hub of topic rooms; the instruments live in those. */
  'chem-moles': ['./widgets/stoichiometry.js',
                 { path: './widgets/chemistry.js', opts: { tabs: ['molar'] } }],
  'chem-solutions': [{ path: './widgets/chemistry.js', opts: { tabs: ['molarity', 'dilution'] } }],
  'chem-acids': [{ path: './widgets/chemistry.js', opts: { tabs: ['ph', 'buffer'] } }],
  'chem-titration': ['./widgets/titration.js'],
  'chem-gases': ['./widgets/gaslaws.js'],
  'chem-thermo': ['./widgets/thermochem.js']
};

const TAGLABEL = { room: 'room', math: 'math', soon: 'soon' };

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
  const specs = (WIDGETS[key] || []).map(function (w) {
    return typeof w === 'string' ? { path: w, opts: {} } : { path: w.path, opts: w.opts || {} };
  });
  const widgets = await Promise.all(specs.map(function (s) { return import(s.path); }));

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

  /* Rooms with tools carry a share bar: the tools mirror their inputs into
     the URL, so copying it hands over the whole worked problem. */
  if (specs.length) h += share.bar();

  /* A hub room leads with big topic buttons instead of a wall of sections. */
  if (room.hub) {
    h += '<section class="block"><div class="hub-grid">' + room.hub.map(function (t) {
      return '<a class="hub-card" href="room.html?room=' + encodeURIComponent(t.key) + '">' +
        '<span class="hub-glyph">' + t.glyph + '</span>' +
        '<span class="hub-name">' + esc(t.name) + '</span>' +
        '<span class="hub-desc">' + esc(t.desc) + '</span>' +
        (t.tools ? '<span class="hub-tool">' + esc(t.tools) + '</span>' : '') +
        '</a>';
    }).join('') + '</div></section>';
  }

  widgets.forEach(function (w, i) { h += w.block(specs[i].opts); });

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

  /* Click-to-copy symbol groups, from the ported Symbols room. */
  if (room.groups) {
    h += '<section class="block"><div class="block-head"><h2>Symbols</h2>' +
      '<span class="tag">Click to copy</span>' +
      '<p>Click any symbol to copy it to the clipboard.</p></div>' +
      room.groups.map(function (grp) {
        return '<div class="symkey-group"><div class="symkey-title">' + esc(grp.title) + '</div>' +
          '<div class="symkey-grid">' + grp.symbols.map(function (s) {
            return '<button class="symkey" type="button" data-name="' + esc(s.n) + '">' +
              '<span class="symkey-ch">' + s.g + '</span>' +
              '<span class="symkey-nm">' + esc(s.n) + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '</section>';
  }

  if (room.examples) {
    h += '<section class="block"><div class="block-head"><h2>' +
      esc(room.examplesTitle || 'Worked Examples') + '</h2>' +
      '<span class="tag">Practice</span><p>' +
      esc(room.examplesSub || 'Click to reveal each solution.') + '</p></div>' +
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

  /* An outline of the territory, carried over from the Math rooms. */
  if (room.sections) {
    h += '<section class="block"><div class="block-head"><h2>What this covers</h2>' +
      '<span class="tag">Outline</span></div><div class="sec-grid">' +
      room.sections.map(function (s) {
        return '<div class="sec-card"><div class="sec-title">' + esc(s.title) + '</div><ul>' +
          s.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
          '</ul></div>';
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
  if (room.groups) initSymbolCopy();
  if (specs.length) share.initBar();
  widgets.forEach(function (w, i) { w.init(specs[i].opts); });
}

/* Copy a symbol on click, confirming on the button itself so the feedback
   lands where the eye already is. */
function initSymbolCopy() {
  document.querySelectorAll('.symkey').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      const ch = btn.querySelector('.symkey-ch').textContent;
      const label = btn.querySelector('.symkey-nm');
      const was = label.textContent;
      let ok = true;
      try { await navigator.clipboard.writeText(ch); }
      catch (e) {
        const ta = document.createElement('textarea');
        ta.value = ch; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        ta.remove();
      }
      label.textContent = ok ? 'copied' : 'press ⌘C';
      btn.classList.add('copied');
      setTimeout(function () { label.textContent = was; btn.classList.remove('copied'); }, 1100);
    });
  });
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
