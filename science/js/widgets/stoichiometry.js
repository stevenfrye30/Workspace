/* Limiting reagent, theoretical yield, excess and percent yield.

   The point of this tool is the working, not the answer — a student who is
   handed "15.05 g" learns nothing. Every stage is laid out the way it would
   be on paper, so it can be read aloud line by line during a session. */

import { parseEquation, balanceCheck } from '../chem/formula.js';
import { esc } from '../format.js';

const EXAMPLES = [
  { label: "Al + Cl₂", eq: "2 Al + 3 Cl2 -> 2 AlCl3", amts: ["5.4", "12.0"], actual: "" },
  { label: "N₂ + H₂ (Haber)", eq: "N2 + 3 H2 -> 2 NH3", amts: ["28.0", "5.0"], actual: "25.0" },
  { label: "Combustion of propane", eq: "C3H8 + 5 O2 -> 3 CO2 + 4 H2O", amts: ["22.0", "80.0"], actual: "" },
  { label: "Precipitation", eq: "AgNO3 + NaCl -> AgCl + NaNO3", amts: ["8.5", "3.0"], actual: "6.2" }
];

/* Round for display without pretending to more precision than we have. */
function n(x, sig) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a < 1e-4 || a >= 1e7) return x.toExponential(3);
  return String(parseFloat(x.toPrecision(sig || 4)));
}

function sub(f) { return esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }

export function block() {
  const exOpts = EXAMPLES.map(function (e, i) {
    return '<option value="' + i + '">' + esc(e.label) + '</option>';
  }).join('');

  return '<section class="block stoich" id="stoich">' +
    '<div class="block-head"><h2>Limiting Reagent &amp; Yield</h2><span class="tag">Instrument</span>' +
    '<p>Type a balanced equation and how much of each reactant you have. ' +
    'Every step is shown — moles, mole ratio, which reactant runs out first, ' +
    'theoretical yield, what is left over, and percent yield.</p></div>' +

    '<div class="st-row">' +
      '<input class="st-eq" id="stEq" type="text" spellcheck="false" autocomplete="off" ' +
        'placeholder="e.g. 2 Al + 3 Cl2 -> 2 AlCl3">' +
      '<select class="u-select st-ex" id="stExample" style="flex:0 0 12rem">' +
        '<option value="">Load an example…</option>' + exOpts +
      '</select>' +
    '</div>' +
    '<div class="st-balance" id="stBalance"></div>' +

    '<div id="stInputs"></div>' +

    '<div class="st-row st-actual">' +
      '<label for="stActual">Actual yield obtained (g) — optional</label>' +
      '<input class="u-input" id="stActual" type="number" step="any" placeholder="e.g. 12.4">' +
    '</div>' +

    '<div class="st-out" id="stOut"></div>' +
    '</section>';
}

