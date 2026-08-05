/* General-chemistry reference tables.

   Formulas are stored as plain ASCII with a separate integer charge, so the
   same record is both searchable as text and renderable with proper sub- and
   superscripts. Use fmtFormula() / fmtCharge() from the widget to display.

   Ka/Kb values are the conventional 25 °C textbook values; where sources
   differ in the last digit the rounder, more commonly taught value is used.
   These are for teaching, not for publication-grade work. */

/* ── Polyatomic ions ─────────────────────────────────────────────────────
   n = name, f = formula (ASCII), c = charge, alt = alternative name */
export const POLYATOMIC = [
  { n: "ammonium",             f: "NH4",    c: 1 },
  { n: "hydronium",            f: "H3O",    c: 1 },

  { n: "acetate",              f: "C2H3O2", c: -1, alt: "also written CH_3COO^-" },
  { n: "bromate",              f: "BrO3",   c: -1 },
  { n: "chlorate",             f: "ClO3",   c: -1 },
  { n: "chlorite",             f: "ClO2",   c: -1 },
  { n: "cyanide",              f: "CN",     c: -1 },
  { n: "dihydrogen phosphate", f: "H2PO4",  c: -1 },
  { n: "hydrogen carbonate",   f: "HCO3",   c: -1, alt: "bicarbonate" },
  { n: "hydrogen sulfate",     f: "HSO4",   c: -1, alt: "bisulfate" },
  { n: "hydrogen sulfite",     f: "HSO3",   c: -1, alt: "bisulfite" },
  { n: "hydroxide",            f: "OH",     c: -1 },
  { n: "hypochlorite",         f: "ClO",    c: -1 },
  { n: "iodate",               f: "IO3",    c: -1 },
  { n: "nitrate",              f: "NO3",    c: -1 },
  { n: "nitrite",              f: "NO2",    c: -1 },
  { n: "perchlorate",          f: "ClO4",   c: -1 },
  { n: "permanganate",         f: "MnO4",   c: -1 },
  { n: "thiocyanate",          f: "SCN",    c: -1 },

  { n: "carbonate",            f: "CO3",    c: -2 },
  { n: "chromate",             f: "CrO4",   c: -2 },
  { n: "dichromate",           f: "Cr2O7",  c: -2 },
  { n: "hydrogen phosphate",   f: "HPO4",   c: -2 },
  { n: "oxalate",              f: "C2O4",   c: -2 },
  { n: "peroxide",             f: "O2",     c: -2 },
  { n: "silicate",             f: "SiO3",   c: -2 },
  { n: "sulfate",              f: "SO4",    c: -2 },
  { n: "sulfite",              f: "SO3",    c: -2 },
  { n: "thiosulfate",          f: "S2O3",   c: -2 },

  { n: "arsenate",             f: "AsO4",   c: -3 },
  { n: "phosphate",            f: "PO4",    c: -3 },
  { n: "phosphite",            f: "PO3",    c: -3 }
];

/* The -ate / -ite / hypo- / per- pattern, taught as a family rather than
   memorised one ion at a time. */
export const OXYANION_PATTERN = [
  { prefix: "per-…-ate", example: "ClO4", c: -1, meaning: "one more O than the -ate ion" },
  { prefix: "-ate",      example: "ClO3", c: -1, meaning: "the reference ion" },
  { prefix: "-ite",      example: "ClO2", c: -1, meaning: "one fewer O than the -ate ion" },
  { prefix: "hypo-…-ite", example: "ClO", c: -1, meaning: "two fewer O than the -ate ion" }
];

/* ── Solubility rules ───────────────────────────────────────────────────
   Ordered so that an earlier rule wins when two rules disagree.

   Prose here mixes formulas with ordinary words ("Group 1"), so it uses
   explicit markers rather than letting a formatter guess: _n is a subscript
   and ^x a superscript, with ^{...} for multi-character charges. Writing a
   charge as a subscript would turn Ba^{2+} into "two bariums". */
export const SOLUBILITY = [
  { rule: "Group 1 cations (Li^+, Na^+, K^+, Rb^+, Cs^+) and ammonium (NH_4^+)",
    verdict: "soluble", exceptions: "none — this rule always wins" },
  { rule: "Nitrate (NO_3^-), acetate (C_2H_3O_2^-), chlorate (ClO_3^-), perchlorate (ClO_4^-)",
    verdict: "soluble", exceptions: "none in practice" },
  { rule: "Chloride (Cl^-), bromide (Br^-), iodide (I^-)",
    verdict: "soluble", exceptions: "Ag^+, Pb^{2+} and Hg_2^{2+} are insoluble" },
  { rule: "Sulfate (SO_4^{2-})",
    verdict: "soluble", exceptions: "Ba^{2+}, Pb^{2+}, Sr^{2+}, Hg_2^{2+} insoluble; Ca^{2+} and Ag^+ slightly soluble" },
  { rule: "Hydroxide (OH^-)",
    verdict: "insoluble", exceptions: "Group 1 and Ba^{2+} soluble; Ca^{2+} and Sr^{2+} slightly soluble" },
  { rule: "Sulfide (S^{2-})",
    verdict: "insoluble", exceptions: "Group 1, Group 2 and NH_4^+ soluble" },
  { rule: "Carbonate (CO_3^{2-}), phosphate (PO_4^{3-}), sulfite (SO_3^{2-}), chromate (CrO_4^{2-})",
    verdict: "insoluble", exceptions: "Group 1 and NH_4^+ soluble" }
];

