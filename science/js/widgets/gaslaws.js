/* Gas laws: ideal gas, combined gas law, Dalton's partial pressures,
   Graham's effusion.

   Every tab converts the input to atm / L / K / mol first and shows that
   conversion as its own step, because forgetting Kelvin and mismatching R to
   the pressure unit are the two mistakes this topic is made of. */

import { R_ATM, R_VALUES, P_UNITS, V_UNITS, T_UNITS, REF_CONDITIONS, GAS_LAWS }
  from '../data/gases.js';
import { molarMass } from '../chem/formula.js';
import { esc } from '../format.js';

function n(x, sig) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a < 1e-4 || a >= 1e7) return x.toExponential(3);
  return String(parseFloat(x.toPrecision(sig || 4)));
}
function sub(f) { return esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }

function opts(list, key, sel) {
  return list.map(function (o) {
    return '<option' + (o[key] === sel ? ' selected' : '') + '>' + esc(o[key]) + '</option>';
  }).join('');
}
const pOpts = opts(P_UNITS, 'u', 'atm');
const vOpts = opts(V_UNITS, 'u', 'L');
const tOpts = opts(T_UNITS, 'u', '°C');

function pFactor(u) { return (P_UNITS.find(function (x) { return x.u === u; }) || P_UNITS[0]).f; }
function vFactor(u) { return (V_UNITS.find(function (x) { return x.u === u; }) || V_UNITS[0]).f; }
function tSpec(u) { return T_UNITS.find(function (x) { return x.u === u; }) || T_UNITS[0]; }

