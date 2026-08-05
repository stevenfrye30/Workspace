/* Room content: chem-redox — oxidation, reduction and electrochemistry. */

export default {
name: "Redox & Electrochemistry", kind: "Chemistry · electron transfer", glyph: "🔋", color: "#e0794b",
blurb: "Reactions that move electrons, and the cells that put that movement to work — oxidation numbers, half-reactions, batteries and electrolysis.",
status: "Reference — formulas and worked examples",
topics: [
  "Oxidation & reduction", "Oxidation numbers", "Oxidising & reducing agents",
  "Half-reactions", "Balancing redox", "Galvanic cells", "Cell notation",
  "Standard reduction potentials", "Cell potential E°", "Nernst equation",
  "Electrolysis", "Faraday's laws", "Corrosion"
],
cards: [
  { name: "Redox (OIL RIG)", body: "Oxidation Is Loss, Reduction Is Gain of e⁻", note: "The oxidising agent is itself reduced; the reducing agent is itself oxidised." },
  { name: "Oxidation numbers", body: "Free element 0 · monatomic ion = its charge · O usually −2 · H usually +1 · sum = overall charge", note: "Peroxides make O −1; metal hydrides make H −1." },
  { name: "Spotting a redox reaction", body: "Assign oxidation numbers on both sides. If any changed, it is redox.", note: "If none changed, it is something else — precipitation, acid–base." },
  { name: "Half-reactions", body: "Split into an oxidation half and a reduction half, balance each, then scale so the electrons cancel.", note: "Balance atoms first, oxygen with H₂O, hydrogen with H⁺, then charge with e⁻." },
  { name: "Galvanic cell", body: "A spontaneous redox reaction driving current. Oxidation at the anode, reduction at the cathode.", note: "<b>An Ox, Red Cat</b> — anode oxidation, cathode reduction." },
  { name: "Cell notation", body: "anode | anode solution ‖ cathode solution | cathode", note: "The double bar is the salt bridge." },
  { name: "Standard cell potential", body: "E°<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub>", note: "Both read from a reduction-potential table. Do <b>not</b> multiply E° when you scale a half-reaction." },
  { name: "Spontaneity", body: "E°<sub>cell</sub> &gt; 0 ⇒ spontaneous ⇒ ΔG° &lt; 0", note: "ΔG° = −nFE°<sub>cell</sub>, with F = 96 485 C/mol." },
  { name: "Nernst equation", body: "E = E° − (RT / nF) ln Q", note: "Cell potential away from standard conditions; at 25 °C this is E° − (0.0592/n)·log Q." },
  { name: "Electrolysis", body: "Forcing a non-spontaneous redox reaction with an external voltage.", note: "The opposite of a galvanic cell — signs of the electrodes flip." },
  { name: "Faraday's law", body: "moles of electrons = It / F", note: "Current × time gives charge; charge ÷ 96 485 gives moles of electrons." }
],
examples: [
  { q: "Redox: Zn + Cu²⁺ → Zn²⁺ + Cu", steps: ["Zn → Zn²⁺ + 2e⁻ (loses electrons)", "Cu²⁺ + 2e⁻ → Cu (gains electrons)"], ans: "Zn is <b>oxidized</b>, Cu²⁺ is <b>reduced</b>" },
  { q: "Oxidation number of S in H₂SO₄", steps: ["H is +1 (×2 = +2), O is −2 (×4 = −8)", "Sum must be 0: 2 + S − 8 = 0"], ans: "S = <b>+6</b>" },
  { q: "Oxidation number of Cr in Cr₂O₇²⁻", steps: ["O is −2 (×7 = −14)", "2Cr − 14 = −2"], ans: "Cr = <b>+6</b>" },
  { q: "E°cell for Zn | Zn²⁺ ‖ Cu²⁺ | Cu", steps: ["E°(Cu²⁺/Cu) = +0.34 V (cathode)", "E°(Zn²⁺/Zn) = −0.76 V (anode)", "0.34 − (−0.76)"], ans: "<b>+1.10 V</b> — spontaneous" },
  { q: "Which is the stronger reducing agent, Zn or Cu?", steps: ["More negative reduction potential = more readily oxidised"], ans: "<b>Zn</b> (−0.76 V vs +0.34 V)" },
  { q: "Is a reaction with E°cell = −0.45 V spontaneous?", steps: ["ΔG° = −nFE°", "Negative E° makes ΔG° positive"], ans: "<b>no</b> — it needs electrolysis" }
],
links: [
  { name: "Equilibrium & Kinetics", desc: "Q appears in the Nernst equation.", href: "room.html?room=chem-equilibrium", tag: "room" },
  { name: "Thermochemistry", desc: "ΔG° = −nFE°cell.", href: "room.html?room=chem-thermo", tag: "room" },
  { name: "Periodic Table", desc: "Metals, nonmetals and their tendencies.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
