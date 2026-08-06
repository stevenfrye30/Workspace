/* Room content: biochemistry */

export default {
name: "Biochemistry", kind: "Molecules of life", glyph: "🧬", color: "#7fb0d0",
blurb: "The bridge from Chemistry to Biology — water and pH become amino acids, enzymes, membranes, metabolism, and the molecules that carry information.",
status: "Reference — molecular cards and worked examples",
cards: [
  { name: "Amino acid structure", body: "Central Cα bonded to —NH₂ (amino), —COOH (carboxyl), —H, and a variable R side chain.", note: "The R group sets polarity, charge, and chemistry." },
  { name: "Peptide bond", body: "Amide bond: carboxyl of one residue + amino of the next, releasing H₂O.", note: "Condensation; chain runs N → C." },
  { name: "Protein structure levels", body: "Primary (sequence) → Secondary (α-helix, β-sheet) → Tertiary (3-D fold) → Quaternary (subunits).", note: "" },
  { name: "Enzyme active site", body: "Substrate binds and is stabilized; activation energy drops. Specificity from shape & chemistry (induced fit).", note: "" },
  { name: "Michaelis–Menten", body: "v = V<sub>max</sub>[S] / (K<sub>m</sub> + [S])", note: "Rate vs substrate for a simple enzyme." },
  { name: "Kₘ and Vₘₐₓ", body: "K<sub>m</sub> = [S] at ½V<sub>max</sub> (lower K<sub>m</sub> = tighter binding). V<sub>max</sub> = rate at saturation.", note: "" },
  { name: "Lineweaver–Burk", body: "1/v = (K<sub>m</sub>/V<sub>max</sub>)(1/[S]) + 1/V<sub>max</sub>", note: "Double-reciprocal: linearizes Michaelis–Menten." },
  { name: "pH and pKₐ", body: "When [HA] = [A⁻], pH = pK<sub>a</sub>. Below pK<sub>a</sub> the group is protonated.", note: "" },
  { name: "Henderson–Hasselbalch", body: "pH = pK<sub>a</sub> + log([A⁻] / [HA])", note: "Biological buffers: bicarbonate, phosphate, protein side chains." },
  { name: "ATP hydrolysis", body: "ATP + H₂O → ADP + P<sub>i</sub> + energy (ΔG°′ ≈ −30.5 kJ/mol).", note: "The cell's energy currency." },
  { name: "Redox carriers", body: "NAD⁺/NADH and FAD/FADH₂ shuttle electrons to the electron transport chain.", note: "" },
  { name: "Glycolysis (net)", body: "Glucose → 2 pyruvate + 2 ATP + 2 NADH.", note: "Cytoplasm; no O₂ required for the pathway itself." },
  { name: "TCA cycle", body: "Oxidizes acetyl-CoA → CO₂, yielding NADH, FADH₂, and GTP.", note: "Mitochondrial matrix." },
  { name: "Oxidative phosphorylation", body: "ETC pumps H⁺ → proton gradient → ATP synthase makes ATP; O₂ is the final e⁻ acceptor.", note: "Most ATP is made here." },
  { name: "DNA base pairing", body: "A–T (2 H-bonds), G–C (3 H-bonds); antiparallel strands.", note: "" },
  { name: "RNA vs DNA", body: "RNA: single-stranded, ribose, uracil (U). DNA: double-stranded, deoxyribose, thymine (T).", note: "" },
  { name: "Membrane phospholipid", body: "Amphipathic: hydrophilic head + two hydrophobic tails → forms a bilayer.", note: "" },
  { name: "Hydrophobic effect", body: "Nonpolar groups cluster to minimize disruption of water's H-bonding.", note: "Drives protein folding and membrane assembly." },
  { name: "Central dogma", body: "DNA → (transcription) → RNA → (translation) → protein.", note: "" }
],
examples: [
  { q: "Identify the parts of an amino acid", steps: ["Find the central Cα", "Attached: —NH₂, —COOH, —H, and R"], ans: "amino + carboxyl + H + <b>R side chain</b> on Cα" },
  { q: "How does a peptide bond form?", steps: ["Carboxyl (—COOH) of one + amino (—NH₂) of the next", "Form an amide bond, release H₂O"], ans: "an <b>amide bond</b> + H₂O (condensation)" },
  { q: "Interpret K<sub>m</sub> and V<sub>max</sub>", steps: ["K<sub>m</sub> = [S] at half of V<sub>max</sub>", "Lower K<sub>m</sub> ⇒ tighter substrate binding"], ans: "K<sub>m</sub> = <b>affinity</b>, V<sub>max</sub> = <b>max rate</b> (scales with [enzyme])" },
  { q: "Michaelis–Menten at extremes", steps: ["[S] ≪ K<sub>m</sub>: v ∝ [S] (first-order)", "[S] ≫ K<sub>m</sub>: v → V<sub>max</sub> (saturated)"], ans: "rate rises with [S], then <b>plateaus at V<sub>max</sub></b>" },
  { q: "Blood as a buffer (Henderson–Hasselbalch)", steps: ["Bicarbonate pK<sub>a</sub> ≈ 6.1, blood pH ≈ 7.4", "7.4 = 6.1 + log([HCO₃⁻]/[CO₂])", "log ratio = 1.3"], ans: "[HCO₃⁻] : [CO₂] ≈ <b>20 : 1</b>" },
  { q: "Why do membranes self-assemble?", steps: ["Phospholipids are amphipathic", "Tails hide from water (hydrophobic effect)"], ans: "a <b>bilayer</b> forms spontaneously (water entropy)" },
  { q: "Trace glucose to ATP (high level)", steps: ["Glycolysis: 2 ATP + 2 NADH", "TCA: NADH + FADH₂ + GTP", "Ox-phos: NADH/FADH₂ → ATP"], ans: "≈ <b>30–32 ATP</b> per glucose" },
  { q: "Connect NADH to electron transport", steps: ["NADH donates e⁻ to Complex I", "e⁻ flow pumps H⁺ across the membrane", "Gradient drives ATP synthase"], ans: "NADH → <b>proton gradient</b> → ATP" },
  { q: "Connect Na⁺/K⁺ to the Periodic Table", steps: ["Na (Z 11) → Na⁺, K (Z 19) → K⁺", "Na⁺/K⁺-ATPase pumps 3 Na⁺ out / 2 K⁺ in, using ATP"], ans: "ion gradients set the <b>membrane potential</b> — open the Periodic Table room" },
  { q: "Connect proteins/enzymes to lab work", steps: ["Purify (chromatography)", "Quantify (Bradford / Lowry)", "Assay activity (kinetics)"], ans: "see the <b>Lab Methods</b> room" }
],
links: [
  { name: "Open Periodic Table", desc: "C, H, N, O, P, S, and the bio-metals.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Open Chemistry", desc: "Bonds, pH, equilibrium underneath.", href: "room.html?room=chemistry", tag: "room" },
  { name: "Open Biology", desc: "The cells these molecules build.", href: "room.html?room=biology", tag: "room" },
  { name: "Open Lab Methods", desc: "Purification, assays, imaging.", href: "room.html?room=lab-methods", tag: "room" },
]
};
