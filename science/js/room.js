/* Science Lab room renderer.

   Each room's content lives in js/rooms/<key>.js and each interactive
   instrument in js/widgets/. Both are loaded on demand, so a room only
   downloads the data it actually renders — opening Chemistry no longer
   pulls in the 118-element table or the unit-conversion tables.

   Field trust: name / kind / blurb / status / topics / link name / link desc
   are escaped. body / note / callout / example q, steps and ans are authored
   HTML and injected raw. Keep new content on the correct side of that line. */

import { esc, slug, anchorsFor } from './format.js';
import { MANIFEST, ALIAS } from './rooms/_manifest.js';
import * as share from './share.js';

/* Instruments now live in the manifest beside the room they belong to, so a
   room is declared in one place. The paths are resolved here, in the module
   that imports them — which is why they are still written './widgets/…'. */

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

/* A room that cannot load its own content is a dead page and says so. A room
   whose *instrument* fails is not: the reference cards and worked examples are
   still the larger part of what a student came for, so a broken tool degrades
   to a note in its own slot instead of taking the page down with it. */
function brokenWidget(path, err) {
  console.error('Instrument failed: ' + path, err);
  return {
    block: function () {
      return '<section class="block"><p class="w-fail">This tool didn’t load. ' +
        'The rest of the room still works — try reloading the page.</p></section>';
    },
    init: function () {}
  };
}

