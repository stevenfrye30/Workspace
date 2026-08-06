/* Thermochemistry: calorimetry, ΔH°rxn from formation enthalpies, Hess's law.

   Like the stoichiometry tool, the working is the product. Each tab lays out
   the substitution before the answer so it can be walked through out loud. */

import { parseEquation, balanceCheck } from '../chem/formula.js';
import { SPECIFIC_HEAT, lookupDHf, PHASE_WATER } from '../data/thermo.js';
import { esc } from '../format.js';
import { readState, writeState, readJSON, changedOnly, snapshot } from '../share.js';
import { widgetCSS } from '../widget-css.js';

widgetCSS('instrument');

function n(x, sig) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a < 1e-4 || a >= 1e7) return x.toExponential(3);
  return String(parseFloat(x.toPrecision(sig || 4)));
}
function sub(f) { return esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }
/* A formula plus its state label, e.g. H2O(l) -> H₂O(l) */
function species(term) {
  return sub(term.formula) + (term.state ? '<span class="tc-state">(' + term.state + ')</span>' : '');
}
function signed(x) { return (x >= 0 ? '+' : '−') + n(Math.abs(x)); }
/* Plain number, but with a typographic minus so it sits beside signed(). */
function num(x) { return n(x).replace('-', '−'); }

const HESS_EXAMPLE = [
  { eq: "C(s) + O2(g) -> CO2(g)", dh: "-393.5", mult: "1" },
  { eq: "CO(g) + 1/2 O2(g) -> CO2(g)", dh: "-283.0", mult: "-1" }
];

export function block() {
  const shOpts = SPECIFIC_HEAT.map(function (s, i) {
    return '<option value="' + s.c + '"' + (i === 0 ? ' selected' : '') + '>' +
      esc(s.n) + ' — ' + s.c + '</option>';
  }).join('');

  return '<section class="block tc" id="thermo">' +
    '<div class="block-head"><h2>Thermochemistry</h2><span class="tag">Instrument</span>' +
    '<p>Heat from a temperature change, reaction enthalpy from formation values, ' +
    'and Hess\'s law — each shown as worked steps.</p></div>' +

    '<div class="u-tabs" id="tcTabs">' +
      '<button class="u-tab on" type="button" data-pane="calor">q = mcΔT</button>' +
      '<button class="u-tab" type="button" data-pane="dhrxn">ΔH°rxn</button>' +
      '<button class="u-tab" type="button" data-pane="hess">Hess\'s law</button>' +
    '</div>' +

    /* ── Calorimetry ── */
    '<div class="tc-pane on" data-pane="calor">' +
      '<p class="tc-hint">Leave <b>exactly one</b> box empty and it solves for that one.</p>' +
      '<div class="st-row"><label class="tc-lab">Substance</label>' +
        '<select class="u-select" id="tcSub" style="flex:0 0 16rem">' + shOpts +
        '<option value="custom">Other (type c below)</option></select></div>' +
      '<div class="st-row"><label class="tc-lab">Mass m (g)</label>' +
        '<input class="u-input" id="tcM" type="number" step="any" value="100"></div>' +
      '<div class="st-row"><label class="tc-lab">Specific heat c</label>' +
        '<input class="u-input" id="tcC" type="number" step="any" value="4.184">' +
        '<span class="tc-unit">J/(g·°C)</span></div>' +
      '<div class="st-row"><label class="tc-lab">Initial T (°C)</label>' +
        '<input class="u-input" id="tcT1" type="number" step="any" value="25"></div>' +
      '<div class="st-row"><label class="tc-lab">Final T (°C)</label>' +
        '<input class="u-input" id="tcT2" type="number" step="any" value="75"></div>' +
      '<div class="st-row"><label class="tc-lab">Heat q (J)</label>' +
        '<input class="u-input" id="tcQ" type="number" step="any" placeholder="leave blank to solve"></div>' +
      '<div class="st-out" id="tcCalorOut"></div>' +
      '<div class="tc-phase" id="tcPhase"></div>' +
    '</div>' +

    /* ── ΔH°rxn from formation enthalpies ── */
    '<div class="tc-pane" data-pane="dhrxn">' +
      '<p class="tc-hint">ΔH°<sub>rxn</sub> = Σ n·ΔH°<sub>f</sub>(products) − Σ n·ΔH°<sub>f</sub>(reactants). ' +
      'Include states — H<sub>2</sub>O(l) and H<sub>2</sub>O(g) are not the same.</p>' +
      '<div class="st-row">' +
        '<input class="st-eq" id="tcEq" type="text" spellcheck="false" autocomplete="off" ' +
          'placeholder="e.g. CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)">' +
        '<select class="u-select" id="tcEqEx" style="flex:0 0 12rem">' +
          '<option value="">Load an example…</option>' +
          '<option value="CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)">Combustion of methane</option>' +
          '<option value="C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(l)">Combustion of propane</option>' +
          '<option value="CaCO3(s) -> CaO(s) + CO2(g)">Decomposition of limestone</option>' +
          '<option value="N2(g) + 3 H2(g) -> 2 NH3(g)">Haber process</option>' +
          '<option value="2 H2O2(l) -> 2 H2O(l) + O2(g)">Peroxide decomposition</option>' +
        '</select></div>' +
      '<div class="st-balance" id="tcEqBal"></div>' +
      '<div class="st-out" id="tcRxnOut"></div>' +
    '</div>' +

    /* ── Hess's law ── */
    '<div class="tc-pane" data-pane="hess">' +
      '<p class="tc-hint">Enter each known step with its ΔH, then a multiplier. ' +
      'Use <b>−1</b> to reverse a step (which flips the sign of its ΔH), ' +
      '<b>2</b> to double it, <b>0.5</b> to halve it.</p>' +
      '<div id="tcHessRows"></div>' +
      '<div class="st-row"><button class="rt-btn" id="tcHessAdd" type="button">+ Add step</button>' +
        '<button class="rt-btn" id="tcHessEx" type="button">Load example</button></div>' +
      '<div class="st-out" id="tcHessOut"></div>' +
    '</div>' +

    '</section>';
}

