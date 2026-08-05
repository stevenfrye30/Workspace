/* Gas-law constants, unit conversions and reference conditions.

   Everything is converted to a single canonical set — atm, litres, kelvin,
   moles — and R is quoted to match. Showing that conversion is most of the
   teaching value: the two commonest mistakes in this topic are leaving a
   temperature in Celsius and pairing R with the wrong pressure unit. */

/* R = 8.31446261815324 J/(mol·K) exactly (SI, from k_B × N_A).
   Dividing by 101 325 Pa/atm and 1000 L/m³ gives the L·atm form. */
export const R_ATM = 8.31446261815324 / 101.325;   /* 0.0820574 L·atm/(mol·K) */

export const R_VALUES = [
  { v: "0.08206", u: "L·atm/(mol·K)", when: "pressure in atm, volume in litres" },
  { v: "8.314",   u: "J/(mol·K)",     when: "SI — pressure in Pa, volume in m³" },
  { v: "8.314",   u: "L·kPa/(mol·K)", when: "pressure in kPa, volume in litres" },
  { v: "62.36",   u: "L·mmHg/(mol·K)", when: "pressure in mmHg or torr" },
  { v: "0.08314", u: "L·bar/(mol·K)", when: "pressure in bar" }
];

/* Multiply by the factor to reach the canonical unit. */
export const P_UNITS = [
  { u: "atm",  f: 1 },
  { u: "kPa",  f: 1 / 101.325 },
  { u: "mmHg", f: 1 / 760 },
  { u: "torr", f: 1 / 760 },
  { u: "bar",  f: 1 / 1.01325 },
  { u: "psi",  f: 1 / 14.695948775513 },
  { u: "Pa",   f: 1 / 101325 }
];

export const V_UNITS = [
  { u: "L",   f: 1 },
  { u: "mL",  f: 0.001 },
  { u: "cm³", f: 0.001 },
  { u: "m³",  f: 1000 }
];

/* Temperature needs an offset, not a factor. */
export const T_UNITS = [
  { u: "°C", toK: function (v) { return v + 273.15; }, fromK: function (k) { return k - 273.15; } },
  { u: "K",  toK: function (v) { return v; },          fromK: function (k) { return k; } },
  { u: "°F", toK: function (v) { return (v - 32) * 5 / 9 + 273.15; }, fromK: function (k) { return (k - 273.15) * 9 / 5 + 32; } }
];

/* Reference conditions. Textbooks disagree about STP and students get caught
   by it, so all three are listed rather than silently picking one. */
export const REF_CONDITIONS = [
  { n: "STP (classic, still used in most US courses)", t: "0 °C", p: "1 atm",
    vm: "22.41 L/mol", note: "the 22.4 figure you were probably taught" },
  { n: "STP (IUPAC since 1982)", t: "0 °C", p: "100 kPa (1 bar)",
    vm: "22.71 L/mol", note: "same temperature, slightly lower pressure" },
  { n: "SATP (ambient)", t: "25 °C", p: "100 kPa",
    vm: "24.79 L/mol", note: "room temperature, for comparison" }
];

/* The named special cases of the combined gas law, which are worth naming
   because exam questions cite them by name. */
export const GAS_LAWS = [
  { n: "Boyle's law",    holds: "n, T constant", rel: "P₁V₁ = P₂V₂",       says: "pressure and volume are inversely proportional" },
  { n: "Charles's law",  holds: "n, P constant", rel: "V₁/T₁ = V₂/T₂",     says: "volume is proportional to absolute temperature" },
  { n: "Gay-Lussac's law", holds: "n, V constant", rel: "P₁/T₁ = P₂/T₂",   says: "pressure is proportional to absolute temperature" },
  { n: "Avogadro's law", holds: "P, T constant", rel: "V₁/n₁ = V₂/n₂",     says: "equal volumes hold equal numbers of molecules" },
  { n: "Combined",       holds: "n constant",    rel: "P₁V₁/T₁ = P₂V₂/T₂", says: "all three together" }
];
