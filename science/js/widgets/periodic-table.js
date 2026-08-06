import { CATS, CATDESC, ELEMENTS, REL, ANOMALOUS_CONFIG } from '../data/elements.js';
import { readState, writeState } from '../share.js';
import { widgetCSS } from '../widget-css.js';

widgetCSS('periodic-table');

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

/* A relative atomic mass in brackets — "[98]" for technetium — means the
   element has no stable isotope and the figure is the longest-lived one. It
   is still a number for the purpose of shading the table. */
function massOf(el) {
  var v = typeof el.m === "number" ? el.m : parseFloat(String(el.m).replace(/[\[\]]/g, ""));
  return isFinite(v) ? v : null;
}

/* The trends a student is asked to explain. Each knows how to pull its value
   off an element and how to write it, so the tile title, the ramp ends and
   the detail row all read the same way. */
var TRENDS = {
  en:  { label: "Electronegativity", unit: "", source: "Pauling scale",
         get: function (el) { return el.en; }, fmt: function (v) { return v.toFixed(2); } },
  rad: { label: "Atomic radius", unit: " pm", source: "covalent radius, Cordero 2008",
         get: function (el) { return el.rad; }, fmt: function (v) { return String(v); } },
  ie:  { label: "Ionisation energy", unit: " kJ/mol", source: "first ionisation, NIST",
         get: function (el) { return el.ie; }, fmt: function (v) { return v.toFixed(0); } },
  mass:{ label: "Atomic mass", unit: "", source: "relative atomic mass",
         get: massOf, fmt: function (v) { return v.toFixed(v < 10 ? 3 : 1); } }
};
var TREND_ORDER = ["en", "rad", "ie", "mass"];

/* The ramp is built from the room's own accent so the table stays in the
   palette it already wears, and it is computed in JS rather than handed to
   color-mix because the tile also needs to know whether to put light or dark
   text on top of each step. */
var RAMP_LOW = [26, 35, 51];
function accentRGB() {
  var v = getComputedStyle(document.documentElement).getPropertyValue("--c").trim();
  var m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) { var n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  var t = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (t) { var q = t[1].split(",").map(Number); if (q.length >= 3) return [q[0], q[1], q[2]]; }
  return [212, 162, 76];
}
/* The low end starts a fifth of the way up rather than at the background
   colour, so "smallest value" still reads as a shaded tile and not a hole. */
function shade(f, acc) {
  var k = 0.18 + 0.82 * f;
  return [0, 1, 2].map(function (i) { return Math.round(RAMP_LOW[i] + (acc[i] - RAMP_LOW[i]) * k); });
}
function rgbStr(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }
function inkOn(c) {
  var l = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  return l > 0.55 ? "#12181f" : "#e8ecf1";
}

export function block() {
  return '<section class="block"><div class="block-head"><h2 id="ptHeading">Interactive Periodic Table</h2><span class="tag">Instrument</span>' +
    '<p>Click any element for its detail card. Search by name, symbol, or atomic number; tap a category in the legend to filter. Shade the whole table by a periodic property to see a trend at once.</p></div>' +
    '<div class="pt-controls"><input class="pt-search" id="ptSearch" type="text" placeholder="Search name, symbol, or number…" autocomplete="off" spellcheck="false">' +
    '<button class="pt-clear" id="ptClear" type="button">Clear</button>' +
    '<span class="pt-count" id="ptCount" role="status" aria-live="polite"></span></div>' +
    '<div class="pt-trends" id="ptTrends" role="group" aria-label="Shade the table by a property"></div>' +
    '<div class="pt-ramp" id="ptRamp" hidden></div>' +
    '<div class="pt-legend" id="ptLegend"></div>' +
    '<p class="pt-hint">Arrow keys move between elements, Enter opens the detail card.</p>' +
    '<div class="pt-wrap" role="group" aria-labelledby="ptHeading">' +
    /* No role="grid" here: the tiles are laid out by CSS grid but there are
       no row elements, and claiming a grid role without them describes a
       structure that is not there. The tiles are named buttons instead. */
    '<div class="pt-scroll"><div class="pt-grid" id="ptGrid"></div></div>' +
    '<div class="pt-detail" id="ptDetail" role="region" aria-label="Element detail"></div></div></section>';
}

