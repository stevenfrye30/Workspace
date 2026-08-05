import { POLYATOMIC, OXYANION_PATTERN, SOLUBILITY, STRONG_ACIDS, STRONG_BASES,
         KA, KB, KA_KB_NOTES } from '../data/chem-tables.js';
import { esc } from '../format.js';

/* A bare formula: every digit is an atom count, so subscript them all.
   Only safe on pure formulas (SO4, Ca(OH)2) — never on prose. */
function fmtFormula(f) {
  return esc(f).replace(/(\d+)/g, '<sub>$1</sub>');
}

/* Mixed formula-and-prose, where digits can mean either an atom count or a
   charge ("Group 1 cations … Ba^{2+}"). Nothing is inferred: _ marks a
   subscript, ^ a superscript, and {} groups multi-character runs.
   A hyphen in a charge is rendered as a true minus sign. */
function fmtChem(s) {
  return esc(s)
    .replace(/_\{([^}]*)\}/g, '<sub>$1</sub>')
    .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
    .replace(/_(\d+)/g, '<sub>$1</sub>')
    .replace(/\^(\d*[+\-−])/g, '<sup>$1</sup>')
    .replace(/(<sup>[^<]*)-/g, '$1−');
}

/* Render an integer charge as a superscript: -2 -> 2−, 1 -> + */
function fmtCharge(c) {
  if (!c) return '';
  const sign = c > 0 ? '+' : '−';
  const mag = Math.abs(c) === 1 ? '' : Math.abs(c);
  return '<sup>' + mag + sign + '</sup>';
}

function ion(r) { return fmtFormula(r.f) + fmtCharge(r.c); }

/* Scientific notation for Ka/Kb: 1.8e-5 -> 1.8 × 10⁻⁵ */
const SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
              '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻' };
function sci(x) {
  const [m, e] = x.toExponential(1).split('e');
  return m + ' × 10' + String(e).replace(/[-0-9]/g, function (d) { return SUP[d]; });
}

export function block() {
  const poly = POLYATOMIC.map(function (r) {
    return '<tr data-s="' + esc(r.n + ' ' + r.f + ' ' + (r.alt || '')) + '">' +
      '<td>' + esc(r.n) + '</td><td class="rt-f">' + ion(r) + '</td>' +
      '<td class="rt-note">' + fmtChem(r.alt || '') + '</td></tr>';
  }).join('');

  const pattern = OXYANION_PATTERN.map(function (r) {
    return '<tr><td class="rt-f">' + esc(r.prefix) + '</td>' +
      '<td class="rt-f">' + ion(r) + '</td>' +
      '<td class="rt-note">' + esc(r.meaning) + '</td></tr>';
  }).join('');

  const sol = SOLUBILITY.map(function (r, i) {
    return '<tr data-s="' + esc(r.rule + ' ' + r.verdict + ' ' + r.exceptions) + '">' +
      '<td class="rt-n">' + (i + 1) + '</td>' +
      '<td>' + fmtChem(r.rule) + '</td>' +
      '<td><span class="rt-verdict ' + r.verdict + '">' + r.verdict + '</span></td>' +
      '<td class="rt-note">' + fmtChem(r.exceptions) + '</td></tr>';
  }).join('');

  const acids = STRONG_ACIDS.map(function (r) {
    return '<tr data-s="' + esc(r.f + ' ' + r.n) + '"><td class="rt-f">' + fmtFormula(r.f) + '</td>' +
      '<td>' + esc(r.n) + '</td><td class="rt-note">' + esc(r.note || '') + '</td></tr>';
  }).join('');

  const bases = STRONG_BASES.map(function (r) {
    return '<tr data-s="' + esc(r.f + ' ' + r.n) + '"><td class="rt-f">' + fmtFormula(r.f) + '</td>' +
      '<td>' + esc(r.n) + '</td><td class="rt-note">' + esc(r.note || '') + '</td></tr>';
  }).join('');

  const ka = KA.map(function (r) {
    return '<tr data-s="' + esc(r.f + ' ' + r.n) + '"><td class="rt-f">' + ion(r) + '</td>' +
      '<td>' + esc(r.n) + '</td><td class="rt-val">' + sci(r.ka) + '</td>' +
      '<td class="rt-val">' + r.pka.toFixed(2) + '</td>' +
      '<td class="rt-note">' + esc(r.note || '') + '</td></tr>';
  }).join('');

  const kb = KB.map(function (r) {
    return '<tr data-s="' + esc(r.f + ' ' + r.n) + '"><td class="rt-f">' + fmtFormula(r.f) + '</td>' +
      '<td>' + esc(r.n) + '</td><td class="rt-val">' + sci(r.kb) + '</td>' +
      '<td class="rt-val">' + r.pkb.toFixed(2) + '</td>' +
      '<td class="rt-note">' + esc(r.note || '') + '</td></tr>';
  }).join('');

  const notes = KA_KB_NOTES.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');

  return '<section class="block rt" id="refTables">' +
    '<div class="block-head"><h2>Search every table</h2><span class="tag">Lookup</span>' +
    '<p>One search box across all four tables. Use <b>Bigger</b> when screen-sharing ' +
    'and <b>Print</b> to turn whichever tab is open into a handout.</p></div>' +

    '<div class="rt-bar">' +
      '<input class="rt-search" id="rtSearch" type="text" placeholder="Search any table — name, formula, ion…" autocomplete="off" spellcheck="false">' +
      '<button class="rt-btn" id="rtBigger" type="button" aria-pressed="false">Bigger</button>' +
      '<button class="rt-btn" id="rtPrint" type="button">Print</button>' +
      '<span class="rt-count" id="rtCount"></span>' +
    '</div>' +

    '<div class="u-tabs" id="rtTabs">' +
      '<button class="u-tab on" type="button" data-pane="ions">Polyatomic ions</button>' +
      '<button class="u-tab" type="button" data-pane="solubility">Solubility</button>' +
      '<button class="u-tab" type="button" data-pane="strong">Strong acids &amp; bases</button>' +
      '<button class="u-tab" type="button" data-pane="ka">K<sub>a</sub> / K<sub>b</sub></button>' +
      '<button class="u-tab" type="button" data-pane="all">All</button>' +
    '</div>' +

    '<div class="rt-pane on" data-pane="ions">' +
      '<h3 class="rt-h">Polyatomic ions</h3>' +
      '<table class="rt-table"><thead><tr><th>Name</th><th>Ion</th><th>Also called</th></tr></thead>' +
      '<tbody>' + poly + '</tbody></table>' +
      '<h3 class="rt-h">The oxyanion pattern</h3>' +
      '<p class="rt-sub">Learn one reference ion per family and the rest follow. Chlorine shown; ' +
      'bromine, iodine, nitrogen and sulfur behave the same way.</p>' +
      '<table class="rt-table"><thead><tr><th>Name form</th><th>Example</th><th>Oxygens</th></tr></thead>' +
      '<tbody>' + pattern + '</tbody></table>' +
    '</div>' +

    '<div class="rt-pane" data-pane="solubility">' +
      '<h3 class="rt-h">Solubility rules for ionic compounds in water</h3>' +
      '<p class="rt-sub">Apply in order — an earlier rule wins when two disagree.</p>' +
      '<table class="rt-table"><thead><tr><th>#</th><th>Contains</th><th>Result</th><th>Exceptions</th></tr></thead>' +
      '<tbody>' + sol + '</tbody></table>' +
    '</div>' +

    '<div class="rt-pane" data-pane="strong">' +
      '<h3 class="rt-h">Strong acids</h3>' +
      '<p class="rt-sub">These ionise completely. Everything else is a weak acid — use K<sub>a</sub>.</p>' +
      '<table class="rt-table"><thead><tr><th>Formula</th><th>Name</th><th>Note</th></tr></thead>' +
      '<tbody>' + acids + '</tbody></table>' +
      '<h3 class="rt-h">Strong bases</h3>' +
      '<p class="rt-sub">Group 1 hydroxides, plus the heavier Group 2 hydroxides.</p>' +
      '<table class="rt-table"><thead><tr><th>Formula</th><th>Name</th><th>Note</th></tr></thead>' +
      '<tbody>' + bases + '</tbody></table>' +
    '</div>' +

    '<div class="rt-pane" data-pane="ka">' +
      '<h3 class="rt-h">Weak acids — K<sub>a</sub> at 25 °C</h3>' +
      '<table class="rt-table"><thead><tr><th>Formula</th><th>Name</th><th>K<sub>a</sub></th><th>pK<sub>a</sub></th><th>Note</th></tr></thead>' +
      '<tbody>' + ka + '</tbody></table>' +
      '<h3 class="rt-h">Weak bases — K<sub>b</sub> at 25 °C</h3>' +
      '<table class="rt-table"><thead><tr><th>Formula</th><th>Name</th><th>K<sub>b</sub></th><th>pK<sub>b</sub></th><th>Note</th></tr></thead>' +
      '<tbody>' + kb + '</tbody></table>' +
      '<ul class="rt-notes">' + notes + '</ul>' +
    '</div>' +

    '</section>';
}

