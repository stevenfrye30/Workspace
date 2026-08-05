/* Room registry: the only list of valid ?room= keys. */

export const MANIFEST = {
  "periodic-table": { name: "Periodic Table", glyph: "⚛", color: "#d4a24c" },
  "chemistry": { name: "Chemistry", glyph: "🧪", color: "#e0794b" },
  "biology": { name: "Biology", glyph: "🌿", color: "#6fae5f" },
  "biochemistry": { name: "Biochemistry", glyph: "🧬", color: "#7fb0d0" },
  "physics": { name: "Physics & Math", glyph: "🧲", color: "#c98bd0" },
  "neuroscience": { name: "Neuroscience & Electrophysiology", glyph: "🧠", color: "#e06b8b" },
  "lab-methods": { name: "Lab Methods", glyph: "🔬", color: "#b8a24c" },
  "data-analysis": { name: "Data, Symbols & Units", glyph: "📊", color: "#5fb0a8" },
  "notes": { name: "Notes & Study Library", glyph: "📓", color: "#c2b280" },
};

/* Retired keys kept as redirects. */
export const ALIAS = { "symbols-units": "data-analysis" };
