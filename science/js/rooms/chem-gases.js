/* Room content: chem-gases — the gas laws. */

export default {
kind: "Chemistry · the gas phase",

blurb: "Pressure, volume, temperature and amount, and the one equation that ties them together — plus partial pressures and why lighter gases escape faster.",
status: "Live — ideal, combined, Dalton and Graham solvers",
cards: [
  { name: "Ideal gas law", body: "PV = nRT", note: "R = 0.0821 L·atm/mol·K  (8.314 J/mol·K). Temperature must be in kelvin, and R must match your pressure unit." },
  { name: "Combined gas law", body: "P₁V₁/T₁ = P₂V₂/T₂", note: "Boyle, Charles and Gay-Lussac are all this equation with one quantity held constant." },
  { name: "The named laws", body: "Boyle: P↑ V↓ · Charles: V ∝ T · Gay-Lussac: P ∝ T · Avogadro: V ∝ n", note: "Each holds the other quantities fixed." },
  { name: "Molar volume at STP", body: "1 mol of any ideal gas = <b>22.4 L</b> at 0 °C and 1 atm.", note: "IUPAC's STP is 0 °C and 100 kPa, giving 22.7 L — check which one your course uses." },
  { name: "Dalton's law", body: "P<sub>total</sub> = ΣP<sub>i</sub> · P<sub>i</sub> = X<sub>i</sub>·P<sub>total</sub>", note: "X<sub>i</sub> = n<sub>i</sub>/n<sub>total</sub>; mole fractions add to 1." },
  { name: "Graham's law", body: "rate₁ / rate₂ = √(M₂ / M₁)", note: "Lighter gases effuse faster. Times are the inverse of rates." },
  { name: "Gas density", body: "d = PM / RT, so M = dRT / P", note: "Lets you find a molar mass from a measured gas density." },
  { name: "Kelvin, always", body: "Every gas law uses absolute temperature.", note: "A ratio of Celsius values is meaningless — 20 °C is not twice 10 °C." },
  { name: "Real gases", body: "Ideal behaviour fails at high pressure and low temperature, where molecules attract and take up space.", note: "Van der Waals adds a correction for each." }
],
examples: [
  { q: "Volume of 1.00 mol of gas at 0 °C and 1.00 atm", steps: ["V = nRT/P", "T must be kelvin: 0 °C = 273 K", "V = (1.00 × 0.0821 × 273) / 1.00"], ans: "<b>22.4 L</b> — the molar volume at STP" },
  { q: "A gas at 1.00 atm and 2.00 L is compressed to 2.00 atm at fixed T", steps: ["T constant ⇒ Boyle's law: P₁V₁ = P₂V₂", "V₂ = (1.00 × 2.00) / 2.00"], ans: "<b>1.00 L</b> — double the pressure, half the volume" },
  { q: "2.00 L at 27 °C is heated to 327 °C at fixed P", steps: ["P constant ⇒ Charles's law: V₁/T₁ = V₂/T₂", "Convert: 300 K and 600 K", "V₂ = 2.00 × 600/300"], ans: "<b>4.00 L</b> — doubling absolute T doubles V" },
  { q: "Partial pressure of O₂ in dry air at 1.00 atm", steps: ["Air is ~21% O₂ by moles, so X = 0.21", "P = X · P_total = 0.21 × 1.00"], ans: "<b>0.21 atm</b>" },
  { q: "How much faster does He effuse than O₂?", steps: ["M(He) = 4.00, M(O₂) = 32.0", "rate ratio = √(32.0 / 4.00) = √8.00"], ans: "<b>2.83×</b> faster" },
  { q: "Molar mass of a gas with density 1.96 g/L at STP", steps: ["M = dRT/P", "= 1.96 × 0.0821 × 273 / 1.00"], ans: "<b>44.0 g/mol</b> — CO₂" }
],
links: [
  { name: "Moles & Stoichiometry", desc: "Gas volumes into mole ratios.", href: "room.html?room=chem-moles", tag: "room" },
  { name: "Thermochemistry", desc: "Heat, work and the gas phase.", href: "room.html?room=chem-thermo", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Pressure conversions and constants.", href: "room.html?room=data-analysis", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
