/* Room content: math-statistics — ported from the standalone Math Lab. */

export default {
kind: "Data",

blurb: "Descriptive stats, distributions, probability, and inference — a working reference for real data, from coursework to research and signal analysis.",
status: "Reference — formulas and worked examples",
cards: [
  { name: "Mean", body: 'x&#772; = <span class="frac"><span class="num">&Sigma; x<sub>i</sub></span><span class="den">n</span></span>', note: "Add the values, divide by how many." },
  { name: "Median (concept)", body: "sort data &rarr; the middle value", note: "For an even count, average the two middle values. Robust to outliers." },
  { name: "Sample variance", body: 's<sup>2</sup> = <span class="frac"><span class="num">&Sigma;(x<sub>i</sub> &minus; x&#772;)<sup>2</sup></span><span class="den">n &minus; 1</span></span>', note: "Average squared distance from the mean (n&minus;1 for a sample)." },
  { name: "Sample standard deviation", body: "s = &radic;(s<sup>2</sup>)", note: "Square root of the variance — back in the data's own units." },
  { name: "Z-score", body: 'z = <span class="frac"><span class="num">x &minus; &mu;</span><span class="den">&sigma;</span></span>', note: "How many standard deviations a value sits from the mean." },
  { name: "Standard error", body: 'SE = <span class="frac"><span class="num">&sigma;</span><span class="den">&radic;n</span></span>', note: "Spread of the sample mean; use s when &sigma; is unknown." },
  { name: "Confidence interval", body: 'x&#772; &plusmn; z* &middot; <span class="frac"><span class="num">&sigma;</span><span class="den">&radic;n</span></span>', note: "estimate &plusmn; (critical value &times; standard error). z* &asymp; 1.96 for 95%." },
  { name: "Correlation coefficient", body: 'r = <span class="frac"><span class="num">&Sigma;(z<sub>x</sub> &middot; z<sub>y</sub>)</span><span class="den">n &minus; 1</span></span>', note: "Between &minus;1 and +1: strength and direction of a linear link." },
  { name: "Simple linear regression", body: "y&#770; = b<sub>0</sub> + b<sub>1</sub>x", note: "Slope b<sub>1</sub> = r &middot; (s<sub>y</sub> / s<sub>x</sub>); the line passes through (x&#772;, y&#772;)." },
  { name: "Complement rule", body: "P(A<sup>c</sup>) = 1 &minus; P(A)", note: "" },
  { name: "Addition rule", body: "P(A &cup; B) = P(A) + P(B) &minus; P(A &cap; B)", note: "" },
  { name: "Multiplication rule", body: "P(A &cap; B) = P(A) &middot; P(B | A)", note: "Independent events: simply P(A) &middot; P(B)." },
  { name: "Bayes' theorem", body: 'P(A | B) = <span class="frac"><span class="num">P(B | A) &middot; P(A)</span><span class="den">P(B)</span></span>', note: "Update a prior with new evidence." },
  { name: "Normal distribution", body: "X ~ N(&mu;, &sigma;<sup>2</sup>)", note: "Bell curve with mean &mu; and variance &sigma;<sup>2</sup>." }
],
examples: [
  { q: "Mean of&nbsp; 4, 8, 6, 10, 2", steps: ["Sum: 4 + 8 + 6 + 10 + 2 = 30", "Divide by n = 5"], ans: "x&#772; = <b>6</b>" },
  { q: "Sample variance & SD of&nbsp; 2, 4, 6", steps: ["Mean = 4; deviations &minus;2, 0, 2", "Squares: 4, 0, 4; sum = 8", "s<sup>2</sup> = 8 / (3 &minus; 1) = 4"], ans: "s<sup>2</sup> = 4,&nbsp; s = <b>2</b>" },
  { q: "Z-score for&nbsp; x = 85,&nbsp; &mu; = 70,&nbsp; &sigma; = 10", steps: ["z = (85 &minus; 70) / 10"], ans: "z = <b>1.5</b>" },
  { q: "Interpret a 95% CI of&nbsp; [12, 18]&nbsp; for the mean", steps: ["It describes the <i>true mean</i>, not individual data points", "Built as estimate &plusmn; margin of error"], ans: "95% confident the true mean lies between <b>12 and 18</b>." },
  { q: "Interpret&nbsp; p = 0.03&nbsp; at &alpha; = 0.05", steps: ["p &lt; &alpha;, so reject the null hypothesis", "p = P(data this extreme | null true) — not P(null is true)"], ans: "Statistically significant: <b>reject H<sub>0</sub></b>." },
  { q: "P(even) when rolling a fair die", steps: ["Even outcomes 2, 4, 6 &rarr; 3 of 6 equally likely"], ans: '<span class="frac"><span class="num">3</span><span class="den">6</span></span> = <b>1/2</b>' },
  { q: "Interpret&nbsp; r = 0.85", steps: ["Sign +: the two variables rise together", "Magnitude near 1: a strong linear link"], ans: "Strong positive correlation — not proof of <b>causation</b>." },
  { q: "Predict with&nbsp; y&#770; = 2 + 3x&nbsp; at x = 4", steps: ["y&#770; = 2 + 3(4)", "y&#770; = 2 + 12"], ans: "y&#770; = <b>14</b>" }
],
links: [
  { name: "Send data to Time-Series Lab", desc: "Hand a trace to the Time-Series Lab.", href: "room.html?room=math-time-series", tag: "room" },
]
};
