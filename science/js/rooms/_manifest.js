/* Room registry — the single source of truth for what a room is called, what
   it looks like, what instruments it carries, and whether it appears on the
   board.

   A room used to be described in up to five places: here, its own module, its
   parent hub's entry, hard-coded HTML and hex in index.html, and the WIDGETS
   map in room.js. They drifted — the board claimed Math had nine rooms when
   one of the nine was an outbound link to Desmos. Display fields live here
   now and nowhere else; the modules keep the prose and the content.

   Per entry:
     name, glyph, color   what it is called and how it is drawn
     widgets              instruments, in render order. A string, or
                          {path, opts} so one module can serve several rooms
                          with different tabs. Paths are resolved by room.js,
                          which is the module that imports them.
     children             for a hub: its topic rooms, in order. Internal rooms
                          only — an outbound link is not a room, and counting
                          it as one is the drift this file exists to stop.
     home                 if it is a board tile: { pos } 1–9 across the 3×3
                          grid, plus center for the round one and also for a
                          second destination rendered beside it.
     home.sub             authored HTML, so it may carry markup like K<sub>a</sub>.
                          A hub with no sub gets its child count instead. */

export const MANIFEST = {
  "chemistry": {
    name: "Chemistry", glyph: "🧪", color: "#e0794b",
    children: ["chem-atoms", "chem-moles", "chem-solutions", "chem-acids", "chem-titration",
               "chem-gases", "chem-thermo", "chem-equilibrium", "chem-redox"],
    home: { pos: 1 }
  },
  "math": {
    name: "Math", glyph: "∑", color: "#8b93d0",
    children: ["math-algebra", "math-calculus", "math-geometry", "math-trigonometry",
               "math-statistics", "math-time-series", "math-symbols", "math-notes"],
    home: { pos: 2 }
  },
  "physics": {
    name: "Physics", glyph: "⚛", color: "#c98bd0",
    home: { pos: 3, sub: "Motion, energy, waves" }
  },
  "biochemistry": {
    name: "Biochemistry", glyph: "🧬", color: "#7fb0d0",
    home: { pos: 4, sub: "Enzymes, metabolism, DNA" }
  },
  "periodic-table": {
    name: "Periodic Table", glyph: "⚛", color: "#d4a24c",
    widgets: ["./widgets/periodic-table.js"],
    home: { pos: 5, center: true, sub: "118 elements" }
  },
  "reference": {
    name: "Reference Tables", glyph: "📋", color: "#5f9ea0",
    widgets: ["./widgets/reference-tables.js"],
    home: { pos: 6, sub: "Ions, solubility, K<sub>a</sub>, thermo", also: "data-analysis" }
  },
  "neuroscience": {
    name: "Neuroscience", glyph: "🧠", color: "#e06b8b",
    home: { pos: 7, sub: "Membrane potential, synapses" }
  },
  "biology": {
    name: "Biology", glyph: "🌿", color: "#6fae5f",
    home: { pos: 8, sub: "Cells, genes, physiology" }
  },
  "lab-methods": {
    name: "Lab Methods", glyph: "🔬", color: "#b8a24c",
    home: { pos: 9, sub: "Safety, prep, technique" }
  },

  /* Chemistry topic rooms. */
  "chem-atoms": { name: "Atoms, Bonding & Trends", glyph: "⚛", color: "#e0794b" },
  "chem-moles": { name: "Moles & Stoichiometry", glyph: "⚖️", color: "#e0794b",
    widgets: ["./widgets/stoichiometry.js",
              { path: "./widgets/chemistry.js", opts: { tabs: ["molar"] } }] },
  "chem-solutions": { name: "Solutions & Concentration", glyph: "🧫", color: "#e0794b",
    widgets: [{ path: "./widgets/chemistry.js", opts: { tabs: ["molarity", "dilution"] } }] },
  "chem-acids": { name: "Acids, Bases & Buffers", glyph: "🧴", color: "#e0794b",
    widgets: [{ path: "./widgets/chemistry.js", opts: { tabs: ["ph", "buffer"] } }] },
  "chem-titration": { name: "Titration", glyph: "⚗️", color: "#e0794b",
    widgets: ["./widgets/titration.js"] },
  "chem-gases": { name: "Gases", glyph: "🎈", color: "#e0794b",
    widgets: ["./widgets/gaslaws.js"] },
  "chem-thermo": { name: "Thermochemistry", glyph: "🔥", color: "#e0794b",
    widgets: ["./widgets/thermochem.js"] },
  "chem-equilibrium": { name: "Equilibrium & Kinetics", glyph: "⚖", color: "#e0794b" },
  "chem-redox": { name: "Redox & Electrochemistry", glyph: "🔋", color: "#e0794b" },

  /* Math rooms, absorbed from the standalone Math Lab. */
  "math-algebra": { name: "Algebra", glyph: "x²", color: "#8b93d0" },
  "math-calculus": { name: "Calculus", glyph: "∫", color: "#8b93d0" },
  "math-geometry": { name: "Geometry", glyph: "△", color: "#8b93d0" },
  "math-trigonometry": { name: "Trigonometry", glyph: "∠", color: "#8b93d0" },
  "math-statistics": { name: "Statistics", glyph: "📊", color: "#8b93d0" },
  "math-time-series": { name: "Time-Series Lab", glyph: "〜", color: "#8b93d0" },
  "math-symbols": { name: "Symbols", glyph: "π", color: "#8b93d0" },
  "math-notes": { name: "Notes & Formulas", glyph: "✎", color: "#8b93d0" },

  "data-analysis": { name: "Data, Symbols & Units", glyph: "📊", color: "#5fb0a8",
    widgets: ["./widgets/units.js"] }
};

/* Retired keys kept as redirects. */
export const ALIAS = { "symbols-units": "data-analysis" };

/* Board tiles in grid order. Derived, so adding a home entry is all it takes
   to put a room on the board. */
export const HOME = Object.keys(MANIFEST)
  .filter(function (k) { return MANIFEST[k].home; })
  .sort(function (a, b) { return MANIFEST[a].home.pos - MANIFEST[b].home.pos; });
