/* Titration curve mathematics.

   Kept separate from the widget so the numbers can be checked on their own.
   Concentrations in mol/L, volumes in litres internally (the UI works in mL).

   Three systems are modelled — the ones a first course actually titrates:
     strong  : strong acid in the flask, strong base in the burette
     weak    : weak acid (Ka) in the flask, strong base in the burette
     weakbase: weak base (Kb) in the flask, strong acid in the burette

   pH comes from solving the exact charge balance numerically rather than
   from Henderson-Hasselbalch. H-H is what gets taught, and it is what the
   worked steps quote, but it is an approximation that ignores water's own
   ionisation — for a very weak acid (Ka around 1e-10) it puts a visible
   2 pH-unit discontinuity at the start of the curve, which looks like a bug
   and teaches the wrong shape. Bisection costs nothing here and is right for
   any K a student types in. */

const KW = 1e-14;

export function equivalenceVolume(Ca, Va, Cb) {
  return Ca * Va / Cb;                       /* litres of titrant */
}

/* Solve f(h) = 0 for [H+] by bisection on pH.
   f is monotonically increasing in h for every system below, so a plain
   bisection over pH 15 → -1 is both safe and quick. */
function solveH(f) {
  let lo = -1, hi = 15;                      /* pH bounds */
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(Math.pow(10, -mid)) > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;                      /* the pH */
}

/* pH after Vb litres of titrant have been added. */
export function pHat(sys, p, Vb) {
  const Ca = p.Ca, Va = p.Va, Cb = p.Cb;
  const Vt = Va + Vb;
  const Ct = Ca * Va / Vt;                   /* analyte, diluted */
  const Cx = Cb * Vb / Vt;                   /* titrant counter-ion, diluted */

  if (sys === 'strong') {
    /* [Na+] + [H+] = [OH-] + [A-], with the strong acid fully dissociated */
    return solveH(function (h) { return Cx + h - KW / h - Ct; });
  }

  if (sys === 'weak') {
    /* [A-] = Ct · Ka/(Ka + h) — the fraction of the acid that is ionised */
    const Ka = p.Ka;
    return solveH(function (h) { return Cx + h - KW / h - Ct * Ka / (Ka + h); });
  }

  /* weak base in the flask, strong acid in the burette.
     [BH+] = Ct · h/(h + Ka), where Ka is that of the conjugate acid. */
  const Ka = KW / p.Kb;
  return solveH(function (h) { return Ct * h / (h + Ka) + h - KW / h - Cx; });
}

/* Sample the curve, clustering points near the equivalence volume where the
   pH moves fastest. A uniform grid there draws a visibly flat-topped jump. */
export function curve(sys, p) {
  const Veq = equivalenceVolume(p.Ca, p.Va, p.Cb);
  const fractions = [];
  const push = function (f) { if (f >= 0 && f <= 2) fractions.push(f); };

  for (let f = 0; f <= 2.0001; f += 0.02) push(f);
  /* A very weak acid rises steeply over the first few percent, before any
     buffering exists — real, but coarse sampling renders it as a corner. */
  for (let f = 0; f <= 0.05001; f += 0.002) push(f);
  for (let f = 0.90; f <= 1.10001; f += 0.005) push(f);
  for (let f = 0.980; f <= 1.02001; f += 0.001) push(f);

  const uniq = fractions.filter(function (f, i, a) { return i === 0 || Math.abs(f - a[i - 1]) > 1e-9; })
    .sort(function (a, b) { return a - b; });

  return uniq.map(function (f) {
    return { V: f * Veq, pH: clamp(pHat(sys, p, f * Veq)) };
  }).filter(function (pt) { return isFinite(pt.pH); });
}

function clamp(x) { return Math.max(0, Math.min(14, x)); }

/* The points worth labelling, which are also the rows of the table view. */
export function keyPoints(sys, p) {
  const Veq = equivalenceVolume(p.Ca, p.Va, p.Cb);
  const rows = [];

  rows.push({ k: 'start', label: 'Start (no titrant)', V: 0, pH: clamp(pHat(sys, p, 0)),
    note: sys === 'strong' ? 'pH = −log[H⁺] of the strong acid'
        : sys === 'weak' ? 'weak acid alone — solve Ka'
                         : 'weak base alone — solve Kb' });

  if (sys !== 'strong') {
    const half = Veq / 2;
    rows.push({ k: 'half', label: 'Half-equivalence', V: half, pH: clamp(pHat(sys, p, half)),
      note: sys === 'weak' ? 'half the acid is converted, so pH = pKa'
                           : 'half the base is converted, so pOH = pKb' });
  }

  rows.push({ k: 'eq', label: 'Equivalence point', V: Veq, pH: clamp(pHat(sys, p, Veq)),
    note: sys === 'strong' ? 'neutral salt — pH 7'
        : sys === 'weak' ? 'only the conjugate base remains, so pH > 7'
                         : 'only the conjugate acid remains, so pH < 7' });

  rows.push({ k: 'excess', label: 'Excess titrant (2 × V(eq))', V: 2 * Veq, pH: clamp(pHat(sys, p, 2 * Veq)),
    note: 'the excess strong titrant now sets the pH' });

  return rows;
}
