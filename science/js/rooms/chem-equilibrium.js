/* Room content: chem-equilibrium — equilibrium and reaction rates. */

export default {
name: "Equilibrium & Kinetics", kind: "Chemistry · rates and balance", glyph: "⚖", color: "#e0794b",
blurb: "How far a reaction goes, and how fast it gets there — two different questions that students routinely mix up.",
status: "Reference — formulas and worked examples",
topics: [
  "Reversible reactions", "Dynamic equilibrium", "Equilibrium constant K",
  "Kc and Kp", "Reaction quotient Q", "ICE tables", "Le Chatelier's principle",
  "Common ion effect", "Ksp", "Reaction rate", "Rate law", "Reaction order",
  "Integrated rate laws", "Half-life", "Activation energy", "Catalysts"
],
cards: [
  { name: "Dynamic equilibrium", body: "Forward and reverse rates become equal — concentrations stop changing, but both reactions continue.", note: "Equilibrium is not the reaction stopping." },
  { name: "Equilibrium constant", body: "K = [products] / [reactants]", note: "Each term raised to its coefficient. Pure solids and liquids are left out." },
  { name: "What K tells you", body: "K ≫ 1 favours products · K ≈ 1 a real mixture · K ≪ 1 favours reactants", note: "K says where it ends up, never how fast." },
  { name: "Q versus K", body: "Q &lt; K → shifts right · Q &gt; K → shifts left · Q = K → at equilibrium", note: "Q is the same expression evaluated at any moment." },
  { name: "Le Chatelier's principle", body: "Disturb a system at equilibrium and it shifts to partly undo the change.", note: "Add reactant → right. Remove product → right. Compress a gas → towards fewer moles of gas." },
  { name: "Temperature is different", body: "Changing temperature changes K itself; concentration and pressure changes do not.", note: "Heat behaves like a reactant in an endothermic reaction." },
  { name: "Kc and Kp", body: "K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn</sup>, where Δn = moles of gas products − reactants", note: "They are equal when Δn = 0." },
  { name: "ICE table", body: "Initial, Change, Equilibrium — one column per species, change in the coefficient ratio.", note: "The standard way to set up an unknown-x equilibrium problem." },
  { name: "Solubility product", body: "K<sub>sp</sub> = the equilibrium constant for a solid dissolving.", note: "Smaller K<sub>sp</sub> means less soluble. The common ion effect pushes it further down." },
  { name: "Rate law", body: "rate = k[A]<sup>m</sup>[B]<sup>n</sup>", note: "Orders m and n are found by experiment — they are <b>not</b> the coefficients." },
  { name: "Reaction order", body: "Zero order: rate is constant · First: rate ∝ [A] · Second: rate ∝ [A]²", note: "Double [A]: first order doubles the rate, second order quadruples it." },
  { name: "Half-life", body: "First order: t½ = 0.693 / k — independent of concentration.", note: "That constancy is the signature of a first-order process." },
  { name: "Activation energy", body: "The barrier a collision must clear. A catalyst lowers it by offering a different route.", note: "A catalyst speeds both directions equally, so K is unchanged." }
],
examples: [
  { q: "Write K for  N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)", steps: ["Products over reactants", "Each raised to its coefficient"], ans: "<b>K = [NH₃]² / ([N₂][H₂]³)</b>" },
  { q: "Which way does it shift if H₂ is added?", steps: ["Q drops below K", "The system consumes the added H₂"], ans: "shifts <b>right</b>, making more NH₃" },
  { q: "Compressing  N₂ + 3 H₂ ⇌ 2 NH₃", steps: ["4 mol of gas on the left, 2 on the right", "Higher pressure favours fewer moles of gas"], ans: "shifts <b>right</b>" },
  { q: "K = 1 × 10⁻⁵ — where does it sit?", steps: ["K ≪ 1"], ans: "<b>reactant-favoured</b>; very little product at equilibrium" },
  { q: "Doubling [A] quadruples the rate — what order?", steps: ["2ᵐ = 4"], ans: "<b>second order</b> in A" },
  { q: "Half-life of a first-order reaction with k = 0.0231 s⁻¹", steps: ["t½ = 0.693 / k", "= 0.693 / 0.0231"], ans: "<b>30.0 s</b>" },
  { q: "Does a catalyst change the yield?", steps: ["It lowers the activation energy of both directions equally", "K is untouched"], ans: "<b>no</b> — it changes the rate, not the position" }
],
links: [
  { name: "Acids, Bases & Buffers", desc: "Ka and Kb are equilibrium constants.", href: "room.html?room=chem-acids", tag: "room" },
  { name: "Thermochemistry", desc: "ΔG = −RT ln K ties them together.", href: "room.html?room=chem-thermo", tag: "room" },
  { name: "Redox & Electrochemistry", desc: "Cell potential and equilibrium.", href: "room.html?room=chem-redox", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
