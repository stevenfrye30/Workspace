// Symbols — Arabic phoneme ⇄ IPA ⇄ English ⇄ letter reference (Sounds & Alphabet).
// A local, self-contained Masri dataset (NOT coupled to the Sound Lab app). The
// inventory mirrors the finished Sound Lab "Phonology · Comparison" table with
// Modern Standard Arabic as the reference target: 28 consonants, 3 short + 3 long
// vowels, and 2 diphthongs. Example words and Egyptian-pronunciation facts are
// drawn from Masri's own vetted sounds.js.
//
// Each row: { ar, tr, gloss, ipa, eng, letter, masri? }
//   ar     — Arabic example word (renders RTL, isolated)
//   tr     — Masri transliteration of the example
//   gloss  — English meaning of the example
//   ipa    — formal (MSA) reference phoneme
//   eng    — English representation or closest English cue
//   letter — Arabic letter or vowel form (the teaching target; renders RTL)
//   masri  — optional note: common Egyptian (Cairene) pronunciation where it differs
//
// The four emphatic letters and the two diphthong vowel-forms use exact logical
// Unicode order (tatweel U+0640 marks the preceding consonant position):
//   aj  ـَيْ  = U+0640 U+064E U+064A U+0652   (tatweel · fatha · yeh · sukun)
//   aw  ـَوْ  = U+0640 U+064E U+0648 U+0652   (tatweel · fatha · waw · sukun)

