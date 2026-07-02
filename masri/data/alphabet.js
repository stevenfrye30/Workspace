// The 28 letters of the Arabic alphabet, with their EGYPTIAN sound values.
// `connector: false` marks the six letters that never join to the letter after
// them (ا د ذ ر ز و) — so they have no distinct initial/medial shape.
window.MASRI = window.MASRI || {};
window.MASRI.alphabet = {
  intro:
    "Arabic is written right-to-left and cursive: most letters change shape by " +
    "position. Six letters (ا د ذ ر ز و) only connect on their right, so a word " +
    "can break after them. Sounds below are the <b>Egyptian</b> readings.",
  extras:
    "Beyond the 28: <b>ء</b> hamza (glottal stop), <b>ة</b> tā marbūṭa (final -a, " +
    "the feminine ending), <b>ى</b> alif maqṣūra (final long -a), and the ligature " +
    "<b>لا</b> lām-alif.",
  letters: [
    { letter: "ا", name: "alif", name_ar: "أَلِف", sound: "ā / seat for hamza", ipa: "/aː/", connector: false, note: "Carries the long a; also props up hamza (أ إ)." },
    { letter: "ب", name: "bāʾ",  name_ar: "بَاء",  sound: "b", ipa: "/b/", connector: true },
    { letter: "ت", name: "tāʾ",  name_ar: "تَاء",  sound: "t", ipa: "/t/", connector: true },
    { letter: "ث", name: "thāʾ", name_ar: "ثَاء",  sound: "t (or s)", ipa: "/t/", connector: true, note: "Egyptian: usually t." },
    { letter: "ج", name: "gīm",  name_ar: "جِيم",  sound: "g (hard, as in go)", ipa: "/g/", connector: true, note: "The signature Egyptian sound. MSA: j." },
    { letter: "ح", name: "ḥāʾ",  name_ar: "حَاء",  sound: "ḥ (throat h)", ipa: "/ħ/", connector: true },
    { letter: "خ", name: "khāʾ", name_ar: "خَاء",  sound: "kh (as in Bach)", ipa: "/x/", connector: true },
    { letter: "د", name: "dāl",  name_ar: "دَال",  sound: "d", ipa: "/d/", connector: false },
    { letter: "ذ", name: "dhāl", name_ar: "ذَال",  sound: "d (or z)", ipa: "/d/", connector: false, note: "Egyptian: usually d." },
    { letter: "ر", name: "rāʾ",  name_ar: "رَاء",  sound: "r (rolled)", ipa: "/r/", connector: false },
    { letter: "ز", name: "zāy",  name_ar: "زَاي",  sound: "z", ipa: "/z/", connector: false },
    { letter: "س", name: "sīn",  name_ar: "سِين",  sound: "s", ipa: "/s/", connector: true },
    { letter: "ش", name: "shīn", name_ar: "شِين",  sound: "sh", ipa: "/ʃ/", connector: true },
    { letter: "ص", name: "ṣād",  name_ar: "صَاد",  sound: "ṣ (emphatic s)", ipa: "/sˤ/", connector: true },
    { letter: "ض", name: "ḍād",  name_ar: "ضَاد",  sound: "ḍ (emphatic d)", ipa: "/dˤ/", connector: true },
    { letter: "ط", name: "ṭāʾ",  name_ar: "طَاء",  sound: "ṭ (emphatic t)", ipa: "/tˤ/", connector: true },
    { letter: "ظ", name: "ẓāʾ",  name_ar: "ظَاء",  sound: "ẓ (emphatic z)", ipa: "/zˤ/", connector: true },
    { letter: "ع", name: "ʿayn", name_ar: "عَين",  sound: "ʿ (throat squeeze)", ipa: "/ʕ/", connector: true },
    { letter: "غ", name: "ghayn",name_ar: "غَين",  sound: "gh (gargled)", ipa: "/ɣ/", connector: true },
    { letter: "ف", name: "fāʾ",  name_ar: "فَاء",  sound: "f", ipa: "/f/", connector: true },
    { letter: "ق", name: "qāf",  name_ar: "قَاف",  sound: "ʾ (glottal stop)", ipa: "/ʔ/", connector: true, note: "Egyptian: a glottal stop. MSA: deep q." },
    { letter: "ك", name: "kāf",  name_ar: "كَاف",  sound: "k", ipa: "/k/", connector: true },
    { letter: "ل", name: "lām",  name_ar: "لَام",  sound: "l", ipa: "/l/", connector: true },
    { letter: "م", name: "mīm",  name_ar: "مِيم",  sound: "m", ipa: "/m/", connector: true },
    { letter: "ن", name: "nūn",  name_ar: "نُون",  sound: "n", ipa: "/n/", connector: true },
    { letter: "ه", name: "hāʾ",  name_ar: "هَاء",  sound: "h", ipa: "/h/", connector: true, note: "A light h, as in English <i>hat</i>. Softer than ح." },
    { letter: "و", name: "wāw",  name_ar: "وَاو",  sound: "w / ū / ō", ipa: "/w/", connector: false, note: "Consonant w, or carries long u / o." },
    { letter: "ي", name: "yāʾ",  name_ar: "يَاء",  sound: "y / ī / ē", ipa: "/j/", connector: true, note: "Consonant y, or carries long i / e." }
  ]
};
