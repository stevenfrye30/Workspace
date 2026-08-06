/* Room content: periodic-table

   Card names, the blurb and link text are escaped by the renderer, so they use
   plain words and Unicode subscripts. Card bodies, notes and the worked
   examples are raw HTML and use proper <sub> / <sup> markup. */

export default {
kind: "Core hub",

blurb: "The connective center of the Science Lab — every element a doorway into chemistry, biochemistry, physics, and the bench. Shade the table by a property to see a trend all at once, then read why it goes that way.",
status: "Live — 118 elements, searchable, filterable, and shaded by four periodic trends",
examplesSub: "Work each one, then click to check.",
links: [
  { name: "Chemistry", desc: "Reactions, stoichiometry, acids/bases.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Moles & Stoichiometry", desc: "Atomic masses become molar masses.", href: "room.html?room=chem-moles", tag: "room" },
  { name: "Reference Tables", desc: "Ion charges, solubility, and formula writing.", href: "room.html?room=reference", tag: "room" },
  { name: "Biochemistry", desc: "Where elements become life.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Physics", desc: "Atomic structure & forces.", href: "room.html?room=physics", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Notation, SI units, constants, analysis.", href: "room.html?room=data-analysis", tag: "room" }
]
};
