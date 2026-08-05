/* Room content: math — the hub, mirroring the Chemistry one. */

export default {
name: "Math", kind: "Structure & change", glyph: "∑", color: "#8b93d0",
blurb: "Reference, worked examples and notation. Graphing hands off to Desmos.",
status: "Hub — nine rooms",
hub: [
  { key: "math-algebra", glyph: "x²", name: "Algebra",
    desc: "Equations, factoring, functions, exponents, logarithms, systems." },
  { key: "math-calculus", glyph: "∫", name: "Calculus",
    desc: "Limits, derivatives, integrals, and the rules that connect them." },
  { key: "math-geometry", glyph: "△", name: "Geometry",
    desc: "Shapes, area and volume, coordinates, distance and proofs." },
  { key: "math-trigonometry", glyph: "∠", name: "Trigonometry",
    desc: "Ratios, the unit circle, identities, and wave behaviour." },
  { key: "math-statistics", glyph: "📊", name: "Statistics",
    desc: "Descriptive stats, distributions, probability, inference, regression." },
  { key: "math-time-series", glyph: "〜", name: "Time-Series Lab",
    desc: "Traces over time — smoothing, peaks, area, decay constants." },
  { key: "math-symbols", glyph: "π", name: "Symbols",
    desc: "Greek letters, operators, set and logic notation.", tools: "Click to copy" },
  { key: "math-notes", glyph: "✎", name: "Notes & Formulas",
    desc: "Essentials from every math room, plus your own notebook." },
  { href: "https://www.desmos.com/calculator", glyph: "📈", name: "Desmos ↗",
    desc: "Graphing, sliders and tables. Opens in a new tab.", tools: "External" }
]
};
