/* Room content: reference — the general-chemistry lookup tables. */

export default {
name: "Reference Tables", kind: "Lookup", glyph: "📋", color: "#5f9ea0",
/* blurb / status / topics are escaped by the renderer, so they use plain
   "Ka" and "Kb" — Unicode has a subscript a but no subscript b, and mixing
   the two reads as a typo. Card bodies and examples below are raw HTML and
   use proper <sub> markup. */
blurb: "The tables you stop and look up mid-problem — polyatomic ions, solubility rules, strong acids and bases, and Ka / Kb values. Built to be searched during a session and printed as a handout after one.",
status: "Live — searchable, screen-share sized, printable",
cards: [
  { name: "Writing an ionic formula", body: "Balance the charges — criss-cross, then reduce.<br>Ca<sup>2+</sup> + PO<sub>4</sub><sup>3−</sup> → Ca<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>", note: "Keep a polyatomic ion in parentheses when you need more than one of it." },
  { name: "Naming an ionic compound", body: "Cation name, then anion name. Transition metals take a Roman numeral for their charge.", note: "FeCl<sub>3</sub> = iron(III) chloride, not iron trichloride." },
  { name: "Will it precipitate?", body: "Swap the partners, then check each product against the solubility rules. Anything insoluble is your precipitate.", note: "No insoluble product means no reaction." },
  { name: "Strong or weak?", body: "If the acid is one of the six on the strong list, it ionises completely. Everything else needs K<sub>a</sub>.", note: "Strong acid ⇒ [H⁺] = the acid's concentration. No equilibrium needed." },
  { name: "Conjugate pairs", body: "K<sub>a</sub> × K<sub>b</sub> = K<sub>w</sub> = 1.0 × 10⁻¹⁴<br>pK<sub>a</sub> + pK<sub>b</sub> = 14.00", note: "The stronger the acid, the weaker its conjugate base." },
  { name: "Choosing a buffer", body: "Pick an acid whose pK<sub>a</sub> is within about 1 unit of your target pH.", note: "Equal [A⁻] and [HA] puts pH exactly at pK<sub>a</sub>." },

  /* The cards below are deliberately method, not data. Polyatomic ions, the
     oxyanion pattern, solubility, the strong acid/base lists and Ka/Kb are
     already in this room as searchable, printable tables in the instrument
     above; copying those 174 rows into cards would give the room two versions
     of the same chemistry to drift apart. These teach how to use the tables
     and name which tab to open. */

  { name: "Which table do I need?",
    body: "Charge on a formula unit → <b>Polyatomic ions</b>.<br>Will it precipitate → <b>Solubility</b>.<br>Does it ionise completely → <b>Strong acids &amp; bases</b>.<br>How far does it ionise → <b>K<sub>a</sub> / K<sub>b</sub></b>.<br>Heat or spontaneity → <b>Thermo</b>.",
    note: "The search box above covers all of them at once, so a formula you can't place will find its own table." },

  { name: "Net ionic equations",
    body: "1. Balance the molecular equation.<br>2. Split every <b>soluble strong electrolyte</b> into ions — strong acids, strong bases, soluble salts.<br>3. Leave solids, liquids, gases and weak electrolytes whole.<br>4. Cancel anything identical on both sides.",
    note: "What cancels are the spectators. AgNO<sub>3</sub> + NaCl reduces to Ag<sup>+</sup> + Cl<sup>−</sup> → AgCl(s); Na<sup>+</sup> and NO<sub>3</sub><sup>−</sup> never reacted." },

  { name: "Naming an oxyanion series",
    body: "Four rungs, one oxygen apart, same central atom:<br><b>per</b>‑…‑<b>ate</b>  ClO<sub>4</sub><sup>−</sup><br>…‑<b>ate</b>  ClO<sub>3</sub><sup>−</sup><br>…‑<b>ite</b>  ClO<sub>2</sub><sup>−</sup><br><b>hypo</b>‑…‑<b>ite</b>  ClO<sup>−</sup>",
    note: "The charge never changes down the ladder — only the oxygen count does. Memorise the ‑ate rung and count from it." },

  { name: "The polyatomic ions to learn first",
    body: "Almost all of them are anions. Learn the −1 set (nitrate, hydroxide, acetate, the halogen ‑ates), the −2 set (sulfate, carbonate), and phosphate at −3.",
    note: "The ‑ite partners then come free — one fewer oxygen, same charge. Ammonium NH<sub>4</sub><sup>+</sup> is the one you'll meet as a cation." },

  { name: "Charge traps",
    body: "NH<sub>4</sub><sup>+</sup> is the only common polyatomic <b>cation</b> — everything else in the table is negative.<br>Sulfate SO<sub>4</sub><sup>2−</sup> vs sulfite SO<sub>3</sub><sup>2−</sup>. Nitrate NO<sub>3</sub><sup>−</sup> vs nitrite NO<sub>2</sub><sup>−</sup>.",
    note: "A hydrogen‑ prefix adds one H<sup>+</sup> and moves the charge a step toward zero: carbonate CO<sub>3</sub><sup>2−</sup> → hydrogen carbonate HCO<sub>3</sub><sup>−</sup>." },

  { name: "Reading a Ka value",
    body: "Bigger K<sub>a</sub> = stronger acid = more ionised.<br>pK<sub>a</sub> = −log K<sub>a</sub>, so a <b>lower</b> pK<sub>a</sub> is stronger.<br>One pK<sub>a</sub> unit is a factor of ten.",
    note: "Only the six strong acids let you read [H⁺] straight off the concentration; everything else needs the equilibrium. If ionisation runs past about 5% of the starting concentration, the usual approximation has broken and you need the quadratic." }
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
