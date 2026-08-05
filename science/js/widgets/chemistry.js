import { ELEMENTS } from '../data/elements.js';
import { uFmt } from '../format.js';

export function block() {
  return '<section class="block"><div class="block-head"><h2>Chemistry Calculators</h2><span class="tag">Instrument</span>' +
    '<p>Molar mass, molarity, dilution, pH, and buffer pH — the everyday chem solvers, live.</p></div>' +
    '<div class="u-tabs" id="chemTabs">' +
      '<button class="u-tab on" type="button" data-pane="molar">Molar mass</button>' +
      '<button class="u-tab" type="button" data-pane="molarity">Molarity</button>' +
      '<button class="u-tab" type="button" data-pane="dilution">Dilution</button>' +
      '<button class="u-tab" type="button" data-pane="ph">pH</button>' +
      '<button class="u-tab" type="button" data-pane="buffer">Buffer</button>' +
    '</div>' +
    '<div class="chem">' +
      '<div class="u-pane on" data-pane="molar">' +
        '<div class="u-row"><input class="u-input" id="mmFormula" style="width:15rem" placeholder="e.g. Ca(OH)2, NaCl, C6H12O6" autocomplete="off" spellcheck="false"></div>' +
        '<div class="chem-out" id="mmOut">—</div>' +
        '<div class="u-note">Supports parentheses and hydrate dots (e.g. CuSO4·5H2O). Element symbols are case-sensitive.</div>' +
      '</div>' +
      '<div class="u-pane" data-pane="molarity">' +
        '<div class="u-row"><label>Moles (mol)</label><input class="u-input" id="molMol" type="number" step="any" value="0.5"></div>' +
        '<div class="u-row"><label>Volume (L)</label><input class="u-input" id="molVol" type="number" step="any" value="1"></div>' +
        '<div class="chem-out" id="molOut">—</div>' +
        '<div class="u-note">Molarity M = moles of solute / litres of solution.</div>' +
      '</div>' +
      '<div class="u-pane" data-pane="dilution">' +
        '<div class="u-row"><label>Stock conc. C₁</label><input class="u-input" id="dC1" type="number" step="any" value="2"></div>' +
        '<div class="u-row"><label>Target conc. C₂</label><input class="u-input" id="dC2" type="number" step="any" value="0.5"></div>' +
        '<div class="u-row"><label>Final volume V₂</label><input class="u-input" id="dV2" type="number" step="any" value="100"></div>' +
        '<div class="chem-out" id="dOut">—</div>' +
        '<div class="u-note">C₁V₁ = C₂V₂. Keep both concentrations in the same units, and the volume in whatever unit you want V₁ back in.</div>' +
      '</div>' +
      '<div class="u-pane" data-pane="ph">' +
        '<div class="u-row"><label>pH</label><input class="u-input" id="phPH" type="number" step="any" value="7"></div>' +
        '<div class="u-row"><label>[H⁺] (M)</label><input class="u-input" id="phH" type="number" step="any"></div>' +
        '<div class="chem-out" id="phOut">—</div>' +
        '<div class="u-note">pH = −log₁₀[H⁺]. Edit either field; the other follows.</div>' +
      '</div>' +
      '<div class="u-pane" data-pane="buffer">' +
        '<div class="u-row"><label>pKₐ</label><input class="u-input" id="bfPKa" type="number" step="any" value="4.74"></div>' +
        '<div class="u-row"><label>[A⁻] (base)</label><input class="u-input" id="bfA" type="number" step="any" value="1"></div>' +
        '<div class="u-row"><label>[HA] (acid)</label><input class="u-input" id="bfHA" type="number" step="any" value="1"></div>' +
        '<div class="chem-out" id="bfOut">—</div>' +
        '<div class="u-note">Henderson–Hasselbalch: pH = pKₐ + log₁₀([A⁻]/[HA]).</div>' +
      '</div>' +
    '</div></section>';
}

