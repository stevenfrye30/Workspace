/* Room registry: the only list of valid ?room= keys. */

export const MANIFEST = {
  "periodic-table": { name: "Periodic Table", glyph: "⚛", color: "#d4a24c" },
  "reference": { name: "Reference Tables", glyph: "📋", color: "#5f9ea0" },
  "chemistry": { name: "Chemistry", glyph: "🧪", color: "#e0794b" },
  /* Chemistry topic rooms — the hub above links to these. */
  "chem-atoms": { name: "Atoms, Bonding & Trends", glyph: "⚛", color: "#e0794b" },
  "chem-moles": { name: "Moles & Stoichiometry", glyph: "⚖️", color: "#e0794b" },
  "chem-solutions": { name: "Solutions & Concentration", glyph: "🧫", color: "#e0794b" },
  "chem-acids": { name: "Acids, Bases & Buffers", glyph: "🧴", color: "#e0794b" },
  "chem-titration": { name: "Titration", glyph: "⚗️", color: "#e0794b" },
  "chem-gases": { name: "Gases", glyph: "🎈", color: "#e0794b" },
  "chem-thermo": { name: "Thermochemistry", glyph: "🔥", color: "#e0794b" },
  "chem-equilibrium": { name: "Equilibrium & Kinetics", glyph: "⚖", color: "#e0794b" },
  "chem-redox": { name: "Redox & Electrochemistry", glyph: "🔋", color: "#e0794b" },
  "biology": { name: "Biology", glyph: "🌿", color: "#6fae5f" },
  "biochemistry": { name: "Biochemistry", glyph: "🧬", color: "#7fb0d0" },
  "physics": { name: "Physics", glyph: "⚛", color: "#c98bd0" },
  /* Math rooms, absorbed from the standalone Math Lab. */
  "math-algebra": { name: "Algebra", glyph: "x²", color: "#8b93d0" },
  "math-calculus": { name: "Calculus", glyph: "∫", color: "#8b93d0" },
  "math-geometry": { name: "Geometry", glyph: "△", color: "#8b93d0" },
  "math-trigonometry": { name: "Trigonometry", glyph: "∠", color: "#8b93d0" },
  "math-statistics": { name: "Statistics", glyph: "📊", color: "#8b93d0" },
  "math-time-series": { name: "Time-Series Lab", glyph: "〜", color: "#8b93d0" },
  "math-symbols": { name: "Symbols", glyph: "π", color: "#8b93d0" },
  "math-notes": { name: "Notes & Formulas", glyph: "✎", color: "#8b93d0" },
  "neuroscience": { name: "Neuroscience & Electrophysiology", glyph: "🧠", color: "#e06b8b" },
  "lab-methods": { name: "Lab Methods", glyph: "🔬", color: "#b8a24c" },
  "data-analysis": { name: "Data, Symbols & Units", glyph: "📊", color: "#5fb0a8" },
  "notes": { name: "Notes & Study Library", glyph: "📓", color: "#c2b280" },
};

/* Retired keys kept as redirects. */
export const ALIAS = { "symbols-units": "data-analysis" };