export function init() {
  var grid = document.getElementById("ptGrid");
  var legend = document.getElementById("ptLegend");
  var trendBar = document.getElementById("ptTrends");
  var ramp = document.getElementById("ptRamp");
  var detail = document.getElementById("ptDetail");
  var search = document.getElementById("ptSearch");
  var clearBtn = document.getElementById("ptClear");
  var count = document.getElementById("ptCount");
  if (!grid || !detail) return;
  var byZ = {}, tileByZ = {}, atPos = {}, activeCat = null, trend = "";
  var saved = readState('pt');
  var selectedZ = 6;
  function sync() {
    writeState('pt', { z: selectedZ === 6 ? '' : selectedZ, q: search.value.trim(),
                       cat: activeCat || '', t: trend || '' });
  }

  // legend
  Object.keys(CATS).forEach(function (code) {
    var c = CATS[code];
    var b = document.createElement("button");
    b.className = "pt-leg"; b.type = "button"; b.setAttribute("data-cat", code);
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<span class="sw" style="background:' + c.color + '"></span>' + c.label;
    b.addEventListener("click", function () {
      activeCat = (activeCat === code) ? null : code;
      sync();
      Array.prototype.forEach.call(legend.children, function (ch) {
        var on = activeCat && ch.getAttribute("data-cat") === activeCat;
        ch.classList.toggle("off", !!activeCat && !on);
        ch.setAttribute("aria-pressed", String(!!on));
      });
      applyFilter();
    });
    legend.appendChild(b);
  });

  // trend buttons — "Category" is the default colouring, not a trend
  [{ k: "", label: "Category" }].concat(TREND_ORDER.map(function (k) {
    return { k: k, label: TRENDS[k].label };
  })).forEach(function (t) {
    var b = document.createElement("button");
    b.className = "pt-trend"; b.type = "button"; b.setAttribute("data-trend", t.k);
    b.setAttribute("aria-pressed", "false");
    b.textContent = t.label;
    b.addEventListener("click", function () { setTrend(t.k); sync(); });
    trendBar.appendChild(b);
  });

  // grid cells
  ELEMENTS.forEach(function (el) {
    byZ[el.z] = el;
    var pos = gridPos(el);
    atPos[pos.x + "," + pos.y] = el.z;
    var t = document.createElement("button");
    t.className = "pt-cell"; t.type = "button"; t.tabIndex = -1;
    t.style.gridColumn = pos.x; t.style.gridRow = pos.y;
    t.style.setProperty("--cat", CATS[el.c].color);
    t.setAttribute("aria-label", el.n + ", " + el.s + ", atomic number " + el.z);
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

  /* ── Trend shading ──────────────────────────────────────────── */
  function setTrend(k) {
    trend = TRENDS[k] ? k : "";
    Array.prototype.forEach.call(trendBar.children, function (b) {
      var on = b.getAttribute("data-trend") === trend;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    applyTrend();
    if (byZ[selectedZ]) selectEl(selectedZ);
  }

  function applyTrend() {
    var t = TRENDS[trend];
    grid.classList.toggle("trend", !!t);
    if (!t) {
      ELEMENTS.forEach(function (el) {
        var tile = tileByZ[el.z];
        tile.classList.remove("nodata");
        tile.style.removeProperty("--sh");
        tile.style.removeProperty("--ink");
        tile.removeAttribute("title");
      });
      ramp.hidden = true;
      return;
    }
    var acc = accentRGB();
    var vals = [];
    ELEMENTS.forEach(function (el) { var v = t.get(el); if (v != null) vals.push(v); });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    ELEMENTS.forEach(function (el) {
      var tile = tileByZ[el.z], v = t.get(el);
      if (v == null) {
        tile.classList.add("nodata");
        tile.style.removeProperty("--sh");
        tile.style.removeProperty("--ink");
        tile.title = el.n + " — " + t.label.toLowerCase() + " not measured";
        return;
      }
      tile.classList.remove("nodata");
      var c = shade(hi === lo ? 1 : (v - lo) / (hi - lo), acc);
      tile.style.setProperty("--sh", rgbStr(c));
      tile.style.setProperty("--ink", inkOn(c));
      tile.title = el.n + " — " + t.label + " " + t.fmt(v) + t.unit;
    });
    var stops = [];
    for (var i = 0; i <= 8; i++) stops.push(rgbStr(shade(i / 8, acc)));
    ramp.innerHTML =
      '<span class="pt-ramp-end">' + t.fmt(lo) + t.unit + '</span>' +
      '<span class="pt-ramp-bar" style="background:linear-gradient(90deg,' + stops.join(",") + ')"></span>' +
      '<span class="pt-ramp-end">' + t.fmt(hi) + t.unit + '</span>' +
      '<span class="pt-ramp-note">' + t.label + ' (' + t.source + '). Unshaded = never measured.</span>';
    ramp.hidden = false;
  }

  /* ── Detail card ────────────────────────────────────────────── */
  var SUBJECTS = [
    { room: "chemistry", name: "Chemistry" },
    { room: "biochemistry", name: "Biochemistry" },
    { room: "physics", name: "Physics" }
  ];

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

    /* The property rows carry the trend the table is currently shaded by,
       marked, so the colour under the cursor has a number beside it. */
    var rows = "";
    TREND_ORDER.forEach(function (k) {
      if (k === "mass") return;                     /* mass has its own row */
      var v = TRENDS[k].get(el);
      rows += '<dt' + (trend === k ? ' class="on"' : '') + '>' + TRENDS[k].label + '</dt>' +
        '<dd' + (trend === k ? ' class="on"' : '') + '>' +
        (v == null ? "—" : TRENDS[k].fmt(v) + TRENDS[k].unit) + '</dd>';
    });

    detail.innerHTML =
      '<div class="d-top"><span class="d-sym">' + el.s + '</span><span class="d-z">Z ' + el.z + '</span></div>' +
      '<div class="d-name" id="ptDetailName" tabindex="-1">' + el.n + '</div><div class="d-cat">' + cat.label + '</div>' +
      '<dl>' +
      '<dt' + (trend === "mass" ? ' class="on"' : '') + '>Atomic mass</dt>' +
      '<dd' + (trend === "mass" ? ' class="on"' : '') + '>' + el.m + '</dd>' +
      '<dt>Group</dt><dd>' + grp + '</dd>' +
      '<dt>Period</dt><dd>' + el.p + '</dd>' +
      '<dt>Config</dt><dd>' + electronConfig(el.z) + '</dd>' +
      '<dt>Oxidation</dt><dd>' + ox + '</dd>' +
      rows +
      '</dl>' +
      '<div class="d-desc">' + desc + '</div>' + rel +
      '<div class="d-links"><span class="d-links-lead">Explore ' + el.s + ' in</span>' +
      SUBJECTS.map(function (s) {
        return '<a href="room.html?room=' + s.room + '">' + s.name + '</a>';
      }).join('') + '</div>';

    Object.keys(tileByZ).forEach(function (k) {
      tileByZ[k].classList.remove("sel");
      tileByZ[k].tabIndex = -1;
      tileByZ[k].removeAttribute("aria-current");
    });
    tileByZ[z].classList.add("sel");
    tileByZ[z].tabIndex = 0;               /* roving tabindex: one stop, not 118 */
    tileByZ[z].setAttribute("aria-current", "true");
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

  /* ── Keyboard: arrows walk the grid, Enter commits to the card ── */
  function step(z, dx, dy) {
    var p = gridPos(byZ[z]), x = p.x, y = p.y;
    for (var i = 0; i < 20; i++) {
      x += dx; y += dy;
      if (x < 1 || x > 18 || y < 1 || y > 9) return null;
      if (atPos[x + "," + y]) return atPos[x + "," + y];
    }
    return null;
  }
  var ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  grid.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      /* Default-prevented so the button's own click does not also fire —
         arrowing has already selected this element; Enter is the commit that
         hands focus to the card. */
      e.preventDefault();
      selectEl(selectedZ);
      var nm = document.getElementById("ptDetailName");
      if (nm) nm.focus();
      return;
    }
    var d = ARROWS[e.key];
    if (!d) return;
    e.preventDefault();
    var next = step(selectedZ, d[0], d[1]);
    if (next) { selectEl(next); tileByZ[next].focus(); }
  });

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
    Array.prototype.forEach.call(legend.children, function (ch) {
      ch.classList.remove("off"); ch.setAttribute("aria-pressed", "false");
    });
    applyFilter(); sync(); search.focus();
  });

  /* A shared link can preselect an element, a search, a category and a trend. */
  if (saved.q) search.value = saved.q;
  if (saved.cat && CATS[saved.cat]) {
    activeCat = saved.cat;
    Array.prototype.forEach.call(legend.children, function (ch) {
      var on = ch.getAttribute("data-cat") === activeCat;
      ch.classList.toggle("off", !on);
      ch.setAttribute("aria-pressed", String(on));
    });
  }
  applyFilter();
  setTrend(TRENDS[saved.t] ? saved.t : "");
  var startZ = parseInt(saved.z, 10);
  selectEl(byZ[startZ] ? startZ : 6);  // default: carbon, the centre of organic life
}
