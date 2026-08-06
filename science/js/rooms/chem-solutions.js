/* Room content: chem-solutions — concentration and dilution. */

export default {
name: "Solutions & Concentration", kind: "Chemistry · mixtures", glyph: "🧫", color: "#e0794b",
blurb: "Moles per litre, and what happens when you add water — molarity, dilution, solution stoichiometry, and the rules for what actually dissolves.",
status: "Live — molarity and dilution solvers",
cards: [
  { name: "Molarity", body: "M = mol / L", note: "moles of solute per litre of <b>solution</b> — not per litre of solvent." },
  { name: "Dilution", body: "M₁V₁ = M₂V₂", note: "Moles of solute don't change when you add water, so concentration × volume is conserved." },
  { name: "Molality", body: "m = mol solute / kg solvent", note: "Uses mass of solvent, so it doesn't drift with temperature the way molarity does." },
  { name: "Preparing a solution", body: "Weigh the solute, dissolve in less than the final volume, then top up to the mark.", note: "Never add solvent to the mark first — the solute has volume too." },
  { name: "Solution stoichiometry", body: "moles = M × V. Get moles, use the mole ratio, convert back.", note: "The balanced equation still governs the ratio." },
  { name: "Net ionic equation", body: "Split every soluble strong electrolyte into ions, then cancel whatever appears on both sides.", note: "What cancels are the spectator ions." },
  { name: "Will it precipitate?", body: "Swap the partners and check each product against the solubility rules.", note: "No insoluble product means no reaction." },
  { name: "Parts per million", body: "ppm = (mass solute / mass solution) × 10⁶", note: "For dilute aqueous solutions, 1 ppm ≈ 1 mg/L." }
],
examples: [
  { q: "Molarity of 0.5 mol NaCl in 2 L", steps: ["M = mol / L = 0.5 / 2"], ans: "<b>0.25 M</b>" },
  { q: "Dilute 2 M stock to 0.5 M in 100 mL", steps: ["M₁V₁ = M₂V₂", "V₁ = (0.5 × 100) / 2"], ans: "<b>25 mL</b> of stock, then top up to 100 mL" },
  { q: "Mass of NaCl to make 250 mL of 0.100 M", steps: ["mol = 0.100 × 0.250 = 0.0250 mol", "m = n × M = 0.0250 × 58.44"], ans: "<b>1.46 g</b>" },
  { q: "Does AgNO₃ + NaCl react?", steps: ["Swap partners → AgCl and NaNO₃", "Chlorides are soluble except Ag⁺ ⇒ AgCl is insoluble"], ans: "yes — <b>AgCl precipitates</b>" },
  { q: "Net ionic equation for that reaction", steps: ["Split the soluble strong electrolytes into ions", "Cancel Na⁺ and NO₃⁻ — both sides"], ans: "<b>Ag⁺ + Cl⁻ → AgCl(s)</b>" }
],
links: [
  { name: "Reference Tables", desc: "Solubility rules and polyatomic ions.", href: "room.html?room=reference", tag: "room" },
  { name: "Moles & Stoichiometry", desc: "The mole work underneath.", href: "room.html?room=chem-moles", tag: "room" },
  { name: "Acids, Bases & Buffers", desc: "Concentration applied to pH.", href: "room.html?room=chem-acids", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
