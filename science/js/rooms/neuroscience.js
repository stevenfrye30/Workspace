/* Room content: neuroscience */

export default {
name: "Neuroscience & Electrophysiology", kind: "Signals", glyph: "🧠", color: "#e06b8b",
blurb: "Neurons, synapses, and the electrical & optical signals they produce — a bench notebook for patch clamp, calcium/glutamate imaging, and trace analysis.",
status: "Populated — ephys & imaging reference, examples, and Time-Series links",
callout: "<b>Bench-oriented & educational.</b> This room mirrors real ephys/imaging workflow and connects it to the Time-Series and Statistics tools in Math Lab. (General reference — no private lab data.)",
topics: [
  "Neurons", "Glia", "Membrane potential", "Ion gradients", "Ions: Na⁺ K⁺ Ca²⁺ Cl⁻", "Action potentials",
  "Synapses", "Neurotransmitters", "Receptors", "Excitatory & inhibitory", "EPSCs & IPSCs", "mEPSCs",
  "Evoked responses", "Synaptic plasticity", "Patch clamp", "Voltage clamp", "Current clamp",
  "Access resistance", "Membrane resistance", "Capacitance", "Holding current", "Calcium imaging",
  "Glutamate imaging", "GCaMP", "iGluSnFR", "Signal traces", "Time-series analysis"
],
cards: [
  { name: "Resting membrane potential", body: "V<sub>m</sub> ≈ −65 to −70 mV — set by ion gradients and selective permeability (mostly K⁺ at rest).", note: "" },
  { name: "Nernst equation", body: "E<sub>ion</sub> = (RT/zF)·ln([ion]<sub>out</sub>/[ion]<sub>in</sub>) ≈ (61/z)·log₁₀(out/in) mV at 37 °C.", note: "Equilibrium potential for a single ion." },
  { name: "Goldman equation", body: "V<sub>m</sub> from several ions weighted by permeability (P<sub>K</sub>, P<sub>Na</sub>, P<sub>Cl</sub>).", note: "Resting V<sub>m</sub> when many ions contribute." },
  { name: "Membrane capacitance", body: "C<sub>m</sub> ≈ 1 µF/cm² · Q = C·V.", note: "Sets how fast V<sub>m</sub> can change; charges before it responds." },
  { name: "Ohm's law (channels)", body: "I = V / R = g·V · conductance g = 1/R.", note: "" },
  { name: "Driving force", body: "I<sub>ion</sub> = g·(V<sub>m</sub> − E<sub>ion</sub>)", note: "(V<sub>m</sub> − E<sub>ion</sub>) is the driving force; sign sets current direction." },
  { name: "EPSC / IPSC", body: "EPSC: inward, depolarizing (e.g. glutamate). IPSC: outward/hyperpolarizing (GABA, glycine).", note: "" },
  { name: "mEPSC (miniature)", body: "Response to single-vesicle (quantal) release; persists in TTX; small (~pA).", note: "Probes quantal size & release frequency." },
  { name: "Evoked response", body: "Stimulus-locked synaptic current/potential; amplitude scales with release.", note: "Train stimulation reveals plasticity (PPR, depression, facilitation)." },
  { name: "Voltage vs current clamp", body: "Voltage clamp: hold V<sub>m</sub>, measure current. Current clamp: inject current, measure V<sub>m</sub>.", note: "" },
  { name: "Access (series) resistance", body: "R<sub>a</sub> — electrode + pipette resistance in series with the cell.", note: "Filters fast currents and adds voltage error (I·R<sub>a</sub>); monitor & report % change." },
  { name: "Membrane resistance", body: "R<sub>m</sub> (input resistance) — higher = better seal; a falling R<sub>m</sub> means leak.", note: "Health indicator." },
  { name: "Holding current", body: "Steady current needed to clamp V<sub>m</sub> at the holding potential.", note: "Drift signals seal/health change or rundown." },
  { name: "ΔF/F (imaging)", body: "ΔF/F = (F − F₀) / F₀", note: "Normalizes fluorescence to a baseline F₀." },
  { name: "GCaMP / iGluSnFR", body: "Genetically-encoded sensors: GCaMP reports Ca²⁺ (activity); iGluSnFR reports extracellular glutamate (release).", note: "" },
  { name: "Baseline correction", body: "Subtract the mean of a quiet pre-event window so baseline = 0, then measure.", note: "" },
  { name: "Peak amplitude", body: "Maximum deflection from baseline (pA, mV, or ΔF/F).", note: "" },
  { name: "Area under curve (charge)", body: "∫ I dt = charge transferred; trapezoidal integration on a trace.", note: "" },
  { name: "Decay time constant τ", body: "Single-exponential fit of the decay; reflects receptor/channel kinetics & clearance.", note: "Units: ms." },
  { name: "Signal-to-noise ratio", body: "SNR = signal amplitude / baseline noise (σ).", note: "Higher = more reliable event detection." },
  { name: "Whole-cell recording", body: "Rupture the patch → cytoplasmic access → clamp the whole cell.", note: "Quantal view: evoked ≈ N × quantal (≈ mEPSC) size." }
],
examples: [
  { q: "How do Na⁺ & K⁺ gradients set V<sub>m</sub>?", steps: ["K⁺ high inside, Na⁺ high outside", "At rest the membrane is mostly K⁺-permeable", "So V<sub>m</sub> sits near E<sub>K</sub>"], ans: "resting V<sub>m</sub> ≈ <b>E<sub>K</sub></b> (~−70 mV); Na⁺ influx depolarizes" },
  { q: "Driving force on Na⁺ at rest", steps: ["V<sub>m</sub> = −70 mV, E<sub>Na</sub> ≈ +60 mV", "Driving force = V<sub>m</sub> − E<sub>Na</sub>"], ans: "≈ <b>−130 mV</b> → strong inward Na⁺ drive" },
  { q: "Why does access resistance matter?", steps: ["R<sub>a</sub> + C<sub>m</sub> form a low-pass filter", "Fast EPSCs get slowed & attenuated", "Voltage error = I·R<sub>a</sub>"], ans: "monitor R<sub>a</sub>; <b>compensate</b> and report % change" },
  { q: "Interpret a rising holding current", steps: ["Holding current drifts large/negative", "Often seal loss, leak, or rundown"], ans: "flag the recording — <b>health/seal change</b>" },
  { q: "Identify a miniature EPSC", steps: ["Small (~−10 to −30 pA), stochastic", "Fast rise, exponential decay", "Persists in TTX"], ans: "a <b>quantal (mini) event</b>" },
  { q: "Identify an evoked EPSC", steps: ["Time-locked to the stimulus", "Larger; amplitude scales with stim intensity"], ans: "<b>evoked</b> (stimulus-driven) release" },
  { q: "Calculate ΔF/F", steps: ["F = 120, F₀ = 100", "ΔF/F = (120 − 100) / 100"], ans: "<b>0.20 = 20%</b>" },
  { q: "Why baseline-correct a trace?", steps: ["Drift/offset shifts the zero", "Subtract mean of a quiet pre-event window"], ans: "baseline = 0 → <b>clean amplitude</b> measurement" },
  { q: "Connect Ca²⁺ to the Periodic Table", steps: ["Ca (Z 20) → Ca²⁺", "Influx via voltage-gated channels triggers vesicle fusion", "GCaMP reports this Ca²⁺"], ans: "Ca²⁺ is the <b>trigger & the signal</b> — open the Periodic Table room" },
  { q: "Take an ephys trace to Math Time-Series", steps: ["Export the trace (time, value)", "Smooth, detect peaks/events, baseline, AUC, fit τ", "Summarize stats across events"], ans: "use <b>Math Lab · Time-Series</b> (and Statistics)" }
],
links: [
  { name: "Open Periodic Table", desc: "Na, K, Ca, Cl and their ions.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Open Biochemistry", desc: "Receptors, channels, signaling.", href: "room.html?room=biochemistry", tag: "room" },
  { name: "Open Biology", desc: "Cells, physiology, the nervous system.", href: "room.html?room=biology", tag: "room" },
  { name: "Open Lab Methods", desc: "Patch clamp, microscopy, imaging.", href: "room.html?room=lab-methods", tag: "room" },
  { name: "Open Data, Symbols & Units", desc: "Design, controls, error, notation.", href: "room.html?room=data-analysis", tag: "room" },
  { name: "Math Lab · Time-Series", desc: "Smooth, peaks/events, AUC, decay τ.", href: "../math/room.html?room=time-series", tag: "math" },
  { name: "Math Lab · Statistics", desc: "Compare events, tests, effect size.", href: "../math/room.html?room=statistics", tag: "math" },
]
};
