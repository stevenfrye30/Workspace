// The working core of Egyptian Arabic grammar, as reference tables.
// Egyptian forms throughout — not MSA. Each topic is a table you can scan.
window.MASRI = window.MASRI || {};
window.MASRI.grammar = [
  {
    title: "Subject pronouns",
    note: "Egyptian drops MSA's dual and its separate feminine plural — one plural does the job.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["أنا",  "ana",   "I"],
      ["إنت",  "enta",  "you (m)"],
      ["إنتي", "enti",  "you (f)"],
      ["هو",   "howwa", "he / it"],
      ["هي",   "heyya", "she / it"],
      ["إحنا", "eḥna",  "we"],
      ["إنتو", "ento",  "you (pl)"],
      ["هم",   "homma", "they"]
    ]
  },
  {
    title: "Possessive / object endings",
    note: "Suffixes glued to the noun. Shown on كتاب <i>kitāb</i> (book): my book, your book…",
    headers: ["Ending", "On كتاب", "Masri", "English"],
    rows: [
      ["ـي",  "كتابي",  "kitābi",  "my book"],
      ["ـك",  "كتابك",  "kitābak", "your book (m)"],
      ["ـك",  "كتابك",  "kitābik", "your book (f)"],
      ["ـه",  "كتابه",  "kitābo",  "his book"],
      ["ـها", "كتابها", "kitābha", "her book"],
      ["ـنا", "كتابنا", "kitābna", "our book"],
      ["ـكو", "كتابكو", "kitābko", "your book (pl)"],
      ["ـهم", "كتابهم", "kitābhom","their book"]
    ]
  },
  {
    title: "Present tense — the bi- prefix",
    note: "Ongoing / habitual action adds <b>بـ (bi-)</b> to the verb. Shown on يكتب <i>yiktib</i> (to write).",
    headers: ["Pronoun", "Arabic", "Masri", "English"],
    rows: [
      ["ana",   "بكتب",   "baktib",    "I write / I'm writing"],
      ["enta",  "بتكتب",  "bitiktib",  "you write (m)"],
      ["enti",  "بتكتبي", "bitiktibi", "you write (f)"],
      ["howwa", "بيكتب",  "biyiktib",  "he writes"],
      ["heyya", "بتكتب",  "bitiktib",  "she writes"],
      ["eḥna",  "بنكتب",  "biniktib",  "we write"],
      ["ento",  "بتكتبوا","bitiktibu", "you write (pl)"],
      ["homma", "بيكتبوا","biyiktibu", "they write"]
    ]
  },
  {
    title: "Future tense — the ha- prefix",
    note: "Swap بـ for <b>هـ (ha-)</b> for the future: هكتب <i>haktib</i> = I will write.",
    headers: ["Pronoun", "Arabic", "Masri", "English"],
    rows: [
      ["ana",   "هكتب",   "haktib",    "I will write"],
      ["enta",  "هتكتب",  "hatiktib",  "you will write (m)"],
      ["enti",  "هتكتبي", "hatiktibi", "you will write (f)"],
      ["howwa", "هيكتب",  "hayiktib",  "he will write"],
      ["heyya", "هتكتب",  "hatiktib",  "she will write"],
      ["eḥna",  "هنكتب",  "haniktib",  "we will write"],
      ["ento",  "هتكتبوا","hatiktibu", "you will write (pl)"],
      ["homma", "هيكتبوا","hayiktibu", "they will write"]
    ]
  },
  {
    title: "Past tense",
    note: "The past adds endings to the bare stem كتب <i>katab</i> (he wrote). No prefix.",
    headers: ["Pronoun", "Arabic", "Masri", "English"],
    rows: [
      ["ana",   "كتبت",  "katabt",  "I wrote"],
      ["enta",  "كتبت",  "katabt",  "you wrote (m)"],
      ["enti",  "كتبتي", "katabti", "you wrote (f)"],
      ["howwa", "كتب",   "katab",   "he wrote"],
      ["heyya", "كتبت",  "katabet", "she wrote"],
      ["eḥna",  "كتبنا", "katabna", "we wrote"],
      ["ento",  "كتبتوا","katabtu", "you wrote (pl)"],
      ["homma", "كتبوا", "katabu",  "they wrote"]
    ]
  },
  {
    title: "Negation",
    note: "Two systems. Verbs get wrapped in <b>ما…ش</b> (ma…sh). Everything else uses <b>مش</b> (mesh).",
    headers: ["Type", "Arabic", "Masri", "English"],
    rows: [
      ["verb",     "مكتبش",     "ma-katabsh",   "he didn't write"],
      ["verb",     "مبكتبش",    "ma-baktibsh",  "I don't write"],
      ["verb",     "معنديش",    "ma-ʿandīsh",   "I don't have"],
      ["non-verb", "مش هنا",    "mesh hena",    "not here"],
      ["non-verb", "مش كويس",   "mesh kwayyes", "not good"],
      ["non-verb", "مش عايز",   "mesh ʿāyez",   "I don't want"]
    ]
  },
  {
    title: "Question words",
    note: "In Egyptian, most question words come <b>after</b> the verb: <i>esmak ēh?</i> = your-name what?",
    headers: ["Arabic", "Masri", "English", "Example"],
    rows: [
      ["إيه",   "ēh",    "what",     "عايز إيه؟ <i>ʿāyez ēh?</i> — what do you want?"],
      ["مين",   "mīn",   "who",      "مين ده؟ <i>mīn da?</i> — who's that?"],
      ["فين",   "fēn",   "where",    "رايح فين؟ <i>rāyeḥ fēn?</i> — going where?"],
      ["إمتى",  "emta",  "when",     "إمتى؟ <i>emta?</i> — when?"],
      ["ليه",   "lēh",   "why",      "ليه؟ <i>lēh?</i> — why?"],
      ["إزاي",  "ezzāy", "how",      "إزاي؟ <i>ezzāy?</i> — how?"],
      ["كام",   "kām",   "how many", "بكام؟ <i>bekām?</i> — for how much?"],
      ["أنهي",  "anhi",  "which",    "أنهي واحد؟ <i>anhi wāḥed?</i> — which one?"]
    ]
  },
  {
    title: "The definite article & “this/that”",
    note: "“The” is <b>الـ (el-)</b>. Before “sun letters” the l assimilates: الشمس → <i>esh-shams</i>. " +
          "Demonstratives <b>da/di/dol</b> come AFTER the noun.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["البيت",     "el-bēt",       "the house"],
      ["الشمس",     "esh-shams",    "the sun (assimilated l)"],
      ["الكتاب ده", "el-kitāb da",  "this book (m)"],
      ["الأوضة دي", "el-ōḍa di",    "this room (f)"],
      ["الكتب دول", "el-kotob dol", "these books"]
    ]
  },
  {
    title: "To have — ʿand",
    note: "Egyptian has no verb “to have”; it uses <b>عند (ʿand)</b> + a possessive ending = “at me / with me.”",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["عندي",  "ʿandi",   "I have"],
      ["عندك",  "ʿandak",  "you have (m)"],
      ["عندك",  "ʿandik",  "you have (f)"],
      ["عنده",  "ʿando",   "he has"],
      ["عندها", "ʿandaha", "she has"],
      ["عندنا", "ʿandena", "we have"],
      ["عندكو", "ʿandoku", "you have (pl)"],
      ["عندهم", "ʿandohom","they have"]
    ]
  },
  {
    title: "There is no “to be” in the present",
    note: "Egyptian has no am/is/are. Put the pronoun (or a noun) straight next to the word — no linking verb.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["أنا طالب",    "ana ṭāleb",     "I'm a student (m)"],
      ["أنا تعبان",   "ana taʿbān",    "I'm tired (m)"],
      ["إنت فين؟",    "enta fēn?",     "where are you? (m)"],
      ["هو هنا",      "howwa hena",    "he's here"],
      ["هي مبسوطة",   "heyya mabsūṭa", "she's happy (f)"],
      ["إحنا جاهزين", "eḥna gahzīn",   "we're ready (pl)"]
    ]
  },
  {
    title: "Saying “I want” — ʿāyez",
    note: "Use عايز (m) / عايزة (f), then a noun or a verb. One of the most useful words in daily life.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["أنا عايز",      "ana ʿāyez",      "I want (m)"],
      ["أنا عايزة",     "ana ʿayza",      "I want (f)"],
      ["عايز مية",      "ʿāyez mayya",    "I want water"],
      ["عايز أروح",     "ʿāyez arūḥ",     "I want to go"],
      ["عايزة آكل",     "ʿayza ākol",     "I want to eat (f)"],
      ["إنت عايز إيه؟", "enta ʿāyez ēh?", "what do you want? (m)"]
    ]
  },
  {
    title: "Saying “I have” / “I don't have”",
    note: "“Have” = عند + ending. To say you *don't* have, wrap it in ما...ش → معنديش.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["عندي",        "ʿandi",          "I have"],
      ["عندي فلوس",   "ʿandi felūs",    "I have money"],
      ["عندي سؤال",   "ʿandi soʾāl",    "I have a question"],
      ["معنديش",      "maʿandīsh",      "I don't have"],
      ["معنديش وقت",  "maʿandīsh waʾt", "I don't have time"],
      ["معنديش فكرة", "maʿandīsh fekra","I have no idea"]
    ]
  },
  {
    title: "Everyday questions",
    note: "In Egyptian the question word usually comes at the END of the sentence.",
    headers: ["Arabic", "Masri", "English"],
    rows: [
      ["اسمك إيه؟",   "esmak ēh?",      "what's your name? (m)"],
      ["ده بكام؟",    "da bekām?",      "how much is this?"],
      ["فين الحمام؟", "fēn el-ḥammām?", "where's the bathroom?"],
      ["رايح فين؟",   "rāyeḥ fēn?",     "where are you going? (m)"],
      ["ليه؟",        "lēh?",           "why?"],
      ["ممكن؟",       "momken?",        "may I? / is it okay?"]
    ]
  }
];
