/* Room content: math-time-series — ported from the standalone Math Lab. */

export default {
kind: "Signal",

blurb: "A data & signal console for anything measured over time — electrophysiology traces, stock data, repeated measures, and sensor streams.",
status: "Reference — formulas and worked examples",
callout: "<b>Future-facing data lab.</b> Upload &amp; analysis aren't wired up yet — this is the working reference and the plan. Built to grow into a real console for ephys traces, stock data, and repeated measures.",
cards: [
  { name: "Sampling interval & rate", body: 'f<sub>s</sub> = <span class="frac"><span class="num">1</span><span class="den">&Delta;t</span></span>', note: "f<sub>s</sub> in Hz (samples/sec); &Delta;t is the time between samples." },
  { name: "Period & frequency", body: 'f = <span class="frac"><span class="num">1</span><span class="den">T</span></span>', note: "T in seconds, f in Hz. Equivalently T = 1/f." },
  { name: "Baseline subtraction", body: "x&prime;(t) = x(t) &minus; baseline", note: "Baseline = mean of a quiet window before the event." },
  { name: "Amplitude", body: "A = peak &minus; baseline", note: "Height of a response above rest." },
  { name: "Percent change", body: '%&Delta; = <span class="frac"><span class="num">x &minus; x<sub>0</sub></span><span class="den">x<sub>0</sub></span></span> &times; 100%', note: "Relative change versus a reference x<sub>0</sub> (handy for stocks)." },
  { name: "Moving average (window k)", body: 'MA<sub>t</sub> = <span class="frac"><span class="num">1</span><span class="den">k</span></span> &Sigma; x<sub>t&minus;i</sub>', note: "Mean of the last k samples. Larger k = smoother but laggier." },
  { name: "Exponential smoothing (EMA)", body: "y<sub>t</sub> = &alpha;&middot;x<sub>t</sub> + (1 &minus; &alpha;)&middot;y<sub>t&minus;1</sub>", note: "&alpha; in (0, 1] trades responsiveness against smoothness." },
  { name: "First difference", body: "&Delta;x<sub>t</sub> = x<sub>t</sub> &minus; x<sub>t&minus;1</sub>", note: "Removes level/trend; the basis of rate-of-change." },
  { name: "Rate of change", body: '<span class="frac"><span class="num">dx</span><span class="den">dt</span></span> &asymp; <span class="frac"><span class="num">x<sub>t</sub> &minus; x<sub>t&minus;1</sub></span><span class="den">&Delta;t</span></span>', note: "Discrete slope between consecutive samples." },
  { name: "Area under curve (trapezoid)", body: 'AUC &asymp; &Sigma; <span class="frac"><span class="num">&Delta;t</span><span class="den">2</span></span>(x<sub>i</sub> + x<sub>i+1</sub>)', note: "Trapezoidal integration of a sampled trace." },
  { name: "Exponential decay", body: "x(t) = A&middot;e<sup>&minus;t/&tau;</sup>", note: "&tau; = time constant; the value falls to ~37% (1/e) at t = &tau;." },
  { name: "Signal-to-noise ratio", body: 'SNR = <span class="frac"><span class="num">A<sub>signal</sub></span><span class="den">&sigma;<sub>noise</sub></span></span>', note: "Higher is cleaner. In dB: 20&middot;log<sub>10</sub>(ratio)." },
  { name: "Z-score normalization", body: 'z<sub>t</sub> = <span class="frac"><span class="num">x<sub>t</sub> &minus; &mu;</span><span class="den">&sigma;</span></span>', note: "Standardize a trace to compare across recordings." },
  { name: "Rolling window", body: "stat over [ t &minus; k + 1, &hellip;, t ]", note: "Compute mean / SD / min / max in a sliding window of width k." }
],
examples: [
  { q: "Sampling rate from&nbsp; &Delta;t = 0.5 ms", steps: ["f<sub>s</sub> = 1 / &Delta;t = 1 / 0.0005 s"], ans: "f<sub>s</sub> = <b>2000 Hz</b> (2 kHz)" },
  { q: "Frequency from period&nbsp; T = 20 ms", steps: ["f = 1 / T = 1 / 0.02 s"], ans: "f = <b>50 Hz</b>" },
  { q: "Subtract a baseline: value 1.2, baseline 0.2", steps: ["x&prime; = 1.2 &minus; 0.2"], ans: "x&prime; = <b>1.0</b>" },
  { q: "Amplitude: peak &minus;40 mV, baseline &minus;70 mV", steps: ["A = peak &minus; baseline = &minus;40 &minus; (&minus;70)"], ans: "A = <b>30 mV</b>" },
  { q: "Percent change from 100 to 130", steps: ["(130 &minus; 100) / 100 &times; 100%"], ans: "<b>+30%</b>" },
  { q: "Moving average of&nbsp; 2, 4, 6, 8&nbsp; (window 2)", steps: ["(2 + 4) / 2 = 3", "(4 + 6) / 2 = 5", "(6 + 8) / 2 = 7"], ans: "<b>3, 5, 7</b>" },
  { q: "Trapezoid AUC of&nbsp; 0, 2, 4&nbsp; (&Delta;t = 1)", steps: ["&frac12;(0 + 2)&middot;1 = 1", "&frac12;(2 + 4)&middot;1 = 3", "Sum the trapezoids"], ans: "AUC = <b>4</b>" },
  { q: "Stock trend vs noise", steps: ["Daily wiggle of about &plusmn;1 around the line", "Underlying slope &asymp; +5 / day", "Slope &raquo; noise"], ans: "A real <b>uptrend</b> — signal beats noise." },
  { q: "Spot an event in an ephys-style trace", steps: ["Baseline &minus;70 mV with small noise &sigma;", "A deflection to &minus;20 mV crosses the +3&sigma; threshold", "Amplitude = &minus;20 &minus; (&minus;70) = 50 mV"], ans: "Mark an <b>event</b>, amplitude 50 mV." }
],
links: [
  { name: "Open Statistics", desc: "Summarize values in the Statistics room.", href: "room.html?room=math-statistics", tag: "room" },
]
};
