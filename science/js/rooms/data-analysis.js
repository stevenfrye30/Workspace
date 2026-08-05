/* Room content: data-analysis */

export default {
name: "Data, Symbols & Units", kind: "Evidence & notation", glyph: "📊", color: "#5fb0a8",
blurb: "The bench reference for turning measurements into conclusions — experimental design, statistics, traces, and error — plus the shared units, symbols, and notation of science.",
status: "Live tools — units converter & calculator — plus reference, wired to Math Lab",
topics: [
  "Experimental design", "Variables", "Controls", "Replicates", "Graphing", "Statistics",
  "Time-series analysis", "Error & uncertainty", "Significant figures", "SI base units",
  "Derived units", "Prefixes", "Scientific notation", "Greek letters", "Chemistry notation",
  "Biology notation", "Ephys notation", "Imaging notation", "Constants"
],
cards: [
  { name: "Controls", body: "Positive & negative controls · vehicle · blinding · randomization.", note: "" },
  { name: "Variables", body: "Independent (you change) · dependent (you measure) · controlled (held constant) · confounders.", note: "" },
  { name: "Replicates", body: "Technical (same sample, repeated) vs biological (independent samples). Report n.", note: "" },
  { name: "Mean, SD, SEM", body: "x&#772; = &Sigma;x/n · SD = spread · SEM = SD/&radic;n (precision of the mean).", note: "" },
  { name: "Error & uncertainty", body: "Random (scatter, reduce with n) vs systematic (bias). Report value ± uncertainty.", note: "" },
  { name: "Significant figures", body: "Keep the digits the measurement supports; the result is only as precise as its least-precise input.", note: "" },
  { name: "SI base units", body: "metre (m) · kilogram (kg) · second (s) · ampere (A) · kelvin (K) · mole (mol) · candela (cd).", note: "" },
  { name: "Prefixes", body: "n (10⁻⁹) · µ (10⁻⁶) · m (10⁻³) · c (10⁻²) · k (10³) · M (10⁶) · G (10⁹).", note: "" },
  { name: "Scientific notation", body: "a × 10<sup>n</sup>, with 1 ≤ |a| &lt; 10. Add/subtract: match exponents; multiply: add exponents.", note: "" },
  { name: "Unit conversion", body: "Multiply by 1 in disguise (e.g. 1000 mg / 1 g); cancel units; check the result's units.", note: "" },
  { name: "Common constants", body: "N<sub>A</sub> = 6.022×10²³ /mol · R = 8.314 J/mol·K · k<sub>B</sub> = 1.38×10⁻²³ J/K · c = 3.00×10⁸ m/s.", note: "" },
  { name: "Chemistry notation", body: "H₂O · Na⁺ · Cl⁻ · ΔG · K · pH · mol/L · e⁻ · subscripts (count) & superscripts (charge).", note: "" },
  { name: "Biology notation", body: "DNA / RNA · A–T, G–C · 5′→3′ · genotype/phenotype · [S], K<sub>m</sub>, V<sub>max</sub>.", note: "" },
  { name: "Ephys notation", body: "V<sub>m</sub> · E<sub>ion</sub> · pA · mV · MΩ · pF · ms · τ · R<sub>a</sub> · R<sub>m</sub>.", note: "" },
  { name: "Imaging notation", body: "ΔF/F · F₀ (baseline) · GCaMP (Ca²⁺) · iGluSnFR (glutamate).", note: "" }
],
links: [
  { name: "Math Lab · Statistics", desc: "Distributions, regression, hypothesis tests.", href: "../math/room.html?room=statistics", tag: "math" },
  { name: "Math Lab · Time-Series", desc: "Trace smoothing, peaks, AUC, decay τ.", href: "../math/room.html?room=time-series", tag: "math" },
  { name: "Math Lab · Graph Lab", desc: "Plot and explore functions & data.", href: "../math/graph-lab.html", tag: "math" },
  { name: "Math Lab · Symbols", desc: "Click-to-copy symbol library (175 symbols).", href: "../math/room.html?room=symbols", tag: "math" },
  { name: "Periodic Table", desc: "Element symbols & units.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Biology", desc: "Where the data comes from.", href: "room.html?room=biology", tag: "room" },
  { name: "Chemistry", desc: "Notation in context.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Biochemistry", desc: "Kinetics, metabolism, assays.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Neuroscience & Ephys", desc: "Traces, ΔF/F, signal metrics.", href: "room.html?room=neuroscience", tag: "room" },
]
};
