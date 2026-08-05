/* The everyday chemistry solvers.

   Each pane can be requested on its own, so a topic room shows only the
   calculators that belong to it — the Solutions room gets molarity and
   dilution, the Acids room gets pH and buffer. Pass {tabs:[...]} to pick;
   omit it for all five. */

import { molarMass } from '../chem/formula.js';
import { uFmt } from '../format.js';
import { readState, writeState, changedOnly, snapshot } from '../share.js';

const PANES = {
  molar: {
    label: 'Molar mass',
    body: '<div class="u-row"><input class="u-input" id="mmFormula" style="width:15rem" placeholder="e.g. Ca(OH)2, NaCl, C6H12O6" autocomplete="off" spellcheck="false"></div>' +
      '<div class="chem-out" id="mmOut">—</div>' +
      '<div class="u-note">Supports parentheses and hydrate dots (e.g. CuSO4·5H2O). Element symbols are case-sensitive.</div>'
  },
  molarity: {
    label: 'Molarity',
    body: '<div class="u-row"><label>Moles (mol)</label><input class="u-input" id="molMol" type="number" step="any" value="0.5"></div>' +
      '<div class="u-row"><label>Volume (L)</label><input class="u-input" id="molVol" type="number" step="any" value="1"></div>' +
      '<div class="chem-out" id="molOut">—</div>' +
      '<div class="u-note">Molarity M = moles of solute / litres of solution.</div>'
  },
  dilution: {
    label: 'Dilution',
    body: '<div class="u-row"><label>Stock conc. C₁</label><input class="u-input" id="dC1" type="number" step="any" value="2"></div>' +
      '<div class="u-row"><label>Target conc. C₂</label><input class="u-input" id="dC2" type="number" step="any" value="0.5"></div>' +
      '<div class="u-row"><label>Final volume V₂</label><input class="u-input" id="dV2" type="number" step="any" value="100"></div>' +
      '<div class="chem-out" id="dOut">—</div>' +
      '<div class="u-note">C₁V₁ = C₂V₂. Keep both concentrations in the same units, and the volume in whatever unit you want V₁ back in.</div>'
  },
  ph: {
    label: 'pH',
    body: '<div class="u-row"><label>pH</label><input class="u-input" id="phPH" type="number" step="any" value="7"></div>' +
      '<div class="u-row"><label>[H⁺] (M)</label><input class="u-input" id="phH" type="number" step="any"></div>' +
      '<div class="chem-out" id="phOut">—</div>' +
      '<div class="u-note">pH = −log₁₀[H⁺]. Edit either field; the other follows.</div>'
  },
  buffer: {
    label: 'Buffer',
    body: '<div class="u-row"><label>pKₐ</label><input class="u-input" id="bfPKa" type="number" step="any" value="4.74"></div>' +
      '<div class="u-row"><label>[A⁻] (base)</label><input class="u-input" id="bfA" type="number" step="any" value="1"></div>' +
      '<div class="u-row"><label>[HA] (acid)</label><input class="u-input" id="bfHA" type="number" step="any" value="1"></div>' +
      '<div class="chem-out" id="bfOut">—</div>' +
      '<div class="u-note">Henderson–Hasselbalch: pH = pKₐ + log₁₀([A⁻]/[HA]).</div>'
  }
};

function keysFor(opts) {
  const want = opts && opts.tabs;
  if (!want || !want.length) return Object.keys(PANES);
  return want.filter(function (k) { return k in PANES; });
}

export function block(opts) {
  const keys = keysFor(opts);
  const single = keys.length === 1;
  const heading = single ? PANES[keys[0]].label : 'Chemistry Calculators';
  const blurb = single
    ? 'Live — type and it solves as you go.'
    : keys.map(function (k) { return PANES[k].label; }).join(', ') + ' — the everyday chem solvers, live.';

  const tabs = single ? '' : '<div class="u-tabs" id="chemTabs">' +
    keys.map(function (k, i) {
      return '<button class="u-tab' + (i ? '' : ' on') + '" type="button" data-pane="' + k + '">' +
        PANES[k].label + '</button>';
    }).join('') + '</div>';

  const panes = keys.map(function (k, i) {
    return '<div class="u-pane' + (i ? '' : ' on') + '" data-pane="' + k + '">' + PANES[k].body + '</div>';
  }).join('');

  return '<section class="block"><div class="block-head"><h2>' + heading + '</h2>' +
    '<span class="tag">Instrument</span><p>' + blurb + '</p></div>' +
    tabs + '<div class="chem">' + panes + '</div></section>';
}