export function init() {
  const root = document.getElementById('thermo');
  if (!root) return;

  const tabs = root.querySelectorAll('#tcTabs .u-tab');
  const panes = root.querySelectorAll('.tc-pane');
  let pane = 'calor';
  function showPane(name) {
    pane = name;
    tabs.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-pane') === name); });
    panes.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === name); });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPane(t.getAttribute('data-pane')); sync(); });
  });

  /* Calorimetry and reaction fields mirrored to the URL; Hess rows ride
     along as JSON since they are a variable-length list. */
  const TC_FIELDS = ['tcSub', 'tcM', 'tcC', 'tcT1', 'tcT2', 'tcQ', 'tcEq'];
  const TC_DEFAULTS = snapshot(TC_FIELDS, function (id) { return document.getElementById(id); });
  const HESS_DEFAULT = JSON.stringify(HESS_EXAMPLE.map(function (r) { return [r.eq, r.dh, r.mult]; }));
  function sync() {
    const state = {};
    TC_FIELDS.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) state[id] = el.value;
    });
    const out = changedOnly(TC_DEFAULTS, state);
    if (pane !== 'calor') out.tab = pane;
    const hessNow = JSON.stringify(hess.map(function (r) { return [r.eq, r.dh, r.mult]; }));
    if (hessNow !== HESS_DEFAULT) out.hess = hessNow;
    writeState('tc', out);
  }
  const saved = readState('tc');
  let hess = readJSON(saved, 'hess', null)
    ? readJSON(saved, 'hess', []).map(function (r) { return { eq: String(r[0] || ''), dh: String(r[1] == null ? '' : r[1]), mult: String(r[2] == null ? '1' : r[2]) }; })
    : HESS_EXAMPLE.map(function (r) { return Object.assign({}, r); });

  /* ── Calorimetry ─────────────────────────────────────────────── */
  const subSel = document.getElementById('tcSub');
  const mEl = document.getElementById('tcM'), cEl = document.getElementById('tcC');
  const t1El = document.getElementById('tcT1'), t2El = document.getElementById('tcT2');
  const qEl = document.getElementById('tcQ');
  const calorOut = document.getElementById('tcCalorOut');
  const phaseEl = document.getElementById('tcPhase');

  subSel.addEventListener('change', function () {
    if (subSel.value !== 'custom') { cEl.value = subSel.value; solveCalor(); }
  });

  function solveCalor() {
    const f = { m: mEl.value, c: cEl.value, t1: t1El.value, t2: t2El.value, q: qEl.value };
    const blanks = Object.keys(f).filter(function (k) { return String(f[k]).trim() === ''; });

    if (blanks.length === 0) {
      calorOut.innerHTML = '<div class="st-hint">Clear one box — q, m, c, or a temperature — and it will solve for it.</div>';
      return;
    }
    if (blanks.length > 1) {
      calorOut.innerHTML = '<div class="st-hint">Leave only one box empty (currently ' + blanks.length + ').</div>';
      return;
    }
    const v = {};
    Object.keys(f).forEach(function (k) { v[k] = parseFloat(f[k]); });
    const unknown = blanks[0];

    let h = '<div class="st-step"><div class="st-h">The relationship</div>' +
      '<p>q = m · c · ΔT, where ΔT = T<sub>final</sub> − T<sub>initial</sub></p></div>';

    if (unknown === 'q') {
      if ([v.m, v.c, v.t1, v.t2].some(isNaN)) { calorOut.innerHTML = numHint(); return; }
      const dT = v.t2 - v.t1, q = v.m * v.c * dT;
      h += '<div class="st-step"><div class="st-h">Substitute</div><ul>' +
        '<li>ΔT = ' + n(v.t2) + ' − ' + n(v.t1) + ' = <b>' + n(dT) + ' °C</b></li>' +
        '<li>q = ' + n(v.m) + ' g × ' + n(v.c) + ' J/(g·°C) × ' + n(dT) + ' °C</li>' +
        '<li>q = <b class="st-ans">' + n(q) + ' J</b> = <b class="st-ans">' + n(q / 1000) + ' kJ</b></li>' +
        '</ul></div>' + sense(q);
    } else if (unknown === 'm') {
      if ([v.q, v.c, v.t1, v.t2].some(isNaN)) { calorOut.innerHTML = numHint(); return; }
      const dT = v.t2 - v.t1;
      if (dT === 0) { calorOut.innerHTML = zeroDT(); return; }
      const m = v.q / (v.c * dT);
      h += '<div class="st-step"><div class="st-h">Rearrange for m</div><ul>' +
        '<li>ΔT = ' + n(dT) + ' °C</li>' +
        '<li>m = q / (c · ΔT) = ' + n(v.q) + ' / (' + n(v.c) + ' × ' + n(dT) + ')</li>' +
        '<li>m = <b class="st-ans">' + n(m) + ' g</b></li></ul></div>';
    } else if (unknown === 'c') {
      if ([v.q, v.m, v.t1, v.t2].some(isNaN)) { calorOut.innerHTML = numHint(); return; }
      const dT = v.t2 - v.t1;
      if (dT === 0 || v.m === 0) { calorOut.innerHTML = zeroDT(); return; }
      const c = v.q / (v.m * dT);
      h += '<div class="st-step"><div class="st-h">Rearrange for c</div><ul>' +
        '<li>ΔT = ' + n(dT) + ' °C</li>' +
        '<li>c = q / (m · ΔT) = ' + n(v.q) + ' / (' + n(v.m) + ' × ' + n(dT) + ')</li>' +
        '<li>c = <b class="st-ans">' + n(c) + ' J/(g·°C)</b></li></ul></div>';
    } else {
      /* solving for a temperature */
      if ([v.q, v.m, v.c].some(isNaN)) { calorOut.innerHTML = numHint(); return; }
      if (v.m === 0 || v.c === 0) { calorOut.innerHTML = zeroDT(); return; }
      const dT = v.q / (v.m * v.c);
      const solving = unknown === 't2' ? 'final' : 'initial';
      const known = unknown === 't2' ? v.t1 : v.t2;
      if (isNaN(known)) { calorOut.innerHTML = numHint(); return; }
      const answer = unknown === 't2' ? known + dT : known - dT;
      h += '<div class="st-step"><div class="st-h">Rearrange for the ' + solving + ' temperature</div><ul>' +
        '<li>ΔT = q / (m · c) = ' + n(v.q) + ' / (' + n(v.m) + ' × ' + n(v.c) + ') = <b>' + n(dT) + ' °C</b></li>' +
        '<li>T<sub>' + (unknown === 't2' ? 'final' : 'initial') + '</sub> = ' +
          (unknown === 't2' ? n(known) + ' + ' + n(dT) : n(known) + ' − ' + n(dT)) +
          ' = <b class="st-ans">' + n(answer) + ' °C</b></li></ul></div>';
    }
    calorOut.innerHTML = h;
  }

  function numHint() { return '<div class="st-hint">Fill the other boxes with numbers.</div>'; }
  function zeroDT() { return '<div class="st-hint">That combination divides by zero — check ΔT, m and c.</div>'; }
  function sense(q) {
    return '<div class="st-step"><div class="st-h">Reading the sign</div><p>' +
      (q > 0 ? 'q is positive, so the substance <b>absorbed</b> heat (endothermic from its point of view).'
             : q < 0 ? 'q is negative, so the substance <b>released</b> heat (exothermic).'
                     : 'q is zero — no temperature change, so no heat transferred.') +
      '</p></div>';
  }

  [mEl, cEl, t1El, t2El, qEl].forEach(function (el) {
    el.addEventListener('input', function () { solveCalor(); sync(); });
  });
  TC_FIELDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el && saved[id] !== undefined) el.value = saved[id];
  });

  phaseEl.innerHTML = '<div class="tc-phasenote"><b>Phase changes happen at constant temperature</b>, ' +
    'so q = mcΔT does not apply during melting or boiling. Use q = n·ΔH instead: ' +
    PHASE_WATER.map(function (p) {
      return esc(p.n) + ' = ' + p.kJmol + ' kJ/mol (' + p.Jg + ' J/g)';
    }).join('; ') + '.';

  solveCalor();

  /* ── ΔH°rxn ──────────────────────────────────────────────────── */
  const eqEl = document.getElementById('tcEq');
  const eqEx = document.getElementById('tcEqEx');
  const eqBal = document.getElementById('tcEqBal');
  const rxnOut = document.getElementById('tcRxnOut');

  function solveRxn() {
    const text = eqEl.value.trim();
    eqBal.className = 'st-balance';
    if (!text) { eqBal.textContent = ''; rxnOut.innerHTML = ''; return; }

    let eq;
    try { eq = parseEquation(text); }
    catch (err) {
      eqBal.className = 'st-balance bad';
      eqBal.textContent = err.message;
      rxnOut.innerHTML = '';
      return;
    }

    const bal = balanceCheck(eq);
    if (bal.balanced) {
      eqBal.className = 'st-balance ok';
      eqBal.textContent = '✓ Balanced';
    } else {
      eqBal.className = 'st-balance warn';
      eqBal.innerHTML = '⚠ Not balanced — ' + bal.rows.filter(function (r) { return r.left !== r.right; })
        .map(function (r) { return '<b>' + esc(r.el) + '</b> ' + r.left + ' vs ' + r.right; }).join('; ') +
        '. ΔH°rxn from a wrong equation is a wrong number.';
    }

    /* Look each species up; report what is missing rather than guessing. */
    const all = eq.reactants.concat(eq.products);
    const missing = [], assumed = [], ambiguous = [];
    all.forEach(function (t) {
      const r = lookupDHf(t.formula, t.state);
      if (!r) { missing.push(t); t._dhf = null; return; }
      if (r.ambiguous) { ambiguous.push({ t: t, states: r.ambiguous }); t._dhf = null; return; }
      t._dhf = r.value;
      if (r.assumed) { t._assumedState = r.state; assumed.push(t); }
    });

    let h = '';
    if (ambiguous.length) {
      h += '<div class="st-step"><div class="st-h">Which state?</div><ul>' +
        ambiguous.map(function (a) {
          const list = a.states.map(function (s) { return '<b>(' + s + ')</b>'; });
          const joined = list.length > 1
            ? list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]
            : list[0];
          return '<li>' + sub(a.t.formula) + ' is tabulated for ' + joined +
            ' — add the state to the formula.</li>';
        }).join('') + '</ul></div>';
    }
    if (missing.length) {
      h += '<div class="st-step"><div class="st-h">Not in the table</div><ul>' +
        missing.map(function (t) {
          return '<li>' + species(t) + ' has no tabulated ΔH°<sub>f</sub> here' +
            (t.state ? ' for state (' + t.state + ')' : '') +
            ' — look it up in your textbook and use Hess\'s law instead.</li>';
        }).join('') + '</ul></div>';
    }
    if (ambiguous.length || missing.length) { rxnOut.innerHTML = h; return; }

    if (assumed.length) {
      h += '<div class="st-step"><div class="st-h">States assumed</div><ul>' +
        assumed.map(function (t) {
          return '<li>' + sub(t.formula) + ' — only one state is tabulated, so <b>(' +
            t._assumedState + ')</b> was used. Write it explicitly to be sure.</li>';
        }).join('') + '</ul></div>';
    }

    function sumSide(terms, label) {
      let total = 0;
      const lines = terms.map(function (t) {
        const contrib = t.coef * t._dhf;
        total += contrib;
        return '<li>' + t.coef + ' × ' + species(t) + ': ' + t.coef + ' × ' +
          signed(t._dhf) + ' = <b>' + signed(contrib) + ' kJ</b>' +
          (t._dhf === 0 ? ' <span class="tc-zero">(element in its standard state)</span>' : '') + '</li>';
      }).join('');
      return { total: total, html: '<div class="st-step"><div class="st-h">' + label +
        '</div><ul>' + lines + '<li class="tc-sum">Σ = <b>' + signed(total) + ' kJ</b></li></ul></div>' };
    }

    const p = sumSide(eq.products, 'Step 1 — Σ n·ΔH°f of the products');
    const r = sumSide(eq.reactants, 'Step 2 — Σ n·ΔH°f of the reactants');
    const dh = p.total - r.total;

    h += p.html + r.html +
      '<div class="st-step"><div class="st-h">Step 3 — subtract</div><ul>' +
      '<li>ΔH°<sub>rxn</sub> = (' + signed(p.total) + ') − (' + signed(r.total) + ')</li>' +
      '<li>ΔH°<sub>rxn</sub> = <b class="st-ans">' + signed(dh) + ' kJ</b></li></ul></div>' +
      '<div class="st-step"><div class="st-h">What that means</div><p>' +
      (dh < 0 ? 'Negative ΔH — the reaction <b>releases</b> heat. It is <b>exothermic</b>.'
              : dh > 0 ? 'Positive ΔH — the reaction <b>absorbs</b> heat. It is <b>endothermic</b>.'
                       : 'ΔH is zero — no net enthalpy change.') + '</p></div>';

    rxnOut.innerHTML = h;
  }

  eqEl.addEventListener('input', function () { solveRxn(); sync(); });
  eqEx.addEventListener('change', function () {
    if (!eqEx.value) return;
    eqEl.value = eqEx.value;
    solveRxn(); sync();
    eqEx.value = '';
  });
  if (saved.tcEq === undefined) eqEl.value = 'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)';
  solveRxn();

  /* ── Hess's law ──────────────────────────────────────────────── */
  const hessRows = document.getElementById('tcHessRows');
  const hessOut = document.getElementById('tcHessOut');

  function renderHess() {
    hessRows.innerHTML = hess.map(function (row, i) {
      return '<div class="tc-hessrow">' +
        '<input class="st-eq tc-heq" data-i="' + i + '" type="text" spellcheck="false" ' +
          'placeholder="step ' + (i + 1) + ' equation" value="' + esc(row.eq) + '">' +
        '<input class="u-input tc-hdh" data-i="' + i + '" type="number" step="any" ' +
          'placeholder="ΔH kJ" value="' + esc(row.dh) + '">' +
        '<input class="u-input tc-hm" data-i="' + i + '" type="number" step="any" ' +
          'placeholder="×" value="' + esc(row.mult) + '">' +
        '<button class="rt-btn tc-hdel" data-i="' + i + '" type="button" aria-label="Remove step">×</button>' +
        '</div>';
    }).join('');

    hessRows.querySelectorAll('.tc-heq').forEach(function (el) {
      el.addEventListener('input', function () { hess[+el.dataset.i].eq = el.value; solveHess(); sync(); });
    });
    hessRows.querySelectorAll('.tc-hdh').forEach(function (el) {
      el.addEventListener('input', function () { hess[+el.dataset.i].dh = el.value; solveHess(); sync(); });
    });
    hessRows.querySelectorAll('.tc-hm').forEach(function (el) {
      el.addEventListener('input', function () { hess[+el.dataset.i].mult = el.value; solveHess(); sync(); });
    });
    hessRows.querySelectorAll('.tc-hdel').forEach(function (el) {
      el.addEventListener('click', function () {
        hess.splice(+el.dataset.i, 1);
        if (!hess.length) hess.push({ eq: '', dh: '', mult: '1' });
        renderHess(); solveHess(); sync();
      });
    });
  }

  function solveHess() {
    const usable = hess.filter(function (r) {
      return String(r.dh).trim() !== '' && !isNaN(parseFloat(r.dh)) &&
             String(r.mult).trim() !== '' && !isNaN(parseFloat(r.mult));
    });
    if (!usable.length) {
      hessOut.innerHTML = '<div class="st-hint">Enter a ΔH and a multiplier for at least one step.</div>';
      return;
    }
    let total = 0;
    const lines = usable.map(function (r) {
      const dh = parseFloat(r.dh), m = parseFloat(r.mult), c = dh * m;
      total += c;
      const how = m === -1 ? 'reversed' : m === 1 ? 'as written' : '× ' + num(m);
      return '<li>' + (r.eq ? '<span class="tc-heqtxt">' + esc(r.eq) + '</span> ' : '') +
        '<span class="tc-how">(' + how + ')</span>: ' +
        signed(dh) + ' × ' + num(m) + ' = <b>' + signed(c) + ' kJ</b></li>';
    }).join('');

    hessOut.innerHTML = '<div class="st-step"><div class="st-h">Each step after its multiplier</div><ul>' +
      lines + '</ul></div>' +
      '<div class="st-step"><div class="st-h">Add them</div><ul>' +
      '<li>ΔH<sub>target</sub> = <b class="st-ans">' + signed(total) + ' kJ</b></li></ul>' +
      '<p class="tc-check">Check the steps actually add to your target equation — ' +
      'the arithmetic is right whether or not the intermediates cancel.</p></div>';
  }

  document.getElementById('tcHessAdd').addEventListener('click', function () {
    hess.push({ eq: '', dh: '', mult: '1' });
    renderHess(); solveHess(); sync();
  });
  document.getElementById('tcHessEx').addEventListener('click', function () {
    hess = HESS_EXAMPLE.map(function (r) { return Object.assign({}, r); });
    renderHess(); solveHess(); sync();
  });

  renderHess();
  solveHess();
  if (saved.tab) showPane(saved.tab);
}