window.MASRI = window.MASRI || {};
window.MASRI.symbols = {
  intro:
    "Use this chart to connect Arabic letters with their IPA symbols and closest " +
    "English sound cues. The main symbol shows the formal Arabic reference sound; " +
    "small notes mark common Egyptian (Masri) pronunciations where they differ.",
  columns: ["Example", "IPA", "English", "Arabic"],
  panels: [
    {
      groups: [
        { label: "Plosives", rows: [
          { ar: "بحر",   tr: "baḥr",    gloss: "sea",      ipa: "/b/",  eng: "b",                          letter: "ب" },
          { ar: "تلاتة", tr: "talāta",  gloss: "three",    ipa: "/t/",  eng: "t",                          letter: "ت" },
          { ar: "دوا",   tr: "dawa",    gloss: "medicine", ipa: "/d/",  eng: "d",                          letter: "د" },
          { ar: "طيب",   tr: "ṭayyeb",  gloss: "okay",     ipa: "/tˤ/", eng: "no English equivalent",      letter: "ط" },
          { ar: "ضيف",   tr: "ḍēf",     gloss: "guest",    ipa: "/dˤ/", eng: "no English equivalent",      letter: "ض" },
          { ar: "كتير",  tr: "ketīr",   gloss: "a lot",    ipa: "/k/",  eng: "k",                          letter: "ك" },
          { ar: "قهوة",  tr: "ʾahwa",   gloss: "coffee",   ipa: "/q/",  eng: "no direct English equivalent", letter: "ق", masri: "Masri: often /ʔ/ (glottal stop)" },
          { ar: "أهلاً", tr: "ahlan",   gloss: "hello",    ipa: "/ʔ/",  eng: "glottal stop (the catch in “uh-oh”)", letter: "ء" }
        ]},
        { label: "Nasals", rows: [
          { ar: "مصر",  tr: "maṣr", gloss: "Egypt", ipa: "/m/", eng: "m", letter: "م" },
          { ar: "نور",  tr: "nūr",  gloss: "light", ipa: "/n/", eng: "n", letter: "ن" }
        ]},
        { label: "Fricatives", rows: [
          { ar: "فيل",   tr: "fīl",    gloss: "elephant",  ipa: "/f/",  eng: "f",                     letter: "ف" },
          { ar: "ثوم",   tr: "tūm",    gloss: "garlic",    ipa: "/θ/",  eng: "th as in “thin”",       letter: "ث", masri: "Masri: often /t/ (sometimes /s/)" },
          { ar: "ذهب",   tr: "dahab",  gloss: "gold",      ipa: "/ð/",  eng: "th as in “this”",       letter: "ذ", masri: "Masri: often /d/ (sometimes /z/)" },
          { ar: "ظرف",   tr: "zarf",   gloss: "envelope",  ipa: "/ðˤ/", eng: "no English equivalent", letter: "ظ", masri: "Masri: often /zˤ/ (heavy z); may merge with ض" },
          { ar: "سمك",   tr: "samak",  gloss: "fish",      ipa: "/s/",  eng: "s",                     letter: "س" },
          { ar: "صباح",  tr: "ṣabāḥ",  gloss: "morning",   ipa: "/sˤ/", eng: "no English equivalent", letter: "ص" },
          { ar: "زيت",   tr: "zēt",    gloss: "oil",       ipa: "/z/",  eng: "z",                     letter: "ز" },
          { ar: "شكراً", tr: "shukran", gloss: "thank you", ipa: "/ʃ/",  eng: "sh",                    letter: "ش" }
        ]}
      ]
    },
    {
      groups: [
        { label: "Fricatives (continued)", rows: [
          { ar: "خمسة", tr: "khamsa", gloss: "five",      ipa: "/x/",  eng: "like the “ch” in “loch”",     letter: "خ" },
          { ar: "غالي", tr: "ghāli",  gloss: "expensive", ipa: "/ɣ/",  eng: "no direct English equivalent", letter: "غ" },
          { ar: "حب",   tr: "ḥobb",   gloss: "love",      ipa: "/ħ/",  eng: "no direct English equivalent", letter: "ح" },
          { ar: "عين",  tr: "ʿēn",    gloss: "eye",       ipa: "/ʕ/",  eng: "no direct English equivalent", letter: "ع" },
          { ar: "هنا",  tr: "hena",   gloss: "here",      ipa: "/h/",  eng: "h",                           letter: "ه" }
        ]},
        { label: "Affricate, liquids & glides", rows: [
          { ar: "جمل",   tr: "gamal", gloss: "camel",    ipa: "/dʒ/", eng: "j (formal Arabic reference)", letter: "ج", masri: "Masri: usually /g/ (as in “go”)" },
          { ar: "ليل",   tr: "lēl",   gloss: "night",    ipa: "/l/",  eng: "l",                           letter: "ل" },
          { ar: "راس",   tr: "rās",   gloss: "head",     ipa: "/r/",  eng: "rolled or tapped r",          letter: "ر" },
          { ar: "يلا",   tr: "yalla", gloss: "let’s go", ipa: "/j/",  eng: "y",                           letter: "ي" },
          { ar: "واحد",  tr: "wāḥid", gloss: "one",      ipa: "/w/",  eng: "w",                           letter: "و" }
        ]},
        { label: "Short vowels", rows: [
          { ar: "بنت",   tr: "bint",    gloss: "girl",      ipa: "/i/", eng: "i as in “bit”",         letter: "ـِ" },
          { ar: "شكراً", tr: "shukran", gloss: "thank you", ipa: "/u/", eng: "u as in “put”",         letter: "ـُ" },
          { ar: "سمك",   tr: "samak",   gloss: "fish",      ipa: "/a/", eng: "a as in “cat / father”", letter: "ـَ" }
        ]},
        { label: "Long vowels", rows: [
          { ar: "كبير", tr: "kibīr", gloss: "big",         ipa: "/iː/", eng: "ee as in “see”",   letter: "ي" },
          { ar: "فول",  tr: "fūl",   gloss: "fava beans",  ipa: "/uː/", eng: "oo as in “moon”",  letter: "و" },
          { ar: "باب",  tr: "bāb",   gloss: "door",        ipa: "/aː/", eng: "aa as in “father”", letter: "ا" }
        ]},
        { label: "Diphthongs", rows: [
          { ar: "بَيْت", tr: "bayt", gloss: "house", ipa: "/aj/", eng: "ay as in “eye”", letter: "ـَيْ", masri: "Masri: usually monophthong ē — bēt" },
          { ar: "يَوْم", tr: "yawm", gloss: "day",   ipa: "/aw/", eng: "ow as in “how”", letter: "ـَوْ", masri: "Masri: usually monophthong ō — yōm" }
        ]}
      ]
    }
  ]
};
