/* Titration curves — plot, key points, and indicator choice.

   Three views, because a curve and a table answer different questions and a
   tutor wants to switch between them mid-explanation: Curve, Both (default),
   and Table. Table is also the chart's accessible twin — every value on the
   plot is reachable there, so nothing is gated behind hover.

   Chart conventions: one series, so no legend box — the heading names it.
   2px line, round caps. Markers r=5 with a 2px surface ring. Hairline solid
   gridlines. Only the equivalence and half-equivalence points are directly
   labelled; the axis and the crosshair carry everything else. */

import { curve, keyPoints, equivalenceVolume, pHat } from '../chem/titration.js';
import { KA, KB, INDICATORS } from '../data/chem-tables.js';
import { esc } from '../format.js';
import { readState, writeState } from '../share.js';
import { widgetCSS } from '../widget-css.js';

widgetCSS('instrument');
widgetCSS('titration');

/* Curve colour: the room accent snapped into the dark-mode lightness band
   (the raw accent sits at L 0.683, just above the 0.67 ceiling). Validated
   against the panel surface #28384c — passes lightness, chroma and contrast. */
const SERIES = '#da6828';

/* Chart geometry. SVG text scales with the viewBox, so a landscape chart
   squeezed onto a phone renders its labels at about 5px — legible nowhere.
   On a narrow screen the chart turns portrait instead, which keeps the scale
   factor near 1 and gives the curve room to breathe vertically. */
const WIDE   = { W: 720, H: 380, L: 52, R: 14, T: 16, B: 38 };
const NARROW = { W: 380, H: 440, L: 44, R: 12, T: 14, B: 46 };
function geom() {
  const g = (typeof window !== 'undefined' && window.innerWidth < 640) ? NARROW : WIDE;
  return Object.assign({ PW: g.W - g.L - g.R, PH: g.H - g.T - g.B, narrow: g === NARROW }, g);
}

function n(x, d) { return (Math.round(x * Math.pow(10, d == null ? 2 : d)) / Math.pow(10, d == null ? 2 : d)).toFixed(d == null ? 2 : d); }
function sub(f) { return esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }

const SYSTEMS = {
  strong:   { label: 'Strong acid + strong base', flask: 'strong acid', burette: 'strong base' },
  weak:     { label: 'Weak acid + strong base',   flask: 'weak acid',   burette: 'strong base' },
  weakbase: { label: 'Weak base + strong acid',   flask: 'weak base',   burette: 'strong acid' }
};

export function block() {
  const kaOpts = KA.filter(function (a) { return a.pka >= 2 && a.pka <= 11; })
    .map(function (a) { return '<option value="' + a.ka + '">' + esc(a.n) + ' — pKa ' + a.pka.toFixed(2) + '</option>'; }).join('');
  const kbOpts = KB.map(function (b) {
    return '<option value="' + b.kb + '">' + esc(b.n) + ' — pKb ' + b.pkb.toFixed(2) + '</option>';
  }).join('');

  return '<section class="block ti" id="titration">' +
    '<div class="block-head"><h2>Titration Curves</h2><span class="tag">Instrument</span>' +
    '<p>pH against volume of titrant, with the equivalence point, the buffer region ' +
    'and a suitable indicator. Switch between the curve, the numbers, or both.</p></div>' +

    '<div class="st-row">' +
      '<label class="tc-lab">System</label>' +
      '<select class="u-select" id="tiSys" style="flex:0 0 17rem">' +
        Object.keys(SYSTEMS).map(function (k) {
          return '<option value="' + k + '">' + esc(SYSTEMS[k].label) + '</option>';
        }).join('') +
      '</select>' +
    '</div>' +

    '<div class="ti-inputs">' +
      '<div class="st-row"><label class="tc-lab">In the flask — conc.</label>' +
        '<input class="u-input" id="tiCa" type="number" step="any" value="0.1"><span class="tc-unit">M</span></div>' +
      '<div class="st-row"><label class="tc-lab">In the flask — volume</label>' +
        '<input class="u-input" id="tiVa" type="number" step="any" value="25"><span class="tc-unit">mL</span></div>' +
      '<div class="st-row"><label class="tc-lab">In the burette — conc.</label>' +
        '<input class="u-input" id="tiCb" type="number" step="any" value="0.1"><span class="tc-unit">M</span></div>' +
      '<div class="st-row ti-weak" id="tiKaRow"><label class="tc-lab">Weak acid K<sub>a</sub></label>' +
        '<input class="u-input" id="tiKa" type="number" step="any" value="1.8e-5">' +
        '<select class="u-select" id="tiKaPick" style="flex:0 0 15rem"><option value="">pick a common acid…</option>' + kaOpts + '</select></div>' +
      '<div class="st-row ti-weak" id="tiKbRow"><label class="tc-lab">Weak base K<sub>b</sub></label>' +
        '<input class="u-input" id="tiKb" type="number" step="any" value="1.8e-5">' +
        '<select class="u-select" id="tiKbPick" style="flex:0 0 15rem"><option value="">pick a common base…</option>' + kbOpts + '</select></div>' +
    '</div>' +

    '<div class="ti-views" role="group" aria-label="View">' +
      '<button class="u-tab" type="button" data-view="curve">Curve</button>' +
      '<button class="u-tab on" type="button" data-view="both">Both</button>' +
      '<button class="u-tab" type="button" data-view="table">Table</button>' +
    '</div>' +

    '<div class="ti-out" id="tiOut"></div>' +
    '</section>';
}

