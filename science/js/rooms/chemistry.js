/* Room content: chemistry */

export default {
name: "Chemistry", kind: "Matter", glyph: "🧪", color: "#e0794b",
blurb: "Where the periodic table becomes reactions — bonding, equations, solutions, acids/bases, equilibrium, thermodynamics, kinetics, and organic foundations.",
status: "Populated — formulas and worked examples",
topics: [
  "Atoms & ions", "Elements & compounds", "Periodic trends", "Electron configuration", "Bonding",
  "Ionic bonds", "Covalent bonds", "Molecular geometry", "Intermolecular forces", "Chemical equations",
  "Stoichiometry", "Moles & molar mass", "Solutions & concentration", "Acids & bases", "Buffers",
  "Equilibrium", "Thermodynamics", "Kinetics", "Redox", "Electrochemistry", "Organic basics", "Lab calculations"
],
cards: [
  { name: "Mole relationship", body: "n = m / M", note: "moles = mass ÷ molar mass." },
  { name: "Avogadro's number", body: "N<sub>A</sub> = 6.022 × 10²³ /mol", note: "particles per mole." },
  { name: "Molarity", body: "M = mol / L", note: "moles of solute per litre of solution (mol/L)." },
  { name: "Dilution", body: "M₁V₁ = M₂V₂", note: "concentration × volume is conserved on dilution." },
  { name: "Percent composition", body: "%X = (mass of X / molar mass) × 100", note: "" },
  { name: "Empirical formula", body: "smallest whole-number mole ratio of the elements", note: "% → moles → divide by the smallest." },
  { name: "Ideal gas law", body: "PV = nRT", note: "R = 0.0821 L·atm/mol·K  (8.314 J/mol·K)." },
  { name: "pH and pOH", body: "pH = −log[H⁺] · pH + pOH = 14", note: "" },
  { name: "Ka and Kb", body: "K<sub>a</sub> · K<sub>b</sub> = K<sub>w</sub> = 1 × 10⁻¹⁴", note: "stronger acid ⇒ larger K<sub>a</sub>." },
  { name: "Henderson–Hasselbalch", body: "pH = pK<sub>a</sub> + log([A⁻] / [HA])", note: "buffer pH from the conjugate ratio." },
  { name: "Equilibrium constant", body: "K = [products] / [reactants]", note: "each term raised to its coefficient. Q vs K predicts the shift (Le Chatelier)." },
  { name: "Gibbs free energy", body: "ΔG = ΔH − TΔS · ΔG = −RT ln K", note: "ΔG &lt; 0 ⇒ spontaneous." },
  { name: "Reaction rate", body: "rate = k[A]<sup>m</sup>[B]<sup>n</sup>", note: "orders m, n are found experimentally." },
  { name: "Redox (OIL RIG)", body: "Oxidation Is Loss, Reduction Is Gain of e⁻", note: "oxidizing agent is reduced; reducing agent is oxidized." },
  { name: "Nernst equation", body: "E = E° − (RT / nF) ln Q", note: "cell potential away from standard conditions." },
  { name: "Electronegativity trend", body: "↑ across a period · ↓ down a group", note: "peaks at fluorine." },
  { name: "Ionization energy trend", body: "↑ across a period · ↓ down a group", note: "" },
  { name: "Atomic radius trend", body: "↓ across a period · ↑ down a group", note: "" }
],
examples: [
  { q: "Molar mass of H₂O", steps: ["H: 2 × 1.008 = 2.016", "O: 1 × 16.00 = 16.00", "Add them"], ans: "<b>18.02 g/mol</b>" },
  { q: "Convert 36 g of H₂O to moles", steps: ["n = m / M = 36 / 18.02"], ans: "≈ <b>2.0 mol</b>" },
  { q: "Molarity of 0.5 mol NaCl in 2 L", steps: ["M = mol / L = 0.5 / 2"], ans: "<b>0.25 M</b>" },
  { q: "Dilute 2 M stock to 0.5 M in 100 mL", steps: ["M₁V₁ = M₂V₂", "V₁ = (0.5 × 100) / 2"], ans: "<b>25 mL</b> of stock, then top up to 100 mL" },
  { q: "Balance  H₂ + O₂ → H₂O", steps: ["Balance O with 2 H₂O", "Balance H with 2 H₂"], ans: "<b>2 H₂ + O₂ → 2 H₂O</b>" },
  { q: "From 4 mol H₂ in  2 H₂ + O₂ → 2 H₂O", steps: ["H₂ : H₂O ratio = 2 : 2 = 1 : 1"], ans: "<b>4 mol H₂O</b> (consumes 2 mol O₂)" },
  { q: "pH when [H⁺] = 1 × 10⁻³ M", steps: ["pH = −log(10⁻³)"], ans: "pH = <b>3</b>" },
  { q: "Buffer pH: pK<sub>a</sub> = 4.74, [A⁻] = [HA]", steps: ["pH = pK<sub>a</sub> + log(1)", "log 1 = 0"], ans: "pH = <b>4.74</b>" },
  { q: "Redox: Zn + Cu²⁺ → Zn²⁺ + Cu", steps: ["Zn → Zn²⁺ + 2e⁻ (loses electrons)", "Cu²⁺ + 2e⁻ → Cu (gains electrons)"], ans: "Zn is <b>oxidized</b>, Cu²⁺ is <b>reduced</b>" },
  { q: "Why does NaCl form? (connect to the table)", steps: ["Na (Z 11) loses 1e⁻ → Na⁺", "Cl (Z 17) gains 1e⁻ → Cl⁻", "Opposite charges attract"], ans: "<b>Na⁺Cl⁻</b> — open the Periodic Table room to inspect Na &amp; Cl" }
],
links: [
  { name: "Open Periodic Table", desc: "The elements behind every reaction.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Chemical notation, units, constants & calculator.", href: "room.html?room=data-analysis", tag: "room" },
  { name: "Open Biochemistry", desc: "Where chemistry meets biology — enzymes, metabolism.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Open Lab Methods", desc: "Solution prep, titrations, chromatography, calibration.", href: "room.html?room=lab-methods", tag: "room" },
  { name: "Open Physics & Math", desc: "Energy, gas laws, and measurement.", href: "room.html?room=physics", tag: "room" },
  { name: "Math Lab", desc: "Algebra, calculus, statistics — the full toolset.", href: "../math/", tag: "math" },
]
};
