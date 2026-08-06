/* Scientific calculator core.

   Builds itself inside whatever element it is handed and wires its own keys,
   so there are no global ids and several instances can coexist. The header
   dock is the only caller today; keeping it mountable means an inline one can
   be added anywhere later without a second copy of the evaluator.

   Angle mode is the reason the evaluator takes the shape it does. The trig
   keys used to insert the literal text "Math.sin(" into the expression, which
   meant radians and only radians — a student typing sin 30 on a worksheet got
   −0.988 instead of 0.5, with nothing on screen to say why. The keys now
   insert bare names, and the names are supplied as arguments to the evaluated
   function from SCOPE below, so sin() can read the current mode at the moment
   it is called. No string rewriting, and the sandbox gets tighter rather than
   looser: Math is not in scope at all any more. */

const ANGLE_KEY = 'scilab.calc.angle';

/* DEG is the default — a general-science student reaching for this is far
   likelier to be doing a triangle than an integral. */
function readAngle() {
  try { return localStorage.getItem(ANGLE_KEY) === 'RAD' ? 'RAD' : 'DEG'; }
  catch (e) { return 'DEG'; }
}
function saveAngle(v) { try { localStorage.setItem(ANGLE_KEY, v); } catch (e) {} }

/* Everything the expression is allowed to name. The check is whole-token, so
   "asin" passes on its own merits rather than by containing "sin", and
   anything not on this list — Math, constructor, a stray variable — refuses
   to evaluate. */
const ALLOWED = /^(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs|PI|E)$/;
function identifiersOk(src) {
  /* 1e5 and 2.5E-3 are numeric literals, not an identifier called e. */
  const stripped = src.replace(/(\d)[eE]([+-]?\d)/g, '$1$2');
  const ids = stripped.match(/[A-Za-z_$][A-Za-z0-9_$]*/g);
  return !ids || ids.every(function (id) { return ALLOWED.test(id); });
}

const BUTTONS = [
  ['sin', 'fn', 'fn:sin('], ['cos', 'fn', 'fn:cos('], ['tan', 'fn', 'fn:tan('],
  ['log', 'fn', 'fn:log('], ['ln', 'fn', 'fn:ln('],
  ['sin⁻¹', 'fn', 'fn:asin('], ['cos⁻¹', 'fn', 'fn:acos('], ['tan⁻¹', 'fn', 'fn:atan('],
  ['x²', 'fn', 'add:**2'], ['xʸ', 'fn', 'add:**'],
  ['√', 'fn', 'fn:sqrt('], ['π', 'fn', 'add:PI'], ['e', 'fn', 'add:E'],
  ['(', 'op', 'add:('], [')', 'op', 'add:)'],
  ['C', 'clear wide', 'clr'], ['⌫', 'clear', 'bksp'], ['%', 'op', 'add:%'], ['±', 'op', 'sign'],
  ['7', '', 'add:7'], ['8', '', 'add:8'], ['9', '', 'add:9'], ['÷', 'op', 'add:/'], ['×', 'op', 'add:*'],
  ['4', '', 'add:4'], ['5', '', 'add:5'], ['6', '', 'add:6'], ['−', 'op', 'add:-'], ['+', 'op', 'add:+'],
  ['1', '', 'add:1'], ['2', '', 'add:2'], ['3', '', 'add:3'], ['EE', 'fn', 'add:e'], ['Ans', 'fn', 'ans'],
  ['0', 'wide', 'add:0'], ['.', '', 'add:.'], ['=', 'eq wide', 'eval']
];

