// Sounds of Masri (Egyptian / Cairene Arabic) — grouped pronunciation reference.
// Egyptian-first: how Cairenes actually pronounce, with formal (MSA) as secondary
// contrast. An optional `audio` property per card is supported by the renderer but
// left unset until trusted local recordings exist (no synthetic speech).
window.MASRI = window.MASRI || {};
window.MASRI.sounds = {
  intro:
    "Egyptian Arabic uses the Arabic alphabet, but several sounds are pronounced " +
    "differently in Cairene speech. Start with the signature changes, then use the " +
    "sound groups, comparisons, and vowel guide below.",

  jump: [
    { label: "Cairene changes", anchor: "snd-cairene" },
    { label: "Throat & back", anchor: "snd-throat" },
    { label: "Emphatic", anchor: "snd-emphatic" },
    { label: "Egyptian r", anchor: "snd-ra" },
    { label: "Vowels", anchor: "snd-vowels" },
    { label: "Comparisons", anchor: "snd-compare" },
    { label: "Franco-Arabic", anchor: "snd-franco" }
  ],

  // Section A — signature Cairene sounds (larger cards)
  signature: [
    { letter: "ج", name: "gīm", sym: "g", ipa: "/g/", ex_ar: "جمل", ex: "gamal", ex_en: "camel",
      summary: "A hard <b>g</b> as in “go” — the classic Cairene sound.",
      detail: "Formal (Modern Standard) Arabic uses a soft <i>j</i> (/dʒ/); Cairene keeps the hard g." },
    { letter: "ق", name: "qāf", sym: "ʾ", ipa: "/ʔ/", ex_ar: "قهوة", ex: "ʾahwa", ex_en: "coffee",
      summary: "In Cairene speech, usually the <b>glottal stop</b> heard in “uh-oh.”",
      detail: "In formal Arabic it is a back-of-the-mouth <i>q</i> sound (/q/). Cairene turns it into the glottal stop — so قلب is <i>ʾalb</i> (heart)." }
  ],

  // Common Cairene shifts (word-dependent, not universal rules)
  shifts: {
    intro: "These letters often shift in Egyptian — but the outcome depends on the word, not a fixed rule.",
    cards: [
      { letter: "ث", name: "thāʾ", sym: "t / s", ipa: "/t/", ex_ar: "ثوم", ex: "tūm", ex_en: "garlic",
        summary: "In many common Egyptian words this becomes <b>t</b>.",
        detail: "Some formal or borrowed words use <b>s</b> (or another pronunciation) instead. It is not a single mechanical rule." },
      { letter: "ذ", name: "dhāl", sym: "d / z", ipa: "/d/", ex_ar: "ذهب", ex: "dahab", ex_en: "gold",
        summary: "In many common Egyptian words this becomes <b>d</b>.",
        detail: "Some words use <b>z</b> instead — the outcome varies by word." },
      { letter: "ظ", name: "ẓāʾ", sym: "ẓ / z", ipa: "/zˤ/", ex_ar: "ظرف", ex: "zarf", ex_en: "envelope",
        summary: "Commonly realized as a heavy (emphatic) <b>z</b> in Egyptian.",
        detail: "The formal letter name and transliteration are <i>ẓāʾ / ẓ</i>. It is also one of the emphatic consonants (see below)." }
    ]
  },

  // Section B — throat & back
  throat: {
    intro: "Made in the throat or the back of the mouth. Aim for a relaxed sound — never force or strain the throat.",
    cards: [
      { letter: "ح", name: "ḥāʾ", sym: "ḥ", ipa: "/ħ/", ex_ar: "حب", ex: "ḥobb", ex_en: "love",
        summary: "Strong breath through a narrowed throat, <b>voice off</b> — deeper than English h.",
        detail: "Place: in the throat. Common mistake: confusing it with ه (a light h), or dropping it. Keep the throat relaxed — don't strain." },
      { letter: "خ", name: "khāʾ", sym: "kh", ipa: "/x/", ex_ar: "خمسة", ex: "khamsa", ex_en: "five",
        summary: "Steady friction at the back of the mouth, <b>voice off</b> — like Scottish “loch.”",
        detail: "Place: back of the mouth. Common mistake: softening it to a plain k or h. Don't forcefully clear the throat." },
      { letter: "ع", name: "ʿayn", sym: "ʿ", ipa: "/ʕ/", ex_ar: "عين", ex: "ʿēn", ex_en: "eye",
        summary: "A voiced narrowing deep in the throat, <b>voice on</b> — no exact English match.",
        detail: "Place: deep in the throat. Common mistake: skipping it entirely — try not to drop it (عربي = <i>ʿarabi</i>). Keep it relaxed rather than squeezing hard." },
      { letter: "غ", name: "ghayn", sym: "gh", ipa: "/ɣ/", ex_ar: "غالي", ex: "ghāli", ex_en: "expensive",
        summary: "The voiced partner of خ, <b>voice on</b> — similar to some French r sounds.",
        detail: "Place: back of the mouth. Common mistake: confusing it with its voiceless partner خ (kh)." }
    ]
  },

  // Section C — emphatic consonants (one intro, compact per-card cues)
  emphatic: {
    intro: "Emphatic consonants have a darker, retracted quality that can also affect nearby vowels.",
    cards: [
      { letter: "ص", name: "ṣād", sym: "ṣ", ipa: "/sˤ/", ex_ar: "صباح", ex: "ṣabāḥ", ex_en: "morning",
        summary: "The emphatic partner of <b>س</b> (s)." },
      { letter: "ض", name: "ḍād", sym: "ḍ", ipa: "/dˤ/", ex_ar: "ضيف", ex: "ḍēf", ex_en: "guest",
        summary: "The emphatic partner of <b>د</b> (d)." },
      { letter: "ط", name: "ṭāʾ", sym: "ṭ", ipa: "/tˤ/", ex_ar: "طيب", ex: "ṭayyeb", ex_en: "okay",
        summary: "The emphatic partner of <b>ت</b> (t)." }
    ],
    crossref: "<b>ظ</b> (ẓāʾ, /zˤ/) is also emphatic — in Egyptian usually a heavy z. Its full card is under Cairene changes above."
  },

  // Section D — Egyptian r
  ra: {
    letter: "ر", name: "rāʾ", sym: "r", ipa: "/r/",
    summary: "A tapped or lightly rolled <b>r</b> — not the soft English r.",
    detail: "Tap the tongue once against the ridge behind the teeth, or roll it lightly. Avoid over-rolling.",
    examples: [
      { ar: "راس", ex: "rās", en: "head", pos: "Start of a word" },
      { ar: "عربي", ex: "ʿarabi", en: "Arabic", pos: "Between vowels" }
    ]
  },

  vowels: {
    intro:
      "Egyptian has three short vowels and their long partners, plus long <b>ē</b> and <b>ō</b> " +
      "(where formal Arabic has <i>ay</i> and <i>aw</i>). ē and ō are especially common in Egyptian. " +
      "Long vowels are simply held longer. Ordinary Arabic writing usually omits short-vowel marks, so " +
      "the spelling does not always show a beginner the spoken vowel.",
    shortNote: "Most short vowels are not written in ordinary Arabic text.",
    short: [
      { sym: "a", ar: "سمك", ex: "samak", en: "fish" },
      { sym: "i", ar: "بنت", ex: "bint", en: "girl" },
      { sym: "u", ar: "شكراً", ex: "shukran", en: "thank you" }
    ],
    long: [
      { sym: "ā", ar: "باب", ex: "bāb", en: "door" },
      { sym: "ī", ar: "فيل", ex: "fīl", en: "elephant" },
      { sym: "ū", ar: "نور", ex: "nūr", en: "light" },
      { sym: "ē", ar: "بيت", ex: "bēt", en: "house", note: "formal Arabic <i>bayt</i>" },
      { sym: "ō", ar: "يوم", ex: "yōm", en: "day", note: "formal Arabic <i>yawm</i>" }
    ],
    pairs: [
      { s: { sym: "a", ex: "samak", en: "fish" }, l: { sym: "ā", ex: "bāb", en: "door" } },
      { s: { sym: "i", ex: "bint", en: "girl" }, l: { sym: "ī", ex: "fīl", en: "elephant" } },
      { s: { sym: "u", ex: "shukran", en: "thank you" }, l: { sym: "ū", ex: "nūr", en: "light" } }
    ]
  },

  compare: {
    intro: "Some sounds are easy to mix up. Here is how to tell them apart.",
    cards: [
      { a: { L: "ه", sym: "h", ar: "هنا", ex: "hena", en: "here" }, b: { L: "ح", sym: "ḥ", ar: "حب", ex: "ḥobb", en: "love" },
        note: "ه is a light English-style h; ح is stronger, made deeper in the throat." },
      { a: { L: "خ", sym: "kh", ar: "خمسة", ex: "khamsa", en: "five" }, b: { L: "غ", sym: "gh", ar: "غالي", ex: "ghāli", en: "expensive" },
        note: "Same place at the back of the mouth — خ is voice-off, غ is voice-on." },
      { a: { L: "ء", sym: "ʾ", ar: "قهوة", ex: "ʾahwa", en: "coffee" }, b: { L: "ع", sym: "ʿ", ar: "عين", ex: "ʿēn", en: "eye" },
        note: "ء is a clean glottal stop (a little catch); ع is a voiced squeeze deeper in the throat." },
      { a: { L: "س", sym: "s", ar: "سمك", ex: "samak", en: "fish" }, b: { L: "ص", sym: "ṣ", ar: "صباح", ex: "ṣabāḥ", en: "morning" },
        note: "س is a plain s; ص is the heavy (emphatic) s and darkens nearby vowels." },
      { a: { L: "ت", sym: "t", ar: "تلاتة", ex: "talāta", en: "three" }, b: { L: "ط", sym: "ṭ", ar: "طيب", ex: "ṭayyeb", en: "okay" },
        note: "ت is a plain t; ط is the heavy (emphatic) t." },
      { a: { L: "د", sym: "d", ar: "دوا", ex: "dawa", en: "medicine" }, b: { L: "ض", sym: "ḍ", ar: "ضيف", ex: "ḍēf", en: "guest" },
        note: "د is a plain d; ض is the heavy (emphatic) d." },
      { a: { L: "ك", sym: "k", ar: "كتير", ex: "ketīr", en: "a lot" }, b: { L: "ق", sym: "ʾ", ar: "قهوة", ex: "ʾahwa", en: "coffee" },
        note: "ك is k. Cairene ق is usually a glottal stop (not k); formal Arabic pronounces ق as /q/." }
    ]
  },

  franco: {
    intro:
      "“Franco-Arabic” / <i>Arabizi</i> — typing Arabic on a Latin keyboard, with numbers standing in " +
      "for sounds that have no Latin letter. Conventions vary by person, platform, and region; these are " +
      "common Egyptian patterns, not fixed spelling rules.",
    distinct: "This is recognition help only. Masri's own transliteration (<b>ʿ ḥ ā ē ō …</b>) is the readable standard used everywhere else on the desk.",
    rows: [
      { num: "2", letter: "ء / ق", sound: "glottal stop (hamza / Egyptian qāf)" },
      { num: "3", letter: "ع", sound: "ʿayn (the throat sound)" },
      { num: "5", letter: "خ", sound: "kh" },
      { num: "6", letter: "ط", sound: "emphatic ṭ" },
      { num: "7", letter: "ح", sound: "ḥ (breathy throat h)" },
      { num: "8", letter: "غ", sound: "gh", alt: "also 3’" },
      { num: "9", letter: "ص", sound: "emphatic ṣ" },
      { num: "6’", letter: "ظ", sound: "ẓ (often just written z)", alt: "varies" },
      { num: "9’", letter: "ض", sound: "ḍ (often just written d)", alt: "varies" }
    ],
    examples: [
      { arabizi: "3ayez", ar: "عايز", en: "want" },
      { arabizi: "7ob", ar: "حب", en: "love" },
      { arabizi: "2ahwa", ar: "قهوة", en: "coffee" }
    ]
  }
};
