/* Thermochemistry data.

   Standard enthalpies of formation are at 298 K and 1 bar, in kJ/mol, keyed
   by formula AND physical state — H2O(l) and H2O(g) differ by ~44 kJ/mol,
   which is the whole enthalpy of vaporisation, so the state is not optional.

   An element in its standard state is defined as zero; those entries are
   listed explicitly so a student sees why they vanish from the arithmetic
   rather than wondering where they went.

   Values are the conventional general-chemistry set. Textbooks differ in the
   last digit (CH4 is quoted as -74.6 or -74.8); the rounder, more commonly
   printed figure is used. Aqueous ions are deliberately omitted — they need a
   convention about H+ that is beyond a first course.

   Specific heats are in J/(g·°C) near room temperature. */

/* key: "FORMULA|state" -> kJ/mol */
export const DHF = {
  /* elements in their standard state — zero by definition */
  "H2|g": 0, "O2|g": 0, "N2|g": 0, "F2|g": 0, "Cl2|g": 0,
  "Br2|l": 0, "I2|s": 0, "C|s": 0, "S|s": 0, "P|s": 0,
  "Na|s": 0, "K|s": 0, "Mg|s": 0, "Ca|s": 0, "Al|s": 0,
  "Fe|s": 0, "Cu|s": 0, "Zn|s": 0, "Ag|s": 0, "Pb|s": 0, "Si|s": 0,

  /* water and simple oxides */
  "H2O|l": -285.8, "H2O|g": -241.8, "H2O|s": -291.8,
  "H2O2|l": -187.8,
  "CO2|g": -393.5, "CO|g": -110.5,
  "SO2|g": -296.8, "SO3|g": -395.7,
  "NO|g": 91.3, "NO2|g": 33.2, "N2O|g": 81.6, "N2O4|g": 11.1,
  "O3|g": 142.7,

  /* hydrocarbons and organics */
  "CH4|g": -74.6, "C2H2|g": 227.4, "C2H4|g": 52.4, "C2H6|g": -84.0,
  "C3H8|g": -103.8, "C4H10|g": -125.7, "C8H18|l": -250.1,
  "C6H6|l": 49.0,
  "CH3OH|l": -238.6, "C2H5OH|l": -277.6,
  "C6H12O6|s": -1273.3, "C12H22O11|s": -2226.1,
  "CH3COOH|l": -484.3,

  /* hydrides and acids */
  "NH3|g": -45.9, "HCl|g": -92.3, "HF|g": -273.3,
  "HBr|g": -36.3, "HI|g": 26.5, "H2S|g": -20.6,

  /* ionic solids */
  "NaCl|s": -411.2, "NaOH|s": -425.6, "NaHCO3|s": -950.8,
  "Na2CO3|s": -1130.7, "NH4Cl|s": -314.4, "AgCl|s": -127.0,
  "CaO|s": -634.9, "CaCO3|s": -1207.6, "Ca(OH)2|s": -985.2,
  "MgO|s": -601.6, "CuO|s": -157.3, "ZnO|s": -350.5,
  "Fe2O3|s": -824.2, "Al2O3|s": -1675.7, "SiO2|s": -910.7,
  "PCl3|g": -287.0, "PCl5|g": -374.9,
  "KCl|s": -436.5, "KBr|s": -393.8
};

/* Human-readable names for the reference table. */
export const DHF_NAMES = {
  "H2O": "water", "H2O2": "hydrogen peroxide", "CO2": "carbon dioxide",
  "CO": "carbon monoxide", "SO2": "sulfur dioxide", "SO3": "sulfur trioxide",
  "NO": "nitrogen monoxide", "NO2": "nitrogen dioxide", "N2O": "dinitrogen monoxide",
  "N2O4": "dinitrogen tetroxide", "O3": "ozone",
  "CH4": "methane", "C2H2": "acetylene", "C2H4": "ethylene", "C2H6": "ethane",
  "C3H8": "propane", "C4H10": "butane", "C8H18": "octane", "C6H6": "benzene",
  "CH3OH": "methanol", "C2H5OH": "ethanol", "C6H12O6": "glucose",
  "C12H22O11": "sucrose", "CH3COOH": "acetic acid",
  "NH3": "ammonia", "HCl": "hydrogen chloride", "HF": "hydrogen fluoride",
  "HBr": "hydrogen bromide", "HI": "hydrogen iodide", "H2S": "hydrogen sulfide",
  "NaCl": "sodium chloride", "NaOH": "sodium hydroxide",
  "NaHCO3": "sodium bicarbonate", "Na2CO3": "sodium carbonate",
  "NH4Cl": "ammonium chloride", "AgCl": "silver chloride",
  "CaO": "calcium oxide (lime)", "CaCO3": "calcium carbonate",
  "Ca(OH)2": "calcium hydroxide", "MgO": "magnesium oxide",
  "CuO": "copper(II) oxide", "ZnO": "zinc oxide", "Fe2O3": "iron(III) oxide",
  "Al2O3": "aluminium oxide", "SiO2": "silicon dioxide (quartz)",
  "PCl3": "phosphorus trichloride", "PCl5": "phosphorus pentachloride",
  "KCl": "potassium chloride", "KBr": "potassium bromide"
};

/* Specific heat capacity, J/(g·°C) */
export const SPECIFIC_HEAT = [
  { n: "Water (liquid)", c: 4.184, note: "the one worth memorising" },
  { n: "Ice", c: 2.09 },
  { n: "Steam", c: 2.03 },
  { n: "Ethanol", c: 2.44 },
  { n: "Air", c: 1.005 },
  { n: "Aluminium", c: 0.897 },
  { n: "Glass", c: 0.84 },
  { n: "Granite", c: 0.79 },
  { n: "Iron", c: 0.449 },
  { n: "Copper", c: 0.385 },
  { n: "Silver", c: 0.235 },
  { n: "Gold", c: 0.129 },
  { n: "Lead", c: 0.128 }
];

/* Phase-change enthalpies for water, the standard heating-curve problem. */
export const PHASE_WATER = [
  { n: "Fusion (melting) at 0 °C",      kJmol: 6.02,  Jg: 334 },
  { n: "Vaporisation (boiling) at 100 °C", kJmol: 40.7, Jg: 2260 }
];

/* Look up a formation enthalpy, tolerating a missing state when the formula
   is unambiguous (only one state is tabulated for it). */
export function lookupDHf(formula, state) {
  if (state && Object.prototype.hasOwnProperty.call(DHF, formula + '|' + state)) {
    return { value: DHF[formula + '|' + state], state: state, assumed: false };
  }
  const matches = Object.keys(DHF).filter(function (k) {
    return k.slice(0, k.indexOf('|')) === formula;
  });
  if (!matches.length) return null;
  if (state) return null;                       // state given but not tabulated
  if (matches.length > 1) return { ambiguous: matches.map(function (k) { return k.split('|')[1]; }) };
  const only = matches[0];
  return { value: DHF[only], state: only.split('|')[1], assumed: true };
}
