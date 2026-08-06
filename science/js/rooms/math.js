/* Room content: math — the hub, mirroring the Chemistry one. */

export default {
kind: "Structure & change",
blurb: "Reference, worked examples and notation. Graphing hands off to Desmos.",
status: "Hub — eight rooms, plus Desmos",
hub: {
  "math-algebra": { desc: "Equations, factoring, functions, exponents, logarithms, systems." },
  "math-calculus": { desc: "Limits, derivatives, integrals, and the rules that connect them." },
  "math-geometry": { desc: "Shapes, area and volume, coordinates, distance and proofs." },
  "math-trigonometry": { desc: "Ratios, the unit circle, identities, and wave behaviour." },
  "math-statistics": { desc: "Descriptive stats, distributions, probability, inference, regression." },
  "math-time-series": { desc: "Traces over time — smoothing, peaks, area, decay constants." },
  "math-symbols": { desc: "Greek letters, operators, set and logic notation.", tools: "Click to copy" },
  "math-notes": { desc: "Essentials from every math room, plus your own notebook." }
},
/* Not a room, and deliberately not in the manifest's children — counting an
   outbound link as a room is what made the board claim nine of them. */
hubExternal: [
  { href: "https://www.desmos.com/calculator", glyph: "📈", name: "Desmos ↗",
    desc: "Graphing, sliders and tables. Opens in a new tab.", tools: "External" }
]
};
