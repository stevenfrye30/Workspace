/* Room content: math-algebra — ported from the standalone Math Lab. */

export default {
name: "Algebra", kind: "Structure", glyph: "x²", color: "#8b93d0",
blurb: "Equations, factoring, functions, and symbolic manipulation — a working reference with rules, worked examples, and room to grow.",
status: "Reference & examples ready — interactive tools coming",
topics: [
  "Equations", "Inequalities", "Factoring", "Functions", "Exponents",
  "Radicals", "Logarithms", "Systems of equations", "Polynomials", "Rational expressions"
],
cards: [
  { name: "Slope formula", body: 'm = <span class="frac"><span class="num">y<sub>2</sub> &minus; y<sub>1</sub></span><span class="den">x<sub>2</sub> &minus; x<sub>1</sub></span></span>', note: "Rate of change between two points." },
  { name: "Slope-intercept form", body: "y = mx + b", note: "m is slope, b is the y-intercept." },
  { name: "Point-slope form", body: "y &minus; y<sub>1</sub> = m(x &minus; x<sub>1</sub>)", note: "Line through (x<sub>1</sub>, y<sub>1</sub>) with slope m." },
  { name: "Quadratic formula", body: 'x = <span class="frac"><span class="num">&minus;b &plusmn; &radic;(b<sup>2</sup> &minus; 4ac)</span><span class="den">2a</span></span>', note: "Solves ax<sup>2</sup> + bx + c = 0. Discriminant b<sup>2</sup>&minus;4ac sets the number of real roots." },
  { name: "Difference of squares", body: "a<sup>2</sup> &minus; b<sup>2</sup> = (a + b)(a &minus; b)", note: "" },
  { name: "Perfect square trinomials", body: "a<sup>2</sup> &plusmn; 2ab + b<sup>2</sup> = (a &plusmn; b)<sup>2</sup>", note: "" },
  { name: "Exponent rules", body: "x<sup>a</sup>&middot;x<sup>b</sup> = x<sup>a+b</sup><br>x<sup>a</sup> &divide; x<sup>b</sup> = x<sup>a&minus;b</sup><br>(x<sup>a</sup>)<sup>b</sup> = x<sup>ab</sup><br>x<sup>0</sup> = 1,&nbsp; x<sup>&minus;n</sup> = 1 / x<sup>n</sup>", note: "" },
  { name: "Logarithm rules", body: "log<sub>b</sub>(xy) = log<sub>b</sub>x + log<sub>b</sub>y<br>log<sub>b</sub>(x/y) = log<sub>b</sub>x &minus; log<sub>b</sub>y<br>log<sub>b</sub>(x<sup>n</sup>) = n&middot;log<sub>b</sub>x<br>change of base: log<sub>b</sub>x = <span class=\"frac\"><span class=\"num\">ln x</span><span class=\"den\">ln b</span></span>", note: "" },
  { name: "Factoring patterns", body: "GCF &rarr; grouping &rarr; ax<sup>2</sup>+bx+c<br>a<sup>3</sup> + b<sup>3</sup> = (a + b)(a<sup>2</sup> &minus; ab + b<sup>2</sup>)<br>a<sup>3</sup> &minus; b<sup>3</sup> = (a &minus; b)(a<sup>2</sup> + ab + b<sup>2</sup>)", note: "Try factors in order: common factor first, then a pattern." }
],
examples: [
  { q: "Solve&nbsp; 3x + 5 = 20", steps: ["Subtract 5 from both sides: 3x = 15", "Divide both sides by 3"], ans: "x = <b>5</b>" },
  { q: "Factor&nbsp; x<sup>2</sup> + 5x + 6", steps: ["Find two numbers with product 6 and sum 5", "Those are 2 and 3"], ans: "(x + 2)(x + 3)" },
  { q: "Solve the system&nbsp; 2x + y = 7,&nbsp; x &minus; y = 2", steps: ["Add the equations: 3x = 9, so x = 3", "Substitute: 2(3) + y = 7"], ans: "x = <b>3</b>,&nbsp; y = <b>1</b>" },
  { q: "Simplify&nbsp; (x<sup>3</sup> &middot; x<sup>5</sup>) / x<sup>2</sup>", steps: ["Multiply: x<sup>3</sup>&middot;x<sup>5</sup> = x<sup>8</sup>", "Divide: x<sup>8</sup> / x<sup>2</sup> = x<sup>8&minus;2</sup>"], ans: "x<sup>6</sup>" },
  { q: "Slope through&nbsp; (1, 2)&nbsp; and&nbsp; (4, 11)", steps: ["m = (11 &minus; 2) / (4 &minus; 1)", "m = 9 / 3"], ans: "m = <b>3</b>" }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
],
sections: [
  { title: "Equations", items: ["Linear & quadratic solving", "Systems of equations", "Inequalities", "Step-by-step worked examples"] },
  { title: "Factoring", items: ["Common factors & grouping", "Quadratic factoring", "Polynomial division", "Roots & the factor theorem"] },
  { title: "Functions", items: ["Domain & range", "Transformations", "Composition & inverses", "Graph behaviour"] },
  { title: "Symbolic manipulation", items: ["Simplification & expansion", "Substitution", "Rearranging formulas"] },
  { title: "Notes & examples", items: ["Saved derivations", "Reusable templates"] }
]
};
