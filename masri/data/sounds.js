// Sounds of Masri (Egyptian / Cairene Arabic).
// Egyptian-first: this describes how Egyptians actually pronounce, which is
// often NOT how the same letters sound in Modern Standard Arabic (MSA).
window.MASRI = window.MASRI || {};
window.MASRI.sounds = {
  intro:
    "Egyptian Arabic keeps the Arabic alphabet but reads several letters its own way. " +
    "Two differences define the Egyptian accent: <b>ج</b> is a hard <b>g</b> (as in <i>go</i>), " +
    "not the <i>j</i> of MSA; and <b>ق</b> is usually a <b>glottal stop</b> (the catch in <i>uh-oh</i>), " +
    "not a deep <i>q</i>. The interdental letters (ث ذ ظ) also collapse into everyday sounds. " +
    "The six trickiest for beginners — <b>ح خ ع غ ق ج</b> — come first below, each with a rough " +
    "English hint and an example word.",

  // The letters an English speaker most needs re-taught for Egyptian.
  // The six hardest for beginners are listed first: ج ق ح خ ع غ.
  consonants: [
    { letter: "ج", name: "gīm",  egyptian: "g", ipa: "/g/", approx: "hard g, as in “go”",
      ex_ar: "جمل", ex: "gamal", ex_en: "camel",
      note: "A hard g like in <i>go</i> or <i>gift</i> — never the soft <i>j</i> of Modern Standard Arabic. The classic Egyptian sound." },
    { letter: "ق", name: "qāf",  egyptian: "ʾ (glottal stop)", ipa: "/ʔ/", approx: "the catch in “uh-oh”",
      ex_ar: "قلب", ex: "ʾalb", ex_en: "heart",
      note: "In Egyptian it's a glottal stop — the little catch in the middle of <i>uh-oh</i>. (MSA says a deep k.) So قهوة = <i>ʾahwa</i>, coffee." },
    { letter: "ح", name: "ḥāʾ",  egyptian: "ḥ", ipa: "/ħ/", approx: "a breathy H from the throat",
      ex_ar: "حب", ex: "ḥobb", ex_en: "love",
      note: "Breathe out sharply from deep in the throat, as if fogging a mirror — heavier than English <i>h</i>, and not the same as ه." },
    { letter: "خ", name: "khāʾ", egyptian: "kh", ipa: "/x/", approx: "the “ch” in Scottish “loch”",
      ex_ar: "خمسة", ex: "khamsa", ex_en: "five",
      note: "A raspy sound at the back of the mouth — like German <i>Bach</i>, or gently clearing your throat." },
    { letter: "ع", name: "ʿayn", egyptian: "ʿ", ipa: "/ʕ/", approx: "a tight throat squeeze (no English match)",
      ex_ar: "عين", ex: "ʿēn", ex_en: "eye",
      note: "The hardest for English speakers: tighten your throat as if straining to say “ah”, and voice it. Don't just skip it — عربي = <i>ʿarabi</i>." },
    { letter: "غ", name: "ghayn",egyptian: "gh", ipa: "/ɣ/", approx: "a gargled French “r”",
      ex_ar: "غالي", ex: "ghāli", ex_en: "expensive",
      note: "Like gargling water, or a Parisian French <i>r</i>. It is the voiced partner of خ (kh)." },
    { letter: "ث", name: "thāʾ", egyptian: "t (or s)", ipa: "/t/", approx: "usually a plain t",
      ex_ar: "ثوم", ex: "tūm", ex_en: "garlic",
      note: "Egyptian collapses the English <i>th</i>: usually a plain <b>t</b> in everyday words (sometimes <b>s</b> in bookish ones)." },
    { letter: "ذ", name: "dhāl", egyptian: "d (or z)", ipa: "/d/", approx: "usually a plain d",
      ex_ar: "ذهب", ex: "dahab", ex_en: "gold",
      note: "This <i>th</i> collapses too: usually a plain <b>d</b> (sometimes <b>z</b>)." },
    { letter: "ظ", name: "ẓāʾ",  egyptian: "ẓ / z (emphatic)", ipa: "/zˤ/", approx: "a heavy z",
      ex_ar: "ظرف", ex: "zarf", ex_en: "envelope",
      note: "A heavy, throaty <b>z</b> (emphatic) that darkens the vowel next to it." },
    { letter: "ر", name: "rāʾ",  egyptian: "r (rolled)", ipa: "/r/", approx: "a tapped/rolled Spanish r",
      ex_ar: "راس", ex: "rās", ex_en: "head",
      note: "A tapped or rolled <i>r</i> like Spanish — never the soft English r." },
    { letter: "ص", name: "ṣād",  egyptian: "ṣ (emphatic s)", ipa: "/sˤ/", approx: "a heavy s",
      ex_ar: "صباح", ex: "ṣabāḥ", ex_en: "morning",
      note: "A heavy <i>s</i> with the tongue pulled back; it makes nearby vowels sound deeper." },
    { letter: "ض", name: "ḍād",  egyptian: "ḍ (emphatic d)", ipa: "/dˤ/", approx: "a heavy d",
      ex_ar: "ضيف", ex: "ḍēf", ex_en: "guest",
      note: "A heavy <i>d</i>. Arabic is nicknamed “the language of the ḍād” after this letter." },
    { letter: "ط", name: "ṭāʾ",  egyptian: "ṭ (emphatic t)", ipa: "/tˤ/", approx: "a heavy t",
      ex_ar: "طيب", ex: "ṭayyeb", ex_en: "okay",
      note: "A heavy <i>t</i> with the tongue flat and pulled back." }
  ],

  vowels: {
    intro:
      "Three short vowels (a, i, u) and their long partners (ā, ī, ū). Egyptian also has " +
      "long <b>ē</b> and <b>ō</b>, where MSA has the diphthongs <i>ay</i> and <i>aw</i>.",
    rows: [
      { sound: "a",  ex_ar: "بَاب",  ex: "bāb",  gloss: "door (short a)" },
      { sound: "i",  ex_ar: "بِنت",  ex: "bint", gloss: "girl (short i)" },
      { sound: "u",  ex_ar: "كُل",   ex: "koll", gloss: "all (short u)" },
      { sound: "ā",  ex_ar: "نَام",  ex: "nām",  gloss: "he slept (long a)" },
      { sound: "ī",  ex_ar: "فِيل",  ex: "fīl",  gloss: "elephant (long i)" },
      { sound: "ū",  ex_ar: "نُور",  ex: "nūr",  gloss: "light (long u)" },
      { sound: "ē",  ex_ar: "بيت",   ex: "bēt",  gloss: "house — MSA <i>bayt</i>" },
      { sound: "ō",  ex_ar: "يوم",   ex: "yōm",  gloss: "day — MSA <i>yawm</i>" }
    ]
  },

  // How Egyptians write Arabic sounds with Latin letters + numbers when texting.
  franco: {
    intro:
      "“Franco-Arabic” / <i>Arabizi</i> — how Egyptians type Arabic on a Latin keyboard. " +
      "Numbers stand in for sounds that have no Latin letter, usually because the digit " +
      "looks like the Arabic letter.",
    rows: [
      { num: "2", letter: "ء / ق", sound: "glottal stop (hamza / Egyptian qāf)" },
      { num: "3", letter: "ع", sound: "ʿayn (the throat sound)" },
      { num: "5", letter: "خ", sound: "kh" },
      { num: "6", letter: "ط", sound: "emphatic ṭ" },
      { num: "7", letter: "ح", sound: "ḥ (breathy throat h)" },
      { num: "8", letter: "غ", sound: "gh (also written 3’ )" },
      { num: "9", letter: "ص", sound: "emphatic ṣ" }
    ]
  }
};
