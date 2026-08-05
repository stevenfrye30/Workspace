/* Room content: chemistry — the hub.

   This used to be one very long page carrying every instrument, 33 reference
   cards and 24 examples in a single scroll. It is now a set of doors: each
   topic is its own room with only its own tools, cards and examples, which is
   also how a session actually runs — you open one subject and stay in it. */

export default {
name: "Chemistry", kind: "Matter", glyph: "🧪", color: "#e0794b",
blurb: "General chemistry, one topic per room. Pick where you are working — each room has its own solvers, reference cards and worked examples.",
status: "Hub — nine topic rooms",
hub: [
  { key: "chem-atoms", glyph: "⚛", name: "Atoms, Bonding & Trends",
    desc: "Structure, ions, electron configuration, bond types, periodic trends and intermolecular forces.",
    tools: "Pairs with the periodic table" },
  { key: "chem-moles", glyph: "⚖️", name: "Moles & Stoichiometry",
    desc: "The mole, molar mass, empirical formulas, balancing, mole ratios and limiting reagent.",
    tools: "Limiting reagent solver · molar mass" },
  { key: "chem-solutions", glyph: "🧫", name: "Solutions & Concentration",
    desc: "Molarity, dilution, solution stoichiometry, solubility rules and net ionic equations.",
    tools: "Molarity · dilution" },
  { key: "chem-acids", glyph: "🧴", name: "Acids, Bases & Buffers",
    desc: "Strong vs weak, the pH scale, Ka and Kb, buffers and Henderson–Hasselbalch.",
    tools: "pH · buffer" },
  { key: "chem-titration", glyph: "⚗️", name: "Titration",
    desc: "Curves, equivalence and half-equivalence, the buffer region, and choosing an indicator.",
    tools: "Curve · table · indicator picker" },
  { key: "chem-gases", glyph: "🎈", name: "Gases",
    desc: "Ideal and combined gas laws, molar volume, partial pressures and effusion.",
    tools: "PV=nRT · combined · Dalton · Graham" },
  { key: "chem-thermo", glyph: "🔥", name: "Thermochemistry",
    desc: "Calorimetry, enthalpy, Hess's law, phase changes, entropy and spontaneity.",
    tools: "q=mcΔT · ΔH°rxn · Hess" },
  { key: "chem-equilibrium", glyph: "⚖", name: "Equilibrium & Kinetics",
    desc: "K and Q, Le Chatelier, ICE tables, rate laws, order, half-life and catalysts.",
    tools: "Formulas & examples" },
  { key: "chem-redox", glyph: "🔋", name: "Redox & Electrochemistry",
    desc: "Oxidation numbers, half-reactions, galvanic cells, cell potential and electrolysis.",
    tools: "Formulas & examples" }
],
links: [
  { name: "Reference Tables", desc: "Ions, solubility, strong acids, Ka/Kb, thermo — searchable.", href: "room.html?room=reference", tag: "room" },
  { name: "Periodic Table", desc: "All 118 elements, searchable and filterable.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Unit converter, constants and a scientific calculator.", href: "room.html?room=data-analysis", tag: "room" },
  { name: "Biochemistry", desc: "Where this chemistry meets biology.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Lab Methods", desc: "Solution prep, titrations, calibration.", href: "room.html?room=lab-methods", tag: "room" },
  { name: "Algebra", desc: "Rearrange and solve equations.", href: "room.html?room=math-algebra", tag: "math" }
]
};
