/* Room content: chem-titration — titration curves and indicators. */

export default {
name: "Titration", kind: "Chemistry · analysis", glyph: "⚗️", color: "#e0794b",
blurb: "Adding measured titrant and reading the curve that results — equivalence, half-equivalence, the buffer region, and picking an indicator that changes where it matters.",
status: "Live — curve, table and indicator picker",
cards: [
  { name: "Equivalence point", body: "Where moles of titrant = moles of analyte.", note: "Equivalence means <b>stoichiometrically equal</b>, not pH 7 — only strong + strong lands on 7." },
  { name: "Endpoint vs equivalence", body: "The endpoint is where the indicator changes colour; equivalence is the true stoichiometric point.", note: "A well-chosen indicator makes the two nearly coincide." },
  { name: "Half-equivalence", body: "At half the equivalence volume, [HA] = [A⁻], so <b>pH = pK<sub>a</sub></b>.", note: "This is how a pKa is read off a curve, and it is the point of best buffering." },
  { name: "Equivalence pH by type", body: "Strong + strong → 7<br>Weak acid + strong base → &gt; 7<br>Weak base + strong acid → &lt; 7", note: "The leftover conjugate decides which side of neutral you land on." },
  { name: "Choosing an indicator", body: "Pick one whose colour-change range contains the equivalence pH.", note: "Phenolphthalein (8.3–10.0) for weak acid + strong base; methyl red (4.4–6.2) for weak base + strong acid." },
  { name: "Titration calculation", body: "M<sub>a</sub>V<sub>a</sub> = M<sub>b</sub>V<sub>b</sub> (for a 1:1 reaction)", note: "For other ratios, carry the mole ratio from the balanced equation." },
  { name: "Shape of the curve", body: "A gentle buffer plateau, a near-vertical jump at equivalence, then it flattens again.", note: "The weaker the acid, the smaller the jump — and the harder the endpoint is to see." },
  { name: "Polyprotic acids", body: "One equivalence point per proton, each with its own pK<sub>a</sub>.", note: "H₃PO₄ has three, though the third is too weak to show up in water." }
],
examples: [
  { q: "Titrating 25.0 mL of 0.100 M HCl with 0.100 M NaOH — equivalence volume?", steps: ["moles HCl = 0.100 × 0.0250 = 2.50 mmol", "1:1 reaction, so 2.50 mmol NaOH needed", "V = 2.50 mmol ÷ 0.100 M"], ans: "<b>25.0 mL</b>, and the pH there is <b>7.00</b>" },
  { q: "Why is the equivalence point of acetic acid + NaOH above pH 7?", steps: ["At equivalence, all the acetic acid has become acetate", "Acetate is a weak base — it takes H⁺ from water", "That leaves excess OH⁻"], ans: "pH ≈ <b>8.7</b>, basic — not 7" },
  { q: "Read a pKa off a titration curve", steps: ["Find the equivalence volume", "Halve it", "Read the pH at that volume"], ans: "that pH <b>is the pKa</b>" },
  { q: "Which indicator for a weak base titrated with strong acid?", steps: ["Equivalence pH is below 7 (≈ 5.3 for ammonia)", "Need an indicator that changes near there"], ans: "<b>methyl red</b> (4.4–6.2), not phenolphthalein" },
  { q: "25.0 mL of unknown HCl needs 18.4 mL of 0.200 M NaOH", steps: ["mol NaOH = 0.200 × 0.0184 = 3.68 mmol", "1:1, so 3.68 mmol HCl", "M = 3.68 mmol ÷ 25.0 mL"], ans: "<b>0.147 M</b>" }
],
links: [
  { name: "Acids, Bases & Buffers", desc: "The chemistry the curve is made of.", href: "room.html?room=chem-acids", tag: "room" },
  { name: "Reference Tables", desc: "Ka values and indicator ranges.", href: "room.html?room=reference", tag: "room" },
  { name: "Solutions & Concentration", desc: "Molarity and solution stoichiometry.", href: "room.html?room=chem-solutions", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
