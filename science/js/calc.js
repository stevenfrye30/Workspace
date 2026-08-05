/* Scientific calculator core.

   Builds itself inside whatever element it is handed and wires its own keys,
   so there are no global ids and several instances can coexist. The header
   dock is the only caller today; keeping it mountable means an inline one can
   be added anywhere later without a second copy of the evaluator. */

const BUTTONS = [
  ['sin', 'fn', 'fn:Math.sin('], ['cos', 'fn', 'fn:Math.cos('], ['tan', 'fn', 'fn:Math.tan('],
  ['log', 'fn', 'fn:Math.log10('], ['ln', 'fn', 'fn:Math.log('],
  ['x²', 'fn', 'add:**2'], ['√', 'fn', 'fn:Math.sqrt('], ['π', 'fn', 'add:Math.PI'],
  ['e', 'fn', 'add:Math.E'], ['xʸ', 'fn', 'add:**'],
  ['C', 'clear', 'clr'], ['(', 'op', 'add:('], [')', 'op', 'add:)'],
  ['%', 'op', 'add:%'], ['÷', 'op', 'add:/'],
  ['7', '', 'add:7'], ['8', '', 'add:8'], ['9', '', 'add:9'], ['×', 'op', 'add:*'], ['⌫', 'clear', 'bksp'],
  ['4', '', 'add:4'], ['5', '', 'add:5'], ['6', '', 'add:6'], ['−', 'op', 'add:-'], ['EE', 'fn', 'add:e'],
  ['1', '', 'add:1'], ['2', '', 'add:2'], ['3', '', 'add:3'], ['+', 'op', 'add:+'], ['Ans', 'fn', 'ans'],
  ['0', 'wide', 'add:0'], ['.', '', 'add:.'], ['=', 'eq wide', 'eval']
];

export function mount(root) {
  root.classList.add('calc');
  root.tabIndex = 0;
  root.innerHTML =
    '<div class="calc-display"><div class="calc-expr"></div><div class="calc-result">0</div></div>' +
    '<div class="calc-grid"></div>';

  const exprEl = root.querySelector('.calc-expr');
  const resEl = root.querySelector('.calc-result');
  const grid = root.querySelector('.calc-grid');
  let expr = '', result = '0', lastWasResult = false;

  function draw() {
    exprEl.textContent = expr
      .replace(/Math\.sin\(/g, 'sin(').replace(/Math\.cos\(/g, 'cos(').replace(/Math\.tan\(/g, 'tan(')
      .replace(/Math\.log10\(/g, 'log(').replace(/Math\.log\(/g, 'ln(').replace(/Math\.sqrt\(/g, '√(')
      .replace(/Math\.PI/g, 'π').replace(/Math\.E/g, 'e')
      .replace(/\*\*/g, '^').replace(/\*/g, '×').replace(/\//g, '÷');
    resEl.textContent = result;
  }
  function add(v) { if (lastWasResult && /^[0-9.]/.test(v)) expr = ''; lastWasResult = false; expr += v; draw(); }
  function fn(p) { if (lastWasResult) expr = ''; lastWasResult = false; expr += p; draw(); }
  function clr() { expr = ''; result = '0'; lastWasResult = false; draw(); }
  function bksp() { expr = expr.slice(0, -1); lastWasResult = false; draw(); }

  function evaluate() {
    if (!expr) return;
    try {
      /* Only the Math.* names the keypad can produce are allowed through; any
         other identifier means something was typed that should not evaluate. */
      const safe = expr.replace(/Math\.(sin|cos|tan|log|log10|sqrt|PI|E|abs|pow|ceil|floor|cbrt|exp)\b/g, 'S');
      if (/[a-zA-Z]/.test(safe.replace(/S/g, '').replace(/e[+-]?\d/g, ''))) throw 0;
      const val = Function('"use strict";return(' + expr + ')')();
      result = (typeof val === 'number' && isFinite(val)) ? String(parseFloat(val.toPrecision(12))) : 'Error';
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
  });

  draw();
  return { focus: function () { root.focus(); } };
}
