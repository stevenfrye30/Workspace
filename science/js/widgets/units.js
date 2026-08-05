import { UNITS, U_PREFIXES, U_SIBASE, U_SIDERIVED, U_CONSTANTS } from '../data/units.js';
import { esc, uFmt } from '../format.js';
import { readState, writeState } from '../share.js';

export function block() {
  var prefRows = U_PREFIXES.map(function (p) { return '<tr><td>' + esc(p[0]) + '</td><td class="u-sym">' + esc(p[1]) + '</td><td class="u-val">' + p[2] + '</td></tr>'; }).join("");
  var baseRows = U_SIBASE.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="u-sym">' + esc(r[2]) + '</td></tr>'; }).join("");
  var derRows = U_SIDERIVED.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="u-sym">' + esc(r[2]) + '</td><td class="u-sym">' + esc(r[3]) + '</td></tr>'; }).join("");
  var constRows = U_CONSTANTS.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="u-sym">' + esc(r[1]) + '</td><td class="u-val">' + r[2] + '</td><td class="u-sym">' + esc(r[3]) + '</td></tr>'; }).join("");
  var catOpts = Object.keys(UNITS).map(function (k) { return '<option>' + k + '</option>'; }).join("");
  return '<section class="block"><div class="block-head"><h2>Master Units Table</h2><span class="tag">Instrument</span>' +
    '<p>Live converter across 16 quantities, plus SI prefixes, base &amp; derived units, and physical constants. Type a value, pick a unit, read every equivalent.</p></div>' +
    '<div class="u-tabs">' +
      '<button class="u-tab on" type="button" data-pane="convert">Convert</button>' +
      '<button class="u-tab" type="button" data-pane="prefixes">SI Prefixes</button>' +
      '<button class="u-tab" type="button" data-pane="si">SI Units</button>' +
      '<button class="u-tab" type="button" data-pane="constants">Constants</button>' +
    '</div>' +
    '<div class="u-pane on" data-pane="convert">' +
      '<div class="u-row"><select class="u-select" id="uCat">' + catOpts + '</select></div>' +
      '<div class="u-row"><input class="u-input" id="uVal" type="number" step="any" value="1"><select class="u-select" id="uFrom"></select></div>' +
      '<input class="u-search" id="uSearch" type="text" placeholder="Filter units in this quantity…" autocomplete="off" spellcheck="false">' +
      '<div class="u-scroll"><table class="u-table"><thead><tr><th>Unit</th><th>Symbol</th><th style="text-align:right">Value</th></tr></thead><tbody id="uBody"></tbody></table></div>' +
      '<div class="u-note" id="uNote"></div>' +
    '</div>' +
    '<div class="u-pane" data-pane="prefixes"><div class="u-scroll"><table class="u-table"><thead><tr><th>Prefix</th><th>Symbol</th><th style="text-align:right">Factor</th></tr></thead><tbody>' + prefRows + '</tbody></table></div></div>' +
    '<div class="u-pane" data-pane="si"><div class="u-scroll"><table class="u-table"><thead><tr><th>Base quantity</th><th>Unit</th><th>Symbol</th></tr></thead><tbody>' + baseRows + '</tbody></table></div>' +
      '<div class="u-scroll" style="margin-top:0.7rem"><table class="u-table"><thead><tr><th>Derived</th><th>Unit</th><th>Symbol</th><th>In SI</th></tr></thead><tbody>' + derRows + '</tbody></table></div></div>' +
    '<div class="u-pane" data-pane="constants"><div class="u-scroll"><table class="u-table"><thead><tr><th>Constant</th><th>Sym</th><th style="text-align:right">Value</th><th>Unit</th></tr></thead><tbody>' + constRows + '</tbody></table></div></div>' +
    '</section>';
}

export function init() {
  var catSel = document.getElementById("uCat");
  var fromSel = document.getElementById("uFrom");
  var valInput = document.getElementById("uVal");
  var searchInput = document.getElementById("uSearch");
  var body = document.getElementById("uBody");
  var note = document.getElementById("uNote");
  if (!catSel || !body) return;
  var state = { cat: catSel.value || Object.keys(UNITS)[0], fromIdx: 0 };

  var block = catSel.closest(".block");
  Array.prototype.forEach.call(block.querySelectorAll(".u-tab"), function (t) {
    t.addEventListener("click", function () {
      Array.prototype.forEach.call(block.querySelectorAll(".u-tab"), function (x) { x.classList.remove("on"); });
      Array.prototype.forEach.call(block.querySelectorAll(".u-pane"), function (x) { x.classList.remove("on"); });
      t.classList.add("on");
      block.querySelector('.u-pane[data-pane="' + t.getAttribute("data-pane") + '"]').classList.add("on");
    });
  });

  function fillFrom() {
    var us = UNITS[state.cat].u;
    fromSel.innerHTML = us.map(function (u, i) { return '<option value="' + i + '">' + esc(u[0]) + ' (' + esc(u[1]) + ')</option>'; }).join("");
    fromSel.value = state.fromIdx;
  }
  function toBase(spec, unit, v) { return spec.special ? unit[2](v) : v * unit[2]; }
  function fromBase(spec, unit, b) { return spec.special ? unit[3](b) : b / unit[2]; }
  function compute() {
    var spec = UNITS[state.cat];
    var from = spec.u[state.fromIdx];
    var v = parseFloat(valInput.value);
    if (isNaN(v)) v = 0;
    var base = toBase(spec, from, v);
    var q = (searchInput.value || "").toLowerCase();
    body.innerHTML = spec.u.filter(function (u) {
      return !q || u[0].toLowerCase().indexOf(q) >= 0 || u[1].toLowerCase().indexOf(q) >= 0;
    }).map(function (u) {
      var out = fromBase(spec, u, base);
      var cls = (u === from) ? ' class="from"' : '';
      return '<tr' + cls + '><td>' + esc(u[0]) + '</td><td class="u-sym">' + esc(u[1]) + '</td><td class="u-val">' + uFmt(out) + '</td></tr>';
    }).join("");
    note.textContent = spec.special
      ? "Base: " + spec.base + ". Temperature conversions account for scale offsets, not just ratios."
      : "Converting from " + from[0] + " (" + from[1] + "). Base unit " + spec.base + "; values use exact definitional factors.";
  }
  /* Quantity, source unit and value ride in the URL, so a converted value
     can be handed over exactly as it was set up. */
  function sync() { writeState('un', { c: state.cat, u: state.fromIdx || '', v: valInput.value }); }

  catSel.addEventListener("change", function () { state.cat = catSel.value; state.fromIdx = 0; fillFrom(); compute(); sync(); });
  fromSel.addEventListener("change", function () { state.fromIdx = +fromSel.value; compute(); sync(); });
  valInput.addEventListener("input", function () { compute(); sync(); });
  searchInput.addEventListener("input", compute);

  var saved = readState('un');
  if (saved.c && UNITS[saved.c]) { state.cat = saved.c; catSel.value = saved.c; }
  var si = parseInt(saved.u, 10);
  if (!isNaN(si) && UNITS[state.cat].u[si]) state.fromIdx = si;
  if (saved.v !== undefined) valInput.value = saved.v;
  fillFrom(); compute();
}