export function init() {
  const root = document.getElementById('refTables');
  if (!root) return;

  const tabs = root.querySelectorAll('#rtTabs .u-tab');
  const panes = root.querySelectorAll('.rt-pane');
  const search = document.getElementById('rtSearch');
  const count = document.getElementById('rtCount');
  const bigger = document.getElementById('rtBigger');

  function showPane(name) {
    tabs.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-pane') === name); });
    if (name === 'all') {
      panes.forEach(function (p) { p.classList.add('on'); });
    } else {
      panes.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === name); });
    }
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPane(t.getAttribute('data-pane')); });
  });

  /* Searching spans every table, so it switches to the All view and reports
     how many rows survived — otherwise a hit in a hidden pane looks like none. */
  function filter() {
    const q = (search.value || '').trim().toLowerCase();
    if (q) showPane('all');
    let shown = 0, total = 0;
    root.querySelectorAll('tbody tr').forEach(function (tr) {
      total++;
      const hay = (tr.getAttribute('data-s') || tr.textContent).toLowerCase();
      const hit = !q || hay.indexOf(q) >= 0;
      tr.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    /* Hide a table whose rows are all filtered out, and its heading. */
    root.querySelectorAll('.rt-table').forEach(function (tbl) {
      const any = tbl.querySelector('tbody tr:not([style*="none"])');
      tbl.style.display = any ? '' : 'none';
    });
    count.textContent = q ? shown + ' of ' + total + ' rows' : '';
  }
  search.addEventListener('input', filter);
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { search.value = ''; filter(); showPane('ions'); }
  });

  bigger.addEventListener('click', function () {
    const on = root.classList.toggle('rt-big');
    bigger.setAttribute('aria-pressed', String(on));
    bigger.textContent = on ? 'Smaller' : 'Bigger';
  });

  document.getElementById('rtPrint').addEventListener('click', function () {
    /* Print whatever is on screen: the print stylesheet drops everything
       except this section, so the current tab becomes the handout. */
    window.print();
  });

  filter();
}
