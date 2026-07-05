// The 28 letters of the Arabic alphabet, plus a practical reading reference:
// joining, shape families, connection breakers, special forms, and reading marks.
// Egyptian sound values; `connector:false` marks the six letters that never join
// to the letter after them (ا د ذ ر ز و). Sounds are kept concise — the Sounds
// subsection is the full pronunciation reference.
window.MASRI = window.MASRI || {};
window.MASRI.alphabet = {
  intro:
    "Arabic is written from right to left, and most letters join together. Many " +
    "letters share the same basic shape and are distinguished by dots. Use the " +
    "sections below to understand joining, recognize shape families, and look up " +
    "individual letters.",
  soundNote: "Sounds here are the Egyptian readings. For fuller pronunciation guidance, use the Sounds subsection.",

  jump: [
    { label: "How joining works", anchor: "alp-join" },
    { label: "Shape families", anchor: "alp-families" },
    { label: "Alphabetical reference", anchor: "alp-ref" },
    { label: "Connection breakers", anchor: "alp-break" },
    { label: "Special forms", anchor: "alp-special" },
    { label: "Reading marks", anchor: "alp-marks" },
    { label: "Try Word Builder", anchor: "alp-wb" }
  ],

  joining: {
    breakers: "ا د ذ ر ز و",
    forms: [
      { name: "Isolated", desc: "standing alone" },
      { name: "Initial", desc: "the start of a connected segment" },
      { name: "Medial", desc: "connected on both sides" },
      { name: "Final", desc: "the end of a connected segment" }
    ],
    segmentNote: "“Initial” means the start of a connected segment — not always the first letter of the whole word.",
    examples: [
      { ar: "سمك", ex: "samak", en: "fish", kind: "One connected segment — every letter joins: س-م-ك." },
      { ar: "نور", ex: "nūr", en: "light", kind: "One break — و does not join the letter after it: نو · ر." },
      { ar: "دوا", ex: "dawa", en: "medicine", kind: "Several segments — د, و and ا are all breakers, so each stands apart: د · و · ا." }
    ]
  },

  familiesNote: "In many letter families, the base shape stays the same and the dots identify the letter.",
  families: [
    { letters: [
      { L: "ب", sound: "b", dots: "one dot below", ex_ar: "باب", ex: "bāb", ex_en: "door" },
      { L: "ت", sound: "t", dots: "two dots above", ex_ar: "تلاتة", ex: "talāta", ex_en: "three" },
      { L: "ث", sound: "often t", dots: "three dots above", ex_ar: "ثوم", ex: "tūm", ex_en: "garlic" } ] },
    { letters: [
      { L: "ج", sound: "g", dots: "one dot below", ex_ar: "جمل", ex: "gamal", ex_en: "camel" },
      { L: "ح", sound: "ḥ", dots: "no dots", ex_ar: "حب", ex: "ḥobb", ex_en: "love" },
      { L: "خ", sound: "kh", dots: "one dot above", ex_ar: "خمسة", ex: "khamsa", ex_en: "five" } ] },
    { letters: [
      { L: "د", sound: "d", dots: "no dots", ex_ar: "دوا", ex: "dawa", ex_en: "medicine" },
      { L: "ذ", sound: "often d", dots: "one dot above", ex_ar: "ذهب", ex: "dahab", ex_en: "gold" } ] },
    { letters: [
      { L: "ر", sound: "r", dots: "no dots", ex_ar: "راس", ex: "rās", ex_en: "head" },
      { L: "ز", sound: "z", dots: "one dot above", ex_ar: "عايز", ex: "ʿāyez", ex_en: "want" } ] },
    { letters: [
      { L: "س", sound: "s", dots: "no dots", ex_ar: "سمك", ex: "samak", ex_en: "fish" },
      { L: "ش", sound: "sh", dots: "three dots above", ex_ar: "شاي", ex: "shāy", ex_en: "tea" } ] },
    { letters: [
      { L: "ص", sound: "ṣ", dots: "no dots", ex_ar: "صباح", ex: "ṣabāḥ", ex_en: "morning" },
      { L: "ض", sound: "ḍ", dots: "one dot above", ex_ar: "ضيف", ex: "ḍēf", ex_en: "guest" } ] },
    { letters: [
      { L: "ط", sound: "ṭ", dots: "no dots", ex_ar: "طيب", ex: "ṭayyeb", ex_en: "kind" },
      { L: "ظ", sound: "heavy z", dots: "one dot above", ex_ar: "ظرف", ex: "zarf", ex_en: "envelope" } ] },
    { letters: [
      { L: "ع", sound: "ʿ", dots: "no dots", ex_ar: "عين", ex: "ʿēn", ex_en: "eye" },
      { L: "غ", sound: "gh", dots: "one dot above", ex_ar: "غالي", ex: "ghāli", ex_en: "expensive" } ] },
    { letters: [
      { L: "ف", sound: "f", dots: "one dot above", ex_ar: "فيل", ex: "fīl", ex_en: "elephant" },
      { L: "ق", sound: "ʾ (glottal)", dots: "two dots above", ex_ar: "قهوة", ex: "ʾahwa", ex_en: "coffee" } ] }
  ],

  formOrderNote: "Each card shows the forms in the reference order Isolated · Initial · Medial · Final. That is a lookup sequence — Arabic words themselves are read right to left.",

  letters: [
    { letter: "ا", name: "alif", name_ar: "أَلِف", sound: "ā / seat for hamza", ipa: "/aː/", connector: false, ex_ar: "أنا", ex: "ana", ex_en: "I", note: "Carries long a; also props up hamza (أ إ)." },
    { letter: "ب", name: "bāʾ",  name_ar: "بَاء",  sound: "b", ipa: "/b/", connector: true, ex_ar: "باب", ex: "bāb", ex_en: "door" },
    { letter: "ت", name: "tāʾ",  name_ar: "تَاء",  sound: "t", ipa: "/t/", connector: true, ex_ar: "تلاتة", ex: "talāta", ex_en: "three" },
    { letter: "ث", name: "thāʾ", name_ar: "ثَاء",  sound: "often t, sometimes s", ipa: "/t/", connector: true, ex_ar: "ثوم", ex: "tūm", ex_en: "garlic", note: "Egyptian: often t, sometimes s — depending on the word." },
    { letter: "ج", name: "gīm",  name_ar: "جِيم",  sound: "g (hard, as in go)", ipa: "/g/", connector: true, ex_ar: "جمل", ex: "gamal", ex_en: "camel", note: "The signature Egyptian sound. Formal Arabic: j." },
    { letter: "ح", name: "ḥāʾ",  name_ar: "حَاء",  sound: "ḥ (throat h)", ipa: "/ħ/", connector: true, ex_ar: "حب", ex: "ḥobb", ex_en: "love" },
    { letter: "خ", name: "khāʾ", name_ar: "خَاء",  sound: "kh", ipa: "/x/", connector: true, ex_ar: "خمسة", ex: "khamsa", ex_en: "five" },
    { letter: "د", name: "dāl",  name_ar: "دَال",  sound: "d", ipa: "/d/", connector: false, ex_ar: "دوا", ex: "dawa", ex_en: "medicine" },
    { letter: "ذ", name: "dhāl", name_ar: "ذَال",  sound: "often d, sometimes z", ipa: "/d/", connector: false, ex_ar: "ذهب", ex: "dahab", ex_en: "gold", note: "Egyptian: often d, sometimes z." },
    { letter: "ر", name: "rāʾ",  name_ar: "رَاء",  sound: "r (tapped)", ipa: "/r/", connector: false, ex_ar: "راس", ex: "rās", ex_en: "head" },
    { letter: "ز", name: "zāy",  name_ar: "زَاي",  sound: "z", ipa: "/z/", connector: false, ex_ar: "عايز", ex: "ʿāyez", ex_en: "want" },
    { letter: "س", name: "sīn",  name_ar: "سِين",  sound: "s", ipa: "/s/", connector: true, ex_ar: "سمك", ex: "samak", ex_en: "fish" },
    { letter: "ش", name: "shīn", name_ar: "شِين",  sound: "sh", ipa: "/ʃ/", connector: true, ex_ar: "شاي", ex: "shāy", ex_en: "tea" },
    { letter: "ص", name: "ṣād",  name_ar: "صَاد",  sound: "ṣ (emphatic s)", ipa: "/sˤ/", connector: true, ex_ar: "صباح", ex: "ṣabāḥ", ex_en: "morning" },
    { letter: "ض", name: "ḍād",  name_ar: "ضَاد",  sound: "ḍ (emphatic d)", ipa: "/dˤ/", connector: true, ex_ar: "ضيف", ex: "ḍēf", ex_en: "guest" },
    { letter: "ط", name: "ṭāʾ",  name_ar: "طَاء",  sound: "ṭ (emphatic t)", ipa: "/tˤ/", connector: true, ex_ar: "طيب", ex: "ṭayyeb", ex_en: "kind / nice" },
    { letter: "ظ", name: "ẓāʾ",  name_ar: "ظَاء",  sound: "often a heavy z", ipa: "/zˤ/", connector: true, ex_ar: "ظرف", ex: "zarf", ex_en: "envelope", note: "Egyptian: often a heavy z; formal transliteration ẓ." },
    { letter: "ع", name: "ʿayn", name_ar: "عَيْن", sound: "ʿ (throat sound)", ipa: "/ʕ/", connector: true, ex_ar: "عين", ex: "ʿēn", ex_en: "eye" },
    { letter: "غ", name: "ghayn",name_ar: "غَيْن", sound: "gh", ipa: "/ɣ/", connector: true, ex_ar: "غالي", ex: "ghāli", ex_en: "expensive" },
    { letter: "ف", name: "fāʾ",  name_ar: "فَاء",  sound: "f", ipa: "/f/", connector: true, ex_ar: "فيل", ex: "fīl", ex_en: "elephant" },
    { letter: "ق", name: "qāf",  name_ar: "قَاف",  sound: "ʾ (glottal stop)", ipa: "/ʔ/", connector: true, ex_ar: "قهوة", ex: "ʾahwa", ex_en: "coffee", note: "Cairene: usually a glottal stop. Formal Arabic: /q/." },
    { letter: "ك", name: "kāf",  name_ar: "كَاف",  sound: "k", ipa: "/k/", connector: true, ex_ar: "كتير", ex: "ketīr", ex_en: "a lot" },
    { letter: "ل", name: "lām",  name_ar: "لَام",  sound: "l", ipa: "/l/", connector: true, ex_ar: "لبن", ex: "laban", ex_en: "milk" },
    { letter: "م", name: "mīm",  name_ar: "مِيم",  sound: "m", ipa: "/m/", connector: true, ex_ar: "مية", ex: "mayya", ex_en: "water" },
    { letter: "ن", name: "nūn",  name_ar: "نُون",  sound: "n", ipa: "/n/", connector: true, ex_ar: "نور", ex: "nūr", ex_en: "light" },
    { letter: "ه", name: "hāʾ",  name_ar: "هَاء",  sound: "h (light)", ipa: "/h/", connector: true, ex_ar: "هنا", ex: "hena", ex_en: "here", note: "A light h, softer than ح." },
    { letter: "و", name: "wāw",  name_ar: "وَاو",  sound: "w / ū / ō", ipa: "/w/", connector: false, ex_ar: "واحد", ex: "wāḥed", ex_en: "one", note: "Consonant w, or carries long u / o." },
    { letter: "ي", name: "yāʾ",  name_ar: "يَاء",  sound: "y / ī / ē", ipa: "/j/", connector: true, ex_ar: "يوم", ex: "yōm", ex_en: "day", note: "Consonant y, or carries long i / e." }
  ],

  breakers: {
    intro: "These six letters can connect to a preceding letter on their right, but they never connect to the following letter on their left. The next letter starts a new connected segment.",
    letters: [
      { L: "ا", name: "alif", ex_ar: "باب", ex: "bāb", ex_en: "door" },
      { L: "د", name: "dāl", ex_ar: "دوا", ex: "dawa", ex_en: "medicine" },
      { L: "ذ", name: "dhāl", ex_ar: "ذهب", ex: "dahab", ex_en: "gold" },
      { L: "ر", name: "rāʾ", ex_ar: "عربي", ex: "ʿarabi", ex_en: "Arabic" },
      { L: "ز", name: "zāy", ex_ar: "عايز", ex: "ʿāyez", ex_en: "want" },
      { L: "و", name: "wāw", ex_ar: "نور", ex: "nūr", ex_en: "light" }
    ]
  },

  special: {
    hamza: {
      intro: "<b>ء</b> is hamza — a glottal stop (the catch in “uh-oh”). It can stand on its own or sit on a carrier letter. The carrier does not change the consonant; it is still a hamza.",
      carriers: [
        { form: "أ", label: "hamza on alif", ex_ar: "أنا", ex: "ana", ex_en: "I" },
        { form: "إ", label: "hamza under alif", ex_ar: "إزاي", ex: "ezzāy", ex_en: "how" },
        { form: "ؤ", label: "hamza on wāw", ex_ar: "سؤال", ex: "soʾāl", ex_en: "question" },
        { form: "ئ", label: "hamza on yāʾ", ex_ar: "طوارئ", ex: "ṭawāreʾ", ex_en: "emergency" }
      ]
    },
    tamarbuta: { L: "ة", name: "tāʾ marbūṭa",
      note: "Usually appears at the end of feminine nouns and adjectives. In a pause it commonly sounds like <b>-a</b> or <b>-ah</b>; in some connected grammatical contexts it may be heard as <b>t</b>.",
      ex_ar: "قهوة", ex: "ʾahwa", ex_en: "coffee" },
    maqsura: { L: "ى", name: "alif maqṣūra",
      note: "Appears at the end of a word and usually represents final long <b>ā</b>. It resembles a dotless ي but is distinct in spelling.",
      ex_ar: "مستشفى", ex: "mostashfa", ex_en: "hospital" },
    lamalif: { L: "لا", name: "lām-alif",
      note: "A common ligature of <b>ل + ا</b>. It is still two letters, not a 29th letter of the alphabet.",
      ex_ar: "تلاتة", ex: "talāta", ex_en: "three (the لا joins inside the word)" },
    distinctions: [
      { a: "ة", b: "ه", note: "ة (tāʾ marbūṭa) has two dots and ends words as -a/-ah; ه (hāʾ) has no dots and is a light h." },
      { a: "ى", b: "ي", note: "ى (alif maqṣūra) is dotless and ends a word as long ā; ي (yāʾ) has two dots and is y / long ī." },
      { a: "ء", b: "ع", note: "ء is a glottal stop (a catch); ع is a voiced throat sound. See Sounds for detail." }
    ]
  },

  marks: {
    intro: "Short-vowel and helper marks. These are often omitted in ordinary Arabic writing.",
    rows: [
      { mark: "َ", name: "fatḥa", name_ar: "فَتْحة", desc: "a short a above the letter", demo: "بَ = ba" },
      { mark: "ِ", name: "kasra", name_ar: "كَسْرة", desc: "a short i below the letter", demo: "بِ = bi" },
      { mark: "ُ", name: "ḍamma", name_ar: "ضَمّة", desc: "a short u above the letter", demo: "بُ = bu" },
      { mark: "ْ", name: "sukūn", name_ar: "سُكون", desc: "no vowel after the consonant", demo: "بْ = b" },
      { mark: "ّ", name: "shadda", name_ar: "شَدّة", desc: "doubles the consonant", demo: "بّ = bb" }
    ],
    note: "These marks are often omitted in ordinary Arabic writing. They appear more often in beginner materials, dictionaries, religious texts, and places where pronunciation must be clarified.",
    tanwin: "Tanwīn (ً ٌ ٍ) — doubled short-vowel marks that add an -n sound — is mainly a formal-Arabic feature and is not central to Egyptian Arabic."
  },

  wbNote: "Try a word in Word Builder to see its individual letters, letter names, and word structure."
};
