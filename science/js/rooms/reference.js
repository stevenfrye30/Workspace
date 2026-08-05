/* Room content: reference — the general-chemistry lookup tables. */

export default {
name: "Reference Tables", kind: "Lookup", glyph: "📋", color: "#5f9ea0",
/* blurb / status / topics are escaped by the renderer, so they use plain
   "Ka" and "Kb" — Unicode has a subscript a but no subscript b, and mixing
   the two reads as a typo. Card bodies and examples below are raw HTML and
   use proper <sub> markup. */
blurb: "The tables you stop and look up mid-problem — polyatomic ions, solubility rules, strong acids and bases, and Ka / Kb values. Built to be searched during a session and printed as a handout after one.",
status: "Live — searchable, screen-share sized, printable",
topics: [
  "Polyatomic ions", "Oxyanion naming", "Ionic formulas", "Solubility rules",
  "Precipitation", "Net ionic equations", "Strong acids", "Strong bases",
  "Weak acids", "Ka and pKa", "Kb and pKb", "Buffers"
],
cards: [
  { name: "Writing an ionic formula", body: "Balance the charges — criss-cross, then reduce.<br>Ca<sup>2+</sup> + PO<sub>4</sub><sup>3−</sup> → Ca<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>", note: "Keep a polyatomic ion in parentheses when you need more than one of it." },
  { name: "Naming an ionic compound", body: "Cation name, then anion name. Transition metals take a Roman numeral for their charge.", note: "FeCl<sub>3</sub> = iron(III) chloride, not iron trichloride." },
  { name: "Will it precipitate?", body: "Swap the partners, then check each product against the solubility rules. Anything insoluble is your precipitate.", note: "No insoluble product means no reaction." },
  { name: "Strong or weak?", body: "If the acid is one of the six on the strong list, it ionises completely. Everything else needs K<sub>a</sub>.", note: "Strong acid ⇒ [H⁺] = the acid's concentration. No equilibrium needed." },
  { name: "Conjugate pairs", body: "K<sub>a</sub> × K<sub>b</sub> = K<sub>w</sub> = 1.0 × 10⁻¹⁴<br>pK<sub>a</sub> + pK<sub>b</sub> = 14.00", note: "The stronger the acid, the weaker its conjugate base." },
  { name: "Choosing a buffer", body: "Pick an acid whose pK<sub>a</sub> is within about 1 unit of your target pH.", note: "Equal [A⁻] and [HA] puts pH exactly at pK<sub>a</sub>." }
],
examples: [
  { q: "Name Cu(NO₃)₂", steps: ["NO₃⁻ is nitrate, charge −1", "Two nitrates ⇒ −2 total, so Cu must be +2"], ans: "<b>copper(II) nitrate</b>" },
  { q: "Write the formula for aluminium sulfate", steps: ["Al³⁺ and SO₄²⁻", "Criss-cross: 2 Al, 3 sulfate"], ans: "<b>Al₂(SO₄)₃</b>" },
  { q: "Does AgNO₃ + NaCl react?", steps: ["Swap partners → AgCl and NaNO₃", "Rule 3: chlorides soluble except Ag⁺ ⇒ AgCl is insoluble", "Rule 1: sodium salts always soluble"], ans: "yes — <b>AgCl precipitates</b>" },
  { q: "Net ionic equation for that reaction", steps: ["Split every soluble strong electrolyte into ions", "Cancel Na⁺ and NO₃⁻ — they appear on both sides"], ans: "<b>Ag⁺ + Cl⁻ → AgCl(s)</b>" },
  { q: "pH of 0.010 M HNO₃", steps: ["HNO₃ is on the strong-acid list ⇒ ionises completely", "[H⁺] = 0.010 M", "pH = −log(0.010)"], ans: "pH = <b>2.00</b>" },
  { q: "Which acid buffers at pH 7.2?", steps: ["Look for pK<sub>a</sub> ≈ 7.2 in the K<sub>a</sub> table", "H₂PO₄⁻ has pK<sub>a</sub> = 7.21"], ans: "<b>H₂PO₄⁻ / HPO₄²⁻</b> — the phosphate buffer" },
  { q: "K<sub>b</sub> of the acetate ion", steps: ["Acetic acid K<sub>a</sub> = 1.8 × 10⁻⁵", "K<sub>b</sub> = K<sub>w</sub> / K<sub>a</sub> = 1.0 × 10⁻¹⁴ / 1.8 × 10⁻⁵"], ans: "<b>5.6 × 10⁻¹⁰</b>" }
],
links: [
  { name: "Chemistry", desc: "Formulas, worked examples, and the live calculators.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Periodic Table", desc: "Element charges, groups, and electron configurations.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Data, Symbols & Units", desc: "SI units, prefixes, constants, and the converter.", href: "room.html?room=data-analysis", tag: "room" }
]
};
