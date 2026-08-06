/* Shareable problem links.

   Every tool mirrors its inputs into the query string, so the address bar
   always describes what is on screen and can be handed to a student: "here
   is the exact titration we just did — change the concentration and watch
   what happens." Without this, a problem worked through together evaporates
   when the tab closes.

   Keys are namespaced per tool (st.eq, ti.ca, …) so two tools in one room
   cannot collide. History is replaced rather than pushed — typing in a box
   should not fill the back button with every keystroke. */

/* Read this tool's parameters out of the URL. Returns {} when there are
   none, which is the signal to fall back to the tool's own defaults. */
export function readState(prefix) {
  const pre = prefix + '.';
  const out = {};
  new URLSearchParams(location.search).forEach(function (v, k) {
    if (k.indexOf(pre) === 0) out[k.slice(pre.length)] = v;
  });
  return out;
}

/* Mirror this tool's state into the URL, leaving other tools' keys alone.
   Empty and null values are dropped so the link stays short. */
export function writeState(prefix, state) {
  const p = new URLSearchParams(location.search);
  const pre = prefix + '.';
  Array.from(p.keys()).forEach(function (k) {
    if (k.indexOf(pre) === 0) p.delete(k);
  });
  Object.keys(state).forEach(function (k) {
    const v = state[k];
    if (v === '' || v === null || v === undefined) return;
    p.set(pre + k, String(v));
  });
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
}

/* Keep only what the user actually changed. A tool with two dozen inputs
   would otherwise emit a link that is mostly untouched defaults — long,
   unreadable, and hostile to paste into a message. */
export function changedOnly(defaults, state) {
  const out = {};
  Object.keys(state).forEach(function (k) {
    if (String(state[k]) !== String(defaults[k] === undefined ? '' : defaults[k])) out[k] = state[k];
  });
  return out;
}

/* Snapshot the values a set of inputs starts with, before any restore. */
export function snapshot(ids, get) {
  const d = {};
  ids.forEach(function (id) { const el = get(id); if (el) d[id] = el.value; });
  return d;
}

/* Arrays of rows (Hess steps, gas mixtures) ride along as JSON. */
export function readJSON(state, key, fallback) {
  if (!(key in state)) return fallback;
  try {
    const v = JSON.parse(state[key]);
    return Array.isArray(v) ? v : fallback;
  } catch (e) { return fallback; }
}

/* The bar sits under the room header, once per room, and copies whatever
   the URL currently says — so it covers every tool on the page at once. */
export function bar() {
  return '<div class="share-bar">' +
    '<button class="rt-btn share-btn" id="shareCopy" type="button">Copy link to this problem</button>' +
    '<span class="share-note" id="shareNote">The link reopens this page with your numbers already filled in.</span>' +
    '</div>';
}

/* One clipboard implementation for the whole app. The async API is blocked
   without a user gesture in some contexts and over plain http, so there is a
   fallback; anything that copies should get both, which is why this is
   exported rather than kept private to the share bar. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return legacyCopy(text);
  }
}

export function initBar() {
  const btn = document.getElementById('shareCopy');
  const note = document.getElementById('shareNote');
  if (!btn) return;
  const idle = note.textContent;
  let t;

  btn.addEventListener('click', async function () {
    const ok = await copyText(location.href);
    note.textContent = ok ? 'Copied — paste it to your student.' : 'Press Ctrl+C to copy the selected link.';
    note.classList.toggle('ok', ok);
    clearTimeout(t);
    t = setTimeout(function () { note.textContent = idle; note.classList.remove('ok'); }, 4000);
  });
}

function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}
