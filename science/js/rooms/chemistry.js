/* Room content: chemistry — the hub.

   This used to be one very long page carrying every instrument, 33 reference
   cards and 24 examples in a single scroll. It is now a set of doors: each
   topic is its own room with only its own tools, cards and examples, which is
   also how a session actually runs — you open one subject and stay in it. */

/* The order of the doors, and their names and glyphs, live in the manifest.
   What stays here is the prose: what each room is for, and what it carries. */

export default {
kind: "Matter",
blurb: "General chemistry, one topic per room. Pick where you are working — each room has its own solvers, reference cards and worked examples.",
status: "Hub — nine topic rooms",
hub: {
  "chem-atoms": {
    desc: "Structure, ions, electron configuration, bond types, periodic trends and intermolecular forces.",
    tools: "Pairs with the periodic table" },
  "chem-moles": {
    desc: "The mole, molar mass, empirical formulas, balancing, mole ratios and limiting reagent.",
    tools: "Limiting reagent solver · molar mass" },
  "chem-solutions": {
    desc: "Molarity, dilution, solution stoichiometry, solubility rules and net ionic equations.",
    tools: "Molarity · dilution" },
  "chem-acids": {
    desc: "Strong vs weak, the pH scale, Ka and Kb, buffers and Henderson–Hasselbalch.",
    tools: "pH · buffer" },
  "chem-titration": {
    desc: "Curves, equivalence and half-equivalence, the buffer region, and choosing an indicator.",
    tools: "Curve · table · indicator picker" },
  "chem-gases": {
    desc: "Ideal and combined gas laws, molar volume, partial pressures and effusion.",
    tools: "PV=nRT · combined · Dalton · Graham" },
  "chem-thermo": {
    desc: "Calorimetry, enthalpy, Hess's law, phase changes, entropy and spontaneity.",
    tools: "q=mcΔT · ΔH°rxn · Hess" },
  "chem-equilibrium": {
    desc: "K and Q, Le Chatelier, ICE tables, rate laws, order, half-life and catalysts.",
    tools: "Formulas & examples" },
  "chem-redox": {
    desc: "Oxidation numbers, half-reactions, galvanic cells, cell potential and electrolysis.",
    tools: "Formulas & examples" }
},
/* One link out, not a section of them — everything else on this page is a
   door into a topic, and the periodic table is the only thing reached for
   often enough to sit beside them. The rest of the lab is a click away on
   the home dashboard. */
quick: ["periodic-table"]
};