export function init() {
  var tabsEl = document.getElementById("chemTabs");
  if (!tabsEl) return;
  var block = tabsEl.closest(".block");
  Array.prototype.forEach.call(block.querySelectorAll("#chemTabs .u-tab"), function (t) {
    t.addEventListener("click", function () {
      Array.prototype.forEach.call(block.querySelectorAll("#chemTabs .u-tab"), function (x) { x.classList.remove("on"); });
      Array.prototype.forEach.call(block.querySelectorAll(".chem .u-pane"), function (x) { x.classList.remove("on"); });
      t.classList.add("on");
      block.querySelector('.chem .u-pane[data-pane="' + t.getAttribute("data-pane") + '"]').classList.add("on");
    });
  });

  // Element symbol → atomic mass, from the periodic-table data.
  var MASS = {};
  for (var i = 0; i < ELEMENTS.length; i++) {
    var m = ELEMENTS[i].m;
    if (typeof m === "string") m = parseFloat(m.replace(/[\[\]]/g, ""));
    MASS[ELEMENTS[i].s] = m;
  }
  function parseGroup(str) {
    var idx = 0;
    function count() {
      var num = "";
      while (idx < str.length && /[0-9]/.test(str[idx])) { num += str[idx]; idx++; }
      return num === "" ? 1 : parseInt(num, 10);
    }
    function group() {
      var mass = 0;
      while (idx < str.length) {
        var ch = str[idx];
        if (ch === "(" || ch === "[") { idx++; mass += group() * count(); }
        else if (ch === ")" || ch === "]") { idx++; return mass; }
        else if (/[A-Z]/.test(ch)) {
          var sym = ch; idx++;
          while (idx < str.length && /[a-z]/.test(str[idx])) { sym += str[idx]; idx++; }
          if (!(sym in MASS)) throw new Error("Unknown element “" + sym + "”");
          mass += MASS[sym] * count();
        } else throw new Error("Unexpected “" + ch + "”");
      }
      return mass;
    }
    return group();
  }
  function molarMass(f) {
    f = f.replace(/\s+/g, "");
    if (!f) throw new Error("Enter a formula");
    var segs = f.split(/[.·]/);
    var total = 0;
    for (var s = 0; s < segs.length; s++) {
      var seg = segs[s]; if (!seg) continue;
      var coef = 1;
      var mm = seg.match(/^(\d+)([A-Za-z(\[].*)$/);
      if (mm) { coef = parseInt(mm[1], 10); seg = mm[2]; }
      total += coef * parseGroup(seg);
    }
    return total;
  }

  var mmF = document.getElementById("mmFormula"), mmOut = document.getElementById("mmOut");
  function doMM() {
    var v = mmF.value.trim();
    if (!v) { mmOut.textContent = "—"; return; }
    try { mmOut.innerHTML = "<b>" + uFmt(molarMass(v)) + "</b> g/mol"; }
    catch (e) { mmOut.textContent = e.message || "Invalid formula"; }
  }
  mmF.addEventListener("input", doMM); doMM();

  var molMol = document.getElementById("molMol"), molVol = document.getElementById("molVol"), molOut = document.getElementById("molOut");
  function doMol() {
    var n = parseFloat(molMol.value), V = parseFloat(molVol.value);
    if (isNaN(n) || isNaN(V) || V === 0) { molOut.textContent = "—"; return; }
    molOut.innerHTML = "<b>" + uFmt(n / V) + "</b> mol/L (M)";
  }
  molMol.addEventListener("input", doMol); molVol.addEventListener("input", doMol); doMol();

  var dC1 = document.getElementById("dC1"), dC2 = document.getElementById("dC2"), dV2 = document.getElementById("dV2"), dOut = document.getElementById("dOut");
  function doDil() {
    var C1 = parseFloat(dC1.value), C2 = parseFloat(dC2.value), V2 = parseFloat(dV2.value);
    if (isNaN(C1) || isNaN(C2) || isNaN(V2) || C1 === 0) { dOut.textContent = "—"; return; }
    var V1 = C2 * V2 / C1;
    if (V1 > V2) { dOut.innerHTML = "Target is more concentrated than the stock — can't reach it by dilution."; return; }
    dOut.innerHTML = "Take <b>" + uFmt(V1) + "</b> of stock, add <b>" + uFmt(V2 - V1) + "</b> diluent → " + uFmt(V2) + " total.";
  }
  dC1.addEventListener("input", doDil); dC2.addEventListener("input", doDil); dV2.addEventListener("input", doDil); doDil();

  var phPH = document.getElementById("phPH"), phH = document.getElementById("phH"), phOut = document.getElementById("phOut");
  function showPH(pH) {
    phOut.innerHTML = "pH = <b>" + uFmt(pH) + "</b> · pOH = <b>" + uFmt(14 - pH) + "</b> · [OH⁻] = <b>" + Math.pow(10, -(14 - pH)).toExponential(3) + "</b> M";
  }
  function fromPH() {
    var pH = parseFloat(phPH.value);
    if (isNaN(pH)) { phOut.textContent = "—"; return; }
    phH.value = Math.pow(10, -pH).toExponential(3);
    showPH(pH);
  }
  function fromH() {
    var H = parseFloat(phH.value);
    if (isNaN(H) || H <= 0) { phOut.textContent = "—"; return; }
    var pH = -Math.log(H) / Math.LN10;
    phPH.value = parseFloat(pH.toFixed(3));
    showPH(pH);
  }
  phPH.addEventListener("input", fromPH); phH.addEventListener("input", fromH); fromPH();

  var bfPKa = document.getElementById("bfPKa"), bfA = document.getElementById("bfA"), bfHA = document.getElementById("bfHA"), bfOut = document.getElementById("bfOut");
  function doBuf() {
    var pKa = parseFloat(bfPKa.value), A = parseFloat(bfA.value), HA = parseFloat(bfHA.value);
    if (isNaN(pKa) || isNaN(A) || isNaN(HA) || A <= 0 || HA <= 0) { bfOut.textContent = "—"; return; }
    bfOut.innerHTML = "pH = <b>" + uFmt(pKa + Math.log(A / HA) / Math.LN10) + "</b>";
  }
  bfPKa.addEventListener("input", doBuf); bfA.addEventListener("input", doBuf); bfHA.addEventListener("input", doBuf); doBuf();
}