export function init(opts) {
  const keys = keysFor(opts);
  const tabsEl = document.getElementById('chemTabs');
  if (tabsEl) {
    const wrap = tabsEl.closest('.block');
    wrap.querySelectorAll('#chemTabs .u-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        wrap.querySelectorAll('#chemTabs .u-tab').forEach(function (x) { x.classList.remove('on'); });
        wrap.querySelectorAll('.chem .u-pane').forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        wrap.querySelector('.chem .u-pane[data-pane="' + t.getAttribute('data-pane') + '"]').classList.add('on');
      });
    });
  }

  const has = function (k) { return keys.indexOf(k) >= 0; };
  const g = function (id) { return document.getElementById(id); };

  /* Restore shared values first, then mirror edits back to the URL. Only
     the fields actually on screen are touched, so two rooms sharing this
     module never overwrite each other's keys. */
  const saved = readState('cc');
  const FIELDS = ['mmFormula', 'molMol', 'molVol', 'dC1', 'dC2', 'dV2', 'phPH', 'phH', 'bfPKa', 'bfA', 'bfHA'];
  const DEFAULTS = snapshot(FIELDS, g);
  FIELDS.forEach(function (id) {
    if (g(id) && saved[id] !== undefined) g(id).value = saved[id];
  });
  const sync = function () {
    const state = {};
    FIELDS.forEach(function (id) { if (g(id)) state[id] = g(id).value; });
    writeState('cc', changedOnly(DEFAULTS, state));
  };
  FIELDS.forEach(function (id) {
    const el = g(id);
    if (el) el.addEventListener('input', sync);
  });

  if (has('molar')) {
    const mmF = g('mmFormula'), mmOut = g('mmOut');
    const doMM = function () {
      const v = mmF.value.trim();
      if (!v) { mmOut.textContent = '—'; return; }
      try { mmOut.innerHTML = '<b>' + uFmt(molarMass(v)) + '</b> g/mol'; }
      catch (e) { mmOut.textContent = e.message || 'Invalid formula'; }
    };
    mmF.addEventListener('input', doMM); doMM();
  }

  if (has('molarity')) {
    const molMol = g('molMol'), molVol = g('molVol'), molOut = g('molOut');
    const doMol = function () {
      const n = parseFloat(molMol.value), V = parseFloat(molVol.value);
      if (isNaN(n) || isNaN(V) || V === 0) { molOut.textContent = '—'; return; }
      molOut.innerHTML = '<b>' + uFmt(n / V) + '</b> mol/L (M)';
    };
    molMol.addEventListener('input', doMol); molVol.addEventListener('input', doMol); doMol();
  }

  if (has('dilution')) {
    const dC1 = g('dC1'), dC2 = g('dC2'), dV2 = g('dV2'), dOut = g('dOut');
    const doDil = function () {
      const C1 = parseFloat(dC1.value), C2 = parseFloat(dC2.value), V2 = parseFloat(dV2.value);
      if (isNaN(C1) || isNaN(C2) || isNaN(V2) || C1 === 0) { dOut.textContent = '—'; return; }
      const V1 = C2 * V2 / C1;
      if (V1 > V2) { dOut.innerHTML = "Target is more concentrated than the stock — can't reach it by dilution."; return; }
      dOut.innerHTML = 'Take <b>' + uFmt(V1) + '</b> of stock, add <b>' + uFmt(V2 - V1) + '</b> diluent → ' + uFmt(V2) + ' total.';
    };
    dC1.addEventListener('input', doDil); dC2.addEventListener('input', doDil); dV2.addEventListener('input', doDil); doDil();
  }

  if (has('ph')) {
    const phPH = g('phPH'), phH = g('phH'), phOut = g('phOut');
    const showPH = function (pH) {
      phOut.innerHTML = 'pH = <b>' + uFmt(pH) + '</b> · pOH = <b>' + uFmt(14 - pH) + '</b> · [OH⁻] = <b>' +
        Math.pow(10, -(14 - pH)).toExponential(3) + '</b> M';
    };
    const fromPH = function () {
      const pH = parseFloat(phPH.value);
      if (isNaN(pH)) { phOut.textContent = '—'; return; }
      phH.value = Math.pow(10, -pH).toExponential(3);
      showPH(pH);
    };
    const fromH = function () {
      const H = parseFloat(phH.value);
      if (isNaN(H) || H <= 0) { phOut.textContent = '—'; return; }
      const pH = -Math.log(H) / Math.LN10;
      phPH.value = parseFloat(pH.toFixed(3));
      showPH(pH);
    };
    phPH.addEventListener('input', fromPH); phH.addEventListener('input', fromH); fromPH();
  }

  if (has('buffer')) {
    const bfPKa = g('bfPKa'), bfA = g('bfA'), bfHA = g('bfHA'), bfOut = g('bfOut');
    const doBuf = function () {
      const pKa = parseFloat(bfPKa.value), A = parseFloat(bfA.value), HA = parseFloat(bfHA.value);
      if (isNaN(pKa) || isNaN(A) || isNaN(HA) || A <= 0 || HA <= 0) { bfOut.textContent = '—'; return; }
      bfOut.innerHTML = 'pH = <b>' + uFmt(pKa + Math.log(A / HA) / Math.LN10) + '</b>';
    };
    bfPKa.addEventListener('input', doBuf); bfA.addEventListener('input', doBuf); bfHA.addEventListener('input', doBuf); doBuf();
  }
}
