/* Room content: physics — the formula reference ported from the Math Lab.
   It replaces the old Science physics room, which was a bridge whose only
   purpose was linking out to the Math Lab. */

export default {
name: "Physics", kind: "Nature", glyph: "⚛", color: "#c98bd0",
blurb: "Applied math with units — motion, forces, energy, electricity, and waves (F, v, a, E, P, V, I, R, λ, f, ω), tied to graphing and real measurements.",
status: "Reference — formulas and worked examples",
cards: [
  { name: "Velocity", body: 'v = <span class="frac"><span class="num">&Delta;x</span><span class="den">&Delta;t</span></span>', note: "Displacement over time (m/s)." },
  { name: "Acceleration", body: 'a = <span class="frac"><span class="num">&Delta;v</span><span class="den">&Delta;t</span></span>', note: "Change in velocity over time (m/s&sup2;)." },
  { name: "Newton's second law", body: "F = m a", note: "Force in newtons (N = kg&middot;m/s&sup2;)." },
  { name: "Weight force", body: "W = m g", note: "g &asymp; 9.8 m/s&sup2; near Earth's surface." },
  { name: "Momentum", body: "p = m v", note: "Units kg&middot;m/s." },
  { name: "Impulse", body: "J = F&middot;&Delta;t = &Delta;p", note: "Force applied over time changes momentum." },
  { name: "Work", body: "W = F d cos &theta;", note: "Energy transferred (J = N&middot;m)." },
  { name: "Kinetic energy", body: "KE = &frac12; m v<sup>2</sup>", note: "Energy of motion (J)." },
  { name: "Potential energy (gravity)", body: "PE = m g h", note: "Energy of height (J)." },
  { name: "Power", body: 'P = <span class="frac"><span class="num">W</span><span class="den">t</span></span>', note: "Rate of energy use (W = J/s)." },
  { name: "Ohm's law", body: "V = I R", note: "Volts = amps &times; ohms (V, A, &Omega;)." },
  { name: "Electric power", body: "P = V I = I<sup>2</sup>R", note: "Power dissipated (W)." },
  { name: "Resistors in series", body: "R<sub>eq</sub> = R<sub>1</sub> + R<sub>2</sub> + &hellip;", note: "Same current through each." },
  { name: "Resistors in parallel", body: '<span class="frac"><span class="num">1</span><span class="den">R<sub>eq</sub></span></span> = <span class="frac"><span class="num">1</span><span class="den">R<sub>1</sub></span></span> + <span class="frac"><span class="num">1</span><span class="den">R<sub>2</sub></span></span> + &hellip;', note: "Same voltage across each." },
  { name: "Wave speed", body: "v = f &lambda;", note: "Speed = frequency &times; wavelength (m/s)." },
  { name: "Frequency & period", body: 'f = <span class="frac"><span class="num">1</span><span class="den">T</span></span>', note: "f in hertz (Hz), T in seconds." },
  { name: "Angular frequency", body: "&omega; = 2&pi;f", note: "Radians per second." },
  { name: "Hooke's law", body: "F = &minus;k x", note: "Spring restoring force; k in N/m." },
  { name: "Coulomb's law", body: 'F = k <span class="frac"><span class="num">q<sub>1</sub> q<sub>2</sub></span><span class="den">r<sup>2</sup></span></span>', note: "Force between charges; k &asymp; 8.99&times;10<sup>9</sup> N&middot;m&sup2;/C&sup2;." },
  { name: "Density", body: '&rho; = <span class="frac"><span class="num">m</span><span class="den">V</span></span>', note: "Mass per volume (kg/m&sup3;)." }
],
examples: [
  { q: "Velocity: 100 m in 4 s", steps: ["v = &Delta;x / &Delta;t = 100 / 4"], ans: "v = <b>25 m/s</b>" },
  { q: "Acceleration: 0 &rarr; 30 m/s in 5 s", steps: ["a = &Delta;v / &Delta;t = 30 / 5"], ans: "a = <b>6 m/s&sup2;</b>" },
  { q: "Force: m = 2 kg, a = 3 m/s&sup2;", steps: ["F = m a = 2 &middot; 3"], ans: "F = <b>6 N</b>" },
  { q: "Weight of a 10 kg mass", steps: ["W = m g = 10 &middot; 9.8"], ans: "W = <b>98 N</b>" },
  { q: "Kinetic energy: m = 4 kg, v = 5 m/s", steps: ["KE = &frac12; m v<sup>2</sup> = &frac12; &middot; 4 &middot; 25"], ans: "KE = <b>50 J</b>" },
  { q: "Potential energy: m = 2 kg, h = 5 m", steps: ["PE = m g h = 2 &middot; 9.8 &middot; 5"], ans: "PE = <b>98 J</b>" },
  { q: "Ohm's law: V = 12 V, R = 4 &Omega;", steps: ["I = V / R = 12 / 4"], ans: "I = <b>3 A</b>" },
  { q: "Resistance: 3 &Omega; and 6 &Omega; in parallel", steps: ["1/R = 1/3 + 1/6 = 1/2", "R = 2"], ans: "R<sub>eq</sub> = <b>2 &Omega;</b>" },
  { q: "Wave speed: f = 50 Hz, &lambda; = 2 m", steps: ["v = f &lambda; = 50 &middot; 2"], ans: "v = <b>100 m/s</b>" },
  { q: "Frequency &harr; Time-Series Lab", steps: ["A wave with f = 50 Hz has period T = 1/f = 20 ms", "Analyze the same trace over time in the Time-Series Lab"], ans: "T = <b>20 ms</b>" }
],
links: [
  { name: "Send wave to Time-Series Lab", desc: "Analyze a signal over time.", href: "room.html?room=math-time-series", tag: "room" },
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
],
sections: [
  { title: "Formulas", items: ["Formula library", "Units & dimensional analysis", "Physical constants"] },
  { title: "Mechanics", items: ["Kinematics", "Forces & Newton's laws", "Energy & momentum"] },
  { title: "Electricity", items: ["Circuits (Ohm, Kirchhoff)", "Fields & potential", "Capacitance & current"] },
  { title: "Waves", items: ["Wave equation", "Frequency, wavelength, speed", "Interference & resonance"] },
  { title: "Symbolic & numeric tools", items: ["Solve for any variable", "Plug-in calculators"] }
]
};
