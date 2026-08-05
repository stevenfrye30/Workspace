/* Room content: math-symbols — ported from the standalone Math Lab. */

export default {
name: "Symbols", kind: "Notation", glyph: "π", color: "#8b93d0",
blurb: "A notation cabinet for writing math — Greek letters, operators, and notation from every field, each a click away to copy.",
status: "Click any symbol to copy",
callout: "Click any symbol to copy it. For symbols while graphing, Desmos has its own on-screen keyboard.",
topics: [
  "Greek letters", "Operators", "Comparison symbols", "Set notation", "Logic symbols",
  "Calculus notation", "Statistics notation", "Probability notation", "Geometry symbols",
  "Trigonometry symbols", "Physics symbols", "Arrows", "Subscripts & superscripts", "Typography"
],
groups: [
  { title: "Greek lowercase", symbols: [
    { g: "&alpha;", n: "alpha" }, { g: "&beta;", n: "beta" }, { g: "&gamma;", n: "gamma" }, { g: "&delta;", n: "delta" },
    { g: "&epsilon;", n: "epsilon" }, { g: "&zeta;", n: "zeta" }, { g: "&eta;", n: "eta" }, { g: "&theta;", n: "theta" },
    { g: "&iota;", n: "iota" }, { g: "&kappa;", n: "kappa" }, { g: "&lambda;", n: "lambda" }, { g: "&mu;", n: "mu" },
    { g: "&nu;", n: "nu" }, { g: "&xi;", n: "xi" }, { g: "&pi;", n: "pi" }, { g: "&rho;", n: "rho" },
    { g: "&sigma;", n: "sigma" }, { g: "&tau;", n: "tau" }, { g: "&upsilon;", n: "upsilon" }, { g: "&phi;", n: "phi" },
    { g: "&chi;", n: "chi" }, { g: "&psi;", n: "psi" }, { g: "&omega;", n: "omega" }
  ] },
  { title: "Greek uppercase", symbols: [
    { g: "&Gamma;", n: "Gamma" }, { g: "&Delta;", n: "Delta" }, { g: "&Theta;", n: "Theta" }, { g: "&Lambda;", n: "Lambda" },
    { g: "&Xi;", n: "Xi" }, { g: "&Pi;", n: "Pi" }, { g: "&Sigma;", n: "Sigma" }, { g: "&Phi;", n: "Phi" },
    { g: "&Psi;", n: "Psi" }, { g: "&Omega;", n: "Omega" }
  ] },
  { title: "Operators", symbols: [
    { g: "+", n: "plus" }, { g: "&minus;", n: "minus" }, { g: "&times;", n: "times" }, { g: "&divide;", n: "divide" },
    { g: "&plusmn;", n: "plus-minus" }, { g: "&#8723;", n: "minus-plus" }, { g: "&sdot;", n: "dot" }, { g: "&lowast;", n: "asterisk" },
    { g: "&radic;", n: "root" }, { g: "&sum;", n: "sum" }, { g: "&prod;", n: "product" }, { g: "&int;", n: "integral" },
    { g: "&part;", n: "partial" }, { g: "&nabla;", n: "nabla" }, { g: "&infin;", n: "infinity" }, { g: "!", n: "factorial" }, { g: "%", n: "percent" }
  ] },
  { title: "Comparison", symbols: [
    { g: "=", n: "equals" }, { g: "&ne;", n: "not equal" }, { g: "&asymp;", n: "approx" }, { g: "&equiv;", n: "identical" },
    { g: "&lt;", n: "less" }, { g: "&gt;", n: "greater" }, { g: "&le;", n: "&le; or eq" }, { g: "&ge;", n: "&ge; or eq" },
    { g: "&#8810;", n: "much less" }, { g: "&#8811;", n: "much greater" }, { g: "&prop;", n: "proportional" }, { g: "&cong;", n: "congruent" }, { g: "&sim;", n: "similar" }
  ] },
  { title: "Set notation", symbols: [
    { g: "&isin;", n: "in" }, { g: "&notin;", n: "not in" }, { g: "&sub;", n: "subset" }, { g: "&sube;", n: "subset eq" },
    { g: "&sup;", n: "superset" }, { g: "&supe;", n: "superset eq" }, { g: "&cup;", n: "union" }, { g: "&cap;", n: "intersect" },
    { g: "&empty;", n: "empty set" }, { g: "&#8726;", n: "set minus" }, { g: "&#8477;", n: "reals" }, { g: "&#8484;", n: "integers" },
    { g: "&#8469;", n: "naturals" }, { g: "&#8474;", n: "rationals" }, { g: "&#8450;", n: "complex" }
  ] },
  { title: "Logic", symbols: [
    { g: "&and;", n: "and" }, { g: "&or;", n: "or" }, { g: "&not;", n: "not" }, { g: "&rArr;", n: "implies" },
    { g: "&hArr;", n: "iff" }, { g: "&forall;", n: "for all" }, { g: "&exist;", n: "exists" }, { g: "&#8708;", n: "not exists" },
    { g: "&there4;", n: "therefore" }, { g: "&#8757;", n: "because" }, { g: "&oplus;", n: "xor" }, { g: "&#8868;", n: "true" }, { g: "&perp;", n: "false" }
  ] },
  { title: "Calculus", symbols: [
    { g: "&int;", n: "integral" }, { g: "&#8748;", n: "double int" }, { g: "&#8750;", n: "contour int" }, { g: "&part;", n: "partial" },
    { g: "&nabla;", n: "del" }, { g: "&Delta;", n: "delta" }, { g: "&sum;", n: "sum" }, { g: "&prod;", n: "product" },
    { g: "&prime;", n: "prime" }, { g: "&Prime;", n: "double prime" }, { g: "&rarr;", n: "to" }, { g: "&infin;", n: "infinity" }, { g: "lim", n: "limit" }
  ] },
  { title: "Statistics", symbols: [
    { g: "x&#772;", n: "mean (x-bar)" }, { g: "&mu;", n: "pop. mean" }, { g: "&sigma;", n: "std dev" }, { g: "&sigma;&sup2;", n: "variance" },
    { g: "s", n: "sample SD" }, { g: "&Sigma;", n: "sum" }, { g: "n", n: "count" }, { g: "p&#770;", n: "p-hat" },
    { g: "&rho;", n: "pop. corr" }, { g: "r", n: "correlation" }, { g: "&chi;&sup2;", n: "chi-square" }, { g: "&nu;", n: "deg. freedom" }
  ] },
  { title: "Probability", symbols: [
    { g: "P", n: "probability" }, { g: "&cap;", n: "and" }, { g: "&cup;", n: "or" }, { g: "|", n: "given" },
    { g: "&sim;", n: "distributed" }, { g: "!", n: "factorial" }, { g: "&prop;", n: "proportional" }, { g: "E", n: "expectation" }, { g: "Var", n: "variance" }
  ] },
  { title: "Geometry", symbols: [
    { g: "&ang;", n: "angle" }, { g: "&deg;", n: "degree" }, { g: "&perp;", n: "perpendicular" }, { g: "&#8741;", n: "parallel" },
    { g: "&#9651;", n: "triangle" }, { g: "&#9633;", n: "square" }, { g: "&#9675;", n: "circle" }, { g: "&cong;", n: "congruent" },
    { g: "&sim;", n: "similar" }, { g: "&pi;", n: "pi" }, { g: "&#8978;", n: "arc" }, { g: "&#8737;", n: "meas. angle" }
  ] },
  { title: "Trigonometry", symbols: [
    { g: "sin", n: "sine" }, { g: "cos", n: "cosine" }, { g: "tan", n: "tangent" }, { g: "csc", n: "cosecant" },
    { g: "sec", n: "secant" }, { g: "cot", n: "cotangent" }, { g: "&theta;", n: "theta" }, { g: "&phi;", n: "phi" },
    { g: "&deg;", n: "degree" }, { g: "rad", n: "radian" }, { g: "&pi;", n: "pi" }, { g: "&#8767;", n: "wave" }
  ] },
  { title: "Physics", symbols: [
    { g: "&Delta;", n: "change" }, { g: "&prop;", n: "proportional" }, { g: "&#8463;", n: "h-bar" }, { g: "&lambda;", n: "wavelength" },
    { g: "&nu;", n: "frequency" }, { g: "&omega;", n: "ang. freq" }, { g: "&rho;", n: "density" }, { g: "&tau;", n: "time const" },
    { g: "&Phi;", n: "flux" }, { g: "&Omega;", n: "ohm" }, { g: "&nabla;", n: "del" }, { g: "&mu;", n: "micro" }, { g: "&#197;", n: "angstrom" }, { g: "&plusmn;", n: "uncertainty" }
  ] },
  { title: "Arrows & relations", symbols: [
    { g: "&rarr;", n: "right" }, { g: "&larr;", n: "left" }, { g: "&harr;", n: "both" }, { g: "&rArr;", n: "implies" },
    { g: "&lArr;", n: "implied by" }, { g: "&hArr;", n: "iff" }, { g: "&#8614;", n: "maps to" }, { g: "&uarr;", n: "up" },
    { g: "&darr;", n: "down" }, { g: "&#10230;", n: "long right" }, { g: "&there4;", n: "therefore" }, { g: "&prop;", n: "proportional" }
  ] }
],
examplesTitle: "Usage Examples",
examplesSub: "Click to see how each symbol is used in context.",
examples: [
  { q: "Slope using &Delta;", steps: ["&Delta; means 'change in'", "m = &Delta;y / &Delta;x"], ans: 'm = <span class="frac"><span class="num">y<sub>2</sub> &minus; y<sub>1</sub></span><span class="den">x<sub>2</sub> &minus; x<sub>1</sub></span></span>' },
  { q: "Summation with &Sigma;", steps: ["Index below, limit above", "Adds the terms in order"], ans: "&Sigma;<sub>i=1</sub><sup>n</sup> x<sub>i</sub> = x<sub>1</sub> + &hellip; + x<sub>n</sub>" },
  { q: "Limit notation", steps: ["Read 'as x approaches a'"], ans: "lim<sub>x&rarr;a</sub> f(x) = L" },
  { q: "Derivative notation", steps: ["Leibniz and Lagrange forms"], ans: "dy/dx = f&prime;(x),&nbsp; f&Prime;(x)" },
  { q: "Integral notation", steps: ["&int; sums infinitely many slices; dx marks the variable"], ans: "&int;<sub>a</sub><sup>b</sup> f(x) dx" },
  { q: "Set-builder notation", steps: ["Read '&hellip; such that &hellip;'"], ans: "{ x &isin; &#8477; : x &gt; 0 } = (0, &infin;)" },
  { q: "Conditional probability", steps: ["The bar | reads 'given'"], ans: "P(A | B) = P(A &cap; B) / P(B)" },
  { q: "Sample vs population stats", steps: ["x&#772; and s describe a sample", "&mu; and &sigma; describe the population"], ans: "x&#772;, s&nbsp; &harr;&nbsp; &mu;, &sigma;" },
  { q: "Vector notation", steps: ["Components, then magnitude"], ans: "<b>v</b> = (v<sub>1</sub>, v<sub>2</sub>, v<sub>3</sub>),&nbsp; |<b>v</b>| = &radic;(v<sub>1</sub><sup>2</sup> + v<sub>2</sub><sup>2</sup> + v<sub>3</sub><sup>2</sup>)" }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
],
sections: [
  { title: "Greek letters", items: ["Lower & uppercase", "Names & pronunciation", "Common uses"] },
  { title: "Operators", items: ["∑ ∏ ∫ ∂ ∇", "Relations (≤ ≥ ≈ ≠)", "Set & logic symbols"] },
  { title: "Common notation", items: ["Subscripts & superscripts", "Vectors & matrices", "Function notation"] },
  { title: "Copyable symbols", items: ["Click to copy (planned)", "Meaning where useful"] }
]
};
