/* Math Lab — shared floating scientific calculator.
   Self-injecting: include <script src="calc.js" defer></script> on any
   Math page that loads atlas.css (for the warm palette variables).
   Renders a top-right summon button + a floating panel. Expandable:
   add buttons to BTNS or functions to the evaluator's switch. */
(function () {
  if (window.__mathCalcLoaded) return;
  window.__mathCalcLoaded = true;

  /* ---- Styles ---- */
  const css = `
  .calc-summon{position:fixed;top:1rem;right:1rem;z-index:60;display:inline-flex;align-items:center;gap:.45rem;
    font-family:var(--sans);font-size:.82rem;font-weight:600;color:var(--bg);
    background:linear-gradient(160deg,var(--m-graph,#4a5670),color-mix(in srgb,var(--m-graph,#4a5670) 70%,#000));
    border:1px solid color-mix(in srgb,var(--m-graph,#4a5670) 60%,#000);border-radius:999px;padding:.5rem .9rem;
    cursor:pointer;box-shadow:0 4px 14px -4px rgba(0,0,0,.35);transition:transform .12s ease,box-shadow .2s ease;}
  .calc-summon:hover{transform:translateY(-1px);box-shadow:0 7px 18px -5px rgba(0,0,0,.4);}
  .calc-summon .ic{font-size:1rem;}
  .calc-backdrop{position:fixed;inset:0;z-index:70;background:rgba(30,22,14,.32);backdrop-filter:blur(2px);display:none;}
  .calc-backdrop.open{display:block;}
  .calc-panel{position:fixed;top:3.6rem;right:1rem;z-index:80;width:19rem;max-width:calc(100vw - 2rem);
    background:var(--bg);border:1px solid var(--rule-warm,#c8b88f);border-radius:8px;
    box-shadow:0 18px 50px -12px rgba(40,26,12,.5);padding:.85rem;display:none;font-family:var(--sans);}
  .calc-panel.open{display:block;}
  .calc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.55rem;}
  .calc-head h2{font-family:var(--serif);font-size:1rem;font-weight:700;margin:0;color:var(--ink);}
  .calc-tools{display:flex;align-items:center;gap:.4rem;}
  .calc-mode{font-size:.62rem;font-weight:700;letter-spacing:.08em;padding:.2rem .5rem;border-radius:999px;cursor:pointer;
    color:var(--accent-warm,#7a4e26);background:color-mix(in srgb,var(--accent-warm,#7a4e26) 10%,var(--bg));
    border:1px solid color-mix(in srgb,var(--accent-warm,#7a4e26) 30%,transparent);}
  .calc-close{background:transparent;border:none;cursor:pointer;font-size:1.1rem;line-height:1;color:var(--ink-soft);padding:.1rem .3rem;border-radius:4px;}
  .calc-close:hover{background:color-mix(in srgb,var(--accent-deep,#5e2828) 12%,transparent);color:var(--accent-deep,#5e2828);}
  .calc-display{width:100%;font-family:ui-monospace,"Cascadia Code",monospace;font-size:1.1rem;text-align:right;
    padding:.55rem .6rem;border:1px solid var(--rule-warm,#c8b88f);border-radius:6px;
    background:color-mix(in srgb,var(--accent-warm,#7a4e26) 5%,var(--bg));color:var(--ink);outline:none;}
  .calc-display:focus{border-color:var(--m-graph,#4a5670);}
  .calc-result{font-family:ui-monospace,monospace;font-size:.8rem;text-align:right;color:var(--ink-soft);min-height:1.1rem;margin:.25rem .1rem .5rem;}
  .calc-result.err{color:var(--accent-deep,#5e2828);}
  .calc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.35rem;}
  .calc-btn{font-family:ui-monospace,monospace;font-size:.85rem;padding:.5rem 0;
    border:1px solid color-mix(in srgb,var(--accent-warm,#7a4e26) 22%,transparent);border-radius:6px;
    background:color-mix(in srgb,var(--accent-warm,#7a4e26) 7%,var(--bg));color:var(--ink);cursor:pointer;
    transition:background .12s,border-color .12s,transform .08s;}
  .calc-btn:hover{background:color-mix(in srgb,var(--accent-warm,#7a4e26) 16%,var(--bg));border-color:color-mix(in srgb,var(--accent-warm,#7a4e26) 45%,transparent);}
  .calc-btn:active{transform:translateY(1px);}
  .calc-btn.fn{color:var(--m-graph,#4a5670);}
  .calc-btn.op{color:var(--accent-warm,#7a4e26);font-weight:700;}
  .calc-btn.eq{grid-column:span 2;background:linear-gradient(160deg,var(--m-graph,#4a5670),color-mix(in srgb,var(--m-graph,#4a5670) 70%,#000));color:var(--bg);border-color:color-mix(in srgb,var(--m-graph,#4a5670) 60%,#000);font-weight:700;}
  .calc-btn.clr{color:var(--accent-deep,#5e2828);}
  @media (max-width:600px){.calc-summon{font-size:.76rem;padding:.45rem .75rem;}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- Markup ---- */
  const summon = document.createElement('button');
  summon.className = 'calc-summon';
  summon.id = 'calcSummon';
  summon.setAttribute('aria-haspopup', 'dialog');
  summon.setAttribute('aria-expanded', 'false');
  summon.title = 'Open calculator (always available)';
  summon.innerHTML = '<span class="ic">🧮</span> Calculator';

  const backdrop = document.createElement('div');
  backdrop.className = 'calc-backdrop';

  const panel = document.createElement('div');
  panel.className = 'calc-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Calculator');
  panel.innerHTML =
    '<div class="calc-head"><h2>Calculator</h2><div class="calc-tools">' +
    '<span class="calc-mode" title="Toggle angle mode">RAD</span>' +
    '<button class="calc-close" title="Close (Esc)">✕</button></div></div>' +
    '<input class="calc-display" inputmode="text" autocomplete="off" spellcheck="false" placeholder="0" aria-label="Calculator input">' +
    '<div class="calc-result"></div><div class="calc-grid"></div>';

  document.body.appendChild(summon);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  const display = panel.querySelector('.calc-display');
  const result = panel.querySelector('.calc-result');
  const grid = panel.querySelector('.calc-grid');
  const modeBtn = panel.querySelector('.calc-mode');
  const closeBtn = panel.querySelector('.calc-close');
  let deg = false;

  /* ---- Evaluator (recursive descent; no eval) ---- */
  function calcEval(input, deg) {
    const s = String(input)
      .replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/−/g, '-').replace(/√/g, 'sqrt');
    let i = 0;
    const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
    const D = (x) => deg ? x * Math.PI / 180 : x;
    const fromD = (x) => deg ? x * 180 / Math.PI : x;
    function expr() { return add(); }
    function add() { let v = mul(); ws(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const r = mul(); v = o === '+' ? v + r : v - r; ws(); } return v; }
    function mul() { let v = unary(); ws(); while (s[i] === '*' || s[i] === '/' || s[i] === '%') { const o = s[i++]; const r = unary(); v = o === '*' ? v * r : o === '/' ? v / r : v % r; ws(); } return v; }
    function unary() { ws(); if (s[i] === '-') { i++; return -unary(); } if (s[i] === '+') { i++; return unary(); } return pow(); }
    function pow() { let v = atom(); ws(); if (s[i] === '^') { i++; const r = unary(); return Math.pow(v, r); } return v; }
    function atom() {
      ws();
      if (s[i] === '(') { i++; const v = expr(); ws(); if (s[i] === ')') i++; return v; }
      const num = /^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(s.slice(i));
      if (num) { i += num[0].length; return parseFloat(num[0]); }
      const id = /^[a-zA-Z][a-zA-Z0-9]*/.exec(s.slice(i));
      if (id) {
        i += id[0].length; const name = id[0].toLowerCase();
        if (name === 'pi') return Math.PI;
        if (name === 'e') return Math.E;
        if (name === 'tau') return Math.PI * 2;
        ws();
        if (s[i] === '(') {
          i++; const a = expr(); ws(); if (s[i] === ')') i++;
          switch (name) {
            case 'sin': return Math.sin(D(a));
            case 'cos': return Math.cos(D(a));
            case 'tan': return Math.tan(D(a));
            case 'asin': return fromD(Math.asin(a));
            case 'acos': return fromD(Math.acos(a));
            case 'atan': return fromD(Math.atan(a));
            case 'sqrt': return Math.sqrt(a);
            case 'cbrt': return Math.cbrt(a);
            case 'ln': return Math.log(a);
            case 'log': return Math.log10(a);
            case 'exp': return Math.exp(a);
            case 'abs': return Math.abs(a);
            default: throw new Error('unknown function: ' + name);
          }
        }
        throw new Error('unexpected: ' + name);
      }
      throw new Error('cannot parse');
    }
    const out = expr(); ws();
    if (i < s.length) throw new Error('unexpected: ' + s.slice(i));
    if (!isFinite(out)) throw new Error('undefined');
    return out;
  }

  /* ---- Buttons ---- */
  const BTNS = [
    { t: 'sin', ins: 'sin(', c: 'fn' }, { t: 'cos', ins: 'cos(', c: 'fn' }, { t: 'tan', ins: 'tan(', c: 'fn' }, { t: '(', ins: '(', c: 'op' }, { t: ')', ins: ')', c: 'op' },
    { t: 'ln', ins: 'ln(', c: 'fn' }, { t: 'log', ins: 'log(', c: 'fn' }, { t: '√', ins: 'sqrt(', c: 'fn' }, { t: 'x^y', ins: '^', c: 'op' }, { t: '%', ins: '%', c: 'op' },
    { t: 'π', ins: 'pi', c: 'fn' }, { t: 'e', ins: 'e', c: 'fn' }, { t: '7', ins: '7' }, { t: '8', ins: '8' }, { t: '9', ins: '9' },
    { t: 'exp', ins: 'exp(', c: 'fn' }, { t: 'abs', ins: 'abs(', c: 'fn' }, { t: '4', ins: '4' }, { t: '5', ins: '5' }, { t: '6', ins: '6' },
    { t: '÷', ins: '/', c: 'op' }, { t: '×', ins: '*', c: 'op' }, { t: '1', ins: '1' }, { t: '2', ins: '2' }, { t: '3', ins: '3' },
    { t: '−', ins: '-', c: 'op' }, { t: '+', ins: '+', c: 'op' }, { t: '0', ins: '0' }, { t: '.', ins: '.' }, { t: '⌫', act: 'bksp', c: 'op' },
    { t: 'C', act: 'clear', c: 'clr' }, { t: '=', act: 'eq', c: 'eq' }
  ];
  BTNS.forEach(function (b) {
    const el = document.createElement('button');
    el.className = 'calc-btn' + (b.c ? ' ' + b.c : '');
    el.textContent = b.t;
    el.addEventListener('click', function () {
      if (b.act === 'clear') { display.value = ''; result.textContent = ''; result.classList.remove('err'); }
      else if (b.act === 'bksp') { display.value = display.value.slice(0, -1); }
      else if (b.act === 'eq') { evaluate(); }
      else { insert(b.ins); }
      display.focus();
    });
    grid.appendChild(el);
  });

  function insert(txt) {
    const start = display.selectionStart ?? display.value.length;
    const end = display.selectionEnd ?? display.value.length;
    display.value = display.value.slice(0, start) + txt + display.value.slice(end);
    const pos = start + txt.length;
    display.setSelectionRange(pos, pos);
  }
  function evaluate() {
    const v = display.value.trim();
    if (!v) { result.textContent = ''; result.classList.remove('err'); return; }
    try {
      const r = calcEval(v, deg);
      const shown = Math.abs(r) < 1e-12 ? 0 : parseFloat(r.toPrecision(12));
      result.textContent = '= ' + shown;
      result.classList.remove('err');
      display.value = String(shown);
      display.setSelectionRange(display.value.length, display.value.length);
    } catch (err) {
      result.textContent = '⚠ ' + err.message;
      result.classList.add('err');
    }
  }
  function openCalc() { backdrop.classList.add('open'); panel.classList.add('open'); summon.setAttribute('aria-expanded', 'true'); display.focus(); }
  function closeCalc() { backdrop.classList.remove('open'); panel.classList.remove('open'); summon.setAttribute('aria-expanded', 'false'); }

  summon.addEventListener('click', function () { panel.classList.contains('open') ? closeCalc() : openCalc(); });
  closeBtn.addEventListener('click', closeCalc);
  backdrop.addEventListener('click', closeCalc);
  modeBtn.addEventListener('click', function () { deg = !deg; modeBtn.textContent = deg ? 'DEG' : 'RAD'; });
  display.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); evaluate(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) closeCalc(); });
})();
