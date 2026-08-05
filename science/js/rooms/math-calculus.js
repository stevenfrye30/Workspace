/* Room content: math-calculus — ported from the standalone Math Lab. */

export default {
name: "Calculus", kind: "Change", glyph: "∫", color: "#8b93d0",
blurb: "Limits, derivatives, integrals, and series — a working reference with the core rules, worked examples, and room to grow.",
status: "Reference — formulas and worked examples",
topics: [
  "Limits", "Continuity", "Derivatives", "Derivative rules", "Applications of derivatives",
  "Integrals", "Antiderivatives", "Definite integrals", "Area under a curve",
  "Sequences & series", "Taylor series", "Differential equations (intro)"
],
cards: [
  { name: "Limit — idea & notation", body: "lim<sub>x&rarr;a</sub> f(x) = L", note: "f(x) heads toward L as x heads toward a — even if f(a) is undefined." },
  { name: "Power rule", body: "(x<sup>n</sup>)&prime; = n&middot;x<sup>n&minus;1</sup>", note: "" },
  { name: "Constant multiple rule", body: "(c&middot;f)&prime; = c&middot;f&prime;", note: "" },
  { name: "Sum & difference rules", body: "(f &plusmn; g)&prime; = f&prime; &plusmn; g&prime;", note: "" },
  { name: "Product rule", body: "(f&middot;g)&prime; = f&prime;g + f&middot;g&prime;", note: "" },
  { name: "Quotient rule", body: '(f / g)&prime; = <span class="frac"><span class="num">f&prime;g &minus; f&middot;g&prime;</span><span class="den">g<sup>2</sup></span></span>', note: "" },
  { name: "Chain rule", body: "[ f(g(x)) ]&prime; = f&prime;(g(x))&middot;g&prime;(x)", note: "Differentiate the outside, then multiply by the inside's derivative." },
  { name: "Common derivatives", body: "(sin x)&prime; = cos x<br>(cos x)&prime; = &minus;sin x<br>(e<sup>x</sup>)&prime; = e<sup>x</sup><br>(ln x)&prime; = 1 / x", note: "" },
  { name: "Common integrals", body: '&int; x<sup>n</sup> dx = <span class="frac"><span class="num">x<sup>n+1</sup></span><span class="den">n + 1</span></span> + C&nbsp; (n &ne; &minus;1)<br>&int; <span class="frac"><span class="num">1</span><span class="den">x</span></span> dx = ln|x| + C<br>&int; e<sup>x</sup> dx = e<sup>x</sup> + C', note: "" },
  { name: "Fundamental theorem", body: "&int;<sub>a</sub><sup>b</sup> f(x) dx = F(b) &minus; F(a)", note: "Where F&prime; = f. Also: <i>d/dx</i> &int;<sub>a</sub><sup>x</sup> f(t) dt = f(x)." },
  { name: "Integration by substitution", body: "&int; f(g(x))&middot;g&prime;(x) dx = &int; f(u) du,&nbsp; u = g(x)", note: "Reverse of the chain rule." },
  { name: "Taylor series", body: 'f(x) = &Sigma;<sub>n=0</sub><sup>&infin;</sup> <span class="frac"><span class="num">f<sup>(n)</sup>(a)</span><span class="den">n!</span></span>(x &minus; a)<sup>n</sup>', note: "Maclaurin series is the special case a = 0." }
],
examples: [
  { q: 'Evaluate&nbsp; lim<sub>x&rarr;2</sub> <span class="frac"><span class="num">x<sup>2</sup> &minus; 4</span><span class="den">x &minus; 2</span></span>', steps: ["Factor the top: x<sup>2</sup> &minus; 4 = (x &minus; 2)(x + 2)", "Cancel (x &minus; 2), leaving x + 2", "Substitute x = 2"], ans: "<b>4</b>" },
  { q: "Differentiate&nbsp; 3x<sup>4</sup> &minus; 5x<sup>2</sup> + 2x", steps: ["Apply the power rule term by term", "12x<sup>3</sup> &minus; 10x + 2"], ans: "12x<sup>3</sup> &minus; 10x + 2" },
  { q: "Differentiate&nbsp; (2x + 1)<sup>5</sup>&nbsp; (chain rule)", steps: ["Outside: 5(2x + 1)<sup>4</sup>", "Inside derivative: 2", "Multiply"], ans: "10(2x + 1)<sup>4</sup>" },
  { q: "Tangent line to&nbsp; f(x) = x<sup>2</sup>&nbsp; at x = 3", steps: ["f(3) = 9", "f&prime;(x) = 2x, so slope f&prime;(3) = 6", "Point-slope: y &minus; 9 = 6(x &minus; 3)"], ans: "y = 6x &minus; 9" },
  { q: "Compute&nbsp; &int;<sub>0</sub><sup>2</sup> 3x<sup>2</sup> dx", steps: ["Antiderivative of 3x<sup>2</sup> is x<sup>3</sup>", "Evaluate: [x<sup>3</sup>]<sub>0</sub><sup>2</sup> = 8 &minus; 0"], ans: "<b>8</b>" },
  { q: "Integrate&nbsp; &int; 2x(x<sup>2</sup> + 1)<sup>3</sup> dx&nbsp; (u-substitution)", steps: ["Let u = x<sup>2</sup> + 1, so du = 2x dx", "&int; u<sup>3</sup> du = u<sup>4</sup> / 4", "Back-substitute u = x<sup>2</sup> + 1"], ans: '<span class="frac"><span class="num">(x<sup>2</sup> + 1)<sup>4</sup></span><span class="den">4</span></span> + C' },
  { q: "Approximate&nbsp; e<sup>x</sup>&nbsp; near 0 (Taylor, degree 3)", steps: ["Maclaurin: 1 + x + x<sup>2</sup>/2! + x<sup>3</sup>/3!", "Simplify the factorials"], ans: '1 + x + <span class="frac"><span class="num">x<sup>2</sup></span><span class="den">2</span></span> + <span class="frac"><span class="num">x<sup>3</sup></span><span class="den">6</span></span>' }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
],
sections: [
  { title: "Limits", items: ["Definition & intuition", "One-sided limits", "Limits at infinity", "Continuity"] },
  { title: "Derivatives", items: ["Power, product, quotient, chain rules", "Implicit differentiation", "Higher-order derivatives", "Rates & optimization"] },
  { title: "Integrals", items: ["Antiderivatives", "Definite integrals & area", "Substitution & parts", "Numerical integration"] },
  { title: "Series", items: ["Sequences & convergence", "Power & Taylor series", "Fourier preview"] },
  { title: "Visual explanations", items: ["Tangent-line visuals", "Area-under-curve visuals"] }
]
};
