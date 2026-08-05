/* Periodic-table data: 118 elements, categories, and curated significance. */
export const CATS = {
  alkali:     { label: "Alkali metal",          color: "#d98b6b" },
  alkaline:   { label: "Alkaline earth metal",  color: "#d9b46b" },
  transition: { label: "Transition metal",      color: "#6b9bd9" },
  post:       { label: "Post-transition metal", color: "#6bd9c2" },
  metalloid:  { label: "Metalloid",             color: "#9bd96b" },
  nonmetal:   { label: "Reactive nonmetal",     color: "#6bd97a" },
  halogen:    { label: "Halogen",               color: "#d96bc2" },
  noble:      { label: "Noble gas",             color: "#b06bd9" },
  lanthanide: { label: "Lanthanide",            color: "#d96b8b" },
  actinide:   { label: "Actinide",              color: "#d9746b" },
  unknown:    { label: "Unknown / predicted",   color: "#8a93a0" }
};
export const CATDESC = {
  alkali: "soft, very reactive metals (group 1) that form +1 ions.",
  alkaline: "reactive metals (group 2) that form +2 ions.",
  transition: "hard, conductive d-block metals with variable oxidation states.",
  post: "softer metals to the right of the transition block.",
  metalloid: "elements with properties between metals and nonmetals; many are semiconductors.",
  nonmetal: "elements that gain or share electrons to form covalent compounds.",
  halogen: "very reactive group-17 nonmetals that form −1 ions.",
  noble: "full-shell, largely inert group-18 gases.",
  lanthanide: "f-block rare-earth metals (Z 57–71).",
  actinide: "f-block, largely radioactive metals (Z 89–103).",
  unknown: "superheavy synthetic element; chemistry mostly predicted, not measured."
};
const RAW = [
  [1,"H","Hydrogen",1.008,"nonmetal",1,1],[2,"He","Helium",4.0026,"noble",18,1],
  [3,"Li","Lithium",6.94,"alkali",1,2],[4,"Be","Beryllium",9.0122,"alkaline",2,2],[5,"B","Boron",10.81,"metalloid",13,2],[6,"C","Carbon",12.011,"nonmetal",14,2],[7,"N","Nitrogen",14.007,"nonmetal",15,2],[8,"O","Oxygen",15.999,"nonmetal",16,2],[9,"F","Fluorine",18.998,"halogen",17,2],[10,"Ne","Neon",20.180,"noble",18,2],
  [11,"Na","Sodium",22.990,"alkali",1,3],[12,"Mg","Magnesium",24.305,"alkaline",2,3],[13,"Al","Aluminium",26.982,"post",13,3],[14,"Si","Silicon",28.085,"metalloid",14,3],[15,"P","Phosphorus",30.974,"nonmetal",15,3],[16,"S","Sulfur",32.06,"nonmetal",16,3],[17,"Cl","Chlorine",35.45,"halogen",17,3],[18,"Ar","Argon",39.95,"noble",18,3],
  [19,"K","Potassium",39.098,"alkali",1,4],[20,"Ca","Calcium",40.078,"alkaline",2,4],[21,"Sc","Scandium",44.956,"transition",3,4],[22,"Ti","Titanium",47.867,"transition",4,4],[23,"V","Vanadium",50.942,"transition",5,4],[24,"Cr","Chromium",51.996,"transition",6,4],[25,"Mn","Manganese",54.938,"transition",7,4],[26,"Fe","Iron",55.845,"transition",8,4],[27,"Co","Cobalt",58.933,"transition",9,4],[28,"Ni","Nickel",58.693,"transition",10,4],[29,"Cu","Copper",63.546,"transition",11,4],[30,"Zn","Zinc",65.38,"transition",12,4],[31,"Ga","Gallium",69.723,"post",13,4],[32,"Ge","Germanium",72.630,"metalloid",14,4],[33,"As","Arsenic",74.922,"metalloid",15,4],[34,"Se","Selenium",78.971,"nonmetal",16,4],[35,"Br","Bromine",79.904,"halogen",17,4],[36,"Kr","Krypton",83.798,"noble",18,4],
  [37,"Rb","Rubidium",85.468,"alkali",1,5],[38,"Sr","Strontium",87.62,"alkaline",2,5],[39,"Y","Yttrium",88.906,"transition",3,5],[40,"Zr","Zirconium",91.224,"transition",4,5],[41,"Nb","Niobium",92.906,"transition",5,5],[42,"Mo","Molybdenum",95.95,"transition",6,5],[43,"Tc","Technetium","[98]","transition",7,5],[44,"Ru","Ruthenium",101.07,"transition",8,5],[45,"Rh","Rhodium",102.91,"transition",9,5],[46,"Pd","Palladium",106.42,"transition",10,5],[47,"Ag","Silver",107.87,"transition",11,5],[48,"Cd","Cadmium",112.41,"transition",12,5],[49,"In","Indium",114.82,"post",13,5],[50,"Sn","Tin",118.71,"post",14,5],[51,"Sb","Antimony",121.76,"metalloid",15,5],[52,"Te","Tellurium",127.60,"metalloid",16,5],[53,"I","Iodine",126.90,"halogen",17,5],[54,"Xe","Xenon",131.29,"noble",18,5],
  [55,"Cs","Caesium",132.91,"alkali",1,6],[56,"Ba","Barium",137.33,"alkaline",2,6],
  [57,"La","Lanthanum",138.91,"lanthanide",3,6],[58,"Ce","Cerium",140.12,"lanthanide",null,6],[59,"Pr","Praseodymium",140.91,"lanthanide",null,6],[60,"Nd","Neodymium",144.24,"lanthanide",null,6],[61,"Pm","Promethium","[145]","lanthanide",null,6],[62,"Sm","Samarium",150.36,"lanthanide",null,6],[63,"Eu","Europium",151.96,"lanthanide",null,6],[64,"Gd","Gadolinium",157.25,"lanthanide",null,6],[65,"Tb","Terbium",158.93,"lanthanide",null,6],[66,"Dy","Dysprosium",162.50,"lanthanide",null,6],[67,"Ho","Holmium",164.93,"lanthanide",null,6],[68,"Er","Erbium",167.26,"lanthanide",null,6],[69,"Tm","Thulium",168.93,"lanthanide",null,6],[70,"Yb","Ytterbium",173.05,"lanthanide",null,6],[71,"Lu","Lutetium",174.97,"lanthanide",3,6],
  [72,"Hf","Hafnium",178.49,"transition",4,6],[73,"Ta","Tantalum",180.95,"transition",5,6],[74,"W","Tungsten",183.84,"transition",6,6],[75,"Re","Rhenium",186.21,"transition",7,6],[76,"Os","Osmium",190.23,"transition",8,6],[77,"Ir","Iridium",192.22,"transition",9,6],[78,"Pt","Platinum",195.08,"transition",10,6],[79,"Au","Gold",196.97,"transition",11,6],[80,"Hg","Mercury",200.59,"transition",12,6],[81,"Tl","Thallium",204.38,"post",13,6],[82,"Pb","Lead",207.2,"post",14,6],[83,"Bi","Bismuth",208.98,"post",15,6],[84,"Po","Polonium","[209]","post",16,6],[85,"At","Astatine","[210]","halogen",17,6],[86,"Rn","Radon","[222]","noble",18,6],
  [87,"Fr","Francium","[223]","alkali",1,7],[88,"Ra","Radium","[226]","alkaline",2,7],
  [89,"Ac","Actinium","[227]","actinide",3,7],[90,"Th","Thorium",232.04,"actinide",null,7],[91,"Pa","Protactinium",231.04,"actinide",null,7],[92,"U","Uranium",238.03,"actinide",null,7],[93,"Np","Neptunium","[237]","actinide",null,7],[94,"Pu","Plutonium","[244]","actinide",null,7],[95,"Am","Americium","[243]","actinide",null,7],[96,"Cm","Curium","[247]","actinide",null,7],[97,"Bk","Berkelium","[247]","actinide",null,7],[98,"Cf","Californium","[251]","actinide",null,7],[99,"Es","Einsteinium","[252]","actinide",null,7],[100,"Fm","Fermium","[257]","actinide",null,7],[101,"Md","Mendelevium","[258]","actinide",null,7],[102,"No","Nobelium","[259]","actinide",null,7],[103,"Lr","Lawrencium","[266]","actinide",3,7],
  [104,"Rf","Rutherfordium","[267]","transition",4,7],[105,"Db","Dubnium","[268]","transition",5,7],[106,"Sg","Seaborgium","[269]","transition",6,7],[107,"Bh","Bohrium","[270]","transition",7,7],[108,"Hs","Hassium","[269]","transition",8,7],[109,"Mt","Meitnerium","[278]","transition",9,7],[110,"Ds","Darmstadtium","[281]","transition",10,7],[111,"Rg","Roentgenium","[282]","transition",11,7],[112,"Cn","Copernicium","[285]","transition",12,7],[113,"Nh","Nihonium","[286]","unknown",13,7],[114,"Fl","Flerovium","[289]","unknown",14,7],[115,"Mc","Moscovium","[290]","unknown",15,7],[116,"Lv","Livermorium","[293]","unknown",16,7],[117,"Ts","Tennessine","[294]","unknown",17,7],[118,"Og","Oganesson","[294]","unknown",18,7]
];
export const ELEMENTS = RAW.map(function (r) { return { z: r[0], s: r[1], n: r[2], m: r[3], c: r[4], g: r[5], p: r[6] }; });
/* Experimentally-established ground-state configurations that plain Aufbau
   filling gets wrong, listed as the orbitals beyond the preceding noble-gas
   core. Chromium and copper are the two every general-chemistry course
   teaches as exceptions — a half-filled or filled d subshell is more stable
   than the s2 the filling rule predicts — so a table that shows Cu as
   4s(2) 3d(9) is teaching students the wrong answer to a question they will
   be asked. Each entry's electrons plus its core must sum to Z; the periodic
   table widget asserts that on load. */
