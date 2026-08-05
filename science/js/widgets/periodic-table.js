import { CATS, CATDESC, ELEMENTS, REL, ANOMALOUS_CONFIG } from '../data/elements.js';
import { readState, writeState } from '../share.js';

function sup(n) { var m = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹" }; return String(n).split("").map(function (d) { return m[d] || d; }).join(""); }

var NOBLES = [[86, "Rn"], [54, "Xe"], [36, "Kr"], [18, "Ar"], [10, "Ne"], [2, "He"]];

function coreFor(z) {
  for (var i = 0; i < NOBLES.length; i++) if (NOBLES[i][0] < z) return NOBLES[i];
  return null;
}

/* A configuration is written in order of increasing n, then increasing l —
   so chromium reads [Ar] 3d5 4s1, not the 4s-before-3d order it was filled
   in. Filling order and writing order genuinely differ, and the written form
   is what a student is asked to reproduce. */
var LSEQ = { s: 0, p: 1, d: 2, f: 3 };
function byShell(a, b) {
  var na = parseInt(a[0], 10), nb = parseInt(b[0], 10);
  return na - nb || LSEQ[a[0].charAt(1)] - LSEQ[b[0].charAt(1)];
}

/* Orbitals occupied beyond the noble-gas core, before any anomaly override. */
function aufbau(z, coreZ) {
  var order = [["1s",2],["2s",2],["2p",6],["3s",2],["3p",6],["4s",2],["3d",10],["4p",6],["5s",2],["4d",10],["5p",6],["6s",2],["4f",14],["5d",10],["6p",6],["7s",2],["5f",14],["6d",10],["7p",6]];
  var rem = z, cum = 0, parts = [];
  for (var j = 0; j < order.length && rem > 0; j++) {
    var cap = order[j][1], start = cum, put = Math.min(cap, rem);
    rem -= put; cum += put;
    if (start >= coreZ) parts.push([order[j][0], put]);
  }
  return parts;
}

function electronConfig(z) {
  var core = coreFor(z);
  var coreZ = core ? core[0] : 0;
  var orbitals = ANOMALOUS_CONFIG[z] || aufbau(z, coreZ);
  var written = orbitals.slice().sort(byShell)
    .map(function (o) { return o[0] + sup(o[1]); }).join(" ");
  return (core ? "[" + core[1] + "] " : "") + written;
}

/* Every listed anomaly must still account for exactly Z electrons; a typo in
   that table would otherwise show a plausible-looking but impossible atom. */
Object.keys(ANOMALOUS_CONFIG).forEach(function (z) {
  var core = coreFor(+z);
  var total = (core ? core[0] : 0) +
    ANOMALOUS_CONFIG[z].reduce(function (a, o) { return a + o[1]; }, 0);
  if (total !== +z) {
    console.error('ANOMALOUS_CONFIG for Z=' + z + ' sums to ' + total + ' electrons, not ' + z);
  }
});
function gridPos(el) {
  if (el.c === "lanthanide") return { x: 3 + (el.z - 57), y: 8 };
  if (el.c === "actinide") return { x: 3 + (el.z - 89), y: 9 };
  return { x: el.g, y: el.p };
}

export function block() {
  return '<section class="block"><div class="block-head"><h2>Interactive Periodic Table</h2><span class="tag">Instrument</span>' +
    '<p>Click any element for its detail card. Search by name, symbol, or atomic number; tap a category in the legend to filter.</p></div>' +
    '<div class="pt-controls"><input class="pt-search" id="ptSearch" type="text" placeholder="Search name, symbol, or number…" autocomplete="off" spellcheck="false">' +
    '<button class="pt-clear" id="ptClear" type="button">Clear</button><span class="pt-count" id="ptCount"></span></div>' +
    '<div class="pt-legend" id="ptLegend"></div>' +
    '<div class="pt-wrap"><div class="pt-scroll"><div class="pt-grid" id="ptGrid"></div></div><div class="pt-detail" id="ptDetail"></div></div></section>';
}

export function init() {
  var grid = document.getElementById("ptGrid");
  var legend = document.getElementById("ptLegend");
  var detail = document.getElementById("ptDetail");
  var search = document.getElementById("ptSearch");
  var clearBtn = document.getElementById("ptClear");
  var count = document.getElementById("ptCount");
  if (!grid || !detail) return;
  var byZ = {}, tileByZ = {}, activeCat = null;
  var saved = readState('pt');
  var selectedZ = 6;
  function sync() {
    writeState('pt', { z: selectedZ === 6 ? '' : selectedZ, q: search.value.trim(), cat: activeCat || '' });
  }

  // legend
  Object.keys(CATS).forEach(function (code) {
    var c = CATS[code];
    var b = document.createElement("button");
    b.className = "pt-leg"; b.type = "button"; b.setAttribute("data-cat", code);
    b.innerHTML = '<span class="sw" style="background:' + c.color + '"></span>' + c.label;
    b.addEventListener("click", function () {
      activeCat = (activeCat === code) ? null : code;
      sync();
      Array.prototype.forEach.call(legend.children, function (ch) {
        ch.classList.toggle("off", activeCat && ch.getAttribute("data-cat") !== activeCat);
      });
      applyFilter();
    });
    legend.appendChild(b);
  });

  // grid cells
  ELEMENTS.forEach(function (el) {
    byZ[el.z] = el;
    var pos = gridPos(el);
    var t = document.createElement("button");
    t.className = "pt-cell"; t.type = "button";
    t.style.gridColumn = pos.x; t.style.gridRow = pos.y;
    t.style.setProperty("--cat", CATS[el.c].color);
    t.innerHTML = '<span class="z">' + el.z + '</span><span class="sym">' + el.s + '</span><span class="nm">' + el.n + '</span>';
    t.addEventListener("click", function () { selectEl(el.z); });
    grid.appendChild(t);
    tileByZ[el.z] = t;
  });
  // f-block markers in the main table
  [[6, "57–71"], [7, "89–103"]].forEach(function (mk) {
    var d = document.createElement("div");
    d.className = "pt-marker"; d.style.gridColumn = 3; d.style.gridRow = mk[0]; d.textContent = mk[1];
    grid.appendChild(d);
  });

  function selectEl(z) {
    var el = byZ[z]; if (!el) return;
    selectedZ = z;
    var cat = CATS[el.c];
    detail.style.setProperty("--cat", cat.color);
    var r = REL[z] || {};
    var ox = r.ox || "—";
    var grp = (el.g != null) ? el.g : (el.c === "lanthanide" ? "Lanthanide" : (el.c === "actinide" ? "Actinide" : "—"));
    var desc = r.desc || (cat.label + " — " + (CATDESC[el.c] || ""));
    var rel = "";
    if (r.bio) rel += '<div class="d-rel"><b>Biology:</b> ' + r.bio + '</div>';
    if (r.lab) rel += '<div class="d-rel"><b>Lab:</b> ' + r.lab + '</div>';
    if (r.phys) rel += '<div class="d-rel"><b>Physics:</b> ' + r.phys + '</div>';
    detail.innerHTML =
      '<div class="d-top"><span class="d-sym">' + el.s + '</span><span class="d-z">Z ' + el.z + '</span></div>' +
      '<div class="d-name">' + el.n + '</div><div class="d-cat">' + cat.label + '</div>' +
      '<dl>' +
      '<dt>Atomic mass</dt><dd>' + el.m + '</dd>' +
      '<dt>Group</dt><dd>' + grp + '</dd>' +
      '<dt>Period</dt><dd>' + el.p + '</dd>' +
      '<dt>Config</dt><dd>' + electronConfig(el.z) + '</dd>' +
      '<dt>Oxidation</dt><dd>' + ox + '</dd>' +
      '</dl>' +
      '<div class="d-desc">' + desc + '</div>' + rel +
      '<div class="d-rel" style="margin-top:0.6rem;opacity:0.8;">↳ Explore in the Chemistry, Biochemistry, and Physics rooms below.</div>';
    Object.keys(tileByZ).forEach(function (k) { tileByZ[k].classList.remove("sel"); });
    tileByZ[z].classList.add("sel");
    sync();
  }

  function applyFilter() {
    var q = (search.value || "").trim().toLowerCase();
    var isNum = /^[0-9]+$/.test(q), shown = 0;
    ELEMENTS.forEach(function (el) {
      var okCat = !activeCat || el.c === activeCat;
      var okQ = !q || (isNum ? (String(el.z) === q) : (el.n.toLowerCase().indexOf(q) >= 0 || el.s.toLowerCase().indexOf(q) >= 0));
      var vis = okCat && okQ;
      tileByZ[el.z].classList.toggle("dim", !vis);
      if (vis) shown++;
    });
    count.textContent = shown + " of " + ELEMENTS.length + " shown";
  }

  search.addEventListener("input", function () {
    applyFilter();
    sync();
    var q = search.value.trim().toLowerCase();
    if (!q) return;
    var matches = ELEMENTS.filter(function (el) {
      return /^[0-9]+$/.test(q) ? String(el.z) === q : (el.n.toLowerCase().indexOf(q) >= 0 || el.s.toLowerCase() === q);
    });
    if (matches.length === 1) selectEl(matches[0].z);
  });
  search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var q = search.value.trim().toLowerCase();
      var m = ELEMENTS.filter(function (el) { return el.n.toLowerCase().indexOf(q) >= 0 || el.s.toLowerCase() === q || String(el.z) === q; });
      if (m.length) selectEl(m[0].z);
    }
  });
  clearBtn.addEventListener("click", function () {
    search.value = ""; activeCat = null;
    Array.prototype.forEach.call(legend.children, function (ch) { ch.classList.remove("off"); });
    applyFilter(); search.focus();
  });

  /* A shared link can preselect an element, a search and a category. */
  if (saved.q) search.value = saved.q;
  if (saved.cat && CATS[saved.cat]) {
    activeCat = saved.cat;
    Array.prototype.forEach.call(legend.children, function (ch) {
      ch.classList.toggle("off", ch.getAttribute("data-cat") !== activeCat);
    });
  }
  applyFilter();
  var startZ = parseInt(saved.z, 10);
  selectEl(byZ[startZ] ? startZ : 6);  // default: carbon, the centre of organic life
}