export function init() {
  const root = document.getElementById('titration');
  if (!root) return;
  const g = function (id) { return document.getElementById(id); };
  const out = g('tiOut');
  let view = 'both';

  /* Mirror the setup — including which view is open — into the URL. */
  function sync() {
    writeState('ti', {
      s: g('tiSys').value,
      ca: g('tiCa').value, va: g('tiVa').value, cb: g('tiCb').value,
      ka: g('tiKa').value, kb: g('tiKb').value,
      v: view === 'both' ? '' : view
    });
  }

  root.querySelectorAll('.ti-views .u-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.ti-views .u-tab').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      view = b.getAttribute('data-view');
      render(); sync();
    });
  });

  g('tiKaPick').addEventListener('change', function () {
    if (this.value) { g('tiKa').value = this.value; this.value = ''; render(); sync(); }
  });
  g('tiKbPick').addEventListener('change', function () {
    if (this.value) { g('tiKb').value = this.value; this.value = ''; render(); sync(); }
  });
  ['tiSys', 'tiCa', 'tiVa', 'tiCb', 'tiKa', 'tiKb'].forEach(function (id) {
    g(id).addEventListener('input', function () { render(); sync(); });
    g(id).addEventListener('change', function () { render(); sync(); });
  });

  /* Restore a shared setup before the first render. */
  const saved = readState('ti');
  if (saved.s && ['strong', 'weak', 'weakbase'].indexOf(saved.s) >= 0) g('tiSys').value = saved.s;
  ['ca:tiCa', 'va:tiVa', 'cb:tiCb', 'ka:tiKa', 'kb:tiKb'].forEach(function (pair) {
    const p = pair.split(':');
    if (saved[p[0]] !== undefined && saved[p[0]] !== '') g(p[1]).value = saved[p[0]];
  });
  if (saved.v === 'curve' || saved.v === 'table') {
    view = saved.v;
    root.querySelectorAll('.ti-views .u-tab').forEach(function (x) {
      x.classList.toggle('on', x.getAttribute('data-view') === view);
    });
  }

  function readParams() {
    const sys = g('tiSys').value;
    g('tiKaRow').style.display = sys === 'weak' ? '' : 'none';
    g('tiKbRow').style.display = sys === 'weakbase' ? '' : 'none';

    const Ca = parseFloat(g('tiCa').value);
    const VaMl = parseFloat(g('tiVa').value);
    const Cb = parseFloat(g('tiCb').value);
    const Ka = parseFloat(g('tiKa').value);
    const Kb = parseFloat(g('tiKb').value);
    if (!(Ca > 0) || !(VaMl > 0) || !(Cb > 0)) return null;
    if (sys === 'weak' && !(Ka > 0 && Ka < 1)) return null;
    if (sys === 'weakbase' && !(Kb > 0 && Kb < 1)) return null;
    return { sys: sys, p: { Ca: Ca, Va: VaMl / 1000, Cb: Cb, Ka: Ka, Kb: Kb } };
  }

  function render() {
    const cfg = readParams();
    if (!cfg) {
      out.innerHTML = '<div class="st-hint">Enter positive concentrations and a volume ' +
        '(and a K between 0 and 1 for a weak acid or base).</div>';
      return;
    }
    const sys = cfg.sys, p = cfg.p;
    const pts = curve(sys, p);
    const keys = keyPoints(sys, p);
    const Veq = equivalenceVolume(p.Ca, p.Va, p.Cb) * 1000;   /* mL */
    const eqPH = keys.find(function (r) { return r.k === 'eq'; }).pH;

    let h = '';
    if (view !== 'table') h += chart(sys, p, pts, keys, Veq);
    if (view !== 'curve') h += table(keys, Veq);
    h += steps(sys, p, keys, Veq);
    h += indicators(eqPH);
    out.innerHTML = h;
    if (view !== 'table') wireHover(pts, Veq);
  }

  /* ── the plot ──────────────────────────────────────────────── */
  let G = geom();
  function x(V, Vmax) { return G.L + (V / Vmax) * G.PW; }
  function y(pH) { return G.T + (1 - pH / 14) * G.PH; }

  function chart(sys, p, pts, keys, Veq) {
    const Vmax = 2 * Veq;
    const L = G.L, T = G.T, PW = G.PW, PH = G.PH, W = G.W, H = G.H;
    const path = pts.map(function (pt, i) {
      return (i ? 'L' : 'M') + n(x(pt.V * 1000, Vmax), 1) + ' ' + n(y(pt.pH), 1);
    }).join(' ');

    /* gridlines: hairline, solid, one step off the surface */
    let grid = '';
    for (let ph = 0; ph <= 14; ph += 2) {
      grid += '<line class="ti-grid" x1="' + L + '" y1="' + n(y(ph), 1) + '" x2="' + (L + PW) + '" y2="' + n(y(ph), 1) + '"/>' +
        '<text class="ti-tick" x="' + (L - 8) + '" y="' + n(y(ph) + 4, 1) + '" text-anchor="end">' + ph + '</text>';
    }
    const vStep = niceStep(Vmax);
    for (let v = 0; v <= Vmax + 1e-9; v += vStep) {
      grid += '<line class="ti-grid" x1="' + n(x(v, Vmax), 1) + '" y1="' + T + '" x2="' + n(x(v, Vmax), 1) + '" y2="' + (T + PH) + '"/>' +
        '<text class="ti-tick" x="' + n(x(v, Vmax), 1) + '" y="' + (T + PH + 18) + '" text-anchor="middle">' + trimNum(v) + '</text>';
    }

    /* buffer region wash — only meaningful for a weak system */
    let wash = '';
    if (sys !== 'strong') {
      const a = x(Veq * 0.1, Vmax), b = x(Veq * 0.9, Vmax);
      wash = '<rect class="ti-wash" x="' + n(a, 1) + '" y="' + T + '" width="' + n(b - a, 1) + '" height="' + PH + '"/>' +
        '<text class="ti-note" x="' + n((a + b) / 2, 1) + '" y="' + (T + 14) + '" text-anchor="middle">buffer region</text>';
    }

    /* equivalence guide lines, then the markers */
    const eq = keys.find(function (r) { return r.k === 'eq'; });
    const half = keys.find(function (r) { return r.k === 'half'; });
    let guides = '<line class="ti-guide" x1="' + n(x(Veq, Vmax), 1) + '" y1="' + T + '" x2="' + n(x(Veq, Vmax), 1) + '" y2="' + (T + PH) + '"/>';

    let marks = '';
    function marker(V, pH, label, anchor, dy) {
      const cx = x(V, Vmax), cy = y(pH);
      return '<circle class="ti-ring" cx="' + n(cx, 1) + '" cy="' + n(cy, 1) + '" r="7"/>' +
        '<circle class="ti-dot" cx="' + n(cx, 1) + '" cy="' + n(cy, 1) + '" r="5"/>' +
        '<text class="ti-label" x="' + n(cx + (anchor === 'end' ? -10 : 10), 1) + '" y="' + n(cy + dy, 1) +
        '" text-anchor="' + anchor + '">' + esc(label) + '</text>';
    }
    /* The curve rises to the right of the half-equivalence dot, so the label
       goes below-left into the open area under the buffer plateau. */
    if (half) marks += marker(half.V * 1000, half.pH, 'half-eq · pH ' + n(half.pH), 'end', 24);
    marks += marker(Veq, eq.pH, 'equivalence · pH ' + n(eq.pH), Veq > 0.62 * Vmax ? 'end' : 'start', 22);

    return '<figure class="ti-figure">' +
      '<svg class="ti-svg' + (G.narrow ? ' narrow' : '') + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
        'aria-label="Titration curve: pH against volume of titrant added. Equivalence at ' +
        trimNum(Veq) + ' millilitres, pH ' + n(eq.pH) + '.">' +
      wash + grid + guides +
      '<path class="ti-curve" d="' + path + '"/>' +
      marks +
      '<text class="ti-axis" x="' + (L + PW / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Titrant added (mL)</text>' +
      '<text class="ti-axis" transform="translate(13,' + (T + PH / 2) + ') rotate(-90)" text-anchor="middle">pH</text>' +
      '<rect id="tiHit" x="' + L + '" y="' + T + '" width="' + PW + '" height="' + PH + '" fill="transparent"/>' +
      '<g id="tiCross" style="display:none">' +
        '<line class="ti-cross" y1="' + T + '" y2="' + (T + PH) + '"/>' +
        '<circle class="ti-ring" r="7"/><circle class="ti-dot" r="5"/>' +
      '</g></svg>' +
      '<figcaption class="ti-cap" id="tiCap">Hover the plot to read any point. ' +
      'Every value is also in the table view.</figcaption>' +
      '</figure>';
  }

  function wireHover(pts, Veq) {
    const svg = root.querySelector('.ti-svg');
    const hit = document.getElementById('tiHit');
    const cross = document.getElementById('tiCross');
    const cap = document.getElementById('tiCap');
    if (!svg || !hit) return;
    const Vmax = 2 * Veq;
    const VBW = G.W, PADL = G.L, PLOTW = G.PW;
    const line = cross.querySelector('line');
    const ring = cross.querySelector('.ti-ring');
    const dot = cross.querySelector('.ti-dot');

    function move(ev) {
      const r = svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width * VBW;
      const V = Math.max(0, Math.min(Vmax, (px - PADL) / PLOTW * Vmax));
      /* nearest sampled point, so the readout is a real computed value */
      let best = pts[0], bd = Infinity;
      pts.forEach(function (pt) {
        const d = Math.abs(pt.V * 1000 - V);
        if (d < bd) { bd = d; best = pt; }
      });
      const cx = x(best.V * 1000, Vmax), cy = y(best.pH);
      line.setAttribute('x1', cx); line.setAttribute('x2', cx);
      ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
      cross.style.display = '';
      cap.innerHTML = '<b>' + trimNum(best.V * 1000) + ' mL</b> added · pH <b>' + n(best.pH) + '</b>';
    }
    hit.addEventListener('mousemove', move);
    hit.addEventListener('mouseleave', function () {
      cross.style.display = 'none';
      cap.textContent = 'Hover the plot to read any point. Every value is also in the table view.';
    });
  }

  /* ── the table view (the chart's accessible twin) ──────────── */
  function table(keys, Veq) {
    return '<table class="rt-table ti-table"><thead><tr>' +
      '<th>Stage</th><th style="text-align:right">Titrant added</th>' +
      '<th style="text-align:right">pH</th><th>Why</th></tr></thead><tbody>' +
      keys.map(function (r) {
        return '<tr><td>' + esc(r.label) + '</td>' +
          '<td class="rt-val">' + trimNum(r.V * 1000) + ' mL</td>' +
          '<td class="rt-val">' + n(r.pH) + '</td>' +
          '<td class="rt-note">' + esc(r.note) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  /* ── the working ───────────────────────────────────────────── */
  function steps(sys, p, keys, Veq) {
    const start = keys.find(function (r) { return r.k === 'start'; });
    const half = keys.find(function (r) { return r.k === 'half'; });
    const eq = keys.find(function (r) { return r.k === 'eq'; });

    let h = '<div class="st-step"><div class="st-h">Equivalence volume</div><ul>' +
      '<li>moles in the flask = ' + n(p.Ca, 4) + ' M × ' + trimNum(p.Va * 1000) + ' mL = <b>' +
      n(p.Ca * p.Va * 1000, 4) + ' mmol</b></li>' +
      '<li>V(eq) = moles ÷ titrant conc. = <b class="st-ans">' + trimNum(Veq) + ' mL</b></li></ul></div>';

    h += '<div class="st-step"><div class="st-h">Starting pH</div><ul><li>' +
      (sys === 'strong' ? 'strong acid ionises fully, so [H⁺] = ' + n(p.Ca, 4) + ' M'
       : sys === 'weak' ? 'weak acid — solve x² + K<sub>a</sub>x − K<sub>a</sub>C = 0'
                        : 'weak base — solve for [OH⁻], then pH = 14 − pOH') +
      ' → pH = <b class="st-ans">' + n(start.pH) + '</b></li></ul></div>';

    if (half) {
      h += '<div class="st-step"><div class="st-h">Half-equivalence — the useful one</div><ul>' +
        '<li>At ' + trimNum(Veq / 2) + ' mL, half is converted, so the two forms are equal.</li>' +
        '<li>' + (sys === 'weak'
          ? 'pH = pK<sub>a</sub> + log(1) = <b class="st-ans">pK<sub>a</sub> = ' + n(half.pH) + '</b>'
          : 'pOH = pK<sub>b</sub>, so pH = <b class="st-ans">' + n(half.pH) + '</b>') +
        '</li><li>This is how a pK is measured off a curve — and the point of best buffering.</li></ul></div>';
    }

    h += '<div class="st-step"><div class="st-h">At equivalence</div><ul><li>' +
      (sys === 'strong' ? 'Neither ion of the salt reacts with water, so pH = <b class="st-ans">7.00</b>'
       : sys === 'weak' ? 'Only the conjugate base is left; it takes H⁺ from water, so pH = <b class="st-ans">' + n(eq.pH) + '</b> &gt; 7'
                        : 'Only the conjugate acid is left; it gives H⁺ to water, so pH = <b class="st-ans">' + n(eq.pH) + '</b> &lt; 7') +
      '</li><li>Equivalence means stoichiometrically equal — <b>not</b> pH 7, except for strong + strong.</li></ul></div>';
    return h;
  }

  function indicators(eqPH) {
    const fits = INDICATORS.filter(function (i) { return eqPH >= i.lo && eqPH <= i.hi; });
    const near = INDICATORS.filter(function (i) { return fits.indexOf(i) < 0 && Math.abs((i.lo + i.hi) / 2 - eqPH) <= 2.5; });
    return '<div class="st-step"><div class="st-h">Choosing an indicator</div>' +
      (fits.length
        ? '<ul>' + fits.map(function (i) {
            return '<li><b>' + esc(i.n) + '</b> — changes over pH ' + i.lo + '–' + i.hi +
              ' (' + esc(i.change) + '), which straddles the equivalence pH of ' + n(eqPH) + '.</li>';
          }).join('') + '</ul>'
        : '<p>No listed indicator brackets pH ' + n(eqPH) + ' exactly.' +
          (near.length ? ' Closest: ' + near.map(function (i) { return esc(i.n) + ' (' + i.lo + '–' + i.hi + ')'; }).join(', ') + '.' : '') +
          '</p>') +
      '<p class="tc-check">Pick an indicator whose range falls on the steep part of the curve — ' +
      'that is what makes the colour change sharp.</p></div>';
  }

  /* Rotating a phone crosses the narrow/wide boundary; re-render when it
     actually changes rather than on every resize tick. */
  let rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      const next = geom();
      if (next.narrow !== G.narrow) { G = next; render(); }
    }, 200);
  });

  render();
}

function niceStep(vmax) {
  const raw = vmax / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}
function trimNum(v) {
  const r = Math.round(v * 100) / 100;
  return String(r);
}