export const ANOMALOUS_CONFIG = {
  24:  [["3d", 5], ["4s", 1]],                  /* Cr */
  29:  [["3d", 10], ["4s", 1]],                 /* Cu */
  41:  [["4d", 4], ["5s", 1]],                  /* Nb */
  42:  [["4d", 5], ["5s", 1]],                  /* Mo */
  44:  [["4d", 7], ["5s", 1]],                  /* Ru */
  45:  [["4d", 8], ["5s", 1]],                  /* Rh */
  46:  [["4d", 10]],                            /* Pd — no 5s at all */
  47:  [["4d", 10], ["5s", 1]],                 /* Ag */
  57:  [["5d", 1], ["6s", 2]],                  /* La */
  58:  [["4f", 1], ["5d", 1], ["6s", 2]],       /* Ce */
  64:  [["4f", 7], ["5d", 1], ["6s", 2]],       /* Gd */
  78:  [["4f", 14], ["5d", 9], ["6s", 1]],      /* Pt */
  79:  [["4f", 14], ["5d", 10], ["6s", 1]],     /* Au */
  89:  [["6d", 1], ["7s", 2]],                  /* Ac */
  90:  [["6d", 2], ["7s", 2]],                  /* Th */
  91:  [["5f", 2], ["6d", 1], ["7s", 2]],       /* Pa */
  92:  [["5f", 3], ["6d", 1], ["7s", 2]],       /* U  */
  93:  [["5f", 4], ["6d", 1], ["7s", 2]],       /* Np */
  96:  [["5f", 7], ["6d", 1], ["7s", 2]],       /* Cm */
  103: [["5f", 14], ["7s", 2], ["7p", 1]]       /* Lr */
};

