/* Room content: math-trigonometry — ported from the standalone Math Lab. */

export default {
name: "Trigonometry", kind: "Angle", glyph: "∿", color: "#8b93d0",
blurb: "The bridge between angles, triangles, the unit circle, and waves (∿) — θ, π, sin, cos, tan, and the graphs they trace.",
status: "Reference — formulas and worked examples",
topics: [
  "Angles", "Degrees & radians", "Unit circle", "Sine", "Cosine", "Tangent",
  "Reciprocal functions", "Right-triangle ratios", "Special angles", "Trig identities",
  "Inverse trig", "Graphing trig", "Amplitude", "Period", "Phase shift", "Vertical shift",
  "Waves", "Law of sines", "Law of cosines"
],
cards: [
  { name: "Degree / radian conversion", body: 'rad = deg &middot; <span class="frac"><span class="num">&pi;</span><span class="den">180&deg;</span></span>,&nbsp; deg = rad &middot; <span class="frac"><span class="num">180&deg;</span><span class="den">&pi;</span></span>', note: "180&deg; = &pi; radians." },
  { name: "SOH-CAH-TOA", body: 'sin &theta; = <span class="frac"><span class="num">opp</span><span class="den">hyp</span></span>,&nbsp; cos &theta; = <span class="frac"><span class="num">adj</span><span class="den">hyp</span></span>,&nbsp; tan &theta; = <span class="frac"><span class="num">opp</span><span class="den">adj</span></span>', note: "Right-triangle ratios." },
  { name: "Unit circle point", body: "(cos &theta;, sin &theta;)", note: "A point on the circle of radius 1 at angle &theta;." },
  { name: "Pythagorean identity", body: "sin<sup>2</sup>&theta; + cos<sup>2</sup>&theta; = 1", note: "Also 1 + tan<sup>2</sup>&theta; = sec<sup>2</sup>&theta;." },
  { name: "Reciprocal identities", body: "csc &theta; = 1/sin &theta;<br>sec &theta; = 1/cos &theta;<br>cot &theta; = 1/tan &theta;", note: "" },
  { name: "Quotient identities", body: 'tan &theta; = <span class="frac"><span class="num">sin &theta;</span><span class="den">cos &theta;</span></span>,&nbsp; cot &theta; = <span class="frac"><span class="num">cos &theta;</span><span class="den">sin &theta;</span></span>', note: "" },
  { name: "Even / odd identities", body: "cos(&minus;&theta;) = cos &theta;<br>sin(&minus;&theta;) = &minus;sin &theta;<br>tan(&minus;&theta;) = &minus;tan &theta;", note: "Cosine is even; sine & tangent are odd." },
  { name: "Angle sum identities", body: "sin(A &plusmn; B) = sin A cos B &plusmn; cos A sin B<br>cos(A &plusmn; B) = cos A cos B &#8723; sin A sin B", note: "" },
  { name: "Double angle identities", body: "sin 2&theta; = 2 sin &theta; cos &theta;<br>cos 2&theta; = cos<sup>2</sup>&theta; &minus; sin<sup>2</sup>&theta;", note: "" },
  { name: "Sine wave form", body: "y = a&middot;sin(b(x &minus; c)) + d", note: "a amplitude, b sets period, c phase shift, d vertical shift." },
  { name: "Amplitude & period", body: 'amplitude = |a|,&nbsp; period = <span class="frac"><span class="num">2&pi;</span><span class="den">|b|</span></span>', note: "For y = a&middot;sin(bx)." },
  { name: "Law of sines", body: '<span class="frac"><span class="num">a</span><span class="den">sin A</span></span> = <span class="frac"><span class="num">b</span><span class="den">sin B</span></span> = <span class="frac"><span class="num">c</span><span class="den">sin C</span></span>', note: "Sides opposite their angles." },
  { name: "Law of cosines", body: "c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> &minus; 2ab&middot;cos C", note: "Generalizes the Pythagorean theorem." },
  { name: "Triangle area (sine)", body: "A = &frac12; ab&middot;sin C", note: "Two sides and the included angle." }
],
examples: [
  { q: "Convert&nbsp; 90&deg;&nbsp; to radians", steps: ["rad = 90&deg; &middot; &pi; / 180&deg;"], ans: '<span class="frac"><span class="num">&pi;</span><span class="den">2</span></span>' },
  { q: "Right triangle: opp = 3, adj = 4, hyp = 5", steps: ["sin &theta; = 3/5, cos &theta; = 4/5", "tan &theta; = 3/4"], ans: "sin &theta; = <b>0.6</b>, cos &theta; = <b>0.8</b>, tan &theta; = <b>0.75</b>" },
  { q: "Unit circle at&nbsp; &theta; = 30&deg;", steps: ["(cos 30&deg;, sin 30&deg;)"], ans: '( <span class="frac"><span class="num">&radic;3</span><span class="den">2</span></span> , <span class="frac"><span class="num">1</span><span class="den">2</span></span> )' },
  { q: "Simplify&nbsp; sin<sup>2</sup>&theta; + cos<sup>2</sup>&theta; + tan<sup>2</sup>&theta;", steps: ["sin<sup>2</sup>&theta; + cos<sup>2</sup>&theta; = 1", "1 + tan<sup>2</sup>&theta; = sec<sup>2</sup>&theta;"], ans: "sec<sup>2</sup>&theta;" },
  { q: "Amplitude & period of&nbsp; y = 3 sin(2x)", steps: ["amplitude = |3|", "period = 2&pi; / |2|"], ans: "amplitude <b>3</b>, period <b>&pi;</b>" },
  { q: "Solve&nbsp; sin &theta; = &frac12;&nbsp; on [0, 2&pi;)", steps: ["Reference angle &pi;/6", "Sine is positive in Q1 and Q2"], ans: "&theta; = <b>&pi;/6, 5&pi;/6</b>" },
  { q: "Law of sines: A = 30&deg;, a = 5, B = 90&deg;", steps: ["a / sin A = b / sin B", "5 / sin 30&deg; = b / sin 90&deg;", "10 = b / 1"], ans: "b = <b>10</b>" },
  { q: "Law of cosines: a = 3, b = 4, C = 90&deg;", steps: ["c<sup>2</sup> = 3<sup>2</sup> + 4<sup>2</sup> &minus; 2&middot;3&middot;4&middot;cos 90&deg;", "cos 90&deg; = 0, so c<sup>2</sup> = 25"], ans: "c = <b>5</b>" },
  { q: "See a wave change shape", steps: ["Open Desmos and enter y = a&middot;sin(b(x &minus; c)) + d", "Add sliders for a, b, c, d", "Watch amplitude, period and the two shifts move independently"], ans: "Plot <b>y = a&middot;sin(b(x &minus; c)) + d</b>" }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
  { name: "Send wave to Time-Series Lab", desc: "Analyze a wave as a signal.", href: "room.html?room=math-time-series", tag: "room" },
],
sections: [
  { title: "Unit circle", items: ["Radians & degrees", "Reference angles", "Exact values"] },
  { title: "Identities", items: ["Pythagorean identities", "Angle sum & difference", "Double & half angle"] },
  { title: "Sine / cosine / tangent", items: ["Graphs & periods", "Amplitude & phase", "Inverse trig"] },
  { title: "Waves & angles", items: ["Wave parameters", "Phase shifts", "Applications"] }
]
};