export function block() {
  const rRows = R_VALUES.map(function (r) {
    return '<tr><td class="rt-val">' + esc(r.v) + '</td><td class="rt-f">' + esc(r.u) +
      '</td><td class="rt-note">' + esc(r.when) + '</td></tr>';
  }).join('');
  const refRows = REF_CONDITIONS.map(function (c) {
    return '<tr><td>' + esc(c.n) + '</td><td>' + esc(c.t) + '</td><td>' + esc(c.p) +
      '</td><td class="rt-val">' + esc(c.vm) + '</td><td class="rt-note">' + esc(c.note) + '</td></tr>';
  }).join('');
  const lawRows = GAS_LAWS.map(function (l) {
    return '<tr><td>' + esc(l.n) + '</td><td class="rt-f">' + esc(l.rel) +
      '</td><td class="rt-note">' + esc(l.holds) + '</td><td class="rt-note">' + esc(l.says) + '</td></tr>';
  }).join('');

  return '<section class="block gl" id="gaslaws">' +
    '<div class="block-head"><h2>Gas Laws</h2><span class="tag">Instrument</span>' +
    '<p>Ideal gas, the combined law, partial pressures and effusion. ' +
    'Units are converted to atm · L · K first, and that conversion is shown.</p></div>' +

    '<div class="u-tabs" id="glTabs">' +
      '<button class="u-tab on" type="button" data-pane="ideal">PV = nRT</button>' +
      '<button class="u-tab" type="button" data-pane="combined">Combined</button>' +
      '<button class="u-tab" type="button" data-pane="dalton">Partial pressures</button>' +
      '<button class="u-tab" type="button" data-pane="graham">Effusion</button>' +
      '<button class="u-tab" type="button" data-pane="ref">Constants</button>' +
    '</div>' +

    /* ── Ideal gas ── */
    '<div class="gl-pane on" data-pane="ideal">' +
      '<p class="tc-hint">Leave <b>exactly one</b> of P, V, n or T empty and it solves for that one.</p>' +
      '<div class="st-row"><label class="tc-lab">Pressure P</label>' +
        '<input class="u-input" id="glP" type="number" step="any" value="1">' +
        '<select class="u-select gl-u" id="glPu">' + pOpts + '</select></div>' +
      '<div class="st-row"><label class="tc-lab">Volume V</label>' +
        '<input class="u-input" id="glV" type="number" step="any" value="22.4">' +
        '<select class="u-select gl-u" id="glVu">' + vOpts + '</select></div>' +
      '<div class="st-row"><label class="tc-lab">Moles n</label>' +
        '<input class="u-input" id="glN" type="number" step="any" placeholder="leave blank to solve">' +
        '<input class="u-input gl-formula" id="glFormula" type="text" spellcheck="false" ' +
          'placeholder="or a formula + grams"><input class="u-input gl-grams" id="glGrams" ' +
          'type="number" step="any" placeholder="g"></div>' +
      '<div class="st-row"><label class="tc-lab">Temperature T</label>' +
        '<input class="u-input" id="glT" type="number" step="any" value="0">' +
        '<select class="u-select gl-u" id="glTu">' + tOpts + '</select></div>' +
      '<div class="st-out" id="glIdealOut"></div>' +
    '</div>' +

    /* ── Combined ── */
    '<div class="gl-pane" data-pane="combined">' +
      '<p class="tc-hint">P₁V₁/T₁ = P₂V₂/T₂ with the amount of gas held constant. ' +
      'Leave <b>one</b> box empty. Drop a quantity from <b>both</b> states if it is not changing ' +
      '— that is how you get Boyle\'s or Charles\'s law.</p>' +
      '<div class="gl-states">' +
        '<div class="gl-state"><div class="gl-sh">State 1</div>' +
          '<div class="st-row"><label class="tc-lab">P₁</label><input class="u-input" id="glP1" type="number" step="any" value="1"><select class="u-select gl-u" id="glP1u">' + pOpts + '</select></div>' +
          '<div class="st-row"><label class="tc-lab">V₁</label><input class="u-input" id="glV1" type="number" step="any" value="2"><select class="u-select gl-u" id="glV1u">' + vOpts + '</select></div>' +
          '<div class="st-row"><label class="tc-lab">T₁</label><input class="u-input" id="glT1" type="number" step="any" value="25"><select class="u-select gl-u" id="glT1u">' + tOpts + '</select></div>' +
        '</div>' +
        '<div class="gl-state"><div class="gl-sh">State 2</div>' +
          '<div class="st-row"><label class="tc-lab">P₂</label><input class="u-input" id="glP2" type="number" step="any" value="2"><select class="u-select gl-u" id="glP2u">' + pOpts + '</select></div>' +
          '<div class="st-row"><label class="tc-lab">V₂</label><input class="u-input" id="glV2" type="number" step="any" placeholder="solve"><select class="u-select gl-u" id="glV2u">' + vOpts + '</select></div>' +
          '<div class="st-row"><label class="tc-lab">T₂</label><input class="u-input" id="glT2" type="number" step="any" value="25"><select class="u-select gl-u" id="glT2u">' + tOpts + '</select></div>' +
        '</div>' +
      '</div>' +
      '<div class="st-out" id="glCombOut"></div>' +
    '</div>' +

    /* ── Dalton ── */
    '<div class="gl-pane" data-pane="dalton">' +
      '<p class="tc-hint">Each gas contributes pressure in proportion to its share of the moles. ' +
      'P<sub>i</sub> = X<sub>i</sub> · P<sub>total</sub>, where X<sub>i</sub> = n<sub>i</sub> / n<sub>total</sub>.</p>' +
      '<div class="st-row"><label class="tc-lab">Total pressure</label>' +
        '<input class="u-input" id="glPtot" type="number" step="any" value="1">' +
        '<select class="u-select gl-u" id="glPtotu">' + pOpts + '</select></div>' +
      '<div id="glDaltonRows"></div>' +
      '<div class="st-row"><button class="rt-btn" id="glDaltonAdd" type="button">+ Add gas</button></div>' +
      '<div class="st-out" id="glDaltonOut"></div>' +
    '</div>' +

    /* ── Graham ── */
    '<div class="gl-pane" data-pane="graham">' +
      '<p class="tc-hint">Lighter gases effuse faster: rate₁ / rate₂ = √(M₂ / M₁). ' +
      'Enter two formulas.</p>' +
      '<div class="st-row"><label class="tc-lab">Gas 1</label>' +
        '<input class="u-input gl-gas" id="glG1" type="text" spellcheck="false" value="He"></div>' +
      '<div class="st-row"><label class="tc-lab">Gas 2</label>' +
        '<input class="u-input gl-gas" id="glG2" type="text" spellcheck="false" value="O2"></div>' +
      '<div class="st-out" id="glGrahamOut"></div>' +
    '</div>' +

    /* ── Constants ── */
    '<div class="gl-pane" data-pane="ref">' +
      '<h3 class="rt-h">The gas constant R</h3>' +
      '<p class="rt-sub">Pick the R whose units match your pressure and volume. ' +
      'Mixing them is the most common error in this topic.</p>' +
      '<table class="rt-table"><thead><tr><th style="text-align:right">Value</th><th>Units</th><th>Use when</th></tr></thead>' +
      '<tbody>' + rRows + '</tbody></table>' +
      '<h3 class="rt-h">Reference conditions and molar volume</h3>' +
      '<p class="rt-sub">Textbooks disagree about STP — check which one your course uses.</p>' +
      '<table class="rt-table"><thead><tr><th>Condition</th><th>T</th><th>P</th><th style="text-align:right">V<sub>m</sub></th><th>Note</th></tr></thead>' +
      '<tbody>' + refRows + '</tbody></table>' +
      '<h3 class="rt-h">The named laws</h3>' +
      '<p class="rt-sub">All of these are the combined gas law with something held constant.</p>' +
      '<table class="rt-table"><thead><tr><th>Law</th><th>Relationship</th><th>Holds</th><th>Says</th></tr></thead>' +
      '<tbody>' + lawRows + '</tbody></table>' +
    '</div>' +

    '</section>';
}

