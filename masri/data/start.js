// Start Here — a goal-based front door for someone beginning Egyptian Arabic.
// Content only; the renderer + navigation live in index.html.
window.MASRI = window.MASRI || {};
window.MASRI.start = {
  welcome: {
    lead: "Masri is a reference desk for everyday Egyptian Arabic, especially Cairene speech. Search for what you need, browse a topic, or start with the essentials below.",
    sub: "It is designed for flexible browsing rather than lessons, grades, or progress tracking."
  },

  searchTip: {
    text: "Try searching for an English meaning, Arabic word, transliteration, or topic.",
    examples: ["coffee", "فين", "mesh", "time"]
  },

  // Goal-based navigation. `go` is a section id handled by activate(); `search:true`
  // focuses the global search box.
  goals: [
    { title: "Say something useful", desc: "Practical phrases for everyday situations.",
      primary: { label: "Phrases", go: "phrases" }, also: [{ label: "Everyday Life", go: "around" }] },
    { title: "Pronounce a word", desc: "How the letters sound — and build a word.",
      primary: { label: "Sounds", go: "sounds" }, also: [{ label: "Word Builder", go: "word-builder" }] },
    { title: "Understand Arabic writing", desc: "The alphabet and how letters connect.",
      primary: { label: "Alphabet", go: "alphabet" }, also: [{ label: "Word Builder", go: "word-builder" }] },
    { title: "Understand a sentence", desc: "Grammar patterns and common verbs.",
      primary: { label: "Grammar", go: "grammar" }, also: [{ label: "Verbs", go: "verbs" }] },
    { title: "Find themed vocabulary", desc: "Words grouped by topic.",
      primary: { label: "Vocabulary", go: "vocab" },
      also: [{ label: "Everyday Life", go: "around" }, { label: "People & Descriptions", go: "people" }, { label: "Numbers & Time", go: "numbers" }] },
    { title: "Look up something specific", desc: "Search the whole desk at once.",
      primary: { label: "Search the desk", search: true } }
  ],

  begin: {
    intro: "A simple place to begin, if you are not sure where to look first.",
    steps: [
      { text: "See the major Egyptian pronunciation differences.", go: "sounds" },
      { text: "Look at how Arabic letters connect.", go: "alphabet" },
      { text: "Try a familiar word in Word Builder.", go: "word-builder" },
      { text: "See how Masri transliteration works.", anchor: "sh-translit" },
      { text: "Read the survival phrases.", anchor: "sh-survival" },
      { text: "Browse the topic you need today.", anchor: "sh-goals" }
    ]
  },

  glance: {
    title: "Egyptian Arabic at a glance",
    points: [
      "Egyptian Arabic is everyday <b>spoken</b> Arabic — distinct from formal Modern Standard Arabic (MSA).",
      "Masri primarily reflects <b>Cairene</b> pronunciation and usage.",
      "<b>ج</b> is usually pronounced like a hard <b>g</b> (as in <i>go</i>) in Cairene speech.",
      "<b>ق</b> is often pronounced as a <b>glottal stop</b> — the little catch in <i>uh-oh</i>.",
      "<b>ث</b> and <b>ذ</b> often shift in common Egyptian words, though the outcome depends on the word.",
      "Most <b>short vowels are not written</b> in ordinary Arabic script.",
      "Spoken Egyptian forms may differ noticeably from formal written Arabic.",
      "Pronunciation and vocabulary vary across Egypt."
    ],
    link: "sounds"
  },

  translit: {
    title: "How to read Masri transliteration",
    rows: [
      { sym: "ā", means: "long a", ex_tr: "bāb", ex_en: "door" },
      { sym: "ē", means: "long Egyptian e", ex_tr: "bēt", ex_en: "house" },
      { sym: "ī", means: "long ee", ex_tr: "fīl", ex_en: "elephant" },
      { sym: "ō", means: "long Egyptian o", ex_tr: "yōm", ex_en: "day" },
      { sym: "ū", means: "long oo", ex_tr: "nūr", ex_en: "light" },
      { sym: "ʿ", means: "the letter ع — a throat sound", ex_tr: "ʿarabi", ex_en: "Arabic" },
      { sym: "ʾ", means: "hamza / glottal stop (also Egyptian ق)", ex_tr: "ʾahwa", ex_en: "coffee" },
      { sym: "ḥ", means: "the letter ح — a deep, breathy h", ex_tr: "ḥobb", ex_en: "love" },
      { sym: "kh", means: "the letter خ — as in “loch”", ex_tr: "khamsa", ex_en: "five" },
      { sym: "gh", means: "the letter غ — a gargled r", ex_tr: "ghāli", ex_en: "expensive" },
      { sym: "ṣ ḍ ṭ ẓ", means: "emphatic (heavy) consonants", ex_tr: "ṣabāḥ", ex_en: "morning" }
    ],
    note: "Transliteration is a pronunciation aid. The Arabic spelling remains the main reference.",
    link: "sounds"
  },

  survival: {
    title: "Beginner survival phrases",
    note: "The handful that carry you through almost any early conversation. Where a phrase changes with the speaker's gender, both forms are shown.",
    items: [
      { en: "I'm learning Arabic", ar: "أنا بتعلم عربي", tr: "ana batʿallem ʿarabi" },
      { en: "I don't understand", forms: [ { who: "m", ar: "مش فاهم", tr: "mesh fāhem" }, { who: "f", ar: "مش فاهمة", tr: "mesh fahma" } ] },
      { en: "Can you say that again?", ar: "ممكن تعيد تاني؟", tr: "momken teʿīd tāni?" },
      { en: "Slowly, please", ar: "بالراحة لو سمحت", tr: "bel-rāḥa law samaḥt" },
      { en: "What does this mean?", ar: "يعني إيه ده؟", tr: "yaʿni ēh da?" },
      { en: "How do I say ___?", ar: "إزاي أقول ...؟", tr: "ezzāy aʾūl ...?" },
      { en: "Please write it down", ar: "اكتبها لي لو سمحت", tr: "ektebha-li law samaḥt" },
      { en: "Thank you", ar: "شكراً", tr: "shukran" },
      { en: "Yes", ar: "أيوة", tr: "aywa" },
      { en: "No", ar: "لأ", tr: "laʾ" },
      { en: "Okay", ar: "طيب", tr: "ṭayyeb" },
      { en: "Please / excuse me", ar: "لو سمحت", tr: "law samaḥt" },
      { en: "Sorry", forms: [ { who: "m", ar: "آسف", tr: "āsef" }, { who: "f", ar: "آسفة", tr: "asfa" } ] },
      { en: "Never mind / no worries", ar: "معلش", tr: "maʿlesh" },
      { en: "I don't know", forms: [ { who: "m", ar: "مش عارف", tr: "mesh ʿāref" }, { who: "f", ar: "مش عارفة", tr: "mesh ʿarfa" } ] },
      { en: "Where is ___?", ar: "... فين؟", tr: "... fēn?" },
      { en: "How much?", ar: "بكام؟", tr: "bekām?" },
      { en: "Can you help me?", ar: "ممكن تساعدني؟", tr: "momken tesaʿedni?" }
    ]
  }
};
