/* Room content: reference — the general-chemistry lookup tables. */

export default {
kind: "Lookup",

/* blurb / status / topics are escaped by the renderer, so they use plain
   "Ka" and "Kb" — Unicode has a subscript a but no subscript b, and mixing
   the two reads as a typo. Card bodies and examples below are raw HTML and
   use proper <sub> markup. */
blurb: "The tables you stop and look up mid-problem — polyatomic ions, solubility rules, strong acids and bases, and Ka / Kb values. Built to be searched during a session and printed as a handout after one.",
status: "Live — searchable, screen-share sized, printable",
links: [
  { name: "Chemistry", desc: "Formulas, worked examples, and the live calculators.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Periodic Table", desc: "Element charges, groups, and electron configurations.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Data, Symbols & Units", desc: "SI units, prefixes, constants, and the converter.", href: "room.html?room=data-analysis", tag: "room" }
]
};