export function init() {
  const root = document.getElementById('gaslaws');
  if (!root) return;

  const tabs = root.querySelectorAll('#glTabs .u-tab');
  const panes = root.querySelectorAll('.gl-pane');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      panes.forEach(function (p) { p.classList.remove('on'); });
      t.classList.add('on');
      root.querySelector('.gl-pane[data-pane="' + t.getAttribute('data-pane') + '"]').classList.add('on');
    });
  });

  const g = function (id) { return document.getElementById(id); };
  const hint = function (msg) { return '<div class="st-hint">' + msg + '</div>'; };

  /* ── Ideal gas ─────────────────────────────────────────────── */
  const idealOut = g('glIdealOut');
  const idealFields = ['glP', 'glV', 'glN', 'glT'];

  function solveIdeal() {
    const raw = {
      P: g('glP').value.trim(), V: g('glV').value.trim(),
      n: g('glN').value.trim(), T: g('glT').value.trim()
    };
    const formula = g('glFormula').value.trim();
    const grams = g('glGrams').value.trim();

    /* Moles can come from a formula + mass instead of being typed. */
    let massSteps = '', nFromMass = null, massErr = null;
    if (formula && grams !== '' && !isNaN(parseFloat(grams))) {
      try {
        const M = molarMass(formula);
        nFromMass = parseFloat(grams) / M;
        massSteps = '<div class="st-step"><div class="st-h">Moles from mass</div><ul>' +
          '<li>M(' + sub(formula) + ') = <b>' + n(M) + ' g/mol</b></li>' +
          '<li>n = ' + n(parseFloat(grams)) + ' g ÷ ' + n(M) + ' g/mol = <b>' + n(nFromMass) + ' mol</b></li>' +
          '</ul></div>';
      } catch (e) { massErr = e.message; }
    }
    if (massErr) { idealOut.innerHTML = hint(esc(massErr)); return; }
    if (nFromMass !== null) raw.n = String(nFromMass);

    const blanks = Object.keys(raw).filter(function (k) { return raw[k] === ''; });
    if (blanks.length === 0) { idealOut.innerHTML = hint('Clear one of P, V, n or T and it will solve for it.'); return; }
    if (blanks.length > 1) { idealOut.innerHTML = hint('Leave only one box empty (currently ' + blanks.length + ').'); return; }

    const pu = g('glPu').value, vu = g('glVu').value, tu = g('glTu').value;
    const num = {};
    Object.keys(raw).forEach(function (k) { num[k] = parseFloat(raw[k]); });
    const unknown = blanks[0];
    if (Object.keys(num).some(function (k) { return k !== unknown && isNaN(num[k]); })) {
      idealOut.innerHTML = hint('Fill the other boxes with numbers.');
      return;
    }

    /* Canonicalise, and show it. */
    const conv = [];
    let P = null, V = null, T = null;
    if (unknown !== 'P') { P = num.P * pFactor(pu); if (pu !== 'atm') conv.push(n(num.P) + ' ' + pu + ' = <b>' + n(P) + ' atm</b>'); }
    if (unknown !== 'V') { V = num.V * vFactor(vu); if (vu !== 'L') conv.push(n(num.V) + ' ' + vu + ' = <b>' + n(V) + ' L</b>'); }
    if (unknown !== 'T') { T = tSpec(tu).toK(num.T); if (tu !== 'K') conv.push(n(num.T) + ' ' + tu + ' = <b>' + n(T) + ' K</b>'); }

    let h = massSteps;
    h += '<div class="st-step"><div class="st-h">Work in atm · L · K · mol</div>' +
      (conv.length ? '<ul><li>' + conv.join('</li><li>') + '</li></ul>'
                   : '<p>Already in those units.</p>') +
      '<p class="gl-rnote">so R = <b>' + n(R_ATM, 6) + ' L·atm/(mol·K)</b></p></div>';

    if (T !== null && T <= 0 && unknown !== 'T') {
      idealOut.innerHTML = h + hint('Absolute temperature must be above 0 K — check the temperature and its unit.');
      return;
    }

    let answer, line;
    if (unknown === 'P') {
      answer = num.n * R_ATM * T / V;
      line = 'P = nRT / V = (' + n(num.n) + ' × ' + n(R_ATM, 6) + ' × ' + n(T) + ') / ' + n(V);
      h += ansBlock(line, answer, 'atm', function (x) { return x / pFactor(pu); }, pu);
    } else if (unknown === 'V') {
      answer = num.n * R_ATM * T / P;
      line = 'V = nRT / P = (' + n(num.n) + ' × ' + n(R_ATM, 6) + ' × ' + n(T) + ') / ' + n(P);
      h += ansBlock(line, answer, 'L', function (x) { return x / vFactor(vu); }, vu);
    } else if (unknown === 'n') {
      answer = P * V / (R_ATM * T);
      line = 'n = PV / RT = (' + n(P) + ' × ' + n(V) + ') / (' + n(R_ATM, 6) + ' × ' + n(T) + ')';
      h += '<div class="st-step"><div class="st-h">Solve</div><ul><li>' + line + '</li>' +
        '<li>n = <b class="st-ans">' + n(answer) + ' mol</b></li></ul></div>';
    } else {
      answer = P * V / (num.n * R_ATM);
      line = 'T = PV / nR = (' + n(P) + ' × ' + n(V) + ') / (' + n(num.n) + ' × ' + n(R_ATM, 6) + ')';
      h += ansBlock(line, answer, 'K', function (x) { return tSpec(tu).fromK(x); }, tu);
    }
    idealOut.innerHTML = h;
  }

  /* Kelvin -> Celsius subtracts 273.15, so a result near 0 °C keeps four
     significant figures of pure float noise ("0.0003711 °C"). Two decimals
     is more precision than any gas-law problem carries anyway. */
  function showTemp(x) { return String(parseFloat(x.toFixed(2))); }

  function ansBlock(line, valueCanonical, canonUnit, back, userUnit) {
    const inUser = back(valueCanonical);
    if (canonUnit === 'K') {
      return '<div class="st-step"><div class="st-h">Solve</div><ul><li>' + line + '</li>' +
        '<li><b class="st-ans">' + showTemp(valueCanonical) + ' K</b>' +
        (userUnit !== 'K' ? ' = <b class="st-ans">' + showTemp(inUser) + ' ' + esc(userUnit) + '</b>' : '') +
        '</li></ul></div>';
    }
    return '<div class="st-step"><div class="st-h">Solve</div><ul><li>' + line + '</li>' +
      '<li><b class="st-ans">' + n(valueCanonical) + ' ' + esc(canonUnit) + '</b>' +
      (userUnit !== canonUnit ? ' = <b class="st-ans">' + n(inUser) + ' ' + esc(userUnit) + '</b>' : '') +
      '</li></ul></div>';
  }

  idealFields.forEach(function (id) { g(id).addEventListener('input', solveIdeal); });
  ['glPu', 'glVu', 'glTu'].forEach(function (id) { g(id).addEventListener('change', solveIdeal); });
  g('glFormula').addEventListener('input', solveIdeal);
  g('glGrams').addEventListener('input', solveIdeal);
  g('glN').value = '';
  solveIdeal();

  /* ── Combined gas law ──────────────────────────────────────── */
  const combOut = g('glCombOut');
  const combIds = ['glP1', 'glV1', 'glT1', 'glP2', 'glV2', 'glT2'];

  function solveCombined() {
    const raw = {};
    combIds.forEach(function (id) { raw[id] = g(id).value.trim(); });
    const blanks = combIds.filter(function (id) { return raw[id] === ''; });

    /* A quantity dropped from both states is simply not part of this problem. */
    const dropped = [];
    ['P', 'V', 'T'].forEach(function (q) {
      if (raw['gl' + q + '1'] === '' && raw['gl' + q + '2'] === '') dropped.push(q);
    });
    const unknowns = blanks.filter(function (id) {
      return dropped.indexOf(id.charAt(2)) === -1;
    });

    if (unknowns.length === 0) { combOut.innerHTML = hint('Clear one box and it will solve for it.'); return; }
    if (unknowns.length > 1) { combOut.innerHTML = hint('Leave only one box empty (currently ' + unknowns.length + ').'); return; }

    const unknown = unknowns[0];
    const canon = {};
    let bad = false;
    combIds.forEach(function (id) {
      if (raw[id] === '') { canon[id] = null; return; }
      const v = parseFloat(raw[id]);
      if (isNaN(v)) { bad = true; return; }
      const q = id.charAt(2);
      canon[id] = q === 'P' ? v * pFactor(g(id + 'u').value)
                : q === 'V' ? v * vFactor(g(id + 'u').value)
                            : tSpec(g(id + 'u').value).toK(v);
    });
    if (bad) { combOut.innerHTML = hint('Fill the other boxes with numbers.'); return; }

    /* Anything dropped from both sides cancels; treat it as 1. */
    const val = function (id) { return canon[id] === null ? 1 : canon[id]; };

    const lawName = dropped.length
      ? (dropped.indexOf('T') >= 0 ? "Boyle's law (T constant)"
        : dropped.indexOf('P') >= 0 ? "Charles's law (P constant)"
        : dropped.indexOf('V') >= 0 ? "Gay-Lussac's law (V constant)" : 'Combined gas law')
      : 'Combined gas law';

    let h = '<div class="st-step"><div class="st-h">Which law</div>' +
      '<p>' + esc(lawName) + ' — P₁V₁/T₁ = P₂V₂/T₂' +
      (dropped.length ? ', with ' + dropped.map(function (d) { return d + '₁ = ' + d + '₂'; }).join(' and ') +
        ' cancelling.' : '.') + '</p></div>';

    const convLines = [];
    combIds.forEach(function (id) {
      if (canon[id] === null) return;
      const q = id.charAt(2), u = g(id + 'u').value;
      const canonUnit = q === 'P' ? 'atm' : q === 'V' ? 'L' : 'K';
      if (u !== canonUnit) {
        convLines.push(id.slice(2) + ': ' + n(parseFloat(raw[id])) + ' ' + u + ' = <b>' + n(canon[id]) + ' ' + canonUnit + '</b>');
      }
    });
    if (convLines.length) {
      h += '<div class="st-step"><div class="st-h">Convert</div><ul><li>' +
        convLines.join('</li><li>') + '</li></ul>' +
        '<p class="gl-rnote">Temperatures must be absolute — a ratio of Celsius values is meaningless.</p></div>';
    }

    const q = unknown.charAt(2), state = unknown.charAt(3);
    let answer;
    /* P1V1/T1 = P2V2/T2, rearranged for whichever term is missing. */
    if (state === '2') {
      if (q === 'P') answer = val('glP1') * val('glV1') * val('glT2') / (val('glT1') * val('glV2'));
      if (q === 'V') answer = val('glP1') * val('glV1') * val('glT2') / (val('glT1') * val('glP2'));
      if (q === 'T') answer = val('glT1') * val('glP2') * val('glV2') / (val('glP1') * val('glV1'));
    } else {
      if (q === 'P') answer = val('glP2') * val('glV2') * val('glT1') / (val('glT2') * val('glV1'));
      if (q === 'V') answer = val('glP2') * val('glV2') * val('glT1') / (val('glT2') * val('glP1'));
      if (q === 'T') answer = val('glT2') * val('glP1') * val('glV1') / (val('glP2') * val('glV2'));
    }

    if (!isFinite(answer)) { combOut.innerHTML = h + hint('That combination divides by zero — check for a zero value.'); return; }

    const u = g(unknown + 'u').value;
    const canonUnit = q === 'P' ? 'atm' : q === 'V' ? 'L' : 'K';
    const inUser = q === 'P' ? answer / pFactor(u) : q === 'V' ? answer / vFactor(u) : tSpec(u).fromK(answer);

    const fmt = q === 'T' ? showTemp : n;
    h += '<div class="st-step"><div class="st-h">Solve for ' + q + state + '</div><ul>' +
      '<li><b class="st-ans">' + fmt(answer) + ' ' + canonUnit + '</b>' +
      (u !== canonUnit ? ' = <b class="st-ans">' + fmt(inUser) + ' ' + esc(u) + '</b>' : '') +
      '</li></ul></div>';
    combOut.innerHTML = h;
  }

  combIds.forEach(function (id) {
    g(id).addEventListener('input', solveCombined);
    g(id + 'u').addEventListener('change', solveCombined);
  });
  solveCombined();

  /* ── Dalton ────────────────────────────────────────────────── */
  const dRows = g('glDaltonRows'), dOut = g('glDaltonOut');
  let gases = [{ f: 'N2', mol: '0.78' }, { f: 'O2', mol: '0.21' }, { f: 'Ar', mol: '0.01' }];

  function renderDalton() {
    dRows.innerHTML = gases.map(function (row, i) {
      return '<div class="gl-gasrow">' +
        '<input class="u-input gl-gas" data-i="' + i + '" data-k="f" type="text" spellcheck="false" ' +
          'placeholder="formula" value="' + esc(row.f) + '">' +
        '<input class="u-input" data-i="' + i + '" data-k="mol" type="number" step="any" ' +
          'placeholder="moles" value="' + esc(row.mol) + '">' +
        '<button class="rt-btn gl-del" data-i="' + i + '" type="button" aria-label="Remove gas">×</button>' +
        '</div>';
    }).join('');
    dRows.querySelectorAll('input').forEach(function (el) {
      el.addEventListener('input', function () {
        gases[+el.dataset.i][el.dataset.k] = el.value;
        solveDalton();
      });
    });
    dRows.querySelectorAll('.gl-del').forEach(function (el) {
      el.addEventListener('click', function () {
        gases.splice(+el.dataset.i, 1);
        if (!gases.length) gases.push({ f: '', mol: '' });
        renderDalton(); solveDalton();
      });
    });
  }

  function solveDalton() {
    const usable = gases.filter(function (r) {
      return String(r.mol).trim() !== '' && !isNaN(parseFloat(r.mol)) && parseFloat(r.mol) > 0;
    });
    if (!usable.length) { dOut.innerHTML = hint('Enter moles for at least one gas.'); return; }

    const total = usable.reduce(function (a, r) { return a + parseFloat(r.mol); }, 0);
    const pt = parseFloat(g('glPtot').value);
    const pu = g('glPtotu').value;

    let h = '<div class="st-step"><div class="st-h">Total moles</div><ul><li>' +
      usable.map(function (r) { return n(parseFloat(r.mol)); }).join(' + ') +
      ' = <b>' + n(total) + ' mol</b></li></ul></div>';

    h += '<div class="st-step"><div class="st-h">Mole fraction of each gas</div><ul>' +
      usable.map(function (r) {
        const x = parseFloat(r.mol) / total;
        return '<li>' + (r.f ? sub(r.f) + ': ' : '') + n(parseFloat(r.mol)) + ' / ' + n(total) +
          ' = <b>' + n(x) + '</b></li>';
      }).join('') +
      '<li class="tc-sum">Σ X = <b>' + n(usable.reduce(function (a, r) { return a + parseFloat(r.mol) / total; }, 0)) +
      '</b> — mole fractions always add to 1</li></ul></div>';

    if (!isNaN(pt)) {
      h += '<div class="st-step"><div class="st-h">Partial pressures</div><ul>' +
        usable.map(function (r) {
          const x = parseFloat(r.mol) / total;
          return '<li>' + (r.f ? sub(r.f) + ': ' : '') + n(x) + ' × ' + n(pt) + ' ' + esc(pu) +
            ' = <b class="st-ans">' + n(x * pt) + ' ' + esc(pu) + '</b></li>';
        }).join('') +
        '<li class="tc-sum">Σ P = <b>' + n(pt) + ' ' + esc(pu) + '</b> — Dalton\'s law</li></ul></div>';
    }
    dOut.innerHTML = h;
  }

  g('glDaltonAdd').addEventListener('click', function () {
    gases.push({ f: '', mol: '' }); renderDalton(); solveDalton();
  });
  g('glPtot').addEventListener('input', solveDalton);
  g('glPtotu').addEventListener('change', solveDalton);
  renderDalton();
  solveDalton();

  /* ── Graham ────────────────────────────────────────────────── */
  const grOut = g('glGrahamOut');
  function solveGraham() {
    const f1 = g('glG1').value.trim(), f2 = g('glG2').value.trim();
    if (!f1 || !f2) { grOut.innerHTML = hint('Enter both formulas.'); return; }
    let M1, M2;
    try { M1 = molarMass(f1); } catch (e) { grOut.innerHTML = hint('Gas 1: ' + esc(e.message)); return; }
    try { M2 = molarMass(f2); } catch (e) { grOut.innerHTML = hint('Gas 2: ' + esc(e.message)); return; }

    const ratio = Math.sqrt(M2 / M1);
    grOut.innerHTML =
      '<div class="st-step"><div class="st-h">Molar masses</div><ul>' +
      '<li>M₁(' + sub(f1) + ') = <b>' + n(M1) + ' g/mol</b></li>' +
      '<li>M₂(' + sub(f2) + ') = <b>' + n(M2) + ' g/mol</b></li></ul></div>' +
      '<div class="st-step"><div class="st-h">Graham\'s law</div><ul>' +
      '<li>rate₁ / rate₂ = √(M₂ / M₁) = √(' + n(M2) + ' / ' + n(M1) + ')</li>' +
      '<li>= <b class="st-ans">' + n(ratio) + '</b></li></ul></div>' +
      '<div class="st-step"><div class="st-h">What it means</div><p>' +
      (Math.abs(ratio - 1) < 1e-9
        ? 'Equal molar masses, so both effuse at the same rate.'
        : sub(ratio > 1 ? f1 : f2) + ' effuses <b>' + n(ratio > 1 ? ratio : 1 / ratio) +
          '×</b> faster than ' + sub(ratio > 1 ? f2 : f1) + ', because it is lighter. ' +
          'Effusion times are the other way round — the faster gas takes proportionally less time.') +
      '</p></div>';
  }
  g('glG1').addEventListener('input', solveGraham);
  g('glG2').addEventListener('input', solveGraham);
  solveGraham();
}
