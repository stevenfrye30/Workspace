/* Room content: physics */

export default {
name: "Physics & Math", kind: "Forces & fields", glyph: "🧲", color: "#c98bd0",
blurb: "The bridge room — physical-science concepts on one side, the working math tools that handle them on the other. Light on its own archive; its strength is sending mechanics, waves, circuits, optics, and ephys signals straight into Math Lab's graphing, calculus, statistics, and time-series tools.",
status: "Bridge room — concepts here, calculators & graphs in Math Lab",
callout: "<b>This room is a bridge, not an archive.</b> Physics has little dedicated coursework saved here — so rather than a thin standalone room, it connects each topic to the tool that does the work: <b>Math Lab</b> for formulas, graphing, calculus, statistics, and time-series. Follow the links below.",
topics: [
  "Mechanics", "Kinematics", "Forces & energy", "Waves", "Sound & resonance",
  "Electricity & circuits", "Optics", "Thermodynamics", "Units & dimensional analysis",
  "Significant figures & error", "Graphing relationships", "Calculus in physics",
  "Statistics & uncertainty", "Time-series signals", "Ephys math"
],
cards: [
  { name: "Measurement & units", body: "SI base units · dimensional analysis (both sides must match) · significant figures · uncertainty &amp; error propagation.", note: "Carry units through every step — they catch mistakes." },
  { name: "Kinematics", body: "v = Δx/Δt · a = Δv/Δt · x = x₀ + v₀t + ½at² · v² = v₀² + 2aΔx.", note: "Plot x(t) and v(t) in Graph Lab." },
  { name: "Newton's second law", body: "F = ma · weight W = mg · momentum p = mv.", note: "" },
  { name: "Energy & work", body: "W = F·d · KE = ½mv² · PE = mgh · power P = W/t.", note: "Energy is conserved in a closed system." },
  { name: "Waves", body: "v = f λ · period T = 1/f · amplitude &amp; phase · interference &amp; resonance.", note: "Sine / cosine — graph them in Graph Lab." },
  { name: "Electricity & circuits", body: "Ohm's law V = IR · power P = IV = I²R · series add R, parallel add 1/R · charge Q = CV.", note: "The same Ohm's law returns in ephys (channels)." },
  { name: "Optics", body: "Snell's law n₁ sinθ₁ = n₂ sinθ₂ · thin lens 1/f = 1/d₀ + 1/dᵢ · magnification m = −dᵢ/d₀.", note: "" },
  { name: "Thermodynamics", body: "Q = mcΔT · first law ΔU = Q − W · ideal gas PV = nRT.", note: "Connects to Chemistry thermodynamics." },
  { name: "Graphing relationships", body: "Linear y = mx + b · slope = rate · area under a curve = accumulated quantity (∫).", note: "Graph Lab plots any equation." },
  { name: "Calculus in physics", body: "velocity = dx/dt · acceleration = dv/dt · displacement = ∫v dt · work = ∫F dx.", note: "Derivatives &amp; integrals — see Math Lab · Calculus." },
  { name: "Statistics & uncertainty", body: "mean ± SD · standard error · propagate error through a formula · report honest sig figs.", note: "Math Lab · Statistics." },
  { name: "Time-series signals", body: "A trace is value vs time — smooth, find peaks/events, baseline, amplitude, AUC, decay τ.", note: "Math Lab · Time-Series; shared with ephys." },
  { name: "Ephys math", body: "Ohm's law I = gV · driving force (V<sub>m</sub> − E<sub>ion</sub>) · capacitance Q = CV · exponential decay fits.", note: "Physics math reused at the synapse — see Neuroscience &amp; Ephys." }
],
examples: [
  { q: "A car travels 100 m in 5 s — average speed?", steps: ["v = Δx/Δt = 100 / 5"], ans: "<b>20 m/s</b>" },
  { q: "Kinetic energy of 2 kg at 3 m/s", steps: ["KE = ½mv² = ½ × 2 × 3²"], ans: "<b>9 J</b>" },
  { q: "Wave: f = 50 Hz, λ = 2 m — speed?", steps: ["v = f λ = 50 × 2"], ans: "<b>100 m/s</b>" },
  { q: "12 V across a 4 Ω resistor — current?", steps: ["Ohm's law I = V/R = 12 / 4"], ans: "<b>3 A</b>" },
  { q: "Dimensional check: is v = a·t valid?", steps: ["[a·t] = (m/s²)(s) = m/s", "[v] = m/s — units agree"], ans: "<b>valid</b>" },
  { q: "Take a measured trace to Math Lab", steps: ["Export (time, value) with units", "Smooth → peaks → baseline → AUC → fit τ"], ans: "use <b>Math Lab · Time-Series</b>" }
],
links: [
  { name: "Math Lab (home)", desc: "All the math tools — the dashboard.", href: "../math/", tag: "math" },
  { name: "Math Lab · Physics", desc: "Full physics formula reference & worked examples.", href: "../math/room.html?room=physics", tag: "math" },
  { name: "Math Lab · Algebra", desc: "Rearrange & solve equations.", href: "../math/room.html?room=algebra", tag: "math" },
  { name: "Math Lab · Calculus", desc: "Derivatives & integrals — rates and areas.", href: "../math/room.html?room=calculus", tag: "math" },
  { name: "Math Lab · Statistics", desc: "Mean, SD, error, tests, effect size.", href: "../math/room.html?room=statistics", tag: "math" },
  { name: "Math Lab · Time-Series", desc: "Smooth, peaks/events, AUC, decay τ.", href: "../math/room.html?room=time-series", tag: "math" },
  { name: "Math Lab · Symbols", desc: "Math notation & constants.", href: "../math/room.html?room=symbols", tag: "math" },
  { name: "Graph Lab", desc: "Plot motion or any equation.", href: "../math/graph-lab.html", tag: "math" },
  { name: "Open Data, Symbols & Units", desc: "Units, error, scientific notation.", href: "room.html?room=data-analysis", tag: "room" },
  { name: "Open Neuroscience & Ephys", desc: "Where this math meets the synapse.", href: "room.html?room=neuroscience", tag: "room" },
  { name: "Open Chemistry", desc: "Thermodynamics, gas laws, energy.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Open Lab Methods", desc: "Measurement & data-quality habits.", href: "room.html?room=lab-methods", tag: "room" },
  { name: "Open Periodic Table", desc: "The atomic structure behind matter.", href: "room.html?room=periodic-table", tag: "room" }
]
};
