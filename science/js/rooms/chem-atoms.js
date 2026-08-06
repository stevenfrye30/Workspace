/* Room content: chem-atoms — atomic structure, bonding and periodic trends. */

export default {
name: "Atoms, Bonding & Trends", kind: "Chemistry · structure", glyph: "⚛", color: "#e0794b",
blurb: "What atoms are made of, how they join, and why the periodic table's patterns fall out of electron arrangement.",
status: "Reference — pairs with the interactive periodic table",
cards: [
  { name: "What is in an atom", body: "Protons set the element, neutrons set the isotope, electrons set the chemistry.", note: "Atomic number = protons. Mass number = protons + neutrons." },
  { name: "Ions", body: "Metals lose electrons to form cations (+); nonmetals gain them to form anions (−).", note: "Charge = protons − electrons." },
  { name: "Valence electrons", body: "The outer-shell electrons — the only ones that bond.", note: "For main-group elements, the group number gives the count." },
  { name: "Electronegativity trend", body: "↑ across a period · ↓ down a group", note: "Peaks at fluorine. It drives bond polarity." },
  { name: "Ionization energy trend", body: "↑ across a period · ↓ down a group", note: "Harder to remove an electron from a smaller, more tightly held atom." },
  { name: "Atomic radius trend", body: "↓ across a period · ↑ down a group", note: "More protons pull the same shell in tighter; a new shell pushes it out." },
  { name: "Bond type from ΔEN", body: "ΔEN &gt; ~1.7 ionic · 0.4–1.7 polar covalent · &lt; 0.4 nonpolar covalent", note: "The cut-offs are guidelines, not laws — bonding is a spectrum." },
  { name: "Ionic vs covalent", body: "Ionic: metal + nonmetal, electrons transferred, forms a lattice.<br>Covalent: nonmetal + nonmetal, electrons shared, forms molecules.", note: "Metallic: a lattice of cations in a sea of shared electrons." },
  { name: "Octet rule", body: "Atoms tend towards eight valence electrons.", note: "H and He want two; period 3 and beyond can exceed eight." },
  { name: "Intermolecular forces", body: "London dispersion &lt; dipole–dipole &lt; hydrogen bonding &lt; ion–dipole", note: "These set boiling point and solubility — not bond strength." },
  { name: "Hydrogen bonding", body: "Needs H bonded directly to N, O or F.", note: "Why water boils so much higher than its size suggests." }
],
examples: [
  { q: "Why does NaCl form?", steps: ["Na (Z 11) loses 1e⁻ → Na⁺", "Cl (Z 17) gains 1e⁻ → Cl⁻", "Opposite charges attract"], ans: "<b>Na⁺Cl⁻</b> — open the Periodic Table room to inspect Na &amp; Cl" },
  { q: "Which is larger, Na or Na⁺?", steps: ["Na⁺ has lost its entire outer shell", "Same nuclear charge pulling fewer electrons"], ans: "<b>Na</b> is much larger" },
  { q: "Rank F, O, N by electronegativity", steps: ["All in period 2", "Electronegativity rises across a period"], ans: "<b>F &gt; O &gt; N</b>" },
  { q: "Is HCl polar?", steps: ["EN: H 2.20, Cl 3.16", "ΔEN = 0.96 — in the polar covalent range"], ans: "<b>polar covalent</b>, with Cl the negative end" },
  { q: "Why does water boil higher than H₂S?", steps: ["Both are bent molecules of similar size", "O is electronegative enough for hydrogen bonding; S is not"], ans: "<b>hydrogen bonding</b> in water" },
  { q: "Electron configuration of Cl", steps: ["17 electrons", "Fill 1s 2s 2p 3s 3p"], ans: "<b>[Ne] 3s² 3p⁵</b> — one short of an octet" }
],
links: [
  { name: "Periodic Table", desc: "Click any element for its configuration and trends.", href: "room.html?room=periodic-table", tag: "room" },
  { name: "Moles & Stoichiometry", desc: "From formulas to amounts.", href: "room.html?room=chem-moles", tag: "room" },
  { name: "Reference Tables", desc: "Polyatomic ions and formula writing.", href: "room.html?room=reference", tag: "room" },
  { name: "All of Chemistry", desc: "Back to the topic list.", href: "room.html?room=chemistry", tag: "room" }
]
};