/* ── Strong acids and bases — the memorise-these lists ──────────────────── */
export const STRONG_ACIDS = [
  { f: "HCl",    n: "hydrochloric acid" },
  { f: "HBr",    n: "hydrobromic acid" },
  { f: "HI",     n: "hydroiodic acid" },
  { f: "HNO3",   n: "nitric acid" },
  { f: "H2SO4",  n: "sulfuric acid", note: "first proton only; HSO4− is a weak acid" },
  { f: "HClO4",  n: "perchloric acid" },
  { f: "HClO3",  n: "chloric acid", note: "included by some textbooks" }
];

export const STRONG_BASES = [
  { f: "LiOH",     n: "lithium hydroxide" },
  { f: "NaOH",     n: "sodium hydroxide" },
  { f: "KOH",      n: "potassium hydroxide" },
  { f: "RbOH",     n: "rubidium hydroxide" },
  { f: "CsOH",     n: "cesium hydroxide" },
  { f: "Ca(OH)2",  n: "calcium hydroxide", note: "strong but only slightly soluble" },
  { f: "Sr(OH)2",  n: "strontium hydroxide" },
  { f: "Ba(OH)2",  n: "barium hydroxide" }
];

/* ── Weak acid Ka / weak base Kb at 25 °C ───────────────────────────────
   ka is the numeric value; pka is −log10(ka), pre-computed for display. */
/* c is the species' charge — several of these acids are themselves ions,
   and dropping the charge would misname them (HCO3 is not HCO3−). */
export const KA = [
  { f: "HSO4",   c: -1, n: "hydrogen sulfate",  ka: 1.2e-2,  pka: 1.92 },
  { f: "H3PO4",  c: 0,  n: "phosphoric acid",   ka: 7.5e-3,  pka: 2.12, note: "Ka1" },
  { f: "HF",     c: 0,  n: "hydrofluoric acid", ka: 6.8e-4,  pka: 3.17 },
  { f: "HNO2",   c: 0,  n: "nitrous acid",      ka: 4.5e-4,  pka: 3.35 },
  { f: "HCOOH",  c: 0,  n: "formic acid",       ka: 1.8e-4,  pka: 3.75 },
  { f: "C6H5COOH", c: 0, n: "benzoic acid",     ka: 6.3e-5,  pka: 4.20 },
  { f: "CH3COOH", c: 0, n: "acetic acid",       ka: 1.8e-5,  pka: 4.74, note: "the standard buffer example" },
  { f: "H2CO3",  c: 0,  n: "carbonic acid",     ka: 4.3e-7,  pka: 6.37, note: "Ka1" },
  { f: "H2S",    c: 0,  n: "hydrosulfuric acid", ka: 8.9e-8, pka: 7.05, note: "Ka1" },
  { f: "H2PO4",  c: -1, n: "dihydrogen phosphate", ka: 6.2e-8, pka: 7.21, note: "Ka2 of H3PO4; the phosphate buffer" },
  { f: "HClO",   c: 0,  n: "hypochlorous acid", ka: 3.0e-8,  pka: 7.52 },
  { f: "NH4",    c: 1,  n: "ammonium",          ka: 5.6e-10, pka: 9.25, note: "conjugate acid of NH3" },
  { f: "HCN",    c: 0,  n: "hydrocyanic acid",  ka: 4.9e-10, pka: 9.31 },
  { f: "HCO3",   c: -1, n: "hydrogen carbonate", ka: 4.7e-11, pka: 10.33, note: "Ka2 of H2CO3" },
  { f: "HPO4",   c: -2, n: "hydrogen phosphate", ka: 4.8e-13, pka: 12.32, note: "Ka3 of H3PO4" }
];

export const KB = [
  { f: "CH3NH2",  n: "methylamine",   kb: 4.4e-4,  pkb: 3.36 },
  { f: "NH3",     n: "ammonia",       kb: 1.8e-5,  pkb: 4.74, note: "the standard weak base" },
  { f: "C5H5N",   n: "pyridine",      kb: 1.7e-9,  pkb: 8.77 },
  { f: "C6H5NH2", n: "aniline",       kb: 4.3e-10, pkb: 9.37 }
];

/* Relationships a student needs alongside the Ka/Kb table. */
export const KA_KB_NOTES = [
  "Ka × Kb = Kw = 1.0 × 10⁻¹⁴ for a conjugate acid–base pair.",
  "pKa + pKb = 14.00 for a conjugate pair at 25 °C.",
  "A larger Ka (smaller pKa) means a stronger acid.",
  "A buffer works best when pH is within about 1 unit of the acid's pKa."
];