export function init() {
  const root = document.getElementById('stoich');
  if (!root) return;

  const eqInput = document.getElementById('stEq');
  const exSel = document.getElementById('stExample');
  const balanceEl = document.getElementById('stBalance');
  const inputsEl = document.getElementById('stInputs');
  const actualEl = document.getElementById('stActual');
  const outEl = document.getElementById('stOut');

  let eq = null;          // parsed equation
  let amounts = [];       // one {value, unit} per reactant
  let productIdx = 0;

  function renderInputs() {
    if (!eq) { inputsEl.innerHTML = ''; return; }
    const rows = eq.reactants.map(function (r, i) {
      const a = amounts[i] || { value: '', unit: 'g' };
      return '<div class="st-reactant">' +
        '<span class="st-name">' + sub(r.formula) + '</span>' +
        '<span class="st-mm">' + n(r.mass) + ' g/mol</span>' +
        '<input class="u-input st-amt" data-i="' + i + '" type="number" step="any" ' +
          'value="' + esc(a.value) + '" placeholder="amount">' +
        '<select class="u-select st-unit" data-i="' + i + '" style="flex:0 0 6rem">' +
          '<option value="g"' + (a.unit === 'g' ? ' selected' : '') + '>grams</option>' +
          '<option value="mol"' + (a.unit === 'mol' ? ' selected' : '') + '>moles</option>' +
        '</select></div>';
    }).join('');

    const prodOpts = eq.products.map(function (p, i) {
      return '<option value="' + i + '"' + (i === productIdx ? ' selected' : '') + '>' +
        esc(p.formula) + '</option>';
    }).join('');

    inputsEl.innerHTML = '<div class="st-label">How much of each reactant do you have?</div>' +
      rows +
      '<div class="st-row st-product"><label for="stProduct">Product to track</label>' +
      '<select class="u-select" id="stProduct" style="flex:0 0 12rem">' + prodOpts + '</select></div>';

    inputsEl.querySelectorAll('.st-amt').forEach(function (el) {
      el.addEventListener('input', function () {
        amounts[+el.dataset.i].value = el.value;
        solve();
      });
    });
    inputsEl.querySelectorAll('.st-unit').forEach(function (el) {
      el.addEventListener('change', function () {
        amounts[+el.dataset.i].unit = el.value;
        solve();
      });
    });
    document.getElementById('stProduct').addEventListener('change', function (e) {
      productIdx = +e.target.value;
      solve();
    });
  }

  function readEquation() {
    balanceEl.className = 'st-balance';
    const text = eqInput.value.trim();
    if (!text) { eq = null; balanceEl.textContent = ''; inputsEl.innerHTML = ''; outEl.innerHTML = ''; return; }
    try {
      eq = parseEquation(text);
    } catch (err) {
      eq = null;
      balanceEl.className = 'st-balance bad';
      balanceEl.textContent = err.message;
      inputsEl.innerHTML = '';
      outEl.innerHTML = '';
      return;
    }
    amounts = eq.reactants.map(function (_, i) {
      return amounts[i] || { value: '', unit: 'g' };
    }).slice(0, eq.reactants.length);
    if (productIdx >= eq.products.length) productIdx = 0;

    const bal = balanceCheck(eq);
    if (bal.balanced) {
      balanceEl.className = 'st-balance ok';
      balanceEl.innerHTML = '✓ Balanced — ' + bal.rows.map(function (r) {
        return esc(r.el) + ' ' + r.left;
      }).join(' · ');
    } else {
      balanceEl.className = 'st-balance warn';
      const off = bal.rows.filter(function (r) { return r.left !== r.right; });
      balanceEl.innerHTML = '⚠ Not balanced — ' + off.map(function (r) {
        return '<b>' + esc(r.el) + '</b> ' + r.left + ' left vs ' + r.right + ' right';
      }).join('; ') + '. Balance it first or the yield will be wrong.';
    }
    renderInputs();
    solve();
  }

  function solve() {
    if (!eq) { outEl.innerHTML = ''; return; }
    const prod = eq.products[productIdx];

    /* Every reactant needs a usable amount before there is anything to solve. */
    const given = amounts.map(function (a) { return parseFloat(a.value); });
    if (given.some(function (v) { return isNaN(v) || v < 0; })) {
      outEl.innerHTML = '<div class="st-hint">Enter an amount for every reactant to see the working.</div>';
      return;
    }

    let h = '';

    /* Step 1 — moles of each reactant */
    const moles = eq.reactants.map(function (r, i) {
      return amounts[i].unit === 'mol' ? given[i] : given[i] / r.mass;
    });
    h += '<div class="st-step"><div class="st-h">Step 1 — moles of each reactant</div><ul>';
    eq.reactants.forEach(function (r, i) {
      h += '<li>' + sub(r.formula) + ': ' + (amounts[i].unit === 'mol'
        ? n(given[i]) + ' mol (given)'
        : n(given[i]) + ' g ÷ ' + n(r.mass) + ' g/mol = <b>' + n(moles[i]) + ' mol</b>') + '</li>';
    });
    h += '</ul></div>';

    /* Step 2 — how much product each reactant could make on its own */
    const possible = eq.reactants.map(function (r, i) {
      return moles[i] * (prod.coef / r.coef);
    });
    h += '<div class="st-step"><div class="st-h">Step 2 — product each reactant could make (mole ratio)</div><ul>';
    eq.reactants.forEach(function (r, i) {
      h += '<li>' + sub(r.formula) + ': ' + n(moles[i]) + ' mol × ' +
        prod.coef + '/' + r.coef + ' = <b>' + n(possible[i]) + ' mol</b> ' + sub(prod.formula) + '</li>';
    });
    h += '</ul></div>';

    /* Step 3 — smallest wins */
    let limIdx = 0;
    possible.forEach(function (p, i) { if (p < possible[limIdx]) limIdx = i; });
    const lim = eq.reactants[limIdx];
    const theoreticalMol = possible[limIdx];
    const theoreticalG = theoreticalMol * prod.mass;

    /* Reactants within 0.1% of each other count as an exact stoichiometric
       ratio. Tabulated atomic masses are not round numbers — O is 15.999, so
       "32 g of O2" is 1.0000625 mol — and reporting a 0.0001 mol excess from
       that is noise, not chemistry. 0.1% sits well below the 3-4 significant
       figures a general-chemistry problem works to. */
    const TOL = 1e-3;
    const tie = possible.filter(function (p) {
      return Math.abs(p - theoreticalMol) <= theoreticalMol * TOL;
    }).length > 1;

    h += '<div class="st-step"><div class="st-h">Step 3 — the smallest number wins</div>' +
      (tie
        ? '<p>Every reactant produces the same amount, so they are in exact stoichiometric ratio — ' +
          'nothing is left over and there is no single limiting reactant.</p>'
        : '<p>' + sub(lim.formula) + ' makes the least product, so <b class="st-lim">' +
          sub(lim.formula) + ' is the limiting reactant</b>. It runs out first and sets the yield.</p>') +
      '</div>';

    /* Step 4 — theoretical yield */
    h += '<div class="st-step"><div class="st-h">Step 4 — theoretical yield</div><ul>' +
      '<li>' + n(theoreticalMol) + ' mol × ' + n(prod.mass) + ' g/mol = ' +
      '<b class="st-ans">' + n(theoreticalG) + ' g</b> ' + sub(prod.formula) + '</li></ul></div>';

    /* Step 5 — leftovers */
    const excess = eq.reactants.map(function (r, i) {
      const used = theoreticalMol * (r.coef / prod.coef);
      return { i: i, used: used, leftMol: moles[i] - used };
    }).filter(function (e) { return e.leftMol > moles[e.i] * TOL; });

    if (excess.length) {
      h += '<div class="st-step"><div class="st-h">Step 5 — what is left over</div><ul>';
      excess.forEach(function (e) {
        const r = eq.reactants[e.i];
        h += '<li>' + sub(r.formula) + ': used ' + n(e.used) + ' mol, ' +
          'started with ' + n(moles[e.i]) + ' mol → <b>' + n(e.leftMol) + ' mol</b> left' +
          ' (' + n(e.leftMol * r.mass) + ' g)</li>';
      });
      h += '</ul></div>';
    }

    /* Step 6 — percent yield, only when an actual yield is supplied */
    const actual = parseFloat(actualEl.value);
    if (!isNaN(actual) && actual >= 0 && theoreticalG > 0) {
      const pct = actual / theoreticalG * 100;
      h += '<div class="st-step"><div class="st-h">Step 6 — percent yield</div><ul>' +
        '<li>' + n(actual) + ' g ÷ ' + n(theoreticalG) + ' g × 100 = ' +
        '<b class="st-ans">' + n(pct, 4) + '%</b></li>' +
        (pct > 100 ? '<li class="st-flag">Over 100% — the product is probably still wet, ' +
          'or the actual yield was measured before drying.</li>' : '') +
        '</ul></div>';
    }

    outEl.innerHTML = h;
  }

  eqInput.addEventListener('input', readEquation);
  actualEl.addEventListener('input', solve);
  exSel.addEventListener('change', function () {
    const e = EXAMPLES[exSel.value];
    if (!e) return;
    eqInput.value = e.eq;
    amounts = e.amts.map(function (v) { return { value: v, unit: 'g' }; });
    actualEl.value = e.actual;
    productIdx = 0;
    readEquation();
    exSel.value = '';
  });

  /* Open on a worked example so the tool explains itself. */
  eqInput.value = EXAMPLES[0].eq;
  amounts = EXAMPLES[0].amts.map(function (v) { return { value: v, unit: 'g' }; });
  readEquation();
}
