/* Chemical formula and equation parsing.

   Extracted from the chemistry calculator widget so the stoichiometry tool
   can share it rather than carry a second copy of the same parser.

   parseFormula returns element counts rather than a mass, because
   stoichiometry needs the counts to check that an equation balances. Mass
   is derived from the counts. */

import { ELEMENTS } from '../data/elements.js';

/* Symbol -> atomic mass. Synthetic elements carry a bracketed mass number
   ("[98]"); strip the brackets so they still have a usable value. */
export const MASS = {};
ELEMENTS.forEach(function (el) {
  const m = (typeof el.m === 'string') ? parseFloat(el.m.replace(/[[\]]/g, '')) : el.m;
  MASS[el.s] = m;
});

/* Split a trailing physical-state label off a formula: "H2O(l)" -> H2O + "l".
   Only a trailing (s)/(l)/(g)/(aq) counts, so Ca(OH)2 keeps its parentheses.
   State is not decoration — H2O(l) and H2O(g) have different enthalpies of
   formation, so anything thermochemical has to keep them apart. */
export function splitState(input) {
  const s = String(input).replace(/\s+/g, '');
  const m = s.match(/^(.*?)\((s|l|g|aq)\)$/i);
  return m ? { formula: m[1], state: m[2].toLowerCase() }
           : { formula: s, state: null };
}

/* Parse a neutral formula into element counts.
   Handles nested parentheses/brackets and hydrate dots: CuSO4·5H2O.
   A trailing state label is ignored, so H2O(l) parses like H2O. */
export function parseFormula(input) {
  const f = splitState(input).formula;
  if (!f) throw new Error('Enter a formula');

  const total = {};
  /* Hydrates: each dot-separated segment may carry its own multiplier. */
  f.split(/[.·•]/).forEach(function (seg) {
    if (!seg) return;
    let mult = 1;
    const lead = seg.match(/^(\d+)([A-Za-z([].*)$/);
    if (lead) { mult = parseInt(lead[1], 10); seg = lead[2]; }
    const counts = parseSegment(seg);
    Object.keys(counts).forEach(function (el) {
      total[el] = (total[el] || 0) + counts[el] * mult;
    });
  });
  if (!Object.keys(total).length) throw new Error('Enter a formula');
  return total;
}

function parseSegment(str) {
  let i = 0;

  function number() {
    let n = '';
    while (i < str.length && /[0-9]/.test(str[i])) { n += str[i]; i++; }
    return n === '' ? 1 : parseInt(n, 10);
  }

  function group(depth) {
    const acc = {};
    while (i < str.length) {
      const ch = str[i];
      if (ch === '(' || ch === '[') {
        i++;
        const inner = group(depth + 1);
        const mult = number();
        Object.keys(inner).forEach(function (el) {
          acc[el] = (acc[el] || 0) + inner[el] * mult;
        });
      } else if (ch === ')' || ch === ']') {
        if (!depth) throw new Error('Unmatched “' + ch + '”');
        i++;
        return acc;
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch; i++;
        while (i < str.length && /[a-z]/.test(str[i])) { sym += str[i]; i++; }
        if (!(sym in MASS)) throw new Error('Unknown element “' + sym + '”');
        acc[sym] = (acc[sym] || 0) + number();
      } else {
        throw new Error('Unexpected “' + ch + '”');
      }
    }
    if (depth) throw new Error('Unclosed parenthesis');
    return acc;
  }

  return group(0);
}

/* Molar mass in g/mol. Throws with a readable message on bad input. */
export function molarMass(input) {
  const counts = parseFormula(input);
  let m = 0;
  Object.keys(counts).forEach(function (el) { m += MASS[el] * counts[el]; });
  return m;
}

/* Parse "2 Al + 3 Cl2 -> 2 AlCl3" into both sides.
   Accepts ->, =>, →, or = as the arrow. */
export function parseEquation(input) {
  const raw = String(input).trim();
  if (!raw) throw new Error('Enter an equation');
  const parts = raw.split(/-+>|=+>|→|(?<![<>=])=(?![>=])/);
  if (parts.length !== 2) throw new Error('Use one arrow, e.g. 2 H2 + O2 -> 2 H2O');

  function side(text, which) {
    const terms = text.split('+').map(function (t) { return t.trim(); }).filter(Boolean);
    if (!terms.length) throw new Error('Nothing on the ' + which + ' side');
    return terms.map(function (t) {
      const m = t.match(/^(\d+)?\s*(.+)$/);
      const coef = m[1] ? parseInt(m[1], 10) : 1;
      if (coef === 0) throw new Error('A coefficient cannot be zero');
      const withState = m[2].replace(/\s+/g, '');
      const sp = splitState(withState);
      return {
        coef: coef,
        formula: sp.formula,          // bare formula, for mass and balancing
        state: sp.state,              // 's' | 'l' | 'g' | 'aq' | null
        label: withState,             // as the user typed it, for display
        counts: parseFormula(sp.formula),
        mass: molarMass(sp.formula)
      };
    });
  }

  return { reactants: side(parts[0], 'left'), products: side(parts[1], 'right') };
}

/* Atom balance. Returns the per-element totals so the caller can show a
   student exactly which element is off, not just that something is. */
export function balanceCheck(eq) {
  function tally(sideTerms) {
    const t = {};
    sideTerms.forEach(function (term) {
      Object.keys(term.counts).forEach(function (el) {
        t[el] = (t[el] || 0) + term.counts[el] * term.coef;
      });
    });
    return t;
  }
  const left = tally(eq.reactants), right = tally(eq.products);
  const elements = Object.keys(left).concat(Object.keys(right))
    .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  const rows = elements.map(function (el) {
    return { el: el, left: left[el] || 0, right: right[el] || 0 };
  });
  return { balanced: rows.every(function (r) { return r.left === r.right; }), rows: rows };
}
