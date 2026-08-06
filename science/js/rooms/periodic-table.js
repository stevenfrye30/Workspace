/* Room content: periodic-table */

export default {
name: "Periodic Table", kind: "Core hub", glyph: "⚛", color: "#d4a24c",
blurb: "The connective center of the Science Lab — every element a doorway into chemistry, biochemistry, physics, and the bench.",
status: "Live — all 118 elements, searchable and filterable",
links: [
  { name: "Chemistry", desc: "Reactions, stoichiometry, acids/bases.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Biochemistry", desc: "Where elements become life.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Physics", desc: "Atomic structure & forces.", href: "room.html?room=physics", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Notation, SI units, constants, analysis.", href: "room.html?room=data-analysis", tag: "room" },
]
};
