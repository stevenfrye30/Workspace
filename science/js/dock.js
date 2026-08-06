/* The top-right dock: a calculator and a notepad, on every page.

   Both used to live inside rooms — the calculator as a block in one room, the
   notepad as a textarea repeated at the bottom of every room. Reaching either
   meant navigating somewhere. They are tools you want mid-thought, so they sit
   above the page instead of inside it, opposite the hub pill at top-left.

   Each panel is built on first open and then only shown and hidden, so a
   running total or a half-typed note survives being closed. */

import { mount } from './calc.js';

const PAD_KEY = 'scilab.notepad';
const MIGRATED = 'scilab.notepad.migrated';

const dock = document.createElement('div');
dock.className = 'dock';
document.body.appendChild(dock);

function makePanel(cls, title) {
  const p = document.createElement('div');
  p.className = 'dock-panel ' + cls;
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-label', title);
  p.innerHTML = '<div class="dock-head">' + title +
    '<button class="dock-close" type="button" aria-label="Close">×</button></div>' +
    '<div class="dock-body"></div>';
  document.body.appendChild(p);
  return p;
}

/* Icon-only buttons. The emoji forms of these two (🖩, ✎) are a lottery —
   some platforms render a flat monochrome glyph, some a coloured one, some
   nothing at all — and a button with no text beside it cannot afford to come
   up empty. Drawn instead, so they are the same weight everywhere. */
const ICON = {
  calculator:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="5" y="2.5" width="14" height="19" rx="2.2"/>' +
    '<rect x="8" y="5.6" width="8" height="3.2" rx="0.8"/>' +
    '<g fill="currentColor" stroke="none">' +
    '<circle cx="8.6" cy="12.4" r="1.05"/><circle cx="12" cy="12.4" r="1.05"/><circle cx="15.4" cy="12.4" r="1.05"/>' +
    '<circle cx="8.6" cy="15.6" r="1.05"/><circle cx="12" cy="15.6" r="1.05"/><circle cx="15.4" cy="15.6" r="1.05"/>' +
    '<circle cx="8.6" cy="18.8" r="1.05"/><circle cx="12" cy="18.8" r="1.05"/><circle cx="15.4" cy="18.8" r="1.05"/>' +
    '</g></svg>',
  pencil:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>'
};

function makeTool(label, icon, title, build) {
  const btn = document.createElement('button');
  btn.className = 'dock-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  /* No visible text, so the name has to be carried by the label and the
     tooltip instead. */
  btn.setAttribute('aria-label', label);
  btn.title = label;
  btn.innerHTML = icon;
  dock.appendChild(btn);

  let panel = null, api = null;
  function open() {
    if (!panel) { panel = makePanel(title.toLowerCase(), title); api = build(panel.querySelector('.dock-body'));
      panel.querySelector('.dock-close').addEventListener('click', close); }
    closeOthers(panel);
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    if (api && api.focus) api.focus();
  }
  function close() {
    if (!panel) return;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', function () {
    panel && panel.classList.contains('open') ? close() : open();
  });
  return { close: close, get panel() { return panel; } };
}

const tools = [];
/* Only one panel at a time — they occupy the same corner. */
function closeOthers(keep) {
  tools.forEach(function (t) { if (t.panel && t.panel !== keep) t.close(); });
}

/* Notepad first, calculator last — the dock is a row, so the calculator ends
   up hard against the top-right corner. */
tools.push(makeTool('Notepad', ICON.pencil, 'Notepad', function (body) {
  body.innerHTML =
    '<textarea class="pad" id="dockPad" spellcheck="false" ' +
    'placeholder="Anything worth keeping — a formula, a step you keep missing, a question to ask."></textarea>' +
    '<div class="pad-status" id="dockPadStatus">Saved in this browser only.</div>';
  const ta = body.querySelector('#dockPad');
  const status = body.querySelector('#dockPadStatus');

  let ok = true;
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); }
  catch (e) { ok = false; }
  if (!ok) { status.textContent = 'Saving unavailable in this browser context.'; return { focus: function () { ta.focus(); } }; }

  migrateOldRoomNotes();
  try { ta.value = localStorage.getItem(PAD_KEY) || ''; } catch (e) {}

  let t;
  ta.addEventListener('input', function () {
    status.textContent = 'Saving…';
    clearTimeout(t);
    t = setTimeout(function () {
      try { localStorage.setItem(PAD_KEY, ta.value); status.textContent = 'Saved ✓'; }
      catch (e) { status.textContent = 'Could not save (storage full?).'; }
    }, 350);
  });
  return { focus: function () { ta.focus(); } };
}));

tools.push(makeTool('Calculator', ICON.calculator, 'Calculator', function (body) {
  return mount(body);
}));

/* Notes used to be kept per room under scilab.notes.<room>. Fold whatever a
   student already wrote into the single pad rather than stranding it — the
   old keys are left in place, so nothing is destroyed if this misfires. */
function migrateOldRoomNotes() {
  try {
    if (localStorage.getItem(MIGRATED)) return;
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('scilab.notes.') === 0) {
        const v = localStorage.getItem(k);
        if (v && v.replace(/\s/g, '')) found.push([k.slice('scilab.notes.'.length), v]);
      }
    }
    if (found.length) {
      found.sort();
      const header = '— notes moved here from the individual rooms —\n\n';
      const body = found.map(function (f) { return '## ' + f[0] + '\n' + f[1].trim(); }).join('\n\n');
      const existing = localStorage.getItem(PAD_KEY) || '';
      localStorage.setItem(PAD_KEY, existing ? existing + '\n\n' + body : header + body);
    }
    localStorage.setItem(MIGRATED, '1');
  } catch (e) { /* a failed migration must not stop the pad opening */ }
}

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  tools.forEach(function (t) {
    if (t.panel && t.panel.classList.contains('open') && t.panel.contains(document.activeElement)) t.close();
  });
});
