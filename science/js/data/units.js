/* Unit families, SI tables, and physical constants. */
export const UNITS = {
  Length:      { base:"m",  u:[["Meter","m",1],["Kilometer","km",1000],["Centimeter","cm",0.01],["Millimeter","mm",1e-3],["Micrometer","µm",1e-6],["Nanometer","nm",1e-9],["Ångström","Å",1e-10],["Mile","mi",1609.344],["Yard","yd",0.9144],["Foot","ft",0.3048],["Inch","in",0.0254],["Nautical mile","nmi",1852],["Light-year","ly",9.4607304725808e15],["Astronomical unit","AU",1.495978707e11],["Parsec","pc",3.0856775814913673e16]] },
  Mass:        { base:"kg", u:[["Kilogram","kg",1],["Gram","g",1e-3],["Milligram","mg",1e-6],["Microgram","µg",1e-9],["Metric ton","t",1000],["Pound","lb",0.45359237],["Ounce","oz",0.028349523125],["Stone","st",6.35029318],["US ton","ton",907.18474],["Atomic mass unit","u",1.66053906660e-27]] },
  Time:        { base:"s",  u:[["Second","s",1],["Millisecond","ms",1e-3],["Microsecond","µs",1e-6],["Nanosecond","ns",1e-9],["Minute","min",60],["Hour","h",3600],["Day","d",86400],["Week","wk",604800],["Year (Julian)","yr",31557600]] },
  Temperature: { base:"K",  special:true, u:[
                 ["Kelvin","K", function(v){return v;}, function(k){return k;}],
                 ["Celsius","°C", function(v){return v+273.15;}, function(k){return k-273.15;}],
                 ["Fahrenheit","°F", function(v){return (v-32)*5/9+273.15;}, function(k){return (k-273.15)*9/5+32;}],
                 ["Rankine","°R", function(v){return v*5/9;}, function(k){return k*9/5;}]] },
  Area:        { base:"m²", u:[["Square meter","m²",1],["Square kilometer","km²",1e6],["Square centimeter","cm²",1e-4],["Hectare","ha",1e4],["Acre","ac",4046.8564224],["Square mile","mi²",2589988.110336],["Square yard","yd²",0.83612736],["Square foot","ft²",0.09290304],["Square inch","in²",6.4516e-4]] },
  Volume:      { base:"m³", u:[["Cubic meter","m³",1],["Liter","L",1e-3],["Milliliter","mL",1e-6],["Cubic centimeter","cm³",1e-6],["Cubic foot","ft³",0.028316846592],["Cubic inch","in³",1.6387064e-5],["US gallon","gal",3.785411784e-3],["US quart","qt",9.46352946e-4],["US pint","pt",4.73176473e-4],["US cup","cup",2.365882365e-4],["US fl ounce","fl oz",2.95735295625e-5],["Tablespoon","tbsp",1.47867648e-5],["Teaspoon","tsp",4.92892159375e-6],["Oil barrel","bbl",0.158987294928]] },
  Speed:       { base:"m/s",u:[["Meter/second","m/s",1],["Kilometer/hour","km/h",0.2777777777778],["Mile/hour","mph",0.44704],["Foot/second","ft/s",0.3048],["Knot","kn",0.5144444444444],["Speed of light","c",299792458]] },
  Force:       { base:"N",  u:[["Newton","N",1],["Kilonewton","kN",1000],["Dyne","dyn",1e-5],["Pound-force","lbf",4.4482216152605],["Kilogram-force","kgf",9.80665]] },
  Pressure:    { base:"Pa", u:[["Pascal","Pa",1],["Kilopascal","kPa",1000],["Megapascal","MPa",1e6],["Bar","bar",1e5],["Atmosphere","atm",101325],["Torr (mmHg)","Torr",133.322387415],["Pound/inch²","psi",6894.757293168],["Inch of mercury","inHg",3386.389]] },
  Energy:      { base:"J",  u:[["Joule","J",1],["Kilojoule","kJ",1000],["Calorie","cal",4.184],["Kilocalorie","kcal",4184],["Watt-hour","Wh",3600],["Kilowatt-hour","kWh",3.6e6],["Electronvolt","eV",1.602176634e-19],["BTU","BTU",1055.05585262],["Erg","erg",1e-7],["Foot-pound","ft·lb",1.3558179483314]] },
  Power:       { base:"W",  u:[["Watt","W",1],["Kilowatt","kW",1000],["Megawatt","MW",1e6],["Horsepower (mech)","hp",745.69987158227],["Horsepower (metric)","PS",735.49875],["BTU/hour","BTU/h",0.29307107017]] },
  Angle:       { base:"rad",u:[["Radian","rad",1],["Degree","°",Math.PI/180],["Gradian","grad",Math.PI/200],["Arcminute","′",Math.PI/10800],["Arcsecond","″",Math.PI/648000],["Turn","turn",2*Math.PI]] },
  Frequency:   { base:"Hz", u:[["Hertz","Hz",1],["Kilohertz","kHz",1e3],["Megahertz","MHz",1e6],["Gigahertz","GHz",1e9],["Rev/minute","rpm",1/60]] },
  Data:        { base:"B",  u:[["Bit","bit",0.125],["Byte","B",1],["Kilobyte","kB",1e3],["Megabyte","MB",1e6],["Gigabyte","GB",1e9],["Terabyte","TB",1e12],["Kibibyte","KiB",1024],["Mebibyte","MiB",1048576],["Gibibyte","GiB",1073741824],["Tebibyte","TiB",1099511627776]] },
  Charge:      { base:"C",  u:[["Coulomb","C",1],["Millicoulomb","mC",1e-3],["Microcoulomb","µC",1e-6],["Elementary charge","e",1.602176634e-19],["Ampere-hour","Ah",3600],["Milliampere-hour","mAh",3.6]] },
  Amount:      { base:"mol",u:[["Mole","mol",1],["Millimole","mmol",1e-3],["Micromole","µmol",1e-6],["Kilomole","kmol",1000]] }
};
export const U_PREFIXES = [
  ["quetta","Q","10³⁰"],["ronna","R","10²⁷"],["yotta","Y","10²⁴"],["zetta","Z","10²¹"],["exa","E","10¹⁸"],
  ["peta","P","10¹⁵"],["tera","T","10¹²"],["giga","G","10⁹"],["mega","M","10⁶"],["kilo","k","10³"],
  ["hecto","h","10²"],["deca","da","10¹"],["—","—","10⁰"],["deci","d","10⁻¹"],["centi","c","10⁻²"],
  ["milli","m","10⁻³"],["micro","µ","10⁻⁶"],["nano","n","10⁻⁹"],["pico","p","10⁻¹²"],["femto","f","10⁻¹⁵"],
  ["atto","a","10⁻¹⁸"],["zepto","z","10⁻²¹"],["yocto","y","10⁻²⁴"],["ronto","r","10⁻²⁷"],["quecto","q","10⁻³⁰"]
];
export const U_SIBASE = [
  ["Length","metre","m"],["Mass","kilogram","kg"],["Time","second","s"],["Electric current","ampere","A"],
  ["Temperature","kelvin","K"],["Amount of substance","mole","mol"],["Luminous intensity","candela","cd"]
];
export const U_SIDERIVED = [
  ["Frequency","hertz","Hz","s⁻¹"],["Force","newton","N","kg·m·s⁻²"],["Pressure","pascal","Pa","N·m⁻²"],
  ["Energy","joule","J","N·m"],["Power","watt","W","J·s⁻¹"],["Charge","coulomb","C","A·s"],
  ["Voltage","volt","V","W·A⁻¹"],["Capacitance","farad","F","C·V⁻¹"],["Resistance","ohm","Ω","V·A⁻¹"],
  ["Conductance","siemens","S","A·V⁻¹"],["Magnetic flux","weber","Wb","V·s"],["Flux density","tesla","T","Wb·m⁻²"],
  ["Inductance","henry","H","Wb·A⁻¹"],["Luminous flux","lumen","lm","cd·sr"],["Illuminance","lux","lx","lm·m⁻²"],
  ["Catalytic activity","katal","kat","mol·s⁻¹"],["Radioactivity","becquerel","Bq","s⁻¹"],["Absorbed dose","gray","Gy","J·kg⁻¹"]
];
export const U_CONSTANTS = [
  ["Speed of light","c","299 792 458","m·s⁻¹"],["Planck constant","h","6.62607015×10⁻³⁴","J·s"],
  ["Reduced Planck","ℏ","1.054571817×10⁻³⁴","J·s"],["Gravitational","G","6.67430×10⁻¹¹","m³·kg⁻¹·s⁻²"],
  ["Elementary charge","e","1.602176634×10⁻¹⁹","C"],["Boltzmann","k_B","1.380649×10⁻²³","J·K⁻¹"],
  ["Avogadro","N_A","6.02214076×10²³","mol⁻¹"],["Gas constant","R","8.314462618","J·mol⁻¹·K⁻¹"],
  ["Faraday","F","96 485.33212","C·mol⁻¹"],["Standard gravity","g₀","9.80665","m·s⁻²"],
  ["Electron mass","mₑ","9.1093837015×10⁻³¹","kg"],["Proton mass","mₚ","1.67262192369×10⁻²⁷","kg"],
  ["Atomic mass unit","u","1.66053906660×10⁻²⁷","kg"],["Vacuum permittivity","ε₀","8.8541878128×10⁻¹²","F·m⁻¹"],
  ["Vacuum permeability","µ₀","1.25663706212×10⁻⁶","N·A⁻²"],["Stefan–Boltzmann","σ","5.670374419×10⁻⁸","W·m⁻²·K⁻⁴"],
  ["Rydberg","R∞","1.0973731568160×10⁷","m⁻¹"],["Bohr radius","a₀","5.29177210903×10⁻¹¹","m"]
];