async function render(key) {
  const meta = MANIFEST[key];
  /* Display fields come from the manifest, content from the module. A module
     no longer carries its own name, glyph or colour, so there is one place to
     change them and nothing to keep in step. */
  const room = Object.assign({}, (await import('./rooms/' + key + '.js')).default, {
    name: meta.name, glyph: meta.glyph, color: meta.color, children: meta.children
  });
  const specs = (meta.widgets || []).map(function (w) {
    return typeof w === 'string' ? { path: w, opts: {} } : { path: w.path, opts: w.opts || {} };
  });
  const widgets = await Promise.all(specs.map(function (s) {
    return import(s.path).catch(function (err) { return brokenWidget(s.path, err); });
  }));

  document.title = room.name + ' — Science Lab';
  document.documentElement.style.setProperty('--c', room.color);

  let h = '';
  h += '<nav class="crumb"><a href="./">Science Lab</a><span class="sep">/</span>' +
       '<span class="here">' + esc(room.name) + '</span></nav>';

  h += pager(key);

  /* A hub is a set of doors, so it gets only its name — a kicker, blurb and
     status pill above nine buttons is chrome competing with the choice. */
  /* The heading carries id and tabindex so <main> can be labelled by it and
     focus can be moved to it once the room has rendered. Every glyph in the
     chrome is aria-hidden: they repeat the name beside them, and a screen
     reader announcing "test tube, Chemistry" is reading decoration aloud. */
  if (room.children) {
    h += '<header class="r-head r-head-hub"><h1 class="r-title" id="roomTitle" tabindex="-1">' +
         esc(room.name) + '</h1></header>';
  } else {
    h += '<header class="r-head"><span class="r-glyph" aria-hidden="true">' + room.glyph + '</span>' +
         '<div class="r-kicker">' + esc(room.kind) + '</div>' +
         '<h1 class="r-title" id="roomTitle" tabindex="-1">' + esc(room.name) + '</h1>' +
         '<p class="r-blurb">' + esc(room.blurb) + '</p>' +
         '<div class="r-status"><span class="dot" aria-hidden="true"></span>' +
         esc(room.status || 'Scaffold ready') + '</div></header>';
  }

  if (room.callout) h += '<div class="callout">' + room.callout + '</div>';

  /* A share bar wherever there is state worth handing over. That used to mean
     the eight rooms with instruments; it also means any room with cards or
     examples, because which of those you have open is itself the thing you
     want to send — "read these four, in this order". A room with neither gets
     no bar, since its URL says everything about it already. */
  const shareable = specs.length ||
    (room.cards && room.cards.length) || (room.examples && room.examples.length);
  if (shareable) h += share.bar();

  /* A hub room leads with big topic buttons instead of a wall of sections.
     A tile targets either an internal room (key) or an outside tool (href). */
  if (room.children) {
    /* The hub lists child keys; name and glyph are looked up, and only the
       prose that is unique to this hub — the one-line description, and any
       tool label — comes from the module. */
    const doors = room.children.map(function (k) {
      const c = MANIFEST[k] || {}, own = (room.hub || {})[k] || {};
      return { href: 'room.html?room=' + encodeURIComponent(k), glyph: c.glyph, name: c.name,
               desc: own.desc || '', tools: own.tools, external: false };
    }).concat((room.hubExternal || []).map(function (x) {
      return { href: x.href, glyph: x.glyph, name: x.name, desc: x.desc,
               tools: x.tools, external: true };
    }));

    h += '<section class="block"><div class="hub-grid">' + doors.map(function (t) {
      return '<a class="hub-card' + (t.external ? ' external' : '') + '" href="' + t.href + '"' +
        (t.external ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<span class="hub-glyph" aria-hidden="true">' + t.glyph + '</span>' +
        '<span class="hub-name">' + esc(t.name) + '</span>' +
        '<span class="hub-desc">' + esc(t.desc) + '</span>' +
        (t.tools ? '<span class="hub-tool">' + esc(t.tools) + '</span>' : '') +
        '</a>';
    }).join('') + '</div></section>';

    /* One or two small links under the grid, in place of a full
       Tools & Connections section that would compete with the doors. */
    if (room.quick) {
      h += '<div class="quick-row">' + room.quick.map(function (k) {
        const c = MANIFEST[k] || {};
        return '<a class="quick" href="room.html?room=' + encodeURIComponent(k) + '">' +
          '<span class="quick-glyph" aria-hidden="true">' + c.glyph + '</span>' + esc(c.name) + ' →</a>';
      }).join('') + '</div>';
    }
  }

  /* Each instrument gets its own slot so a failure on mount can be reported
     exactly where the tool should have been. The wrapper carries no box of
     its own, so section margins collapse through it as before. */
  widgets.forEach(function (w, i) {
    let inner;
    try { inner = w.block(specs[i].opts); }
    catch (err) { inner = brokenWidget(specs[i].path, err).block(); }
    h += '<div class="w-slot" data-slot="' + i + '">' + inner + '</div>';
  });

  /* One list, not two. A room used to print a wall of topic chips that did
     nothing and then a wall of cards saying much the same thing; more than
     half the chips had no card behind them at all. The card titles are the
     topics now — click one to open it. Expand all is there because a tutor
     screen-sharing wants the whole sheet visible at once. */
  if (room.cards && room.cards.length) {
    h += '<section class="block ref" id="refList"><div class="block-head">' +
      '<h2>Reference</h2><span class="tag">' + room.cards.length + ' topics</span>' +
      '<p>Click a topic to open it.</p></div>' +
      '<div class="ref-bar"><button class="rt-btn" id="refToggle" type="button" ' +
      'aria-pressed="false">Expand all</button></div>' +
      '<div class="ref-grid">' + (function () {
        /* Ids come from the shared helper so a search result's fragment and
           the card it names cannot drift apart. */
        const ids = anchorsFor('c', room.cards, function (c) { return c.name; });
        return room.cards.map(function (c, i) {
          return '<details class="ref-item" id="' + ids[i] + '"><summary>' + esc(c.name) + '</summary>' +
            '<div class="c-body">' + c.body + '</div>' +
            (c.note ? '<div class="c-note">' + c.note + '</div>' : '') + '</details>';
        }).join('');
      })() + '</div></section>';
  }

  /* Click-to-copy symbol groups, from the ported Symbols room. */
  if (room.groups) {
    h += '<section class="block"><div class="block-head"><h2>Symbols</h2>' +
      '<span class="tag">Click to copy</span>' +
      '<p>Click any symbol to copy it to the clipboard.</p></div>' +
      room.groups.map(function (grp) {
        return '<div class="symkey-group" id="g-' + slug(grp.title) + '"><div class="symkey-title">' + esc(grp.title) + '</div>' +
          '<div class="symkey-grid">' + grp.symbols.map(function (s) {
            return '<button class="symkey" type="button" data-name="' + esc(s.n) + '">' +
              '<span class="symkey-ch">' + s.g + '</span>' +
              '<span class="symkey-nm">' + esc(s.n) + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '</section>';
  }

  if (room.examples) {
    /* The tag used to read "Practice", which now sits beside a Read/Practice
       control meaning something else entirely. */
    h += '<section class="block" id="exBlock"><div class="block-head"><h2>' +
      esc(room.examplesTitle || 'Worked Examples') + '</h2>' +
      '<span class="tag">Examples</span><p>' +
      esc(room.examplesSub || 'Click to reveal each solution.') + '</p></div>' +
      '<div class="pr-bar">' +
        '<div class="pr-modes" role="group" aria-label="How to show the examples">' +
          '<button class="rt-btn pr-mode" type="button" data-mode="read" aria-pressed="true">Read</button>' +
          '<button class="rt-btn pr-mode" type="button" data-mode="practice" aria-pressed="false">Practice</button>' +
        '</div>' +
        '<span class="pr-progress" id="prProgress" role="status" aria-live="polite"></span>' +
      '</div>' +
      '<div class="examples">' + (function () {
        const ids = anchorsFor('x', room.examples, function (e) { return e.q; });
        return room.examples.map(function (ex, i) {
          return '<details class="ex" id="' + ids[i] + '"><summary><span class="ex-q">' + ex.q + '</span></summary>' +
            '<ul class="ex-steps">' + ex.steps.map(function (s) {
              return '<li>' + s + '</li>';
            }).join('') + '</ul>' +
            '<div class="ex-ans">= ' + ex.ans + '</div></details>';
        }).join('');
      })() + '</div></section>';
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

  main.innerHTML = h;

  /* The landmark is named by the room it currently holds, so a screen reader
     listing landmarks gets "Titration, main" rather than an unlabelled region
     that could be any of twenty-seven pages. */
  main.setAttribute('aria-labelledby', 'roomTitle');

  if (room.cards && room.cards.length) initRefList();
  if (room.groups) initSymbolCopy();
  if (shareable) share.initBar();
  initOpenState();
  if (room.examples && room.examples.length) initPractice(key);

  /* The page arrives empty and fills in, so focus is still on the document
     when the content appears — a screen reader user would have to walk back
     through the nav to find out where they are. Move it to the heading once
     there is a heading to move it to.

     Not when a fragment was requested: a search result asked for a specific
     card, and revealHash is already sending focus and scroll there. */
  if (!location.hash) {
    const title = document.getElementById('roomTitle');
    if (title) title.focus({ preventScroll: true });
  }

  revealHash();

  /* One instrument throwing on mount must not stop the ones after it. */
  widgets.forEach(function (w, i) {
    try { w.init(specs[i].opts); }
    catch (err) {
      console.error('Instrument failed to mount: ' + specs[i].path, err);
      const slot = main.querySelector('.w-slot[data-slot="' + i + '"]');
      if (slot) {
        const p = document.createElement('p');
        p.className = 'w-fail';
        p.textContent = 'This tool stopped partway through loading. The rest of the room still works.';
        slot.appendChild(p);
      }
    }
  });
}

/* Where a room sits inside its hub, found by asking the manifest rather than
   by keeping a second ordered list. A room that belongs to no hub — the hubs
   themselves, the periodic table, the reference tables — gets no pager, which
   is why this returns an empty string rather than a disabled strip.

   A topic room used to be a dead end: nine doors in, and the only way to the
   next topic was back out to the hub and in again. */
function hubOf(key) {
  const keys = Object.keys(MANIFEST);
  for (let i = 0; i < keys.length; i++) {
    const kids = MANIFEST[keys[i]].children;
    if (kids && kids.indexOf(key) >= 0) return { hub: keys[i], kids: kids };
  }
  return null;
}

function pager(key) {
  const found = hubOf(key);
  if (!found) return '';
  const kids = found.kids, i = kids.indexOf(key);
  const hub = MANIFEST[found.hub];
  const link = function (k, dir) {
    const m = MANIFEST[k];
    return '<a class="pg-step pg-' + dir + '" href="room.html?room=' + encodeURIComponent(k) + '"' +
      ' rel="' + (dir === 'prev' ? 'prev' : 'next') + '">' +
      (dir === 'prev' ? '<span aria-hidden="true">←</span> ' : '') +
      esc(m.name) +
      (dir === 'next' ? ' <span aria-hidden="true">→</span>' : '') + '</a>';
  };
  return '<nav class="pager" aria-label="' + esc(hub.name) + ' topic rooms">' +
    (i > 0 ? link(kids[i - 1], 'prev') : '<span class="pg-step pg-none"></span>') +
    '<span class="pg-here">' +
      '<a href="room.html?room=' + encodeURIComponent(found.hub) + '">' + esc(hub.name) + '</a>' +
      '<span class="sep" aria-hidden="true">·</span>' +
      '<span class="pg-count">' + (i + 1) + ' of ' + kids.length + '</span>' +
    '</span>' +
    (i < kids.length - 1 ? link(kids[i + 1], 'next') : '<span class="pg-step pg-none"></span>') +
    '</nav>';
}

/* A search result links to room.html?room=…#c-some-card. The card it names is
   a collapsed <details>, so arriving at it has to open it as well as scroll to
   it, or the reader lands on a closed box with no sign of why.

   scrollTo over scrollIntoView: the cards sit in a grid whose rows resize as
   a <details> opens, and scrollIntoView measures before that reflow settles,
   landing short. Opening first and then measuring from the page top is
   stable. */
function revealHash() {
  const id = decodeURIComponent((location.hash || '').slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'DETAILS') el.open = true;
  el.classList.add('hit');

  /* Take the fragment out of the URL before the browser acts on it. Chrome
     keeps retrying its own fragment scroll as content appears, it fires after
     ours, and it parks the target hard against the top of the viewport under
     the fixed nav pill. Removing the fragment leaves it nothing to chase; it
     goes back once we have settled, so the link a student copies still
     carries the anchor. replaceState never scrolls, so restoring is safe. */
  history.replaceState(null, '', location.pathname + location.search);

  /* Scroll more than once, on purpose. The instruments mount after this runs
     and a chart appearing above the target pushes it down several hundred
     pixels, so a single attempt lands the reader in the wrong place on
     exactly the rooms that have the most to load. Each attempt is a no-op
     once the element is already where it should be.

     The moment the reader scrolls, types or clicks, they have taken over and
     we stop moving the page under them. */
  let userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) {
    window.addEventListener(t, function () { userMoved = true; }, { passive: true, once: true });
  });
  function place() {
    if (userMoved) return;
    const want = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 80);
    if (Math.abs(window.scrollY - want) > 4) window.scrollTo(0, want);
  }
  requestAnimationFrame(function () { requestAnimationFrame(place); });
  [150, 400, 800, 1400].forEach(function (ms) { setTimeout(place, ms); });
  /* Rebuilt from the URL as it stands, not from a snapshot taken before the
     open-state mirror started writing to it — restoring the snapshot would
     throw away every card the reader opened while this was pending. */
  setTimeout(function () {
    history.replaceState(null, '', location.pathname + location.search + '#' + id);
  }, 1600);
  setTimeout(function () { el.classList.remove('hit'); }, 3000);
}

/* Practice mode.

   Every worked example is a question with its full solution one click behind
   it, which means the examples are read, never attempted — and reading a
   solution feels like understanding in a way that answering does not.

   Practice hides the solution and gives it back in two stages: the method
   first, then the answer. One stage would let a stuck student jump to the
   number and stop; seeing the steps and then predicting the result is the
   part that does the teaching.

   No content changed to support this — the example data already keeps q,
   steps and ans apart. Read mode leaves the DOM exactly as it was; the
   controls are injected on entering Practice and removed on leaving, so the
   default path is untouched. There is no answer checking and no score: this
   marks what you have looked at, and nothing else. */
function initPractice(roomKey) {
  const block = document.getElementById('exBlock');
  if (!block) return;
  const wrap = block.querySelector('.examples');
  const exs = Array.prototype.slice.call(wrap.querySelectorAll('details.ex'));
  const modeBtns = Array.prototype.slice.call(block.querySelectorAll('.pr-mode'));
  const progress = block.querySelector('#prProgress');
  if (!exs.length) return;

  const KEY = 'scilab.practice.' + roomKey;
  let state = { mode: 'read', revealed: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && typeof v === 'object') {
        state.mode = v.mode === 'practice' ? 'practice' : 'read';
        state.revealed = v.revealed && typeof v.revealed === 'object' ? v.revealed : {};
      }
    }
  } catch (e) { /* unreadable or disabled storage just means a fresh start */ }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function stageOf(ex) { return Math.max(0, Math.min(2, state.revealed[ex.id] | 0)); }

  function paintProgress() {
    const done = exs.filter(function (ex) { return stageOf(ex) >= 2; }).length;
    progress.textContent = state.mode === 'practice'
      ? done + ' of ' + exs.length + ' revealed'
      : '';
  }

  function paintOne(ex) {
    const s = stageOf(ex);
    ex.classList.remove('pr0', 'pr1', 'pr2');
    ex.classList.add('pr' + s);
    const ctrl = ex.querySelector('.pr-ctrl');
    if (!ctrl) return;
    const btn = ctrl.querySelector('button');
    if (s >= 2) { ctrl.hidden = true; return; }
    ctrl.hidden = false;
    btn.textContent = s === 0 ? 'Reveal steps' : 'Reveal answer';
  }

  function addControls() {
    exs.forEach(function (ex) {
      if (ex.querySelector('.pr-ctrl')) return;
      const ctrl = document.createElement('div');
      ctrl.className = 'pr-ctrl';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rt-btn pr-reveal';
      btn.addEventListener('click', function () {
        state.revealed[ex.id] = Math.min(2, stageOf(ex) + 1);
        save();
        paintOne(ex);
        paintProgress();
        /* Focus stays on the control that is still there to be pressed; when
           the last one goes, hand focus back to the example itself so a
           keyboard user is not dropped to the top of the document. */
        if (stageOf(ex) >= 2) { const s = ex.querySelector('summary'); if (s) s.focus(); }
        else btn.focus();
      });
      ctrl.appendChild(btn);
      /* Ahead of the steps, so the reading order is question, control,
         method, answer. */
      const steps = ex.querySelector('.ex-steps');
      ex.insertBefore(ctrl, steps);
      paintOne(ex);
    });
  }

  function removeControls() {
    exs.forEach(function (ex) {
      const c = ex.querySelector('.pr-ctrl');
      if (c) c.remove();
      ex.classList.remove('pr0', 'pr1', 'pr2');
    });
  }

  function setMode(m) {
    state.mode = m === 'practice' ? 'practice' : 'read';
    save();
    wrap.classList.toggle('practice', state.mode === 'practice');
    modeBtns.forEach(function (b) {
      const on = b.getAttribute('data-mode') === state.mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (state.mode === 'practice') { addControls(); exs.forEach(paintOne); }
    else removeControls();
    paintProgress();
  }

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });
  setMode(state.mode);
}

/* Which cards and examples are open is state worth sharing: handing over a
   room with four cards already expanded, in the order you want them read, is
   most of what a worked handout is. It rides in the URL beside the tools'
   inputs under its own prefix, and only open items are listed — a link that
   named every closed card would be mostly noise.

   The ids come from the search work, so a shared open-state and a shared
   deep link cannot disagree about what a card is called. */
function initOpenState() {
  const cards = Array.prototype.slice.call(document.querySelectorAll('#refList .ref-item'));
  const exs = Array.prototype.slice.call(document.querySelectorAll('.examples details.ex'));
  if (!cards.length && !exs.length) return;

  const saved = share.readState('op');
  function restore(list, param, prefix) {
    if (!saved[param]) return;
    const want = Object.create(null);
    saved[param].split(',').forEach(function (s) { want[prefix + s] = 1; });
    list.forEach(function (d) { if (want[d.id]) d.open = true; });
  }
  restore(cards, 'c', 'c-');
  restore(exs, 'x', 'x-');

  function idsOf(list, prefix) {
    return list.filter(function (d) { return d.open; })
      .map(function (d) { return d.id.slice(prefix.length); }).join(',');
  }

  let t;
  function sync() {
    /* Debounced, because Expand all fires one toggle per card and that should
       be one URL write rather than twenty-one. replaceState throughout, so
       opening a card never adds a back-button step. */
    clearTimeout(t);
    t = setTimeout(function () {
      share.writeState('op', { c: idsOf(cards, 'c-'), x: idsOf(exs, 'x-') });
    }, 60);
  }
  cards.concat(exs).forEach(function (d) { d.addEventListener('toggle', sync); });
}

/* Expand-all flips every topic at once, for reading the sheet rather than
   looking one thing up. The label reports what the button will do next. */
function initRefList() {
  const btn = document.getElementById('refToggle');
  if (!btn) return;
  const items = document.querySelectorAll('#refList .ref-item');
  btn.addEventListener('click', function () {
    const expand = btn.getAttribute('aria-pressed') !== 'true';
    items.forEach(function (d) { d.open = expand; });
    btn.setAttribute('aria-pressed', String(expand));
    btn.textContent = expand ? 'Collapse all' : 'Expand all';
  });
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