/* Curated significance for key elements; others fall back to a category blurb. */
export const REL = {
  1:  { ox: "+1, −1", desc: "Lightest element and the fuel of stars; the backbone of acids, water, and organic molecules.", bio: "Half of water; central to pH, redox, and every biomolecule.", lab: "pH, ¹H NMR, reducing gas." },
  2:  { ox: "0", desc: "Inert noble gas; the second-most abundant element in the universe.", lab: "Cryogenics (liquid He), leak detection.", phys: "α-particles are He nuclei; superfluidity." },
  6:  { ox: "+4, +2, −4", desc: "The scaffold of organic chemistry and all known life.", bio: "Backbone of proteins, lipids, carbohydrates, nucleic acids.", lab: "¹³C NMR; ¹⁴C radiocarbon dating." },
  7:  { ox: "+5 … −3", desc: "78% of air; essential to amino acids and nucleotides.", bio: "Amino groups, DNA/RNA bases, ATP.", lab: "Liquid N₂; Kjeldahl assay." },
  8:  { ox: "−2, −1", desc: "Most abundant element in the body by mass; drives respiration.", bio: "Terminal electron acceptor in oxidative phosphorylation.", lab: "Dissolved-oxygen assays." },
  11: { ox: "+1", desc: "Reactive alkali metal whose ion sets extracellular voltage.", bio: "Na⁺ gradient drives action potentials and transport.", lab: "Flame test (yellow); buffers." },
  12: { ox: "+2", desc: "Light structural metal and essential cofactor.", bio: "Stabilizes ATP and ribosomes; chlorophyll's core.", lab: "Grignard reagents." },
  14: { ox: "+4", desc: "Second-most abundant element in Earth's crust; the semiconductor.", lab: "Chromatography media, glassware.", phys: "Foundation of electronics." },
  15: { ox: "+5, +3, −3", desc: "Reactive nonmetal; biology's energy and information currency.", bio: "ATP, DNA/RNA backbone, phospholipids, phosphorylation.", lab: "³²P labeling." },
  16: { ox: "+6, +4, −2", desc: "Nonmetal central to protein structure.", bio: "Cysteine/methionine; disulfide bonds; Fe–S clusters.", lab: "SDS, reducing agents (DTT, β-ME)." },
  17: { ox: "−1, +1, +5, +7", desc: "Reactive halogen; its ion is the major extracellular anion.", bio: "Cl⁻ balance; stomach HCl.", lab: "Bleach, disinfection, buffers." },
  19: { ox: "+1", desc: "Alkali metal and the dominant intracellular cation.", bio: "K⁺ gradient sets the resting membrane potential.", lab: "Flame test (lilac)." },
  20: { ox: "+2", desc: "Structural and signaling metal.", bio: "Bone, muscle contraction, neurotransmitter release, second messenger.", lab: "Ca²⁺ imaging (Fura, GCaMP)." },
  25: { ox: "+2, +4, +7", desc: "Transition-metal cofactor.", bio: "Photosystem II oxygen-evolving complex; superoxide dismutase.", lab: "KMnO₄ oxidant." },
  26: { ox: "+2, +3", desc: "The most-used transition metal in biology.", bio: "Hemoglobin, cytochromes, Fe–S clusters.", lab: "Redox titrations." },
  29: { ox: "+1, +2", desc: "Redox-active transition metal.", bio: "Cytochrome c oxidase; ceruloplasmin.", lab: "Biuret / Lowry protein assays." },
  30: { ox: "+2", desc: "Ubiquitous catalytic and structural metal ion.", bio: "Zinc-finger proteins; carbonic anhydrase; >300 enzymes.", lab: "Affinity tags." },
  34: { ox: "−2, +4, +6", desc: "Essential trace nonmetal.", bio: "Selenocysteine; glutathione peroxidase." },
  47: { ox: "+1", desc: "Coinage transition metal.", lab: "Silver staining; antimicrobial coatings." },
  53: { ox: "−1, +1, +5, +7", desc: "Heavy halogen and essential trace element.", bio: "Thyroid hormones (T3 / T4).", lab: "Radio-iodination (¹²⁵I)." },
  79: { ox: "+3, +1", desc: "Noble, unreactive transition metal.", lab: "Colloidal-gold labeling; electrodes." },
  80: { ox: "+2, +1", desc: "Liquid metal; neurotoxic.", bio: "Bioaccumulates as methylmercury.", lab: "(Historic) thermometers; toxicology." },
  82: { ox: "+2, +4", desc: "Soft, dense post-transition metal and a cumulative toxin.", bio: "Neurotoxic; mimics Ca²⁺." },
  92: { ox: "+6, +4", desc: "Heaviest primordial element; ²³⁵U is fissile.", phys: "Nuclear fission and radiometric dating." }
};
