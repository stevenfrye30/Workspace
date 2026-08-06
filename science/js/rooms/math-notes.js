/* Room content: math-notes — ported from the standalone Math Lab. */

export default {
kind: "Library",

blurb: "Your personal formula vault and study notebook — collect, save, and reuse math from every room in one place.",
status: "Your notebook — autosaves locally",
cards: [
  { name: "Algebra essentials", body: 'x = <span class="frac"><span class="num">&minus;b &plusmn; &radic;(b<sup>2</sup> &minus; 4ac)</span><span class="den">2a</span></span><br>m = (y<sub>2</sub> &minus; y<sub>1</sub>) / (x<sub>2</sub> &minus; x<sub>1</sub>)<br>y &minus; y<sub>1</sub> = m(x &minus; x<sub>1</sub>)', note: "Full room: Algebra." },
  { name: "Calculus essentials", body: "(x<sup>n</sup>)&prime; = n x<sup>n&minus;1</sup><br>&int;<sub>a</sub><sup>b</sup> f = F(b) &minus; F(a)<br>[f(g)]&prime; = f&prime;(g)&middot;g&prime;", note: "Full room: Calculus." },
  { name: "Geometry essentials", body: "d = &radic;[(&Delta;x)<sup>2</sup> + (&Delta;y)<sup>2</sup>]<br>A = &pi;r<sup>2</sup><br>a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>", note: "Full room: Geometry." },
  { name: "Trigonometry essentials", body: "sin<sup>2</sup>&theta; + cos<sup>2</sup>&theta; = 1<br>sin &theta; = opp / hyp<br>y = a&middot;sin(b(x &minus; c)) + d", note: "Full room: Trigonometry." },
  { name: "Statistics essentials", body: "x&#772; = &Sigma;x<sub>i</sub> / n<br>s = &radic;(&Sigma;(x<sub>i</sub> &minus; x&#772;)<sup>2</sup> / (n &minus; 1))<br>z = (x &minus; &mu;) / &sigma;", note: "Full room: Statistics." },
  { name: "Time-Series essentials", body: "f<sub>s</sub> = 1 / &Delta;t<br>MA = (1/k) &Sigma; x<br>AUC &asymp; &Sigma; (&Delta;t/2)(x<sub>i</sub> + x<sub>i+1</sub>)", note: "Full room: Time-Series Lab." },
  { name: "Physics essentials", body: "F = m a<br>KE = &frac12; m v<sup>2</sup><br>V = I R", note: "Full room: Physics." },
  { name: "Notation reminders", body: "&Sigma; sum &middot; &int; integral &middot; &Delta; change<br>&part; partial &middot; &nabla; del &middot; &pi; pi<br>&theta; angle &middot; &mu;, &sigma; mean & SD", note: "Copy any symbol in the Symbols room." },
  { name: "Problem-solving checklist", body: "1. Know what's asked<br>2. List givens & units<br>3. Choose a formula<br>4. Solve symbolically, then plug in<br>5. Check units & sanity", note: "" },
  { name: "Common mistakes checklist", body: "Sign & distribution slips<br>Degrees vs radians<br>n vs n &minus; 1 in variance<br>Dropping units or + C", note: "" }
],
examplesTitle: "Note Templates",
examplesSub: "Click a template, then copy its shape into your notes below.",
examples: [
  { q: "Formula note", steps: ["# Formula", "# Meaning", "# Example", "# When to use", "# Common mistake"], ans: "Make each formula self-explaining." },
  { q: "Worked example note", steps: ["# Problem", "# Plan", "# Steps", "# Answer", "# Check"], ans: "Show the reasoning, not just the result." },
  { q: "Theorem / definition note", steps: ["# Name", "# Statement", "# Conditions", "# Why it holds", "# Example"], ans: "State the conditions precisely." },
  { q: "Statistics interpretation note", steps: ["# Result (p, r, CI, &hellip;)", "# Plain-language meaning", "# What it does NOT mean", "# Decision"], ans: "Interpretation matters more than the number." },
  { q: "Experiment / data-analysis note", steps: ["# Question", "# Data & units", "# Method (filter, baseline, peaks)", "# Measurements", "# Conclusion"], ans: "Record how the data was processed." },
  { q: "Graphing note", steps: ["# Function", "# Key features (intercepts, asymptotes)", "# Transformations", "# Window / scale"], ans: "Note amplitude, period, and shifts." },
  { q: "Common-mistake note", steps: ["# Mistake", "# Why it happens", "# Correct approach", "# Memory hook"], ans: "Turn each error into a reminder." }
],
links: [
  { name: "Desmos graphing calculator", desc: "Plot any expression — opens Desmos in a new tab.", href: "https://www.desmos.com/calculator", tag: "math" },
  { name: "Send data note to Time-Series Lab", desc: "Open the signal console.", href: "room.html?room=math-time-series", tag: "room" },
  { name: "Open Symbols room", desc: "Grab notation to copy.", href: "room.html?room=math-symbols", tag: "room" },
],
notesTall: true,
notesPlaceholder: "# Formula&#10;&#10;# Meaning&#10;&#10;# Example&#10;&#10;# When to use&#10;&#10;# Common mistake",
sections: [
  { title: "Personal notes", items: ["Free-form math notes", "Tagged by topic"] },
  { title: "Formula library", items: ["Saved formulas", "Quick reference"] },
  { title: "Examples", items: ["Worked examples", "Reusable templates"] },
  { title: "Definitions", items: ["Glossary of terms", "Concept explanations"] }
]
};
