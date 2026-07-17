/**
 * SOUND/ipa_data.js
 *
 * The International Phonetic Alphabet as data, for the Phonology → IPA
 * interactive chart. Pure data + pure helpers; no DOM, no audio.
 *
 * This is a DIFFERENT (and much larger) inventory than SM_FEATS in
 * data/phonetics.js. SM_FEATS covers only the ~50 English/GA phonemes the
 * analyzer needs; this covers the official chart: pulmonic consonants,
 * non-pulmonics, "other symbols" (co-articulated / non-grid), the vowel
 * quadrilateral, suprasegmentals, and grouped diacritics.
 *
 * ── Phonetic-accuracy notes (be honest about what's simplified) ──────────
 *   • Grid cells hold the standard letters in their canonical place×manner
 *     slot; voiceless is stored/rendered left, voiced right.
 *   • Empty grid cells are NOT asserted to be "impossible" — the UI says a
 *     blank is either unattested or judged impossible, without colour-coding
 *     the difference (the official chart shades a specific impossible set;
 *     we deliberately don't claim to reproduce that judgement).
 *   • Clicks / implosives / ejectives are shown as REPRESENTATIVE members.
 *     Ejectives in particular are combinatory (any voiceless obstruent + ◌ʼ);
 *     GROUP_NOTES makes that explicit rather than implying a fixed inventory.
 *   • Vowels carry a cardinal quadrilateral position (height×backness); the
 *     UI plots them on a real trapezoid. English example words are flagged as
 *     approximations where the English realization differs (e.g. [e] vs the
 *     diphthongal "bay"; the trill [r] is NOT demonstrated with English "r").
 *   • [ä] (open central unrounded) is intentionally NOT a separate chart
 *     letter — it's [a] centralized; see GROUP_NOTES.vowel.
 *   • "How to make it" text is generated from per-place/per-manner data with
 *     per-symbol overrides for the tricky ones; it is instructional, not a
 *     claim of exact articulatory truth.
 *
 * Public shape (window.SOUND.IPA) — see the object literal at the bottom.
 */
