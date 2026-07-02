// Start Here — the beginner-friendly front door to the desk.
// A calm orientation page before diving into the other sections.
window.MASRI = window.MASRI || {};
window.MASRI.start = {
  what: {
    title: "What this is",
    points: [
      "A simple Egyptian Arabic reference desk — a place to look things up and slowly build familiarity.",
      "For browsing, not finishing. Nothing here is graded or tracked; come and go as you like.",
      "Not a course, not a quiz app, and not Modern Standard Arabic (the formal/news Arabic)."
    ]
  },
  how: {
    title: "How to use it",
    rows: [
      { section: "Sounds",     id: "sounds",  when: "if pronunciation is confusing — the best place to begin" },
      { section: "Phrases",    id: "phrases", when: "for practical, everyday speaking" },
      { section: "Vocabulary", id: "vocab",   when: "for words grouped by theme" },
      { section: "Grammar",    id: "grammar", when: "only when you need a specific pattern" }
    ]
  },
  basics: {
    title: "Egyptian Arabic basics",
    points: [
      "Egyptian Arabic (Masri) is <b>spoken</b> Arabic — the everyday language of Egypt, not formal or news Arabic.",
      "Its pronunciation differs from Modern Standard Arabic (MSA) in a few key ways.",
      "<b>ج</b> is usually a hard <b>“g”</b> (as in <i>go</i>).",
      "<b>ق</b> is often a <b>glottal stop</b> — the little catch in <i>uh-oh</i>.",
      "Everyday speech won't always match textbook Arabic exactly — and that's normal."
    ]
  },
  survival: {
    title: "Beginner survival phrases",
    note: "The handful that carry you through almost any early conversation.",
    items: [
      { ar: "أنا بتعلم عربي",   tr: "ana batʿallem ʿarabi", en: "I'm learning Arabic" },
      { ar: "مش فاهم",          tr: "mesh fāhem",           en: "I don't understand (m)" },
      { ar: "ممكن تعيد تاني؟",  tr: "momken teʿīd tāni?",   en: "can you say that again?" },
      { ar: "بالراحة لو سمحت",  tr: "bel-rāḥa law samaḥt",  en: "slowly, please" },
      { ar: "يعني إيه ده؟",     tr: "yaʿni ēh da?",         en: "what does this mean?" },
      { ar: "إزاي أقول ...؟",   tr: "ezzāy aʾūl ...?",      en: "how do I say ___?" },
      { ar: "اكتبها لي لو سمحت", tr: "ektebha-li law samaḥt", en: "please write it down" },
      { ar: "شكراً",            tr: "shukran",              en: "thank you" }
    ]
  }
};
