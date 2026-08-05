
export function block() {
  return '<section class="block"><div class="block-head"><h2>Scientific Calculator</h2><span class="tag">Instrument</span>' +
    '<p>Trig, logs, powers, π and e. Click the keypad, then type — Enter evaluates, Esc clears, Backspace deletes.</p></div>' +
    '<div class="calc" id="sciCalc" tabindex="0">' +
      '<div class="calc-display"><div class="calc-expr" id="calcExpr"></div><div class="calc-result" id="calcResult">0</div></div>' +
      '<div class="calc-grid" id="calcGrid"></div>' +
    '</div></section>';
}

export function init() {
  var box = document.getElementById("sciCalc");
  var exprEl = document.getElementById("calcExpr");
  var resEl = document.getElementById("calcResult");
  var grid = document.getElementById("calcGrid");
  if (!box || !grid) return;
  var expr = "", result = "0", lastWasResult = false;

  function draw() {
    exprEl.textContent = expr
      .replace(/Math\.sin\(/g, "sin(").replace(/Math\.cos\(/g, "cos(").replace(/Math\.tan\(/g, "tan(")
      .replace(/Math\.log10\(/g, "log(").replace(/Math\.log\(/g, "ln(").replace(/Math\.sqrt\(/g, "√(")
      .replace(/Math\.PI/g, "π").replace(/Math\.E/g, "e").replace(/\*\*/g, "^").replace(/\*/g, "×").replace(/\//g, "÷");
    resEl.textContent = result;
  }
  function add(v) { if (lastWasResult && /^[0-9.]/.test(v)) expr = ""; lastWasResult = false; expr += v; draw(); }
  function fn(p) { if (lastWasResult) expr = ""; lastWasResult = false; expr += p; draw(); }
  function clr() { expr = ""; result = "0"; lastWasResult = false; draw(); }
  function bksp() { expr = expr.slice(0, -1); lastWasResult = false; draw(); }
  function evaluate() {
    if (!expr) return;
    try {
      var safe = expr.replace(/Math\.(sin|cos|tan|log|log10|sqrt|PI|E|abs|pow|ceil|floor|cbrt|exp)\b/g, "S");
      if (/[a-zA-Z]/.test(safe.replace(/S/g, "").replace(/e[+-]?\d/g, ""))) throw 0;
      var val = Function('"use strict";return(' + expr + ')')();
      result = (typeof val === "number" && isFinite(val)) ? String(parseFloat(val.toPrecision(12))) : "Error";
    } catch (e) { result = "Error"; }
    lastWasResult = true; draw();
  }
  var B = [
    ["sin", "fn", function () { fn("Math.sin("); }], ["cos", "fn", function () { fn("Math.cos("); }], ["tan", "fn", function () { fn("Math.tan("); }], ["log", "fn", function () { fn("Math.log10("); }], ["ln", "fn", function () { fn("Math.log("); }],
    ["x²", "fn", function () { add("**2"); }], ["√", "fn", function () { fn("Math.sqrt("); }], ["π", "fn", function () { add("Math.PI"); }], ["e", "fn", function () { add("Math.E"); }], ["xʸ", "fn", function () { add("**"); }],
    ["C", "clear", function () { clr(); }], ["(", "op", function () { add("("); }], [")", "op", function () { add(")"); }], ["%", "op", function () { add("%"); }], ["÷", "op", function () { add("/"); }],
    ["7", "", function () { add("7"); }], ["8", "", function () { add("8"); }], ["9", "", function () { add("9"); }], ["×", "op", function () { add("*"); }], ["⌫", "clear", function () { bksp(); }],
    ["4", "", function () { add("4"); }], ["5", "", function () { add("5"); }], ["6", "", function () { add("6"); }], ["−", "op", function () { add("-"); }], ["EE", "fn", function () { add("e"); }],
    ["1", "", function () { add("1"); }], ["2", "", function () { add("2"); }], ["3", "", function () { add("3"); }], ["+", "op", function () { add("+"); }], ["Ans", "fn", function () { add(result); }],
    ["0", "wide", function () { add("0"); }], [".", "", function () { add("."); }], ["=", "eq wide", function () { evaluate(); }]
  ];
  for (var i = 0; i < B.length; i++) {
    (function (b) {
      var el = document.createElement("button");
      el.className = "calc-btn " + b[1]; el.type = "button"; el.textContent = b[0];
      el.addEventListener("click", function () { b[2](); box.focus(); });
      grid.appendChild(el);
    })(B[i]);
  }
  box.addEventListener("keydown", function (e) {
    var k = e.key;
    if (/^[0-9.+\-*/%()]$/.test(k)) { e.preventDefault(); add(k); }
    else if (k === "Enter" || k === "=") { e.preventDefault(); evaluate(); }
    else if (k === "Backspace") { e.preventDefault(); bksp(); }
    else if (k === "Escape") { e.preventDefault(); clr(); }
  });
}