(function () {
  "use strict";
  const SOUND = (window.SOUND = window.SOUND || {});

  // ── Consonant grid axes ──────────────────────────────────────────────
  const PLACES = [
    ["bilabial", "Bilabial"],
    ["labiodental", "Labiodental"],
    ["dental", "Dental"],
    ["alveolar", "Alveolar"],
    ["postalveolar", "Post-alveolar"],
    ["retroflex", "Retroflex"],
    ["palatal", "Palatal"],
    ["velar", "Velar"],
    ["uvular", "Uvular"],
    ["pharyngeal", "Pharyngeal"],
    ["glottal", "Glottal"],
  ];
  const MANNERS = [
    ["plosive", "Plosive"],
    ["nasal", "Nasal"],
    ["trill", "Trill"],
    ["tap", "Tap / Flap"],
    ["fricative", "Fricative"],
    ["lateral-fricative", "Lateral fric."],
    ["approximant", "Approximant"],
    ["lateral-approximant", "Lateral approx."],
  ];

  // "manner|place" → [[symbol, voice], …]. voice: 0 voiceless (left), 1 voiced.
  const CONS_CELLS = {
    "plosive|bilabial": [["p", 0], ["b", 1]],
    "plosive|alveolar": [["t", 0], ["d", 1]],
    "plosive|retroflex": [["ʈ", 0], ["ɖ", 1]],
    "plosive|palatal": [["c", 0], ["ɟ", 1]],
    "plosive|velar": [["k", 0], ["ɡ", 1]],
    "plosive|uvular": [["q", 0], ["ɢ", 1]],
    "plosive|glottal": [["ʔ", 0]],

    "nasal|bilabial": [["m", 1]],
    "nasal|labiodental": [["ɱ", 1]],
    "nasal|alveolar": [["n", 1]],
    "nasal|retroflex": [["ɳ", 1]],
    "nasal|palatal": [["ɲ", 1]],
    "nasal|velar": [["ŋ", 1]],
    "nasal|uvular": [["ɴ", 1]],

    "trill|bilabial": [["ʙ", 1]],
    "trill|alveolar": [["r", 1]],
    "trill|uvular": [["ʀ", 1]],

    "tap|labiodental": [["ⱱ", 1]],
    "tap|alveolar": [["ɾ", 1]],
    "tap|retroflex": [["ɽ", 1]],

    "fricative|bilabial": [["ɸ", 0], ["β", 1]],
    "fricative|labiodental": [["f", 0], ["v", 1]],
    "fricative|dental": [["θ", 0], ["ð", 1]],
    "fricative|alveolar": [["s", 0], ["z", 1]],
    "fricative|postalveolar": [["ʃ", 0], ["ʒ", 1]],
    "fricative|retroflex": [["ʂ", 0], ["ʐ", 1]],
    "fricative|palatal": [["ç", 0], ["ʝ", 1]],
    "fricative|velar": [["x", 0], ["ɣ", 1]],
    "fricative|uvular": [["χ", 0], ["ʁ", 1]],
    "fricative|pharyngeal": [["ħ", 0], ["ʕ", 1]],
    "fricative|glottal": [["h", 0], ["ɦ", 1]],

    "lateral-fricative|alveolar": [["ɬ", 0], ["ɮ", 1]],

    "approximant|labiodental": [["ʋ", 1]],
    "approximant|alveolar": [["ɹ", 1]],
    "approximant|retroflex": [["ɻ", 1]],
    "approximant|palatal": [["j", 1]],
    "approximant|velar": [["ɰ", 1]],

    "lateral-approximant|alveolar": [["l", 1]],
    "lateral-approximant|retroflex": [["ɭ", 1]],
    "lateral-approximant|palatal": [["ʎ", 1]],
    "lateral-approximant|velar": [["ʟ", 1]],
  };

  // ── Vowel quadrilateral ──────────────────────────────────────────────
  const HEIGHTS = [
    ["close", "Close"], ["near-close", "Near-close"], ["close-mid", "Close-mid"],
    ["mid", "Mid"], ["open-mid", "Open-mid"], ["near-open", "Near-open"], ["open", "Open"],
  ];
  const BACKNESS = [["front", "Front"], ["central", "Central"], ["back", "Back"]];
  // rounded: 0 unrounded, 1 rounded. example = English word (may be approximate);
  // exApprox flags that the English word is only a loose match for the cardinal.
  const VOWELS = [
    { sym: "i", height: "close", backness: "front", rounded: 0, example: "see" },
    { sym: "y", height: "close", backness: "front", rounded: 1, lang: "French ⟨tu⟩, German ⟨über⟩" },
    { sym: "ɨ", height: "close", backness: "central", rounded: 0, lang: "Russian ⟨ы⟩" },
    { sym: "ʉ", height: "close", backness: "central", rounded: 1, lang: "Scottish English ⟨food⟩" },
    { sym: "ɯ", height: "close", backness: "back", rounded: 0, lang: "Japanese ⟨u⟩, Turkish ⟨ı⟩" },
    { sym: "u", height: "close", backness: "back", rounded: 1, example: "food" },
    { sym: "ɪ", height: "near-close", backness: "front", rounded: 0, example: "sit" },
    { sym: "ʏ", height: "near-close", backness: "front", rounded: 1, lang: "German ⟨hübsch⟩" },
    { sym: "ʊ", height: "near-close", backness: "back", rounded: 1, example: "book" },
    { sym: "e", height: "close-mid", backness: "front", rounded: 0, example: "bay", exApprox: 1, lang: "cardinal [e] ≈ Spanish ⟨e⟩; English ⟨bay⟩ glides to [eɪ]" },
    { sym: "ø", height: "close-mid", backness: "front", rounded: 1, lang: "French ⟨peu⟩, German ⟨schön⟩" },
    { sym: "ɘ", height: "close-mid", backness: "central", rounded: 0, lang: "close-mid central" },
    { sym: "ɵ", height: "close-mid", backness: "central", rounded: 1, lang: "close-mid central rounded" },
    { sym: "ɤ", height: "close-mid", backness: "back", rounded: 0, lang: "Vietnamese ⟨ơ⟩" },
    { sym: "o", height: "close-mid", backness: "back", rounded: 1, example: "go", exApprox: 1, lang: "cardinal [o] ≈ Spanish ⟨o⟩; English ⟨go⟩ glides to [oʊ]" },
    { sym: "ə", height: "mid", backness: "central", rounded: 0, example: "sofa" },
    { sym: "ɛ", height: "open-mid", backness: "front", rounded: 0, example: "bed" },
    { sym: "œ", height: "open-mid", backness: "front", rounded: 1, lang: "French ⟨sœur⟩" },
    { sym: "ɜ", height: "open-mid", backness: "central", rounded: 0, example: "bird", exApprox: 1, lang: "British ⟨bird⟩ (non-rhotic)" },
    { sym: "ɞ", height: "open-mid", backness: "central", rounded: 1, lang: "open-mid central rounded" },
    { sym: "ʌ", height: "open-mid", backness: "back", rounded: 0, example: "cup", exApprox: 1, lang: "English ⟨cup⟩ (often more central)" },
    { sym: "ɔ", height: "open-mid", backness: "back", rounded: 1, example: "thought", exApprox: 1, lang: "English ⟨thought⟩ (varies by accent)" },
    { sym: "æ", height: "near-open", backness: "front", rounded: 0, example: "cat" },
    { sym: "ɐ", height: "near-open", backness: "central", rounded: 0, lang: "German ⟨besser⟩ final vowel" },
    { sym: "a", height: "open", backness: "front", rounded: 0, lang: "Spanish ⟨casa⟩, French ⟨patte⟩" },
    { sym: "ɶ", height: "open", backness: "front", rounded: 1, lang: "open front rounded (very rare)" },
    { sym: "ɑ", height: "open", backness: "back", rounded: 0, example: "father", exApprox: 1, lang: "English ⟨father⟩ (accent-dependent)" },
    { sym: "ɒ", height: "open", backness: "back", rounded: 1, example: "hot", exApprox: 1, lang: "British ⟨hot⟩" },
  ];

  // ── Non-pulmonic consonants (representative members) ──────────────────
  const CLICKS = [
    { sym: "ʘ", place: "bilabial", name: "Bilabial click", lang: "a lip smack / kiss-like pop" },
    { sym: "ǀ", place: "dental", name: "Dental click", lang: "English tsk-tsk of disapproval" },
    { sym: "ǃ", place: "alveolar", name: "(Post)alveolar click", lang: "a sharp cork-pop" },
    { sym: "ǂ", place: "palatal", name: "Palato-alveolar click", lang: "Nǁng, Zulu" },
    { sym: "ǁ", place: "alveolar", name: "Alveolar lateral click", lang: "the 'giddy-up' clop" },
  ];
  const IMPLOSIVES = [
    { sym: "ɓ", place: "bilabial", name: "Voiced bilabial implosive", lang: "Sindhi, Vietnamese" },
    { sym: "ɗ", place: "alveolar", name: "Voiced alveolar implosive", lang: "Sindhi, Hausa" },
    { sym: "ʄ", place: "palatal", name: "Voiced palatal implosive", lang: "Swahili, Fula" },
    { sym: "ɠ", place: "velar", name: "Voiced velar implosive", lang: "Sindhi" },
    { sym: "ʛ", place: "uvular", name: "Voiced uvular implosive", lang: "Mam (rare)" },
  ];
  const EJECTIVES = [
    { sym: "pʼ", place: "bilabial", manner: "plosive", name: "Bilabial ejective", lang: "Georgian, Amharic" },
    { sym: "tʼ", place: "alveolar", manner: "plosive", name: "Alveolar ejective", lang: "Georgian, Quechua" },
    { sym: "kʼ", place: "velar", manner: "plosive", name: "Velar ejective", lang: "Georgian, Hausa" },
    { sym: "sʼ", place: "alveolar", manner: "fricative", name: "Alveolar ejective fricative", lang: "Amharic, Tlingit" },
  ];

  // ── Other symbols (co-articulated / non-grid) ─────────────────────────
  const OTHER = [
    { sym: "ʍ", place: "velar", secondary: "bilabial", voice: 0, name: "Voiceless labial–velar fricative", lang: "Scots / conservative English ⟨wh⟩" },
    { sym: "w", place: "velar", secondary: "bilabial", voice: 1, name: "Voiced labial–velar approximant", example: "we" },
    { sym: "ɥ", place: "palatal", secondary: "bilabial", voice: 1, name: "Voiced labial–palatal approximant", lang: "French ⟨huit⟩" },
    { sym: "ɕ", place: "palatal", voice: 0, name: "Voiceless alveolo-palatal fricative", lang: "Mandarin ⟨x⟩, Polish ⟨ś⟩" },
    { sym: "ʑ", place: "palatal", voice: 1, name: "Voiced alveolo-palatal fricative", lang: "Polish ⟨ź⟩, Japanese ⟨j⟩" },
    { sym: "ɧ", place: "velar", voice: 0, name: "Voiceless ‘sj-sound’ (≈ simultaneous ʃ + x)", lang: "Swedish ⟨sj⟩", note: "A disputed sound whose realization varies widely by dialect." },
    { sym: "ʜ", place: "pharyngeal", voice: 0, name: "Voiceless epiglottal fricative", lang: "Agul, Haida" },
    { sym: "ʢ", place: "pharyngeal", voice: 1, name: "Voiced epiglottal fricative/approximant", lang: "Agul, Somali" },
    { sym: "ʡ", place: "pharyngeal", voice: 0, name: "Epiglottal plosive", lang: "Agul, Archi" },
    { sym: "ɺ", place: "alveolar", voice: 1, name: "Voiced alveolar lateral flap", lang: "Japanese (allophone of /r/)" },
  ];

  // ── Suprasegmentals ───────────────────────────────────────────────────
  const SUPRAS = [
    { sym: "ˈ", name: "Primary stress", lang: "ˌphoˈnetician", role: "Goes before the stressed syllable." },
    { sym: "ˌ", name: "Secondary stress", lang: "ˌphoˈnetician", role: "Marks a weaker stressed syllable." },
    { sym: "ː", name: "Long", lang: "aː — held longer", role: "Lengthens the preceding sound." },
    { sym: "ˑ", name: "Half-long", lang: "aˑ", role: "Slightly lengthens the preceding sound." },
    { sym: "̆", name: "Extra-short", lang: "ă", role: "Shortens the preceding sound." },
    { sym: ".", name: "Syllable break", lang: "ri.ˈæk.ʃən", role: "Divides syllables." },
    { sym: "|", name: "Minor (foot) group", lang: "a short prosodic break", role: "A brief phrase boundary." },
    { sym: "‖", name: "Major (intonation) group", lang: "a full utterance break", role: "A larger phrase boundary." },
    { sym: "‿", name: "Linking (absence of a break)", lang: "French liaison", role: "Joins words with no break." },
    { sym: "↗", name: "Global rise", lang: "rising intonation", role: "Pitch rises across the stretch." },
    { sym: "↘", name: "Global fall", lang: "falling intonation", role: "Pitch falls across the stretch." },
  ];

  // ── Diacritics, grouped for learning ──────────────────────────────────
  // Each item: {sym, name, lang}. Groups carry a short teaching label.
  const DIA_GROUPS = [
    { key: "voicing", label: "Voicing & phonation", items: [
      { sym: "̥", name: "Voiceless", lang: "n̥, d̥" },
      { sym: "̬", name: "Voiced", lang: "s̬, t̬" },
      { sym: "̤", name: "Breathy voiced", lang: "b̤, a̤" },
      { sym: "̰", name: "Creaky voiced", lang: "b̰, a̰" },
    ]},
    { key: "release", label: "Aspiration & release", items: [
      { sym: "ʰ", name: "Aspirated", lang: "tʰ, kʰ" },
      { sym: "ⁿ", name: "Nasal release", lang: "dⁿ" },
      { sym: "ˡ", name: "Lateral release", lang: "dˡ" },
      { sym: "̚", name: "No audible release", lang: "d̚" },
    ]},
    { key: "coartic", label: "Secondary articulation", items: [
      { sym: "ʷ", name: "Labialized", lang: "tʷ, kʷ" },
      { sym: "ʲ", name: "Palatalized", lang: "tʲ" },
      { sym: "ˠ", name: "Velarized", lang: "ɫ" },
      { sym: "ˤ", name: "Pharyngealized", lang: "tˤ" },
      { sym: "̃", name: "Nasalized", lang: "ẽ, õ" },
      { sym: "˞", name: "Rhoticity", lang: "ɚ, ɝ" },
    ]},
    { key: "place", label: "Place modification", items: [
      { sym: "̪", name: "Dental", lang: "t̪, d̪" },
      { sym: "̺", name: "Apical", lang: "t̺" },
      { sym: "̻", name: "Laminal", lang: "t̻" },
      { sym: "̟", name: "Advanced", lang: "u̟" },
      { sym: "̠", name: "Retracted", lang: "e̠" },
      { sym: "̈", name: "Centralized", lang: "ë" },
      { sym: "̽", name: "Mid-centralized", lang: "e̽" },
    ]},
    { key: "height", label: "Raising / lowering & tongue root", items: [
      { sym: "̝", name: "Raised", lang: "e̝" },
      { sym: "̞", name: "Lowered", lang: "e̞" },
      { sym: "̘", name: "Advanced tongue root", lang: "e̘" },
      { sym: "̙", name: "Retracted tongue root", lang: "e̙" },
    ]},
    { key: "rounding", label: "Rounding", items: [
      { sym: "̹", name: "More rounded", lang: "ɔ̹" },
      { sym: "̜", name: "Less rounded", lang: "ɔ̜" },
    ]},
    { key: "syllab", label: "Syllabicity", items: [
      { sym: "̩", name: "Syllabic", lang: "n̩ (button)" },
      { sym: "̯", name: "Non-syllabic", lang: "e̯ (as a glide)" },
    ]},
  ];

  // Teaching notes shown at the head of each section.
  const GROUP_NOTES = {
    click: "Clicks use a velaric (mouth) airstream — the tongue pulls air inward, so they don't need the lungs. Shown here are the five click ‘places’; each can be voiced, nasalized, etc. with a companion letter.",
    implosive: "Implosives use a glottalic ingressive airstream — the larynx pulls down while voicing, so air flows slightly inward. Only the voiced series has dedicated letters.",
    ejective: "Ejectives use a glottalic egressive airstream — the closed glottis pushes air out. There is no fixed list: any voiceless obstruent + the ejective mark ◌ʼ (e.g. pʼ, tʼ, kʼ, sʼ, tʃʼ). The four below are just common examples.",
    other: "Sounds that don't fit a single place×manner cell — co-articulated (two places at once) or otherwise off-grid.",
    vowel: "Vowels are plotted on the IPA quadrilateral by tongue height (top = close/high) and backness (left = front). Where two share a spot, the left is unrounded and the right is rounded. Note: there's no separate letter for an open central unrounded vowel — that's written [ä] (centralized [a]).",
    supra: "Marks for stress, length, and phrasing. They shape or organize sounds rather than being sounds themselves — so they don't play in isolation.",
    diacritic: "Small marks that fine-tune a base letter (adding aspiration, nasalization, a different tongue posture, and so on). They are not sounds on their own, so they're shown on a dotted-circle carrier ◌ and don't play in isolation.",
  };

  // ── Articulator / constriction reference (drives diagram + how-to) ─────
  const PLACE_ARTIC = {
    bilabial: { active: "lower lip", passive: "upper lip" },
    labiodental: { active: "lower lip", passive: "upper teeth" },
    dental: { active: "tongue tip", passive: "upper teeth" },
    alveolar: { active: "tongue tip/blade", passive: "alveolar ridge" },
    postalveolar: { active: "tongue blade", passive: "back of the alveolar ridge" },
    retroflex: { active: "tongue tip (curled back)", passive: "hard palate" },
    palatal: { active: "tongue body", passive: "hard palate" },
    velar: { active: "tongue dorsum", passive: "soft palate (velum)" },
    uvular: { active: "tongue dorsum", passive: "uvula" },
    pharyngeal: { active: "tongue root", passive: "pharyngeal wall" },
    glottal: { active: "vocal folds", passive: "—" },
  };
  const MANNER_CONSTR = {
    plosive: { constriction: "complete closure", oral: true, central: true },
    nasal: { constriction: "complete oral closure (air through the nose)", oral: false, central: true },
    trill: { constriction: "light intermittent contact (vibration)", oral: true, central: true },
    tap: { constriction: "a single brief contact", oral: true, central: true },
    fricative: { constriction: "a narrow gap (turbulent friction)", oral: true, central: true },
    "lateral-fricative": { constriction: "a narrow gap along the sides (friction)", oral: true, central: false },
    approximant: { constriction: "an open approximation (no friction)", oral: true, central: true },
    "lateral-approximant": { constriction: "closure at the centre, open sides", oral: true, central: false },
    vowel: { constriction: "an open vocal tract (no obstruction)", oral: true, central: true },
  };

  // ── Name / description composition ────────────────────────────────────
  const label = (pairs, key) => {
    const hit = pairs.find((p) => p[0] === key);
    return hit ? hit[1].toLowerCase() : key;
  };
  const voiceWord = (v) => (v ? "voiced" : "voiceless");
  const MANNER_WORD = {
    plosive: "plosive", nasal: "nasal", trill: "trill", tap: "tap",
    fricative: "fricative", "lateral-fricative": "lateral fricative",
    approximant: "approximant", "lateral-approximant": "lateral approximant",
  };
  const PLACE_WORD = {
    bilabial: "bilabial", labiodental: "labiodental", dental: "dental",
    alveolar: "alveolar", postalveolar: "post-alveolar", retroflex: "retroflex",
    palatal: "palatal", velar: "velar", uvular: "uvular",
    pharyngeal: "pharyngeal", glottal: "glottal",
  };
  const consNameClean = (place, manner, voice) =>
    `${voiceWord(voice)} ${PLACE_WORD[place] || place} ${MANNER_WORD[manner]}`;
  const vowelName = (v) =>
    `${label(HEIGHTS, v.height)} ${label(BACKNESS, v.backness)} ${v.rounded ? "rounded" : "unrounded"} vowel`;

  // "How to make it" — generated from data, with per-symbol overrides.
  const HOWTO_OVERRIDE = {
    "ʔ": "Momentarily close the vocal folds to stop the airflow completely, then release — the catch in the middle of ‘uh-oh’.",
    h: "Let air pass freely through the open vocal folds with light friction — a plain breathy sigh, as at the start of ‘hat’.",
    "ɦ": "Like [h], but with the vocal folds vibrating as the breath passes — a ‘voiced h’.",
    "θ": "Rest the tongue tip lightly against (or just behind) the upper teeth, leaving a narrow gap, and push air through — vocal folds silent.",
    "ð": "As for [θ] but with the vocal folds vibrating — the ‘th’ in ‘this’.",
    r: "Hold the tongue tip loosely just behind the upper teeth and let a strong airflow set it flapping several times — a rolled Spanish ⟨rr⟩.",
    "ʀ": "Let the uvula vibrate against the back of the tongue — a French/German throaty ⟨r⟩.",
    "ɾ": "Flick the tongue tip once against the alveolar ridge — the quick ⟨tt⟩ in American ‘butter’.",
    "ɬ": "Put the tongue in the [l] position, then push air out over one or both sides with friction, voicing off — Welsh ⟨ll⟩.",
    "ŋ": "Raise the back of the tongue to the soft palate as for [k], lower the velum, and send the voiced air out through the nose — the ‘ng’ in ‘sing’.",
    w: "Round the lips and raise the back of the tongue toward the soft palate at the same time, voicing — the ‘w’ in ‘we’.",
    "ʍ": "As for [w] — lips rounded, tongue back raised — but with voiceless friction instead of voicing (a breathy ‘wh’).",
    "ɥ": "Round the lips as for [w] while raising the tongue toward the hard palate as for [j] — French ⟨huit⟩.",
  };

  function howToCons(info) {
    if (HOWTO_OVERRIDE[info.sym]) return HOWTO_OVERRIDE[info.sym];
    const a = PLACE_ARTIC[info.place];
    const m = MANNER_CONSTR[info.manner];
    if (!a || !m) return "";
    let gesture;
    switch (info.manner) {
      case "plosive": gesture = `Press the ${a.active} firmly against the ${a.passive} to block the air completely, then release it in a small burst`; break;
      case "nasal": gesture = `Press the ${a.active} against the ${a.passive} to close the mouth, lower the soft palate, and let the air out through the nose`; break;
      case "fricative": gesture = `Bring the ${a.active} close to the ${a.passive}, leaving ${m.constriction}, and push air through`; break;
      case "trill": gesture = `Hold the ${a.active} loosely near the ${a.passive} and let the airflow set it vibrating`; break;
      case "tap": gesture = `Flick the ${a.active} once quickly against the ${a.passive}`; break;
      case "lateral-fricative": gesture = `Touch the ${a.active} to the ${a.passive} at the centre and force air out along the sides with friction`; break;
      case "approximant": gesture = `Raise the ${a.active} toward the ${a.passive} without quite touching — close enough to colour the sound but not to make friction`; break;
      case "lateral-approximant": gesture = `Touch the ${a.active} to the ${a.passive} at the centre and let the voiced air flow smoothly over the sides`; break;
      default: gesture = `Bring the ${a.active} toward the ${a.passive}`;
    }
    const voice = info.voice
      ? "Vibrate the vocal folds throughout (voiced)."
      : "Keep the vocal folds apart and silent (voiceless).";
    return `${gesture}. ${voice}`;
  }
  function howToVowel(v) {
    const H = { close: "high", "near-close": "high (a little lowered)", "close-mid": "mid-high",
      mid: "mid", "open-mid": "mid-low", "near-open": "low (a little raised)", open: "low" };
    const B = { front: "pushed forward", central: "in the centre", back: "pulled back" };
    const lips = v.rounded ? "rounded" : "spread / relaxed (unrounded)";
    return `Hold the tongue ${H[v.height]} and ${B[v.backness]}, with the lips ${lips}. Voice it steadily, with no obstruction or friction.`;
  }

  // Carrier for combining marks so they're visible alone: ◌̥ not a floating ̥.
  const isCombining = (s) => /^\p{Mn}/u.test(s || "");
  const carrier = (s) => (isCombining(s) ? "◌" + s : s);

  // ── Build the flat INFO lookup ────────────────────────────────────────
  const INFO = {};
  const EN_EX = typeof SM_PHON_EXAMPLE !== "undefined" ? SM_PHON_EXAMPLE : {};
  // Explicit, true-codepoint example words for consonants English genuinely
  // has ([r] trill omitted on purpose — English "r" is the approximant [ɹ]).
  const CONS_EX = {
    p: "pat", b: "bat", t: "tap", d: "dad", k: "cat", "ɡ": "go",
    m: "man", n: "no", "ŋ": "sing",
    f: "fan", v: "van", "θ": "thin", "ð": "this", s: "sun", z: "zoo",
    "ʃ": "ship", "ʒ": "measure", h: "hat",
    j: "yes", l: "let", "ɹ": "run",
  };

  const base = (o) => Object.assign({
    recording: null,   // future human-recorded audio — see README/architecture
    secondary: null, note: null, related: [],
  }, o);

  Object.keys(CONS_CELLS).forEach((key) => {
    const [manner, place] = key.split("|");
    CONS_CELLS[key].forEach(([sym, voice]) => {
      const m = MANNER_CONSTR[manner];
      INFO[sym] = base({
        sym, kind: "cons", place, manner, voice,
        zone: place, name: consNameClean(place, manner, voice),
        example: CONS_EX[sym] || null, exApprox: 0, lang: null,
        airstream: "pulmonic egressive",
        oral: m.oral, lateral: !m.central,
        howto: null, audio: true,
      });
      INFO[sym].howto = howToCons(INFO[sym]);
    });
  });
  VOWELS.forEach((v) => {
    INFO[v.sym] = base({
      sym: v.sym, kind: "vowel", place: v.backness + "-vowel", manner: "vowel",
      voice: 1, height: v.height, backness: v.backness, rounded: v.rounded,
      zone: "vowel", name: vowelName(v),
      example: v.example || EN_EX[v.sym] || null, exApprox: v.exApprox ? 1 : 0,
      lang: v.lang || null, airstream: "pulmonic egressive",
      oral: true, lateral: false, howto: howToVowel(v), audio: true,
    });
  });
  // Default voicing by series: clicks (bare letters) and ejectives are
  // voiceless; only implosives have a voiced letter series.
  const VOICE_BY_KIND = { click: 0, implosive: 1, ejective: 0 };
  const addNonPulm = (arr, kind, airstream) =>
    arr.forEach((e) => {
      INFO[e.sym] = base({
        sym: e.sym, kind, place: e.place || null, manner: e.manner || kind,
        voice: e.voice != null ? e.voice : VOICE_BY_KIND[kind], zone: e.place || null,
        name: e.name, example: null, exApprox: 0, lang: e.lang || null,
        airstream, oral: true, lateral: false,
        howto: null, audio: true,
      });
    });
  addNonPulm(CLICKS, "click", "velaric ingressive");
  addNonPulm(IMPLOSIVES, "implosive", "glottalic ingressive");
  addNonPulm(EJECTIVES, "ejective", "glottalic egressive");
  OTHER.forEach((e) => {
    INFO[e.sym] = base({
      sym: e.sym, kind: "other", place: e.place || null, manner: e.manner || "other",
      voice: e.voice != null ? e.voice : 1, zone: e.place || null, secondary: e.secondary || null,
      name: e.name, example: e.example || null, exApprox: 0, lang: e.lang || null,
      note: e.note || null, airstream: "pulmonic egressive",
      oral: true, lateral: e.sym === "ɺ", howto: HOWTO_OVERRIDE[e.sym] || null, audio: true,
    });
  });
  SUPRAS.forEach((e) => {
    INFO[e.sym] = base({
      sym: e.sym, kind: "supra", place: null, manner: "suprasegmental",
      voice: null, zone: null, name: e.name, example: null, lang: e.lang || null,
      role: e.role || null, airstream: null, howto: null, audio: false,
    });
  });
  DIA_GROUPS.forEach((g) =>
    g.items.forEach((e) => {
      INFO[e.sym] = base({
        sym: e.sym, kind: "diacritic", group: g.key, place: null, manner: "diacritic",
        voice: null, zone: null, name: e.name, example: null, lang: e.lang || null,
        airstream: null, howto: null, audio: false, combining: isCombining(e.sym),
      });
    })
  );

  // ── Contrasts / related sounds (computed) ─────────────────────────────
  const placeIndex = (p) => PLACES.findIndex((x) => x[0] === p);
  function relatedCons(info) {
    const out = [];
    // voicing counterpart
    const cell = CONS_CELLS[info.manner + "|" + info.place];
    if (cell) {
      const other = cell.find(([, v]) => v !== info.voice);
      if (other) out.push({ sym: other[0], rel: info.voice ? "voiceless pair" : "voiced pair" });
    }
    // same place, other manners
    MANNERS.forEach(([mk]) => {
      if (mk === info.manner) return;
      const c = CONS_CELLS[mk + "|" + info.place];
      if (c) out.push({ sym: c[0][0], rel: MANNER_WORD[mk] });
    });
    // same manner, adjacent places
    const pi = placeIndex(info.place);
    [pi - 1, pi + 1].forEach((j) => {
      if (j < 0 || j >= PLACES.length) return;
      const c = CONS_CELLS[info.manner + "|" + PLACES[j][0]];
      if (c) out.push({ sym: c[0][0], rel: PLACE_WORD[PLACES[j][0]] });
    });
    return dedupeRel(out, info.sym).slice(0, 6);
  }
  function relatedVowel(v) {
    const out = [];
    const at = (h, b, r) => VOWELS.find((x) => x.height === h && x.backness === b && x.rounded === r);
    const round = at(v.height, v.backness, v.rounded ? 0 : 1);
    if (round) out.push({ sym: round.sym, rel: v.rounded ? "unrounded pair" : "rounded pair" });
    const hi = HEIGHTS.findIndex((x) => x[0] === v.height);
    [hi - 1, hi + 1].forEach((j) => {
      if (j < 0 || j >= HEIGHTS.length) return;
      const c = VOWELS.find((x) => x.height === HEIGHTS[j][0] && x.backness === v.backness);
      if (c) out.push({ sym: c.sym, rel: j < hi ? "closer" : "opener" });
    });
    const bi = BACKNESS.findIndex((x) => x[0] === v.backness);
    [bi - 1, bi + 1].forEach((j) => {
      if (j < 0 || j >= BACKNESS.length) return;
      const c = VOWELS.find((x) => x.backness === BACKNESS[j][0] && x.height === v.height);
      if (c) out.push({ sym: c.sym, rel: j < bi ? "fronter" : "backer" });
    });
    return dedupeRel(out, v.sym).slice(0, 6);
  }
  function dedupeRel(list, self) {
    const seen = new Set([self]);
    const out = [];
    for (const r of list) {
      if (seen.has(r.sym)) continue;
      seen.add(r.sym);
      out.push(r);
    }
    return out;
  }
  Object.values(INFO).forEach((info) => {
    if (info.kind === "cons") info.related = relatedCons(info);
    else if (info.kind === "vowel") {
      const v = VOWELS.find((x) => x.sym === info.sym);
      info.related = v ? relatedVowel(v) : [];
    }
  });

  function describe(sym) { return INFO[sym] ? INFO[sym].name : null; }

  SOUND.IPA = {
    PLACES, MANNERS, CONS_CELLS,
    HEIGHTS, BACKNESS, VOWELS,
    CLICKS, IMPLOSIVES, EJECTIVES, OTHER,
    SUPRAS, DIA_GROUPS, GROUP_NOTES,
    INFO, describe, carrier,
    PLACE_ARTIC, MANNER_CONSTR,
    placeLabel: (k) => PLACE_WORD[k] || label(PLACES, k),
    mannerLabel: (k) => MANNER_WORD[k] || k,
    heightLabel: (k) => label(HEIGHTS, k),
    backnessLabel: (k) => label(BACKNESS, k),
  };
})();