/* A trailing number, so ± knows what to flip. */
const TRAILING_NUM = /(\d*\.?\d+(?:[eE][+-]?\d+)?)$/;
/* Positions where a bare minus reads as "negate what follows". */
const UNARY_SPOT = /[+\-*/(^%]$/;

export function mount(root) {
  root.classList.add('calc');
  root.tabIndex = 0;
  root.innerHTML =
    '<div class="calc-display">' +
      '<div class="calc-top">' +
        '<div class="calc-mode" role="group" aria-label="Angle unit">' +
          '<button type="button" class="calc-mode-btn" data-angle="DEG">DEG</button>' +
          '<button type="button" class="calc-mode-btn" data-angle="RAD">RAD</button>' +
        '</div>' +
        '<div class="calc-expr"></div>' +
      '</div>' +
      '<div class="calc-result">0</div>' +
    '</div>' +
    '<div class="calc-grid"></div>';

  const exprEl = root.querySelector('.calc-expr');
  const resEl = root.querySelector('.calc-result');
  const grid = root.querySelector('.calc-grid');
  const modeBtns = Array.prototype.slice.call(root.querySelectorAll('.calc-mode-btn'));
  let expr = '', result = '0', lastWasResult = false;
  let angle = readAngle();

  /* Read at call time, not at mount time, so flipping the toggle changes what
     the next evaluation means without rebuilding anything. */
  function toRad(x) { return angle === 'DEG' ? x * Math.PI / 180 : x; }
  function fromRad(x) { return angle === 'DEG' ? x * 180 / Math.PI : x; }

  const SCOPE = {
    sin: function (x) { return Math.sin(toRad(x)); },
    cos: function (x) { return Math.cos(toRad(x)); },
    tan: function (x) { return Math.tan(toRad(x)); },
    asin: function (x) { return fromRad(Math.asin(x)); },
    acos: function (x) { return fromRad(Math.acos(x)); },
    atan: function (x) { return fromRad(Math.atan(x)); },
    log: function (x) { return Math.log10(x); },
    ln: function (x) { return Math.log(x); },
    sqrt: function (x) { return Math.sqrt(x); },
    abs: function (x) { return Math.abs(x); },
    PI: Math.PI,
    E: Math.E
  };
  const SCOPE_NAMES = Object.keys(SCOPE);

  function paintMode() {
    modeBtns.forEach(function (b) {
      const on = b.getAttribute('data-angle') === angle;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      angle = b.getAttribute('data-angle');
      saveAngle(angle);
      paintMode();
      /* A result already on screen was computed under the old mode; recompute
         it rather than leave a number that silently means something else. */
      if (lastWasResult && expr) evaluate();
      root.focus();
    });
  });

  function draw() {
    exprEl.textContent = expr
      .replace(/\bPI\b/g, 'π').replace(/\bE\b/g, 'e')
      .replace(/sqrt\(/g, '√(')
      .replace(/asin\(/g, 'sin⁻¹(').replace(/acos\(/g, 'cos⁻¹(').replace(/atan\(/g, 'tan⁻¹(')
      .replace(/\*\*/g, '^').replace(/\*/g, '×').replace(/\//g, '÷');
    resEl.textContent = result;
  }
  function fmt(v) { return String(parseFloat(v.toPrecision(12))); }
  function add(v) { if (lastWasResult && /^[0-9.]/.test(v)) expr = ''; lastWasResult = false; expr += v; draw(); }
  function fn(p) { if (lastWasResult) expr = ''; lastWasResult = false; expr += p; draw(); }
  function clr() { expr = ''; result = '0'; lastWasResult = false; draw(); }
  function bksp() { expr = expr.slice(0, -1); lastWasResult = false; draw(); }

  /* Flip the sign of whatever number is currently being entered — or of the
     result, if one is showing and the next thing typed would replace it. */
  function sign() {
    if (lastWasResult) {
      const v = parseFloat(result);
      if (!isFinite(v)) return;
      result = fmt(-v); expr = result; draw(); return;
    }
    const m = expr.match(TRAILING_NUM);
    if (!m) return;
    const num = m[1];
    const head = expr.slice(0, expr.length - num.length);
    if (/-$/.test(head) && (head.length === 1 || UNARY_SPOT.test(head.slice(0, -1)))) {
      expr = head.slice(0, -1) + num;            /* already negated — undo */
    } else if (head === '' || UNARY_SPOT.test(head)) {
      expr = head + '-' + num;
    } else {
      return;                                    /* nowhere safe to put it */
    }
    draw();
  }

  function evaluate() {
    if (!expr) return;
    try {
      /* % is a percentage here, not JavaScript's modulo — 200×50% is 100.
         The token stays in the expression so the display can keep saying "%". */
      const src = expr.replace(/%/g, '/100');
      if (!identifiersOk(src)) throw 0;
      const val = Function.apply(null, SCOPE_NAMES.concat('"use strict";return(' + src + ')'))
        .apply(null, SCOPE_NAMES.map(function (n) { return SCOPE[n]; }));
      result = (typeof val === 'number' && isFinite(val)) ? fmt(val) : 'Error';
    } catch (e) { result = 'Error'; }
    lastWasResult = true; draw();
  }

  BUTTONS.forEach(function (b) {
    const el = document.createElement('button');
    el.className = 'calc-btn ' + b[1];
    el.type = 'button';
    el.textContent = b[0];
    el.addEventListener('click', function () {
      const act = b[2];
      if (act === 'clr') clr();
      else if (act === 'bksp') bksp();
      else if (act === 'eval') evaluate();
      else if (act === 'sign') sign();
      else if (act === 'ans') add(result);
      else if (act.indexOf('add:') === 0) add(act.slice(4));
      else if (act.indexOf('fn:') === 0) fn(act.slice(3));
      root.focus();
    });
    grid.appendChild(el);
  });

  root.addEventListener('keydown', function (e) {
    const k = e.key;
    if (/^[0-9.+\-*/%()]$/.test(k)) { e.preventDefault(); add(k); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); evaluate(); }
    else if (k === 'Backspace') { e.preventDefault(); bksp(); }
    else if (k === 'Escape') { e.preventDefault(); clr(); }
    else if (k === 'n' || k === 'N') { e.preventDefault(); sign(); }
  });

  paintMode();
  draw();
  return { focus: function () { root.focus(); } };
}
