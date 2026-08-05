/* Room content: chem-acids — acids, bases, pH and buffers. */

export default {
name: "Acids, Bases & Buffers", kind: "Chemistry · proton transfer", glyph: "🧴", color: "#e0794b",
blurb: "Strong versus weak, the pH scale, and why a buffer resists change — the topic that decides whether equilibrium ever makes sense.",
status: "Live — pH and buffer solvers",
topics: [
  "Arrhenius & Brønsted–Lowry", "Conjugate pairs", "Strong acids", "Strong bases",
  "Weak acids", "Ka and Kb", "The pH scale", "pOH", "Kw", "Buffers",
  "Henderson–Hasselbalch", "Buffer capacity", "Salt hydrolysis"
],
cards: [
  { name: "Brønsted–Lowry", body: "An acid donates H⁺; a base accepts it.", note: "Every acid has a conjugate base, formed by losing that proton." },
  { name: "pH and pOH", body: "pH = −log[H⁺] · pH + pOH = 14", note: "At 25 °C. Each pH unit is a factor of ten in [H⁺]." },
  { name: "Water's own equilibrium", body: "K<sub>w</sub> = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴", note: "Why pH 7 is neutral — and only at 25 °C." },
  { name: "Strong vs weak", body: "Strong acids ionise completely, so [H⁺] = the acid's concentration. Weak ones need K<sub>a</sub>.", note: "There are only six or seven strong acids — learn those and everything else is weak." },
  { name: "Ka and Kb", body: "K<sub>a</sub> · K<sub>b</sub> = K<sub>w</sub> = 1 × 10⁻¹⁴", note: "Stronger acid ⇒ larger K<sub>a</sub> ⇒ weaker conjugate base." },
  { name: "Weak acid pH", body: "[H⁺] ≈ √(K<sub>a</sub> · C) when the acid is weak and reasonably concentrated.", note: "The exact form solves x² + K<sub>a</sub>x − K<sub>a</sub>C = 0." },
  { name: "Henderson–Hasselbalch", body: "pH = pK<sub>a</sub> + log([A⁻] / [HA])", note: "Buffer pH from the ratio of the pair — the absolute amounts cancel." },
  { name: "What a buffer is", body: "A weak acid and its conjugate base together, in comparable amounts.", note: "Added H⁺ is mopped up by A⁻; added OH⁻ is mopped up by HA." },
  { name: "Choosing a buffer", body: "Pick an acid whose pK<sub>a</sub> is within about 1 unit of the target pH.", note: "Equal [A⁻] and [HA] puts pH exactly at pK<sub>a</sub>." },
  { name: "Salt hydrolysis", body: "The salt of a weak acid is basic; the salt of a weak base is acidic.", note: "NaCl is neutral — both of its ions come from strong partners." }
],
examples: [
  { q: "pH when [H⁺] = 1 × 10⁻³ M", steps: ["pH = −log(10⁻³)"], ans: "pH = <b>3</b>" },
  { q: "pH of 0.010 M HNO₃", steps: ["HNO₃ is strong ⇒ ionises completely", "[H⁺] = 0.010 M"], ans: "pH = <b>2.00</b>" },
  { q: "pH of 0.10 M acetic acid (Ka = 1.8 × 10⁻⁵)", steps: ["[H⁺] ≈ √(1.8×10⁻⁵ × 0.10)", "= 1.34 × 10⁻³ M"], ans: "pH ≈ <b>2.87</b>" },
  { q: "Buffer pH: pK<sub>a</sub> = 4.74, [A⁻] = [HA]", steps: ["pH = pK<sub>a</sub> + log(1)", "log 1 = 0"], ans: "pH = <b>4.74</b>" },
  { q: "Kb of the acetate ion", steps: ["K<sub>b</sub> = K<sub>w</sub> / K<sub>a</sub>", "= 1.0 × 10⁻¹⁴ / 1.8 × 10⁻⁵"], ans: "<b>5.6 × 10⁻¹⁰</b>" },
  { q: "Which buffer for pH 7.2?", steps: ["Look for pK<sub>a</sub> ≈ 7.2", "H₂PO₄⁻ has pK<sub>a</sub> = 7.21"], ans: "<b>H₂PO₄⁻ / HPO₄²⁻</b> — the phosphate buffer" },
  { q: "Is a solution of NaCH₃COO acidic or basic?", steps: ["Acetate is the conjugate base of a weak acid", "It takes H⁺ from water, leaving OH⁻"], ans: "<b>basic</b>" }
],
links: [
  { name: "Titration", desc: "Where this becomes a curve.", href: "room.html?room=chem-titration", tag: "room" },
  { name: "Reference Tables", desc: "Strong acids, Ka and Kb values.", href: "room.html?room=reference", tag: "room" },
  { name: "Equilibrium & Kinetics", desc: "Ka is just an equilibrium constant.", href: "room.html?room=chem-equilibrium", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
