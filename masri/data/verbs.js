// Verbs — common Egyptian verbs and the everyday forms that get you speaking
// fast. Reference tables, not conjugation drills. Egyptian (Cairene) throughout.
window.MASRI = window.MASRI || {};
window.MASRI.verbs = {
  intro:
    "Common Egyptian verbs and the everyday forms that get you talking fast. " +
    "Dictionary forms are given as the plain “he …” past (the usual citation form). " +
    "Present tense normally takes a <b>بـ</b> prefix (بروح = <i>I go</i>), but for " +
    "“I know / I understand” Egyptians usually say the participle عارف / فاهم. " +
    "Forms below are masculine (m); a woman adds an -a ending.",
  tables: [
    {
      title: "Core everyday verbs",
      note: "Citation form = the bare “he …” past. English gives the plain meaning.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["راح",    "rāḥ",      "to go"],
        ["جه",     "geh",      "to come"],
        ["أكل",    "akal",     "to eat"],
        ["شرب",    "shereb",   "to drink"],
        ["عايز",   "ʿāyez",    "to want (used like an adjective)"],
        ["عند",    "ʿand",     "to have (“at / with” + ending)"],
        ["عرف",    "ʿeref",    "to know"],
        ["فهم",    "fehem",    "to understand"],
        ["قال",    "ʾāl",      "to say"],
        ["شاف",    "shāf",     "to see"],
        ["عمل",    "ʿamal",    "to do / make"],
        ["كتب",    "katab",    "to write"],
        ["اتعلم",  "etʿallem", "to learn"],
        ["اتكلم",  "etkallem", "to speak"],
        ["حب",     "ḥabb",     "to love / like"],
        ["محتاج",  "meḥtāg",   "to need (used like an adjective)"]
      ]
    },
    {
      title: "Useful “I …” forms",
      note: "The بـ prefix makes the everyday present (بروح = I go). “I want / I have / I need” and “I know / I understand” use adjective-like words, not a bi- verb.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["بروح",           "barūḥ",                   "I go"],
        ["باجي",           "bāgi",                    "I come"],
        ["باكل",           "bākol",                   "I eat"],
        ["باشرب",          "bashrab",                 "I drink"],
        ["أنا عايز",       "ana ʿāyez",               "I want (m)"],
        ["عندي",           "ʿandi",                   "I have"],
        ["أنا عارف",       "ana ʿāref",               "I know (m)"],
        ["أنا فاهم",       "ana fāhem",               "I understand (m)"],
        ["أنا مش فاهم",    "ana mesh fāhem",          "I don't understand (m)"],
        ["أنا بتعلم عربي", "ana batʿallem ʿarabi",    "I'm learning Arabic"],
        ["باتكلم عربي شوية","batkallem ʿarabi shwayya","I speak a little Arabic"],
        ["أنا محتاج مساعدة","ana meḥtāg mosaʿda",      "I need help (m)"]
      ]
    },
    {
      title: "Negatives",
      note: "Two ways to say no: wrap a verb in <b>ما...ش</b> (مبتكلمش), or put <b>مش</b> before a participle/adjective (مش فاهم).",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["أنا مش فاهم",       "ana mesh fāhem",              "I don't understand (m)"],
        ["أنا مش عارف",       "ana mesh ʿāref",              "I don't know (m)"],
        ["أنا مش عايز",       "ana mesh ʿāyez",              "I don't want (m)"],
        ["معنديش",            "maʿandīsh",                   "I don't have"],
        ["مبتكلمش عربي كويس", "mabatkallemsh ʿarabi kwayyes","I don't speak Arabic well"]
      ]
    },
    {
      title: "Question patterns",
      note: "Yes/no questions are just said with a rising tone; a question word (if any) usually comes last.",
      headers: ["Arabic", "Masri", "English"],
      rows: [
        ["إنت فاهم؟",     "enta fāhem?",      "do you understand? (m)"],
        ["إنت عارف؟",     "enta ʿāref?",      "do you know? (m)"],
        ["عايز إيه؟",     "ʿāyez ēh?",        "what do you want? (m)"],
        ["رايح فين؟",     "rāyeḥ fēn?",       "where are you going? (m)"],
        ["بتقول إيه؟",    "betʾūl ēh?",       "what are you saying? (m)"],
        ["ممكن تساعدني؟", "momken tesaʿedni?","can you help me?"]
      ]
    }
  ]
};
