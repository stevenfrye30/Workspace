/* Room content: math-geometry — ported from the standalone Math Lab. */

export default {
name: "Geometry", kind: "Form", glyph: "△", color: "#8b93d0",
blurb: "Shapes, theorems, and coordinate geometry — a visual reference that ties figures (△ ○ □) to formulas and to algebra.",
status: "Reference & examples ready — interactive tools coming",
topics: [
  "Points, lines & planes", "Angles", "Triangles", "Polygons", "Circles", "Perimeter",
  "Area", "Surface area", "Volume", "Coordinate geometry", "Distance formula", "Midpoint formula",
  "Slope & parallel/perpendicular", "Transformations", "Similarity", "Congruence", "Proofs", "Right-triangle geometry"
],
cards: [
  { name: "Distance formula", body: "d = &radic;[ (x<sub>2</sub> &minus; x<sub>1</sub>)<sup>2</sup> + (y<sub>2</sub> &minus; y<sub>1</sub>)<sup>2</sup> ]", note: "Straight-line distance between two points." },
  { name: "Midpoint formula", body: 'M = ( <span class="frac"><span class="num">x<sub>1</sub> + x<sub>2</sub></span><span class="den">2</span></span> , <span class="frac"><span class="num">y<sub>1</sub> + y<sub>2</sub></span><span class="den">2</span></span> )', note: "Average of the endpoints." },
  { name: "Slope formula", body: 'm = <span class="frac"><span class="num">y<sub>2</sub> &minus; y<sub>1</sub></span><span class="den">x<sub>2</sub> &minus; x<sub>1</sub></span></span>', note: "Parallel lines share a slope; perpendicular slopes multiply to &minus;1." },
  { name: "Triangle area △", body: "A = &frac12; b h", note: "Base &times; height, halved." },
  { name: "Rectangle area □", body: "A = l w", note: "Length &times; width." },
  { name: "Circle circumference ○", body: "C = 2&pi;r = &pi;d", note: "Distance around the circle." },
  { name: "Circle area ○", body: "A = &pi;r<sup>2</sup>", note: "Area enclosed by the circle." },
  { name: "Pythagorean theorem", body: "a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>", note: "Right triangles only; c is the hypotenuse." },
  { name: "Polygon interior angle sum", body: "(n &minus; 2) &middot; 180&deg;", note: "Total of all interior angles of an n-gon." },
  { name: "Regular polygon angle", body: '<span class="frac"><span class="num">(n &minus; 2) &middot; 180&deg;</span><span class="den">n</span></span>', note: "Each interior angle when all are equal." },
  { name: "Rectangular prism — surface area", body: "SA = 2(lw + lh + wh)", note: "Sum of all six faces." },
  { name: "Rectangular prism — volume", body: "V = l w h", note: "" },
  { name: "Cylinder volume", body: "V = &pi;r<sup>2</sup>h", note: "Base circle &times; height." },
  { name: "Sphere volume", body: 'V = <span class="frac"><span class="num">4</span><span class="den">3</span></span>&pi;r<sup>3</sup>', note: "" },
  { name: "Cone volume", body: 'V = <span class="frac"><span class="num">1</span><span class="den">3</span></span>&pi;r<sup>2</sup>h', note: "One-third of the matching cylinder." },
  { name: "Equation of a circle", body: "(x &minus; h)<sup>2</sup> + (y &minus; k)<sup>2</sup> = r<sup>2</sup>", note: "Center (h, k), radius r." }
],
examples: [
  { q: "Distance between&nbsp; (1, 2)&nbsp; and&nbsp; (4, 6)", steps: ["d = &radic;[(4 &minus; 1)<sup>2</sup> + (6 &minus; 2)<sup>2</sup>]", "= &radic;(9 + 16) = &radic;25"], ans: "d = <b>5</b>" },
  { q: "Midpoint of&nbsp; (2, 3)&nbsp; and&nbsp; (8, 7)", steps: ["( (2 + 8) / 2 , (3 + 7) / 2 )"], ans: "M = <b>(5, 5)</b>" },
  { q: "Area of a triangle,&nbsp; b = 6, h = 4", steps: ["A = &frac12; &middot; 6 &middot; 4"], ans: "A = <b>12</b>" },
  { q: "Pythagorean theorem, legs 3 and 4", steps: ["c = &radic;(3<sup>2</sup> + 4<sup>2</sup>) = &radic;25"], ans: "c = <b>5</b>" },
  { q: "Circle with&nbsp; r = 3", steps: ["A = &pi;r<sup>2</sup> = 9&pi;", "C = 2&pi;r = 6&pi;"], ans: "A &asymp; <b>28.3</b>,&nbsp; C &asymp; <b>18.8</b>" },
  { q: "Interior angle sum of a hexagon&nbsp; (n = 6)", steps: ["(n &minus; 2) &middot; 180&deg; = 4 &middot; 180&deg;"], ans: "<b>720&deg;</b>" },
  { q: "Equation of a circle: center (2, &minus;1), r = 5", steps: ["(x &minus; h)<sup>2</sup> + (y &minus; k)<sup>2</sup> = r<sup>2</sup>", "h = 2, k = &minus;1, r = 5"], ans: "(x &minus; 2)<sup>2</sup> + (y + 1)<sup>2</sup> = <b>25</b>" },
  { q: "Parallel or perpendicular?&nbsp; slopes 2 and &minus;&frac12;", steps: ["Multiply the slopes: 2 &middot; (&minus;&frac12;) = &minus;1"], ans: "<b>Perpendicular</b> — slopes multiply to &minus;1." }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
],
sections: [
  { title: "Shapes", items: ["Triangles, circles, polygons", "Area & perimeter", "Surface area & volume"] },
  { title: "Theorems", items: ["Pythagoras", "Similarity & congruence", "Circle theorems"] },
  { title: "Coordinate geometry", items: ["Distance & midpoint", "Lines & slopes", "Conic sections"] },
  { title: "Diagrams", items: ["Construction sketches", "Labeled figures"] }
]
};
