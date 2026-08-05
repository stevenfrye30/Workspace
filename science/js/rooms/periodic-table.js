/* Room content: periodic-table */

export default {
name: "Periodic Table", kind: "Core hub", glyph: "⚛", color: "#d4a24c",
blurb: "The connective center of the Science Lab — every element a doorway into chemistry, biochemistry, physics, and the bench.",
status: "Live — all 118 elements, searchable and filterable",
topics: ["Elements", "Groups & families", "Periods", "Atomic structure", "Electron configuration", "Periodic trends", "Bonding", "Oxidation states", "Electronegativity", "Atomic mass", "Biological relevance", "Lab relevance"],
cards: [
  { name: "Element card", body: '<span class="elcard"><span class="z">6</span><span class="sym">C</span><span class="nm">Carbon</span><span class="ms">12.011</span></span>', note: "Click any element above to open its card: atomic number &amp; mass, group, period, electron configuration, oxidation states, and its biological + lab relevance." },
  { name: "Periodic trends", body: "Across a period →: radius ↓, electronegativity ↑, ionization energy ↑.<br>Down a group ↓: radius ↑, electronegativity ↓.", note: "" },
  { name: "Groups & families", body: "Alkali (1) · alkaline earth (2) · transition metals · halogens (17) · noble gases (18) · lanthanides & actinides.", note: "" },
  { name: "Bonding from the table", body: "Ionic (metal + nonmetal) · covalent (nonmetal + nonmetal) · metallic. Polarity follows ΔEN.", note: "" }
],
links: [
  { name: "Chemistry", desc: "Reactions, stoichiometry, acids/bases.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Biochemistry", desc: "Where elements become life.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Physics", desc: "Atomic structure & forces.", href: "room.html?room=physics", tag: "room" },
  { name: "Data, Symbols & Units", desc: "Notation, SI units, constants, analysis.", href: "room.html?room=data-analysis", tag: "room" },
]
};
